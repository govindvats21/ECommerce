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

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
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
        }
      };

      const res = await axios.post(`${serverURL}/api/auth/signup`, finalPayload, {
        withCredentials: true,
      });

      // 🔥 FIX 1: Token ko LocalStorage mein save karein
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Backend response se user data dispatch karein
      dispatch(setUserData(res.data.user || res.data));
      localStorage.setItem("isLoggedIn", "true");
      
      if (closeModal) closeModal();
      navigate("/");
      alert("Signup Successful!");
    } catch (error) {
      console.error("Signup Error:", error.response?.data);
      alert(error.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- Google Authentication ---
  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const { data } = await axios.post(`${serverURL}/api/auth/google-auth`, {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile: result.user.phoneNumber || "",
          location: { type: "Point", coordinates: [77.1025, 28.7041] }
      }, { withCredentials: true });
      
      // 🔥 FIX 2: Google login ke baad bhi token save karein
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      dispatch(setUserData(data.user || data));
      localStorage.setItem("isLoggedIn", "true");
      
      if (closeModal) closeModal();
      navigate("/");
    } catch (error) {
      console.error("Google Auth Error:", error);
      alert("Google Login failed.");
    }
  };

  const primaryColor = "#ff4d2d";

  return (
    <div className="flex items-center justify-center p-4 min-h-[80vh]">
      <div className="bg-white w-full max-w-md">
        <form onSubmit={handleSubmit(handleSignUp)}>
          <h1 className="text-4xl font-black mb-1 text-[#ff4d2d] tracking-tighter">vats</h1>
          <p className="text-gray-500 mb-6 text-xs font-bold uppercase tracking-widest">Create Your Account</p>

          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              className="w-full border-2 rounded-2xl px-4 py-3.5 outline-none focus:border-orange-500 transition-all" 
              {...register("fullName", { required: "Name is required" })} 
            />
            {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName.message}</p>}

            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full border-2 rounded-2xl px-4 py-3.5 outline-none focus:border-orange-500 transition-all" 
              {...register("email", { required: "Email is required" })} 
            />
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              className="w-full border-2 rounded-2xl px-4 py-3.5 outline-none focus:border-orange-500 transition-all" 
              {...register("mobile", { required: "Mobile is required" })} 
            />
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="w-full border-2 rounded-2xl px-4 py-3.5 outline-none focus:border-orange-500 transition-all" 
                {...register("password", { required: "Min 6 characters", minLength: 6 })} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400">
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          <div className="my-6">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 text-center">Register As</label>
            <div className="flex gap-2">
              {["user", "owner", "deliveryBoy"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue("role", r)}
                  className="flex-1 border-2 rounded-xl py-2.5 text-[10px] font-black transition-all uppercase"
                  style={role === r ? { backgroundColor: primaryColor, color: "white", borderColor: primaryColor } : { borderColor: "#eee", color: "#bbb" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full font-black py-4 rounded-2xl text-white shadow-xl shadow-orange-100 uppercase tracking-widest text-xs disabled:bg-gray-400" 
            style={{ backgroundColor: loading ? "#ccc" : primaryColor }}
          >
            {loading ? "Creating Account..." : "SIGN UP"}
          </button>
        </form>

        <button 
          className="w-full mt-4 flex items-center justify-center gap-2 border-2 rounded-2xl px-4 py-3.5 text-xs font-black text-gray-700 hover:bg-gray-50 uppercase tracking-widest" 
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={18} /> Google Signup
        </button>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Already have an account?{" "}
          <button 
            type="button"
            onClick={() => switchModal ? switchModal() : navigate("/signin")} 
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