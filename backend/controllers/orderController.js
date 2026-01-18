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

    // 1. Grouping Logic (Same as before)
    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop?._id || item.shop;
      if (!shopId) return;
      if (!groupItemsByShop[shopId]) groupItemsByShop[shopId] = [];
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId);
        if (!shop) throw new Error(`Shop not found: ${shopId}`);
        const items = groupItemsByShop[shopId];
        const subTotal = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.price)), 0);
        return {
          shop: shop._id,
          owner: shop.owner,
          subTotal,
          status: "pending",
          shopOrderItems: items.map((i) => ({
            item: i.product || i._id,
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
            images: Array.isArray(i.images) ? i.images : [i.image || i.images]
          })),
        };
      })
    );

    // 2. Database mein Order Create karna (Ye COD aur Online dono ke liye common hai)
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      totalAmount: Number(totalAmount),
      shopOrders,
      deliveryAddress,
      payment: paymentMethod === "cod" ? false : false // Default false
    });

    // 3. AGAR COD HAI TOH YAHI SE RETURN KARDO (Razorpay touch bhi nahi hoga)
    if (paymentMethod === "cod") {
      console.log("COD Order Placed Successfully");
      return res.status(200).json(newOrder);
    }

    // 4. AGAR ONLINE HAI TOH RAZORPAY CHALAYEIN
    if (paymentMethod === "online") {
      try {
        const razorOrder = await instance.orders.create({
          amount: Math.round(Number(totalAmount) * 100),
          currency: "INR",
          receipt: `order_rcpt_${newOrder._id.toString().slice(-6)}`,
        });

        newOrder.razorPayOrderId = razorOrder.id;
        await newOrder.save();
        return res.status(200).json({ razorOrder, orderId: newOrder._id });
      } catch (razorError) {
        console.error("Razorpay Order Error:", razorError);
        // Agar Razorpay fail ho jaye toh bhi hum order delete nahi kar rahe, 
        // bas user ko error dikha rahe hain
        return res.status(400).json({ 
          message: "Razorpay Init Failed but Order Created", 
          orderId: newOrder._id,
          error: razorError.message 
        });
      }
    }

  } catch (error) {
    console.error("Main PlaceOrder Error:", error);
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
// orderController.js ke andar updateOrderStatus ko isse replace karein
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status, riderId } = req.body;

    // Order dhoondein
    const order = await Order.findById(orderId).populate("user");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Match logic: String me convert karke hi check karein
    const shopOrder = order.shopOrders.find(
      (o) => String(o.shop?._id || o.shop) === String(shopId)
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "Shop details not found in this order" });
    }

    shopOrder.status = status;

    // Delivery Boy Assignment Logic
    if (status === "out of delivery") {
      if (!riderId) return res.status(400).json({ message: "Rider ID is required" });
      
      shopOrder.assignedDeliveryBoy = riderId;

      await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: [riderId],
        assignedTo: riderId,
        status: "assigned",
      });
    }

    // Deliver hone par time set karein
    if (status === "delivered") {
      shopOrder.deliveredAt = new Date();
    }

    await order.save();
    res.status(200).json({ message: "Status Updated Successfully" });
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
      .populate("user") 
      .populate({
        path: "shopOrders.shop",
        model: "Shop"
      })
      .populate({
        path: "shopOrders.owner", // <--- Ye line add karni hai taaki mobile mil sake
        model: "User",
        select: "mobile fullName email" 
      })
      .populate("shopOrders.shopOrderItems.item")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

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
      // 1. Database mein filter lagao
      const assignments = await DeliveryAssignment.find({ 
        broadcastedTo: { $in: [req.userId] }, // Array check
        status: "broadcasted" 
      }).populate("shop order");

      // 2. Data ko frontend ke layak banao
      const data = assignments.map(a => ({
        _id: a._id,
        assignmentId: a._id,
        shopName: a.shop?.name || "Unknown Shop",
        deliveryAddress: a.order?.deliveryAddress, 
        subTotal: a.order?.shopOrders?.find(so => String(so._id) === String(a.shopOrderId))?.subTotal || 0
      }));

      res.status(200).json(data);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};