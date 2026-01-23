import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase";

const Signup = ({ closeModal, switchModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // setError ko nikaal liya manual errors set karne ke liye
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { role: "user" },
  });

  const role = watch("role");

  // --- Normal Email/Password Signup ---
  const handleSignUp = async (details) => {
    setLoading(true);
    try {
      const finalPayload = {
        ...details,
        location: {
          type: "Point",
          coordinates: [77.1025, 28.7041],
        },
      };

      const res = await axios.post(
        `${serverURL}/api/auth/signup`,
        finalPayload,
        {
          withCredentials: true,
        },
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      dispatch(setUserData(res.data.user || res.data));
      localStorage.setItem("isLoggedIn", "true");

      if (closeModal) closeModal();
      navigate("/");
    } catch (error) {
      const msg = error.response?.data?.message || "";

      // 🔥\ BACKEND ERROR MAPPING (Field ke niche show hogi)
      if (msg.toLowerCase().includes("email")) {
        setError("email", { type: "manual", message: msg });
      } else if (
        msg.toLowerCase().includes("mobile") ||
        msg.toLowerCase().includes("phone")
      ) {
        setError("mobile", { type: "manual", message: msg });
      } else if (msg.toLowerCase().includes("name")) {
        setError("fullName", { type: "manual", message: msg });
      } else {
        setError("password", { type: "manual", message: msg });
      }
    } finally {
      setLoading(false);
    }
  };

const handleGoogleAuth = async () => {
    // 1. Mobile number get karein react-hook-form se
    const mobileValue = watch("mobile");

    // 2. Strict Check: Agar mobile empty hai ya 10 digits ka nahi hai
    if (!mobileValue || !/^[6-9]\d{9}$/.test(mobileValue)) {
      setError("mobile", { 
        type: "manual", 
        message: "⚠️ Please enter a valid 10-digit mobile number first" 
      });
      return; // Popup yahi ruk jayega
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      
      // 3. Google Login Popup (Ab tabhi khulega jab mobile check pass hoga)
      const result = await signInWithPopup(auth, provider);
      
      // 4. Backend Request
      const { data } = await axios.post(`${serverURL}/api/auth/google-auth`, {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile: mobileValue, // User ka manually enter kiya hua mobile bhej rahe hain
          location: { type: "Point", coordinates: [77.1025, 28.7041] }
      }, { withCredentials: true });
      
      if (data.token) localStorage.setItem("token", data.token);
      dispatch(setUserData(data.user || data));
      localStorage.setItem("isLoggedIn", "true");
      
      if (closeModal) closeModal();
      navigate("/");

    } catch (error) {
      console.error("Google Auth Error:", error.code);
      
      // Error handling for UI
      if (error.code === 'auth/unauthorized-domain') {
        alert("Domain Error: Please add 'localhost' to Firebase Authorized Domains.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // No action needed, user just closed the window
      } else {
        setError("email", { type: "manual", message: "Auth failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = "#ff4d2d";

  return (
    <div className="flex items-center justify-center p-4 min-h-[80vh]">
      <div className="bg-white w-full max-w-md">
        <form onSubmit={handleSubmit(handleSignUp)} noValidate>
          <h1 className="text-4xl font-black mb-1 text-[#ff4d2d] tracking-tighter">
            vats
          </h1>
          <p className="text-gray-500 mb-6 text-xs font-bold uppercase tracking-widest">
            Create Your Account
          </p>

          <div className="space-y-4">
            {/* FULL NAME */}
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className={`w-full border-2 rounded-2xl px-4 py-3.5 outline-none transition-all ${errors.fullName ? "border-red-500 bg-red-50" : "focus:border-orange-500"}`}
                {...register("fullName", {
                  required: "Name is required",
                  minLength: { value: 3, message: "Min 3 characters" },
                })}
              />
              {errors.fullName && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className={`w-full border-2 rounded-2xl px-4 py-3.5 outline-none transition-all ${errors.email ? "border-red-500 bg-red-50" : "focus:border-orange-500"}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* MOBILE */}
            <div>
              <input
                type="tel"
                placeholder="Mobile Number"
                className={`w-full border-2 rounded-2xl px-4 py-3.5 outline-none transition-all ${errors.mobile ? "border-red-500 bg-red-50" : "focus:border-orange-500"}`}
                {...register("mobile", {
                  required: "Mobile is required",
                  validate: {
                    isTenDigits: (v) =>
                      /^[6-9]\d{9}$/.test(v) ||
                      "Number must start with 6-9 and be 10 digits",
                    notFake: (v) =>
                      !/^(.)\1{9}$/.test(v) ||
                      "This is not a valid mobile number", // Roke ga 1111111111 ko
                    notSequence: (v) =>
                      v !== "1234567890" ||
                      "Please enter a genuine mobile number", // Roke ga 1234567890 ko
                  },
                })}
              />
              {errors.mobile && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase">
                  ⚠️ {errors.mobile.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={`w-full border-2 rounded-2xl px-4 py-3.5 outline-none transition-all ${errors.password ? "border-red-500 bg-red-50" : "focus:border-orange-500"}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-2 uppercase">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* ROLE SELECTOR */}
          <div className="my-6">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-center">
              Register As
            </label>
            <div className="flex gap-2">
              {["user", "owner", "deliveryBoy"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue("role", r)}
                  className="flex-1 border-2 rounded-xl py-2.5 text-[10px] font-black transition-all uppercase"
                  style={
                    role === r
                      ? {
                          backgroundColor: primaryColor,
                          color: "white",
                          borderColor: primaryColor,
                        }
                      : { borderColor: "#eee", color: "#bbb" }
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-black py-4 rounded-2xl text-white shadow-xl shadow-orange-100 uppercase tracking-widest text-xs disabled:bg-gray-400 transition-all active:scale-95"
            style={{ backgroundColor: loading ? "#ccc" : primaryColor }}
          >
            {loading ? "Creating Account..." : "SIGN UP"}
          </button>
        </form>

        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border-2 rounded-2xl px-4 py-3.5 text-xs font-black text-gray-700 hover:bg-gray-50 uppercase tracking-widest transition-all"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={18} /> Google Signup
        </button>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => (switchModal ? switchModal() : navigate("/signin"))}
            className="font-black underline ml-1"
            style={{ color: primaryColor }}
          >
            LOGIN
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
