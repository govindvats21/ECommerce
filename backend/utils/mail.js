import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    // Check variables
    if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
      console.log("Error: Variables not found in Render!");
      return { success: false, message: "Env variables missing" };
    }

    const info = await transporter.sendMail({
      from: `"Delivery" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Your OTP",
      text: `Your OTP is ${otp}`,
      html: `<b>${otp}</b>`,
    });

    console.log("Email sent successfully!");
    return { success: true, info };
  } catch (error) {
    // Ye message humein bata dega ki asli bimari kya hai
    console.log("--- REAL ERROR START ---");
    console.log("Message:", error.message);
    console.log("Code:", error.code);
    console.log("--- REAL ERROR END ---");
    return { success: false, error: error.message };
  }
};