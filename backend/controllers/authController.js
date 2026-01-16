import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

// SIGN UP
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, role, mobile, location } = req.body;
    if (!fullName || !email || !password || !role || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName, email, password: hashedPassword, role, mobile,
      location: location || { type: "Point", coordinates: [77.1025, 28.7041] }
    });

    const token = genToken(user._id);

    // Cookie (Backup ke liye)
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    // Token ko JSON mein bhi bhej rahe hain
    return res.status(200).json({ user, token }); 
  } catch (error) {
    return res.status(500).json({ message: `Signup error: ${error.message}` });
  }
};

// SIGN IN
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found !" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password is incorrect !" });

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    const { password: _, ...userData } = user.toObject();
    // Token response mein bhej rahe hain
    return res.status(200).json({ userData, token }); 
  } catch (error) {
    return res.status(500).json({ message: `Sigin error: ${error.message}` });
  }
};

// GOOGLE AUTH
export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, role, mobileNumber } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ fullName, email, role, mobileNumber });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: `googleAuth error ${error}` });
  }
};

// Signout, OTP etc (Baki functions same rahenge...)
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "sign out successfully" });
  } catch (error) {
    return res.status(500).json({ message: `signout error ${error}` });
  }
};
// ... rest of the otp/reset functions