import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Signin = ({ closeModal, switchModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm();

  const handleSignIn = async (details) => {
    setLoading(true);
    try {
      const res = await axios.post(`${serverURL}/api/auth/signin`, details, {
        withCredentials: true,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      dispatch(setUserData(res.data.userData || res.data));
      localStorage.setItem("isLoggedIn", "true");

      if (closeModal) closeModal();
      navigate("/"); 
    } catch (error) {
      const message = error.response?.data?.message || "";
      
      // 🔥 Illegal Argument ya Wrong Password ki error password field ke niche
      if (message.toLowerCase().includes("password") || message.toLowerCase().includes("illegal") || message.toLowerCase().includes("credentials")) {
        setError("password", { type: "manual", message: "Incorrect password or invalid data" });
      } 
      // User not found ki error email ke niche
      else if (message.toLowerCase().includes("user") || message.toLowerCase().includes("found")) {
        setError("email", { type: "manual", message: "User not found with this email" });
      } else {
        setError("email", { type: "manual", message: message || "Login failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(`${serverURL}/api/auth/google-auth`, { email: result.user.email }, { withCredentials: true });
      if (data.token) localStorage.setItem("token", data.token);
      dispatch(setUserData(data.user || data));
      localStorage.setItem("isLoggedIn", "true");
      if (closeModal) closeModal();
      navigate("/");
    } catch (error) {
      console.error("Google login failed");
    }
  };

  const primaryColor = "#ff4d2d";

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md">
        <form onSubmit={handleSubmit(handleSignIn)} noValidate>
          <h1 className="text-4xl font-black mb-1 text-[#ff4d2d] tracking-tighter uppercase">vats</h1>
          <p className="text-gray-500 mb-8 text-[10px] font-black uppercase tracking-[0.2em]">Sign In to Continue</p>

          <div className="space-y-4">
            {/* EMAIL */}
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="Email Address"
                className={`w-full border-2 rounded-2xl px-5 py-4 outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'focus:border-orange-500 border-gray-100'}`}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <span className="text-red-500 text-[10px] font-black ml-2 uppercase tracking-wider">{errors.email.message}</span>}
            </div>
            
            {/* PASSWORD */}
            <div className="flex flex-col gap-1">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className={`w-full border-2 rounded-2xl px-5 py-4 outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'focus:border-orange-500 border-gray-100'}`}
                  {...register("password", { required: "Password is required" })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4.5 text-gray-400 mt-0.5">
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-[10px] font-black ml-2 uppercase tracking-wider">{errors.password.message}</span>}
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button type="button" onClick={() => { if(closeModal) closeModal(); navigate("/forgot-password"); }} className="text-[10px] font-black text-gray-400 hover:text-[#ff4d2d] uppercase tracking-widest">
              Forgot Password?
            </button>
          </div>

          <button disabled={loading} type="submit" className="w-full font-black py-4 mt-6 rounded-2xl text-white shadow-xl shadow-orange-100 uppercase tracking-[0.2em] text-[11px] active:scale-95 disabled:bg-gray-300 transition-all" style={{ backgroundColor: loading ? "#ccc" : primaryColor }}>
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        <button className="w-full mt-4 flex items-center justify-center gap-2 border-2 rounded-2xl px-4 py-4 text-[11px] font-black text-gray-700 hover:bg-gray-50 uppercase tracking-widest transition-all" onClick={handleGoogleAuth}>
          <FcGoogle size={20} /> Google Login
        </button>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
          Don't have an account?{" "}
          <button type="button" onClick={() => switchModal ? switchModal() : navigate("/signup")} className="underline ml-1" style={{ color: primaryColor }}>SIGN UP</button>
        </p>
      </div>
    </div>
  );
};

export default Signin;