import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Transporter configuration for Render/Cloud
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Port 587 ke liye false hi rehta hai
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // Yahan 16-digit App Password aayega
  },
  tls: {
    // Ye settings timeout aur SSL errors se bachati hain
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  connectionTimeout: 10000, // 10 seconds tak try karega connect karne ka
  greetingTimeout: 5000,
  socketTimeout: 15000,
});

// 1. Password Reset Mail
export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #333;">Password Reset OTP</h2>
          <p style="font-size: 24px; font-weight: bold;">${otp}</p>
        </div>
      `,
    });
    console.log("Reset OTP sent successfully");
  } catch (error) {
    console.error("Reset Mail Error:", error.message);
  }
};

// 2. Delivery OTP Mail
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    console.log("Starting email process for:", user.email);

    const info = await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Your Delivery OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #ff4d2d; text-align:center;">Delivery Verification</h2>
            <p style="font-size: 16px; color: #555; text-align:center;">
              Hi <strong>${user.fullName}</strong>, share this OTP with your rider:
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #000; text-align:center; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </p>
            <p style="font-size: 12px; color: #888; text-align:center;">Valid for 5 minutes.</p>
          </div>
        </div>
      `,
    });

    console.log("Delivery OTP Sent! MessageID:", info.messageId);
    return info;
  } catch (error) {
    // Logs mein exact error dikhega
    console.error("--- NODEMAILER ERROR ---");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("------------------------");
    throw error;
  }
};