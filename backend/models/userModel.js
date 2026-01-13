import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    mobile: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy"],
      required: true,
    },
    resetOtp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    // Location field ko optional rakha hai taaki purana data crash na ho
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [] }, // Default empty array
    },
    socketId: {
      type: String
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Location index hatana zaroori hai agar hum geospatial queries use nahi kar rahe
// userSchema.index({ location: "2dsphere" }); 

const User = mongoose.model("User", userSchema);
export default User;