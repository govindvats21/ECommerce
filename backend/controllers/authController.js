import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, role, mobile } = req.body;

    if (!fullName || !email || !password || !role || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      mobile,
    });

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "Strict",
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Signup error: ${error.message}` });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found !" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect !" });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "Strict",
    });

    const { password: _, ...userData } = user.toObject();

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ message: `Sigin error: ${error.message}` });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "sign out successfully" });
  } catch (error) {
    return res.status(500).json({ message: `signout error ${error}` });
  }
};

// Google Auth

export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, role, mobileNumber } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName,
        email,
        role,
        mobileNumber,
      });
    }

    const token = genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "Strict",
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: `signupwithgoogle error ${error}` });
  }
};


export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found !" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() +  5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();

    await sendOtpMail(email, otp);

    return res.status(200).json({ message: "email successfully send" });
  } catch (error) {
    return res.status(500).json({ message: `send otp error ${error}` });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "invalid/expired otp" });
    }

    user.isOtpVerified = true
    user.resetOtp = undefined
    user.otpExpires = undefined

    await user.save();

       return res.status(200).json({ message: "otp verified" });

  } catch (error) {
        return res.status(500).json({ message: `verify otp error ${error}` });

  }
};


export const resetPassword = async (req,res) => {
  try {
    const {email,newPassword} = req.body
    const user = await User.findOne({ email });
  if (!user) {
      return res.status(400).json({ message: "User not found !" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword
user.isOtpVerified = false

await user.save()
    return res.status(200).json({ message: "password reset successfully" });

  } catch (error) {
    return res.status(500).json({ message: `reset otp error ${error}` });
    
  }
}