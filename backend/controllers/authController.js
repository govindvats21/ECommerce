import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

// --- SIGN UP ---
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, role, mobile, location } = req.body;

    if (!fullName || !email || !password || !role || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      mobile,
      location: location || {
        type: "Point",
        coordinates: [77.1025, 28.7041] // Default Delhi
      }
    });

    const token = genToken(user._id);

    // Cookie settings
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
       secure: true,
      sameSite: "none",
      path: "/",
    });

    // Password remove karke data bhejna safe hai
    const { password: _, ...userData } = user.toObject();
    return res.status(200).json({ userData, token });
  } catch (error) {
    return res.status(500).json({ message: `Signup error: ${error.message}` });
  }
};

// --- SIGN IN ---
// --- SIGN IN (Fixed for Google Users) ---
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Password field check karein taaki bcrypt crash na ho
    if (!password) {
      return res.status(400).json({ message: "Password is required!" });
    }

    const user = await User.findOne({ email }).select("+password"); // password select karein

    if (!user) return res.status(400).json({ message: "User not found!" });

    // 2. 🔥 Sabse zaroori check: Agar password database mein hai hi nahi (Google User)
    if (!user.password) {
      return res.status(400).json({ 
        message: "This email is linked with Google. Please login using Google." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    const { password: _, ...userData } = user.toObject();
    return res.status(200).json({ userData, token });
  } catch (error) {
    return res.status(500).json({ message: `Signin error: ${error.message}` });
  }
};

// --- GOOGLE AUTH ---
export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, role, mobile } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName,
        email,
        role: role || "customer", // Default role
        mobile: mobile || "",
        // Google users ke liye default location
        location: { type: "Point", coordinates: [77.1025, 28.7041] }
      });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
       secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ userData: user, token });
  } catch (error) {
    return res.status(500).json({ message: `Google Auth error: ${error.message}` });
  }
};

// --- FORGOT PASSWORD (OTP) ---
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found!" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    user.isOtpVerified = false;
    await user.save();

    await sendOtpMail(email, otp);
    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ message: `OTP error: ${error.message}` });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Verify error: ${error.message}` });
  }
};

// --- RESET PASSWORD ---
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found!" });

    // 🔥 SECURITY CHECK: Bina verify kiye reset na ho sake
    if (!user.isOtpVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false; // Reset security flag

    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Reset error: ${error.message}` });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Signout error" });
  }
};