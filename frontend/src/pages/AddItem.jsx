import React, { useState } from "react";
import { FaPlus, FaSave, FaBoxOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import imageCompression from "browser-image-compression"; // ✅ 1. Library Import

const categories = [
  "Mobiles", "Laptops", "Speakers", "Watches", "Gaming", "Fashion",
  "Tablets", "Cameras", "Smart Home", "Accessories", "Clothes",
  "Appliances", "Furniture", "Backpack", "Smart LED TV", "Covers", "Footwear",
];

const AddItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [frontendImages, setFrontendImages] = useState([null, null, null, null]);
  const [backendImages, setBackendImages] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const selectedCategory = watch("category");

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newBackend = [...backendImages];
      newBackend[index] = file;
      setBackendImages(newBackend);

      const newFrontend = [...frontendImages];
      newFrontend[index] = URL.createObjectURL(file);
      setFrontendImages(newFrontend);
    }
  };

  const formSubmit = async (details) => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      
      formData.append("name", details.name);
      formData.append("originalPrice", details.originalPrice);
      formData.append("discountPrice", details.discountPrice);
      formData.append("description", details.description);
      formData.append("category", details.category);
      formData.append("brand", details.brand || "Generic");
      formData.append("stock", details.stock);

      if (details.colors) formData.append("colors", details.colors);
      if (details.sizes) formData.append("sizes", details.sizes);
      if (details.ram) formData.append("ram", details.ram);
      if (details.storage) formData.append("storage", details.storage);

      // ✅ 2. Image Compression Logic
      let imagesAdded = 0;
      const compressionOptions = {
        maxSizeMB: 0.6,          // 1MB se choti file banayega
        maxWidthOrHeight: 1280, 
        useWebWorker: true,
      };

      for (const file of backendImages) {
        if (file) {
          try {
            // Compress the image before appending
            const compressedFile = await imageCompression(file, compressionOptions);
            formData.append("images", compressedFile);
            imagesAdded++;
          } catch (err) {
            console.error("Compression error, sending original:", err);
            formData.append("images", file);
            imagesAdded++;
          }
        }
      }

      if (imagesAdded === 0) {
        setError("Please select at least one image.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        `${serverURL}/api/item/add-item`,
        formData,
        { 
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      dispatch(setMyShopData(res.data));
      navigate("/owner-dashboard"); 
    } catch (error) {
      console.log("Full Error Object:", error);
      const msg = error.response?.data?.message || "Vercel limit exceeded or Server error.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(formSubmit)}
        className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100"
      >
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <FaBoxOpen className="text-blue-600 w-10 h-10 md:w-12 md:h-12" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Add Product</h2>
          <p className="text-gray-500 text-center">Images will be compressed automatically for fast upload</p>
        </div>

        {error && <p className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-center text-sm font-medium">{error}</p>}

        {/* Images Grid */}
        <div className="space-y-2">
          <label className="block font-bold text-gray-700 text-sm">Product Images (Max 4)</label>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-all cursor-pointer">
                {frontendImages[index] ? (
                  <img src={frontendImages[index]} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <FaPlus className="text-gray-300" />
                )}
                <input
                  type="file" accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Name & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-gray-700 font-bold text-sm">Product Name</label>
            <input
              type="text" {...register("name", { required: "Name is required" })}
              className="w-full border rounded-lg p-3 outline-none focus:border-blue-500 bg-gray-50"
              placeholder="e.g. iPhone 15 Pro"
            />
          </div>
          <div className="space-y-1">
            <label className="text-gray-700 font-bold text-sm">Brand</label>
            <input
              type="text" {...register("brand")}
              className="w-full border rounded-lg p-3 outline-none focus:border-blue-500 bg-gray-50"
              placeholder="e.g. Apple"
            />
          </div>
        </div>

        {/* Prices & Stock */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-gray-700 font-bold text-sm">MRP (₹)</label>
            <input type="number" {...register("originalPrice", { required: true })} className="w-full border rounded-lg p-3 outline-none bg-gray-50" />
          </div>
          <div className="space-y-1">
            <label className="text-gray-700 font-bold text-sm">Sale (₹)</label>
            <input type="number" {...register("discountPrice", { required: true })} className="w-full border rounded-lg p-3 outline-none bg-gray-50" />
          </div>
          <div className="space-y-1">
            <label className="text-gray-700 font-bold text-sm">Stock</label>
            <input type="number" {...register("stock", { required: true })} className="w-full border rounded-lg p-3 outline-none bg-gray-50" />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-gray-700 font-bold text-sm">Category</label>
          <select
            {...register("category", { required: "Category is required" })}
            className="w-full border rounded-lg p-3 outline-none bg-gray-50 font-medium"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Attributes */}
        <div className="space-y-4">
          {(selectedCategory === "Mobiles" || selectedCategory === "Laptops" || selectedCategory === "Tablets") && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">RAM</label>
                <input {...register("ram")} className="w-full border rounded-lg p-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-blue-700 uppercase mb-1">Storage</label>
                <input {...register("storage")} className="w-full border rounded-lg p-2 text-sm outline-none" />
              </div>
            </div>
          )}

          {["Fashion", "Clothes", "Footwear"].includes(selectedCategory) && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div>
                <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">Sizes</label>
                <input {...register("sizes")} className="w-full border rounded-lg p-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-purple-700 uppercase mb-1">Colors</label>
                <input {...register("colors")} className="w-full border rounded-lg p-2 text-sm outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-gray-700 font-bold text-sm">Description</label>
          <textarea
            {...register("description", { required: "Description is required" })}
            className="w-full border rounded-lg p-3 outline-none h-24 focus:border-blue-500 bg-gray-50"
            placeholder="Product details..."
          />
        </div>

        <button
          type="submit" disabled={loading}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition duration-200 shadow-lg active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Compressing & Saving...</span>
            </>
          ) : (
            <>
              <FaSave /> Save Product
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddItem;