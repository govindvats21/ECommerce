import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  acceptOrder,
  getCurrentOrder,
  getDeliveryBoyAssignment,
  getMyOrders,
  getOrderById,
  getTodayDeliveries,
  getAllDeliveryBoys,
  placeOrder,
  sendDeliveryOtp,
  updateOrderStatus,
  verifyDeliveryOtp,
  verifyPayment, 

} from "../controllers/orderController.js";

const orderRouter = express.Router();

// User Orders & Payment
orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);

// Delivery Boy Assignment & Management
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/get-today-deliveries", isAuth, getTodayDeliveries);
orderRouter.get("/get-all-boys", isAuth, getAllDeliveryBoys);

// Delivery Verification (OTP)
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp);

// Shop Owner / Status Update
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
// orderRoutes.js

export default orderRouter;