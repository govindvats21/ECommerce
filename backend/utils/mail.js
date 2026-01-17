import { Resend } from 'resend';
import dotenv from "dotenv";
dotenv.config();

// Gmail password ki ab koi zarurat nahi hai
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 1. Password Reset Mail
 */
export const sendOtpMail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'VatsEcommerce <onboarding@resend.dev>', 
      to: to,
      subject: 'Reset Your Password - VatsEcommerce',
      html: `<strong>Aapka Reset OTP hai: ${otp}</strong>`,
    });

    if (error) {
       console.error("❌ Resend Error:", error);
       return null;
    }
    console.log("✅ Reset Mail Sent!");
    return data;
  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
  }
};

/**
 * 2. Delivery OTP Mail
 */
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    const emailTo = user?.email || user;
    const name = user?.fullName || "Customer";

    console.log(`VatsEcommerce mail bhej raha hai: ${emailTo}`);

    const { data, error } = await resend.emails.send({
      from: 'VatsEcommerce <onboarding@resend.dev>',
      to: emailTo,
      subject: 'Delivery OTP - VatsEcommerce',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">VatsEcommerce Delivery</h2>
          <p>Hi <strong>${name}</strong>, aapka delivery verification OTP niche hai:</p>
          <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 30px; letter-spacing: 5px; font-weight: bold; color: #1e293b; border: 1px solid #e2e8f0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
            Ye OTP sirf 5 minute tak valid hai. Kripya ise rider ke sath share karein.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return null;
    }

    console.log("✅ Delivery Mail Sent via VatsEcommerce!");
    return data;
  } catch (err) {
    console.error("❌ Fatal Error:", err.message);
    return null;
  }
};