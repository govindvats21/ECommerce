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

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { role: "user" },
  });

  // --- Normal Sign In ---
  const handleSignIn = async (details) => {
    try {
      const res = await axios.post(`${serverURL}/api/auth/signin`, details, {
        withCredentials: true,
      });

      // 🔥 FIX 1: Token ko LocalStorage mein save karein
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // Backend response se userData dispatch karein
      dispatch(setUserData(res.data.userData || res.data));
      localStorage.setItem("isLoggedIn", "true");

      if (closeModal) closeModal();
      navigate("/"); 
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  // --- Google Sign In ---
  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const { data } = await axios.post(
        `${serverURL}/api/auth/google-auth`,
        { email: result.user.email },
        { withCredentials: true }
      );

      // 🔥 FIX 2: Google login ke baad bhi token save karein
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      dispatch(setUserData(data.user || data));
      localStorage.setItem("isLoggedIn", "true");

      if (closeModal) closeModal();
      navigate("/");
    } catch (error) {
      console.log("Google Auth Error:", error);
      alert("Google Login failed.");
    }
  };

  const primaryColor = "#ff4d2d";

  return (
    <div className="flex items-center justify-center p-4 min-h-[80vh]">
      <div className="bg-white w-full max-w-md">
        <form onSubmit={handleSubmit(handleSignIn)}>
          <h1 className="text-3xl font-black mb-2 text-[#ff4d2d]">Vats</h1>
          <p className="text-gray-600 mb-6 text-sm font-bold">Welcome back!</p>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full border rounded-xl px-4 py-3 outline-none focus:border-orange-500"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full border rounded-xl px-4 py-3 pr-10 outline-none focus:border-orange-500"
                {...register("password", { required: "Password is required" })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400">
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>

          <button type="submit" className="w-full font-bold py-4 mt-6 rounded-xl text-white shadow-lg shadow-orange-100 transition-transform active:scale-95" style={{ backgroundColor: primaryColor }}>
            LOGIN
          </button>
        </form>

        <button className="w-full mt-4 flex items-center justify-center gap-2 border rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors" onClick={handleGoogleAuth}>
          <FcGoogle size={20} /> Google Login
        </button>

        <p className="mt-8 text-center text-sm text-gray-500 font-bold">
          Don't have an account?{" "}
          <button 
            type="button"
            onClick={() => switchModal ? switchModal() : navigate("/signup")} 
            className="font-black" 
            style={{ color: primaryColor }}
          >
            SIGN UP
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signin;