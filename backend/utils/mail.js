import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

// Transporter with Pooling & Timeout Fix
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587, // Render par 587 zyada stable hai
  secure: false, // 587 ke liye false
  pool: true,    // Connection ko hamesha open rakhta hai (Fast Delivery)
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // Check: Ye 16-digit App Password hona chahiye
  },
  tls: {
    rejectUnauthorized: false // Render ke internal blocks bypass karne ke liye
  }
});

export const sendOtpMail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"VatsEcommerce" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password",
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">Use the following OTP to proceed:</p>
          <p style="font-size: 24px; font-weight: bold; color: #000; margin: 20px 0;">${otp}</p>
          <p style="font-size: 14px; color: #888;">Valid for 5 minutes.</p>
        </div>
      </div>`
    });
    console.log("✅ OTP Sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Mail Error: ", error.message);
    return false;
  }
};

export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"VatsEcommerce" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Your Delivery OTP",
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <h2 style="color: #ff4d2d; text-align:center;">Delivery Verification</h2>
          <p style="text-align:center;">Dear <strong>${user.fullName}</strong>, share this OTP with your delivery agent:</p>
          <p style="font-size: 28px; font-weight: bold; color: #000; margin: 20px 0; text-align:center; letter-spacing: 4px;">${otp}</p>
        </div>
      </div>`
    });
    console.log("✅ Delivery OTP Sent");
    return true;
  } catch (error) {
    console.error("❌ Delivery Mail Error: ", error.message);
    return false;
  }
};