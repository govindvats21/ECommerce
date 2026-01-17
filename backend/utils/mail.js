import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// 1. Transporter Create karein
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS, // Yahan Dashboard wala 16-digit App Password aayega
  },
});

// 2. Delivery OTP function
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    // Check if variables are loaded
    if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
      throw new Error("Render Dashboard mein EMAIL ya EMAIL_PASS missing hai!");
    }

    console.log(`Email bhej raha hoon: ${user.email} ko...`);

    const mailOptions = {
      from: `"Delivery Service" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Your Delivery OTP - Order Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #ff4d2d; text-align: center;">Delivery Verification</h2>
          <p>Hi <strong>${user.fullName}</strong>,</p>
          <p>Aapka delivery agent pahunchne wala hai. Order confirm karne ke liye ye OTP share karein:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">Ye OTP agle 5 minute tak valid hai. Kisi aur ke saath share na karein.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="text-align: center; font-size: 12px; color: #aaa;">Team Delivery Service</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully! MessageID:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    // Ye logs Render Dashboard ke "Logs" tab mein dikhenge
    console.error("❌ --- MAIL ERROR START ---");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("❌ --- MAIL ERROR END ---");
    
    // Server crash hone se bachane ke liye error return karein
    return { success: false, error: error.message };
  }
};

// 3. Password Reset function (Optional - agar chahiye ho toh)
export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL}>`,
      to,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}`,
    });
    console.log("Reset OTP Sent!");
  } catch (err) {
    console.error("Reset Mail Error:", err.message);
  }
};