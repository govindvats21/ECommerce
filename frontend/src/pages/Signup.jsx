import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";

const Signup = () => {
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

  const handleSignUp = async(details) => {
try {
   const res = await axios.post(`${serverURL}/api/auth/signup`, details, {
        withCredentials: true,
      });
    dispatch(setUserData(res.data))
      
} catch (error) {
  console.log(error);
  
}
  };

 const handleGoogleAuth = async () => {
    // if(!mobileNumber){
    //   return alert("Mobile Number is requird")
    // }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log(result);

    try {
      const { data } = await axios.post(
        `${serverURL}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobileNumber:result.mobileNumber,
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
      <form onSubmit={handleSubmit(handleSignUp)}>

          <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d]">Vingo</h1>

          <p className="text-gray-600 mb-2">
            Create your account to get started with delicious food deliveries
          </p>
          {/* Full Name */}
          <div className="mb-1">
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              style={{ borderColor }}
              {...register("fullName", { required: "Full name is required" })}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName.message}</p>
            )}
          </div>

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

          {/* Mobile Number */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="Enter your mobile number"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              style={{ borderColor }}
              {...register("mobileNumber", {
                required: "Mobile number is required",
              })}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-sm">{errors.mobile.message}</p>
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

          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Role</label>
            <div className="flex gap-2">
              {["user", "owner", "deliveryBoy"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setValue("role", r)}
                  className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                  style={
                    role === r
                      ? { backgroundColor: primaryColor, color: "white" }
                      : { borderColor, color: "#333" }
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

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
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold"
            style={{ color: primaryColor }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
