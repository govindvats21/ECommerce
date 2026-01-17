import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Render/Cloud ke liye updated transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Render par ye sabse aasaan chalta hai
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // Yahan 'App Password' hi dalna
  },
});

// 1. Password Reset OTP
export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #555;">Use the following OTP to proceed:</p>
            <p style="font-size: 24px; font-weight: bold; color: #000; margin: 20px 0;">${otp}</p>
          </div>
        </div>
      `,
    });
    console.log("Reset OTP Sent");
  } catch (error) {
    console.error("Mail Error:", error.message);
  }
};

// 2. Delivery OTP
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Your Delivery OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h2 style="color: #ff4d2d; text-align:center;">Delivery Verification</h2>
            <p style="font-size: 16px; color: #555; text-align:center;">
              Dear <strong>${user.fullName}</strong>,<br/>
              Share this OTP with your delivery agent:
            </p>
            <p style="font-size: 28px; font-weight: bold; color: #000; margin: 20px 0; text-align:center; letter-spacing: 4px;">
              ${otp}
            </p>
            <p style="font-size: 14px; color: #888; text-align:center;">Valid for 5 minutes.</p>
          </div>
        </div>
      `,
    });
    console.log("Delivery OTP Sent to:", user.email);
    return info;
  } catch (error) {
    console.error("Delivery Mail Error:", error.message);
    throw error;
  }
};