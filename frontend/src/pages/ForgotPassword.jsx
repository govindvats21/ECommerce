import axios from "axios";
import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../App";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate()
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // colors
  const primaryColor = "#ff4d2d"; // rich orange
  const hoverColor = "#e64323"; // darker orange
  const bgColor = "#fff9f6"; // light off-white background
  const borderColor = "#ddd";

  const handleSendOtp = async () => {
    setLoading(true);
    try {
     const res =  await axios.post(
        `${serverURL}/api/auth/sendotp`,
        { email },
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      
      setLoading(false);
      setStep(2);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
     const res = await axios.post(
        `${serverURL}/api/auth/verifyotp`,
        { email, otp },
        {
          withCredentials: true,
        }
      );
      console.log(res.data);

      setLoading(false);
      setStep(3);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);

    if (newPassword === confirmPassword) {
      try {
        const result = await axios.post(
          `${serverURL}/api/auth/resetpassword`,
          { email, newPassword },
          { withCredentials: true }
        );
        setLoading(false);

        navigate("/signin");
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    } else {
      alert("both password is not equal.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[#ddd]">
        {/* Heading */}
        <h1 className="text-2xl font-bold mb-2 text-center text-[#ff4d2d]">
          Forgot Password
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Follow the steps to reset your password
        </p>

        {/* Step 1: Email */}

        {step === 1 && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-[#ddd] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            <button
              type="submit"
              className="w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-[#fff9f6]"
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = ["#ff4d2d"])
              }
              onClick={handleSendOtp}
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Send Otp"}
            </button>
          </>
        )}

        {/* Step 2: Send Otp */}

        {step === 2 && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="Enter the OTP sent to your email"
                className="w-full border border-[#ddd] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
              />
            </div>
            <button
              type="submit"
              className="w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-[#fff9f6]"
              disabled={loading}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = primaryColor)
              }
              onClick={handleVerifyOtp}
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Verify OTP"}
            </button>
          </>
        )}

        {/* Step 3: New Password */}

        {step === 3 && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full border border-[#ddd] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full border border-[#ddd] rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-[#fff9f6]"
              disabled={loading}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = primaryColor)
              }
              onClick={handleResetPassword}
            >
              {loading ? (
                <ClipLoader size={20} color="white" />
              ) : (
                "Reset Password"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
