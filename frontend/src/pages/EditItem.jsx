import React, { useEffect, useState } from "react";
import { FaUtensils, FaSave } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { setMyShopData } from "../redux/ownerSlice";
import { serverURL } from "../App";
import { setItemsOutOfStock } from "../redux/userSlice";

const categories = [
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
];

const EditItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { myShopData } = useSelector((state) => state.owner);

  // States for images
  const [frontendImages, setFrontendImages] = useState([
    null,
    null,
    null,
    null,
  ]);
  const [backendImages, setBackendImages] = useState([null, null, null, null]);
  const [oldImages, setOldImages] = useState([]);
  // 🔹 Local state
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (myShopData && myShopData.items) {
      const item = myShopData.items.find((it) => it._id === id);
      if (item) {
        setValue("name", item.name);
        setValue("originalPrice", item.originalPrice);
        setValue("discountPrice", item.discountPrice);
        setValue("description", item.description);
        setValue("category", item.category);

        const imgs = item.images ? Object.values(item.images) : [];
        setOldImages(imgs);
      }
    }
  }, [id, myShopData, setValue]);

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
    try {
      const formData = new FormData();
      formData.append("name", details.name);
      formData.append("originalPrice", details.originalPrice);
      formData.append("discountPrice", details.discountPrice);
      formData.append("description", details.description);
      formData.append("category", details.category);

      for (let i = 0; i < 4; i++) {
        if (backendImages[i]) {
          formData.append("images", backendImages[i]);
        } else if (oldImages[i]) {
          formData.append("images", oldImages[i]);
        }
      }

      const res = await axios.post(
        `${serverURL}/api/item/edit-item/${id}`,
        formData,
        { withCredentials: true }
      );

      dispatch(setMyShopData(res.data));

      navigate("/");
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Error updating item. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(formSubmit)}
        className="max-w-xl w-full bg-white rounded-xl shadow-md p-8 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-green-600 w-16 h-16" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Edit Grocery Item
          </h2>
        </div>

        {/* Image upload */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">
            Upload New Images (Max 4)
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100"
                />
                {frontendImages[index] ? (
                  <img
                    src={frontendImages[index]}
                    alt={`Preview ${index + 1}`}
                    className="mt-2 w-full h-32 object-cover rounded-md"
                  />
                ) : oldImages[index] ? (
                  <img
                    src={oldImages[index]}
                    alt={`Current ${index + 1}`}
                    className="mt-2 w-full h-32 object-cover rounded-md opacity-70"
                  />
                ) : (
                  <div className="mt-2 w-full h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Name</label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className={`w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-green-600 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter item name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Description
          </label>
          <input
            type="text"
            {...register("description", {
              required: "Description is required",
            })}
            className={`w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-green-600 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter description"
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Original Price (₹)
            </label>
            <input
              type="number"
              min="0"
              {...register("originalPrice", {
                required: "Original price is required",
                min: { value: 0, message: "Price must be ≥ 0" },
              })}
              className={`w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-green-600 ${
                errors.originalPrice ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="₹0"
            />
            {errors.originalPrice && (
              <p className="text-red-600 text-sm mt-1">
                {errors.originalPrice.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Discount Price (₹)
            </label>
            <input
              type="number"
              min="0"
              {...register("discountPrice", {
                required: "Discount price is required",
                min: { value: 0, message: "Price must be ≥ 0" },
              })}
              className={`w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-green-600 ${
                errors.discountPrice ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="₹0"
            />
            {errors.discountPrice && (
              <p className="text-red-600 text-sm mt-1">
                {errors.discountPrice.message}
              </p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Category
          </label>
          <select
            {...register("category", { required: "Category is required" })}
            className={`w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-green-600 ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600 text-sm mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-3 rounded-full flex items-center justify-center gap-3 shadow-md"
        >
          <FaSave className="text-lg" /> Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditItem;
