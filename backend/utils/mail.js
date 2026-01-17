import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

// Render/Cloud ke liye updated transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // 587 ke liye false hi rahega
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  // TLS settings zaroori hain cloud environments ke liye
  tls: {
    rejectUnauthorized: false
  }
});

export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password",
      html: `... (aapka purana html code) ...`
    });
  } catch (error) {
    console.error("Mail Error:", error);
  }
}

export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Your Delivery OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h2 style="color: #ff4d2d; text-align:center;">Delivery Verification</h2>
            <p style="font-size: 16px; color: #555; text-align:center;">
              Dear <strong>${user.fullName}</strong>,<br/>
              Please share the following One-Time Password (OTP) with your delivery agent to confirm your order delivery:
            </p>
            <p style="font-size: 28px; font-weight: bold; color: #000; margin: 20px 0; text-align:center; letter-spacing: 4px;">
              ${otp}
            </p>
            <p style="font-size: 14px; color: #888; text-align:center;">
              This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone except the delivery agent.
            </p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #bbb; text-align:center;">
              Thank you for shopping with us!<br/>
              — Team Delivery Service
            </p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error("Delivery Mail Error:", error);
    throw error; // Isse controller ko pata chalega ki mail fail hui hai
  }
};