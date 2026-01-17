import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Transporter configuration jo Render par 100% chalti hai
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // Render Dashboard par bina space wala password dalo
  },
  tls: {
    // Ye line Google ke security blocks ko bypass karne mein help karti hai
    rejectUnauthorized: false
  }
});

// 1. Password Reset Mail Function
export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #333;">Password Reset OTP</h2>
          <p style="font-size: 24px; font-weight: bold; color: #ff4d2d;">${otp}</p>
          <p>Ye OTP 5 minute mein expire ho jayega.</p>
        </div>
      `,
    });
    console.log("✅ Reset OTP sent successfully");
  } catch (error) {
    console.error("❌ Reset Mail Error:", error.message);
  }
};

// 2. Delivery OTP Mail Function
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    console.log("Email bhej raha hoon:", user.email);

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

    console.log("✅ Delivery OTP Sent! ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ NODEMAILER ERROR:", error.message);
    // Error throw nahi karenge taaki backend crash na ho
    return null;
  }
};