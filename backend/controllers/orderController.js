import DeliveryAssignment from "../models/deliveryAssignment.js";
import Order from "../models/orderModel.js";
import Shop from "../models/shopModel.js";
import User from "../models/userModel.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import { sendDeliveryOtpMail } from "../utils/mail.js";

dotenv.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. PLACE ORDER
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

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
      payment: false
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
    res.status(500).json({ message: error.message });
  }
};

// 2. VERIFY PAYMENT (Socket removed)
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const payment = await instance.payments.fetch(razorpay_payment_id);

    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "Payment failed" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(400).json({ message: "Order not found" });

    order.payment = true;
    order.razorPayPaymentId = razorpay_payment_id;
    await order.save();

    // SOCKET LOGIC REMOVED FROM HERE
    // Ab user ko refresh karne par update dikhega
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// 3. UPDATE ORDER STATUS (Socket removed)
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

      await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });
      // SOCKET BROADCAST REMOVED
    }
    await order.save();
    res.status(200).json({ message: "Status Updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Baki ke functions (acceptOrder, getCurrentOrder, etc.) niche same logic se chalenge ---
// Note: Maine unme se bhi socket calls hata diye hain.

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment || assignment.status !== "broadcasted") return res.status(400).json({ message: "Expired" });

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    await assignment.save();

    const order = await Order.findById(assignment.order);
    const shopOrder = order.shopOrders.id(assignment.shopOrderId);
    if (shopOrder) shopOrder.assignedDeliveryBoy = req.userId;

    await order.save();
    return res.status(200).json({ message: "order accepted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 600000;

    await order.save();
    await sendDeliveryOtpMail(order.user, otp); // Email function still works!
    return res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ... Baki GET functions (getMyOrders, getTodayDeliveries, etc.) as it is rahenge
// (Maine unhe compact rakha hai space ke liye, logic unchanged hai)

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    let orders;
    if (user.role === "user") {
      orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 }).populate("shopOrders.owner shopOrders.shop user");
    } else {
      orders = await Order.find({ "shopOrders.owner": req.userId }).sort({ createdAt: -1 }).populate("user shopOrders.shop");
    }
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId);
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (shopOrder.deliveryOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    shopOrder.status = "delivered";
    await order.save();
    await DeliveryAssignment.updateOne({ shopOrderId: shopOrder._id }, { status: "completed" });
    res.status(200).json({ message: "Delivered" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Is function ko apne orderController.js ke niche add karein
export const getAllDeliveryBoys = async (req, res) => {
  try {
    const boys = await User.find({ role: "deliveryBoy" }).select("fullName _id mobile");
    res.status(200).json(boys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ye bhi add kar lena agar routes mein use ho raha hai
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

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop")
      .populate({
        path: "order",
        populate: { path: "user", select: "fullName email mobile" },
      });

    if (!assignment || !assignment.order) return res.status(200).json(null);

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
        if(String(so.assignedDeliveryBoy) === String(req.userId) && so.status === 'delivered') count++;
      });
    });

    res.status(200).json([{ hour: new Date().getHours(), count }]);
  } catch (error) {
    return res.status(500).json({ message: "Today deliveries error" });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
    try {
      const assignments = await DeliveryAssignment.find({ broadcastedTo: req.userId, status: "broadcasted" }).populate("shop order");
      const data = assignments.map(a => ({
        _id: a._id,
        assignmentId: a._id,
        shopName: a.shop?.name,
        deliveryAddress: a.order?.deliveryAddress?.text || a.order?.deliveryAddress,
        subTotal: a.order?.shopOrders?.find(so => String(so._id) === String(a.shopOrderId))?.subTotal || 0
      }));
      res.status(200).json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
};