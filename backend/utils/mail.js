import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

export const sendOtpMail = async (to, otp) => {
  // 1. Pehle Port 465 (Secure) Try karein
  const config465 = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // 465 ke liye true
    pool: true,
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false }
  };

  // 2. Fallback Port 587 (TLS)
  const config587 = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // 587 ke liye false
    pool: true,
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false }
  };

  const mailOptions = {
    from: `"VatsEcommerce" <${process.env.EMAIL}>`,
    to,
    subject: "Verification OTP",
    html: `<div style="font-family: Arial; text-align: center;">
            <h2>Your OTP Code</h2>
            <h1 style="color: #4CAF50;">${otp}</h1>
           </div>`
  };

  // --- Pehla Try: Port 465 ---
  try {
    const transporter = nodemailer.createTransport(config465);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP Sent via Port 465:", info.messageId);
    return true;
  } catch (err465) {
    console.log("⚠️ Port 465 Failed, trying Port 587...");

    // --- Doosra Try: Port 587 ---
    try {
      const transporter587 = nodemailer.createTransport(config587);
      const info = await transporter587.sendMail(mailOptions);
      console.log("✅ OTP Sent via Port 587:", info.messageId);
      return true;
    } catch (err587) {
      console.error("❌ All ports failed on Render!");
      console.error("Error Detail:", err587.message);
      return false;
    }
  }
};

// Delivery Mail Function
export const sendDeliveryOtpMail = async (user, otp) => {
  return await sendOtpMail(user.email, otp);
};