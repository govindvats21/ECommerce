import express from "express";
import {
  googleAuth,
  resetPassword,
  sendOtp,
  signIn,
  signOut,
  signUp,
  verifyOtp,
} from "../controllers/authController.js";
const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/signout", signOut);
authRouter.post("/google-auth", googleAuth);

authRouter.post("/sendotp", sendOtp);
authRouter.post("/verifyotp", verifyOtp);
authRouter.post("/resetpassword", resetPassword);
export default authRouter;
