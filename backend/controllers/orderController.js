import { set } from "mongoose";
import DeliveryAssignment from "../models/deliveryAssignment.js";
import Order from "../models/orderModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🛒 Order place karne ka function
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    // check karo cart empty to nahi hai
    if (cartItems.length == 0 || !cartItems) {
      return res.status(400).json({ message: "cart is empty" });
    }

    // delivery address complete hona chahiye (text, latitude, longitude)
    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "send complete deliveryAddress" });
    }

    // items ko shop ke hisaab se group karna
    const groupItemsByShop = {};

    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }

      groupItemsByShop[shopId].push(item);
    });

    // har shop ke liye order details banana
    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");

        if (!shop) {
          return res.status(400).json({ message: "shop not found" });
        }

        const items = groupItemsByShop[shopId];

        // subTotal nikalna (quantity * price)
        const subTotal = items.reduce(
          (sum, i) => sum + Number(i.quantity) * Number(i.price),
          0
        );

        return {
          shop: shop._id,
          owner: shop.owner.id,
          subTotal,
          shopOrderItems: items.map((i) => ({
            item: i._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        };
      })
    );

    if (paymentMethod === "online") {
      const razorOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorPayOrderId: razorOrder.id,
        payment: false,
      });

      return res.status(200).json({
        razorOrder,
        orderId: newOrder._id,
      });
    }

    // final Order create karna
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });
    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name images price"
    );
    await newOrder.populate("shopOrders.shop", "name ");
    await newOrder.populate("shopOrders.shopOrderItems.item", "name images price");

    await newOrder.populate("shopOrders.owner", "name socketId ");
    await newOrder.populate("user", "name email mobileNumber ");

    const io = req.app.get("io");

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;

        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            shopOrders: shopOrder,
            user: newOrder.user,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
          });
        }
      });
    }

    return res.status(200).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: `place order error {error}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;

    const paymnet = await instance.payments.fetch(razorpay_payment_id);

    if (!paymnet || paymnet.status != "captured") {
      return res.status(400).json({ message: "payment not captured" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    order.payment = true;

    order.razorPayPaymentId = razorpay_payment_id;
    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name images price");
    await order.populate("shopOrders.shop", "name");
    await Order.populate("shopOrders.owner", "name socketId ");
    await Order.populate("user", "name email mobileNumber ");

    const io = req.app.get("io");

    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            shopOrders: shopOrder,
            user: order.user,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            payment: order.payment,
          });
        }
      });
    }

    res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: "payment not verifyied" });
  }
};

// 📦 User ke orders fetch karna
export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 }) // latest order pehle
        .populate("shopOrders.owner")
        .populate("shopOrders.shop")
        .populate({
          path: "shopOrders.shopOrderItems.item",
          select: "name images discountPrice originalPrice", // item details with images
        })
        .populate("user")
        // .populate("owner")
        // .populate({
        //   path: "shopOrders.shopOrderItems.item",
        //   select: "name images price",
        // });
        
       

      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 }) // latest order pehle
        .populate("user")
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.shopOrderItems.item", "name images price")
        .populate(
          "shopOrders.assignedDeliveryBoy",
          "fullName email mobileNumber"
        );

      // sirf specific owner ka order filter karna
      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner._id == req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
      }));
      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    res.status(500).json({ message: `get user order error {error}` });
  }
};

// 🚚 Order ka status update karna (jaise "out for delivery")
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    // pehle order find karo
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // shop ke hisaab se shopOrder find karna
    const shopOrder = order.shopOrders.find(
      (o) => o.shop.toString() === shopId
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }

    // shop order ka status update karna
    shopOrder.status = status;
    await order.save();

    let deliveryBoysPayload = [];

    // agar order "out of delivery" hai ya pehle se koi assignment nahi hai to naya delivery boy dhundhna

    if (status == "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;

      // nearby delivery boys dhundhna (max 5km range)

      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      // nearby delivery boys ke IDs nikalna
      const nearByIds = nearByDeliveryBoys.map((b) => b._id);

      // busy delivery boys ke IDs nikalna (jo already order par hain)

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));

      // available delivery boys (jo busy list mein nahi hai)
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );

      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length == 0) {
        await order.save();
        return res.json({
          message: "order status updated but there is no delivery boys",
        });
      }

      // delivery assignment create karna
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      // shop order mein delivery boy assign karna

      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      shopOrder.assignment = deliveryAssignment._id;
      // available delivery boys ka payload
      deliveryBoysPayload = availableBoys.map((b) => ({
        _id: b._id,
        fullName: b.fullName,
        email: b.email,
        mobile: b.mobileNumber,
        longitude: b.location.coordinates[0],
        latitude: b.location.coordinates[1],
      }))
      await deliveryAssignment.populate("order")

      await deliveryAssignment.populate("shop")


const io = req.app.get('io')
if(io){
  availableBoys.forEach(boy => {
    const boySocketId = boy.socketId 
    if(boySocketId){
      io.to(boySocketId).emit('newAssignment', {
        sendTo:boy._id,
         assignmentId: deliveryAssignment._id,
      orderId: deliveryAssignment.order._id,
      shopName: deliveryAssignment.shop.name,
      deliveryAddress: deliveryAssignment.order.deliveryAddress,
      items:
        deliveryAssignment.order.shopOrders.find((so) => so._id.equals(deliveryAssignment.shopOrderId))
          .shopOrderItems || [],
      subTotal: deliveryAssignment.order.shopOrders.find((so) => so._id.equals(deliveryAssignment.shopOrderId))
        ?.subTotal,
      })
    }
  })
}


    }

      await order.save();

      // updated shop order find karna
      const updatedShopOrder = order.shopOrders.find(
        (o) => o.shop.toString() == shopId
      );

      // populate karke updated order lana
      await order.populate("shopOrders.shop", "name");
      await order.populate(
        "shopOrders.assignedDeliveryBoy",
        "fullName email mobileNumber"
      );
      await order.populate("user", "socketId");

      const io = req.app.get("io");
      if (io) {
        const userSocketId = order.user?.socketId;

        if (userSocketId) {
          io.to(userSocketId).emit("update-status", {
            orderId: order._id,
            shopId: updatedShopOrder.shop._id,
          status: shopOrder.status,
             userId: order.user?._id || null,
           });
        }
      

      // final response
      res.status(200).json({
        shopOrder: updatedShopOrder,
        assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
        availableBoys: deliveryBoysPayload,
        assignment: updatedShopOrder?.assignment?._id || null,
      });
    }


    
  } catch (error) {
    res.status(500).json({ message: `get user order error ${error}` });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
    })
      .populate("order")
      .populate("shop");

    const formatedData = assignments.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],
      subTotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        ?.subTotal,
    }));
    res.status(200).json(formatedData);
  } catch (error) {
    res.status(500).json({ message: `get assigmnet error ${error}` });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await DeliveryAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" });
    }

    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "assignment is expired" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "you already have another order" });
    }

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    const shopOrder = order.shopOrders.id(assignment.shopOrderId);
    if (shopOrder) {
      shopOrder.assignedDeliveryBoy = req.userId;
    }

    await order.save();
    return res.status(200).json({ message: "order accepted" });
  } catch (error) {
    return res.status(500).json({ message: `accept order error: ${error}` });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignmnet = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop")
      .populate("assignedTo", "fullName email mobileNumber location")
      .populate({
        path: "order",
        populate: [
          {
            path: "user",
            select: "fullName email mobileNumber location",
          },
        ],
      });

    if (!assignmnet) {
      return res.status(400).json({ message: "assignment not found" });
    }
    if (!assignmnet.order) {
      return res.status(400).json({ message: "order not found" });
    }

    const shopOrder = assignmnet.order.shopOrders.find(
      (so) => String(so._id) == String(assignmnet.shopOrderId)
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "shopOrder not found" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignmnet.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignmnet.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignmnet.assignedTo.location.coordinates[0];
    }
    let customerLocation = { lat: null, lon: null };
    if (assignmnet.order.deliveryAddress) {
      customerLocation.lat = assignmnet.order.deliveryAddress.latitude;
      customerLocation.lon = assignmnet.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignmnet.order._id,
      user: assignmnet.order.user,
      shopOrder,
      deliveryAddress: assignmnet.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res.status(500).json({ message: `current order error: ${error}` });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: `current order error: ${error}` });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderId" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 + 60 * 1000;

    await order.save();

    await sendDeliveryOtpMail(order.user, otp);
    return res
      .status(200)
      .json({ message: ` otp send successfully to ${order?.user?.fullName}` });
  } catch (error) {
    return res.status(500).json({ message: `delivery error: ${error}` });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "enter valid order/shopOrderId" });
    }

    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid/Expired Otp" });
    }

    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();

    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    return res.status(200).json({ message: "Order Delivered Successfully " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `verify delivery otp error: ${error}` });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const startsOfDay = new Date();
    startsOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsOfDay },
    }).lean();

    let todayDeliveries = [];

    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          shopOrder.assignedDeliveryBoy == deliveryBoyId &&
          shopOrder.status == "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startsOfDay
        ) {
          todayDeliveries.push(shopOrder);
        }
      });
    });

    let stats = {};

    todayDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    let formattedStats = Object.keys(stats).map((hour) => ({
      hour: parseInt(hour),
      count: stats[hour],
    }));

    formattedStats.sort((a, b) => a.hour - b.hour);

    res.status(200).json(formattedStats);
  } catch (error) {
    return res.status(500).json({ message: "today deliveries error" });
  }
};
