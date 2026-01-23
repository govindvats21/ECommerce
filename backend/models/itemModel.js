import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const itemSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: "Generic",
    },
    discountPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
         "Mobiles",
    "Laptops",
        "Speakers",
        "Watches",
        "Gaming",
        "Fashion",
        "Tablets",
        "Cameras",
        "Smart Home",
        "Accessories",
        "Clothes",
        "Appliances",
        "Furniture",
        "Backpack",
        "Smart LED TV",
        "Covers",
        "Footwear",
      ],
    },
    images: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
    },
    attributes: {
      colors: [String],
      sizes: [String],
      ram: [String],
      storage: [String],
    },
    specifications: {
      type: Map,
      of: String
    },
  
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
