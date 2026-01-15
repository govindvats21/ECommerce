import { set } from "mongoose";
import DeliveryAssignment from "../models/deliveryAssignment.js";
import Order from "../models/orderModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import Item from "../models/itemModel.js";

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

    // 1. Basic Validation
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!deliveryAddress || !deliveryAddress.text) {
      return res.status(400).json({ message: "Please provide a delivery address" });
    }

    // 2. Group items by Shop
    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    // 3. Process Shop Orders
    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) throw new Error(`Shop not found: ${shopId}`);

        const items = groupItemsByShop[shopId];
        const subTotal = items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.price), 0);

        return {
          shop: shop._id,
          owner: shop.owner._id, // FIXED: use _id instead of id
          subTotal,
          shopOrderItems: items.map((i) => ({
            item: i._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
         images: i.images || [i.image] || []
          })),
        };
      })
    );

    // 4. Handle Online Payment
    if (paymentMethod === "online") {
      try {
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

        return res.status(200).json({ razorOrder, orderId: newOrder._id });
      } catch (razorError) {
        console.error("Razorpay Error:", razorError);
        return res.status(500).json({ message: "Razorpay order creation failed" });
      }
    }

    // 5. Handle COD
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

    // Populate for Socket response
    await newOrder.populate("shopOrders.shopOrderItems.item shopOrders.shop shopOrders.owner user");

    // 6. Socket Notification
    const io = req.app.get("io");
    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner?.socketId;
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
    console.error("CRITICAL ORDER ERROR:", error); // Terminal mein error check karne ke liye
    res.status(500).json({ message: `Server Error: ${error.message}` });
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
    if (!order) return res.status(400).json({ message: "order not found" });

    order.payment = true;
    order.razorPayPaymentId = razorpay_payment_id;
    await order.save();

    await order.populate("shopOrders.shopOrderItems.item shopOrders.shop shopOrders.owner user");

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

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.owner shopOrders.shop shopOrders.shopOrderItems.item user");
      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("user shopOrders.shop shopOrders.shopOrderItems.item shopOrders.assignedDeliveryBoy");

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
    res.status(500).json({ message: `get order error ${error.message}` });
  }
};

// Ye function naya add karna hai
export const getAllDeliveryBoys = async (req, res) => {
  try {
    const boys = await User.find({ role: "deliveryBoy" }).select("fullName _id");
    res.status(200).json(boys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Is function ko replace kar lo (Manual Rider Support)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status, riderId } = req.body; // Frontend se riderId aayegi

    const order = await Order.findById(orderId);
    const shopOrder = order.shopOrders.find((o) => o.shop.toString() === shopId);
    if (!shopOrder) return res.status(400).json({ message: "Order not found" });

    shopOrder.status = status;

    if (status === "out of delivery") {
      // Agar rider select kiya hai toh usko, warna sabko broadcast
      const query = riderId ? { _id: riderId } : { role: "deliveryBoy" };
      const targets = await User.find(query);
      const candidates = targets.map((b) => b._id);

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      const io = req.app.get('io');
      if (io) {
        targets.forEach(boy => {
          if (boy.socketId) {
            io.to(boy.socketId).emit('newAssignment', {
              assignmentId: deliveryAssignment._id,
              shopName: "New Order",
              deliveryAddress: order.deliveryAddress.text,
              subTotal: shopOrder.subTotal,
              itemsCount: shopOrder.shopOrderItems.length
            });
          }
        });
      }
    }
    await order.save();
    res.status(200).json({ message: "Status Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... (Baki ke functions: getDeliveryBoyAssignment, acceptOrder, getOrderById etc same rahenge bas coordinates check hat jayega)

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment || assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "Assignment expired or not found" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });
    if (alreadyAssigned) return res.status(400).json({ message: "You already have another order" });

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    const shopOrder = order.shopOrders.id(assignment.shopOrderId);
    if (shopOrder) shopOrder.assignedDeliveryBoy = req.userId;

    await order.save();
    return res.status(200).json({ message: "order accepted" });
  } catch (error) {
    return res.status(500).json({ message: `accept error: ${error.message}` });
  }
};
export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop")
      .populate("assignedTo", "fullName email mobileNumber")
      .populate({
        path: "order",
        populate: [
          {
            path: "user",
            select: "fullName email mobileNumber",
          },
        ],
      });

    if (!assignment) {
      return res.status(404).json({ message: "No active assignment found" });
    }
    if (!assignment.order) {
      return res.status(404).json({ message: "Order details not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId)
    );

    if (!shopOrder) {
      return res.status(404).json({ message: "Specific shop order not found" });
    }

    // Response bina coordinates ke
    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress.text,
      shop: assignment.shop
    });
  } catch (error) {
    return res.status(500).json({ message: `current order error: ${error.message}` });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) return res.status(400).json({ message: "Invalid IDs" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 600000; // 10 mins

    await order.save();
    await sendDeliveryOtpMail(order.user, otp);
    return res.status(200).json({ message: `OTP sent to ${order.user.fullName}` });
  } catch (error) {
    return res.status(500).json({ message: `OTP error: ${error.message}` });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId);
    const shopOrder = order.shopOrders.id(shopOrderId);

    if (shopOrder.deliveryOtp !== otp || shopOrder.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }

    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    await order.save();

    await DeliveryAssignment.updateOne(
      { shopOrderId: shopOrder._id, order: order._id },
      { status: "completed" }
    );

    return res.status(200).json({ message: "Order Delivered Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Verify OTP error: ${error.message}` });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const startsOfDay = new Date();
    startsOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": req.userId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startsOfDay },
    }).lean();

    let count = 0;
    orders.forEach(o => {
      o.shopOrders.forEach(so => {
        if(so.assignedDeliveryBoy == req.userId && so.status == 'delivered') count++;
      });
    });

    res.status(200).json([{ hour: new Date().getHours(), count }]);
  } catch (error) {
    return res.status(500).json({ message: "Today deliveries error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user shopOrders.shop shopOrders.assignedDeliveryBoy shopOrders.shopOrderItems.item")
      .lean();
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const assignments = await DeliveryAssignment.find({
      broadcastedTo: req.userId,
      status: "broadcasted",
    }).populate("order shop");

    const data = assignments.map((a) => {
      // Order ke andar se wo specific shopOrder dhundo jiska kaam delivery boy ko karna hai
      const specificShopOrder = a.order?.shopOrders?.find(
        (so) => so._id.toString() === a.shopOrderId.toString()
      );

      return {
        assignmentId: a._id,
        orderId: a.order?._id,
        shopName: a.shop?.name || "Shop",
        deliveryAddress: a.order?.deliveryAddress?.text || a.order?.deliveryAddress,
        // Yahan se asli data jayega
        subTotal: specificShopOrder?.subTotal || 0,
        itemsCount: specificShopOrder?.shopOrderItems?.length || 0 
      };
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};