import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Signin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "user",
    },
  });
  const role = watch("role");

  const handleSignIn = async (details) => {
    try {
      const res = await axios.post(`${serverURL}/api/auth/signin`, details, {
        withCredentials: true,
      });
          dispatch(setUserData(res.data))
      
    } catch (error) {
      console.log(error);
    }
  };



  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log(result);

    try {
      const { data } = await axios.post(
        `${serverURL}/api/auth/google-auth`,
        {
          email: result.user.email,
        },
        {
          withCredentials: true,
        }
      );
dispatch(setUserData(data))

    } catch (error) {
      console.log(error);
    }
  };

  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[#ff4d2d]">
        <form onSubmit={handleSubmit(handleSignIn)}>
          <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d]">Vats</h1>

          <p className="text-gray-600 mb-2">
            Create your account to get started with delicious food deliveries
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              style={{ borderColor }}
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:border-orange-500"
                style={{ borderColor }}
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>


{/* password forget  */}
          <p
            className="text-right mb-4 text-[#ff4d2d] cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forget Password
          </p>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full font-semibold py-2 rounded-lg transition duration-200"
            style={{ backgroundColor: primaryColor, color: "white" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = hoverColor)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = primaryColor)
            }
          >
            Signup
          </button>
        </form>
        {/* Google Auth */}
        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 cursor-pointer"
          style={{ borderColor }}
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span className="font-medium text-gray-700">Sign up with Google</span>
        </button>

        {/* Already have account */}
        <p className="mt-6 text-center text-gray-600">
          Want to create a new account?{" "}
          <Link
            to="/signup"
            className="font-semibold"
            style={{ color: primaryColor }}
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
