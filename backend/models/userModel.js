import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: function() { 
        return !this.isGoogleUser && !this.resetOtp; 
      }, 
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, 
    },
    isGoogleUser: {
      type: Boolean,
      default: false
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      validate: {
        validator: function(v) {
          return /^[6-9]\d{9}$/.test(v) && !/^(.)\1{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid mobile number!`
      }
    },
    role: {
      type: String,
      enum: {
        values: ["user", "owner", "deliveryBoy"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
      required: true,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { 
        type: [Number], 
        default: [0, 0] 
      },
    },
    socketId: {
      type: String,
      default: null
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;