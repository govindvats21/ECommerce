import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Port 465 aur Secure: true ka use kar rahe hain bypass ke liye
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // Check: rgdxaxjhsoezqwql (No spaces)
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30000, // 30 seconds wait karega
  greetingTimeout: 30000,
  socketTimeout: 30000
});

export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password",
      html: `<h2>OTP: ${otp}</h2>`,
    });
    console.log("✅ Reset OTP Sent");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Your Delivery OTP",
      html: `<h2>OTP: ${otp}</h2>`,
    });
    console.log("✅ Delivery OTP Sent");
    return info;
  } catch (error) {
    console.error("❌ CONNECTION ERROR:", error.message);
    // Timeout handle karne ke liye null return
    return null;
  }
};