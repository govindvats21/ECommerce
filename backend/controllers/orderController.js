import { set } from "mongoose";
import DeliveryAssignment from "../models/deliveryAssignment.js";
import Order from "../models/orderModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import Item from "../models/itemModel.js";
import crypto from "crypto";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🛒 Order place karne ka function
// 1. PLACE ORDER (Same as yours, just ensured online flow is clear)
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop?._id || item.shop;
      if (!shopId) return;
      if (!groupItemsByShop[shopId]) groupItemsByShop[shopId] = [];
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) throw new Error(`Shop not found: ${shopId}`);

        const items = groupItemsByShop[shopId];
        const subTotal = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.price)), 0);

        return {
          shop: shop._id,
          owner: shop.owner?._id || shop.owner,
          subTotal,
          status: "pending",
          shopOrderItems: items.map((i) => ({
            item: i.product || i._id,
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
            // 🔥 Database mein images save ho rahi hain yahan
            images: i.images || []
          })),
        };
      })
    );

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      totalAmount,
      shopOrders,
      deliveryAddress,
      payment: paymentMethod === "cod" ? false : false
    });

    if (paymentMethod === "online") {
      const razorOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `order_rcpt_${newOrder._id}`,
      });
      newOrder.razorPayOrderId = razorOrder.id;
      await newOrder.save();
      return res.status(200).json({ razorOrder, orderId: newOrder._id });
    }

    res.status(200).json(newOrder);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. VERIFY PAYMENT (Professional & Secure)
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;

    // 1. Razorpay se payment ka status check karna
    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "Payment not captured or failed" });
    }

    // 2. Database mein order dhundna
    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ message: "Order not found" });

    // 3. Status update karna
    order.payment = true;
    order.razorPayPaymentId = razorpay_payment_id;
    await order.save();

    // 4. Socket Notification (Baki logic same)
    await order.populate("shopOrders.shopOrderItems.item shopOrders.shop shopOrders.owner user");
    const io = req.app.get("io");
    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner?.socketId;
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
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Payment verification failed" });
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
    const { status, riderId } = req.body;

    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.find((o) => o.shop.toString() === shopId);
    if (!shopOrder) return res.status(400).json({ message: "Order not found" });

    shopOrder.status = status;

    if (status === "out of delivery") {
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

      // Pura data populate karke socket par bhejein
      await deliveryAssignment.populate("shop");

      const io = req.app.get('io');
      if (io) {
        targets.forEach(boy => {
          if (boy.socketId) {
            io.to(boy.socketId).emit('newAssignment', {
              assignmentId: deliveryAssignment._id,
              // Frontend yahan se data uthayega:
              shopName: deliveryAssignment.shop?.name || "New Shop Order",
              deliveryAddress: order.deliveryAddress.text || order.deliveryAddress,
              subTotal: shopOrder.subTotal,
              itemsCount: shopOrder.shopOrderItems.length,
              broadcastedTo: candidates // Security check ke liye
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
    // FIX: Sirf wahi order uthao jo Rider ne ACCEPT kiya hai (Status: assigned)
    // "broadcasted" status wala order yahan nahi aana chahiye
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned", // Sabse zaroori check
    })
      .populate("shop")
      .populate({
        path: "order",
        populate: { path: "user", select: "fullName email mobile" },
      });

    // Agar koi assigned order nahi hai, toh 200 OK ke sath null bhejo
    if (!assignment || !assignment.order) {
      return res.status(200).json(null);
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) === String(assignment.shopOrderId)
    );

    if (!shopOrder) return res.status(200).json(null);

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress.text || assignment.order.deliveryAddress,
      shop: assignment.shop,
      assignmentId: assignment._id
    });
  } catch (error) {
    return res.status(500).json({ message: "Current order fetch failed" });
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
    }).populate({
      path: "order",
      populate: { path: "shopOrders.shop" } // Shop details nikalne ke liye
    }).populate("shop");

    const data = assignments.map((a) => {
      const specificShopOrder = a.order?.shopOrders?.find(
        (so) => so._id.toString() === a.shopOrderId.toString()
      );

      return {
        _id: a._id,
        assignmentId: a._id,
        shopName: a.shop?.name || "Shop",
        deliveryAddress: a.order?.deliveryAddress?.text || a.order?.deliveryAddress,
        subTotal: specificShopOrder?.subTotal || 0,
        itemsCount: specificShopOrder?.shopOrderItems?.length || 0 
      };
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};