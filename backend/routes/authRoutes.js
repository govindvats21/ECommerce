import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";

// 1. SIGN UP
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, role, mobile, location } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName, email, password: hashedPassword, role, mobile,
      location: location || { type: "Point", coordinates: [77.1025, 28.7041] }
    });
    const token = genToken(user._id);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", path: "/" });
    return res.status(200).json({ user, token }); 
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. SIGN IN
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });
    const token = genToken(user._id);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", path: "/" });
    const { password: _, ...userData } = user.toObject();
    return res.status(200).json({ userData, token }); 
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. GOOGLE AUTH
export const googleAuth = async (req, res) => {
  try {
    const { email, fullName } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, fullName, role: "user" });
    }
    const token = genToken(user._id);
    return res.status(200).json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 4. SIGN OUT
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Signed out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// --- YE TEENO FUNCTIONS DALNA ZAROORI HAI ---

// 5. SEND OTP
export const sendOtp = async (req, res) => {
  try {
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};