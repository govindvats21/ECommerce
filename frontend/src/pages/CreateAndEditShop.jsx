import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";

import { serverURL } from "../App";
import { setMyShopData } from "../redux/ownerSlice";

const CreateAndEditShop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);
  const { userCity, userState, userAddress } = useSelector(
    (state) => state.user
  );

  const [frontedImage, setFrontedImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontedImage(URL.createObjectURL(file));
  };

  // Form hook
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: myShopData?.name || "",
      city: myShopData?.city || userCity || "",
      state: myShopData?.state || userState || "",
      address: myShopData?.address || userAddress || "",
    },
  });

  // Form submission
  const formSubmit = async(details) => {
    try {
      const formData = new FormData();
      formData.append("name", details.name);
      formData.append("city", details.city);
      formData.append("state", details.state);
      formData.append("address", details.address);

      if (backendImage) {
        formData.append("image", backendImage);
      }

    //  console.log(Object.fromEntries(formData));


      const res = await axios.post(
        `${serverURL}/api/shop/create-edit`,
        formData,
        { withCredentials: true }
      );
      dispatch(setMyShopData(res.data));
    console.log(res.data);
    
      navigate("/");
    } catch (error) {
      console.log("Error submitting form:", error);
    }
  };

  return (
    <div className="create-shop-container flex flex-col justify-center items-center bg-gradient-to-br from-green-50 to-white min-h-screen relative">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <IoIosArrowRoundBack
          size={42}
          className="text-green-600 hover:text-green-700 cursor-pointer transition"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Form Card */}
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-green-100">
        {/* Icon & Heading */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-100 p-4 rounded-full shadow-inner mb-4">
            <FaUtensils className="text-green-600 w-16 h-16 sm:w-20 sm:h-20" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Fill out the details to get your shop online 🚀
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(formSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              placeholder="Enter shop name"
              className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              {...register("name", { required: true })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">Shop name is required</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={handleImage}
            />
            {frontedImage && (
              <div className="mt-4">
                <img
                  src={frontedImage}
                  alt="Preview"
                  className="w-full h-44 object-cover rounded-lg border shadow-sm"
                />
              </div>
            )}
          </div>

          {/* City & State */}
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="Enter city"
                className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                {...register("city", { required: true })}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">City is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="Enter state"
                className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                {...register("state", { required: true })}
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">State is required</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows="3"
              placeholder="Enter address"
              className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              {...register("address", { required: true })}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">Address is required</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200"
          >
            Save Shop
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAndEditShop;
