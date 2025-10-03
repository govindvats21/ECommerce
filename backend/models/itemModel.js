import mongoose from "mongoose";
const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

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

    category: {
      type: String,
      required: true,
      enum: [
  "Fruits",
  "Vegetables",
  "Dairy & Bakery",
  "Snacks",
  "Beverages",
  "Personal Care",
  "Household Essentials",
  "Baby Care",
  "Packaged Food",
  "Health & Wellness",
  "All",
]
    },
    images: [
      {
        image1: { type: String, default: "" },
        image2: { type: String, default: "" },
        image3: { type: String, default: "" },
        image4: { type: String, default: "" },
      },
    ],
    description: {
      type: String,
    },
  },
  { timestamps: true }
);


// ⭐ Average rating calculate karne ka method
itemSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
};
const Item = mongoose.model("Item", itemSchema);
export default Item;


