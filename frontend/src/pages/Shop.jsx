import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../App";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaStoreAlt,
  FaStar,
  FaClock,
  FaShoppingBasket,
  FaUtensils,
} from "react-icons/fa";

import ItemCard from "../components/ItemCard";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const Shop = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState({});
  const [items, setItems] = useState([]);

  // Fetch shop data and items from API
  const fetchShop = async () => {
    try {
      const res = await axios.get(
        `${serverURL}/api/item/get-items-by-shop/${shopId}`,
        { withCredentials: true }
      );
      setShop(res.data.shop);
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShop();
  }, [shopId]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Nav />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 text-white px-3 py-2 rounded-full shadow-md hover:bg-black/70 transition"
        >
          <FaArrowLeft />
          <span className="hidden md:inline">Back</span>
        </button>

        {/* Shop Banner */}
        <div className="relative w-full h-48 md:h-56 lg:h-64">
          <img
            src={shop.image || "https://via.placeholder.com/1200x400"}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/10 flex flex-col justify-center items-center text-center px-4">
            <FaStoreAlt className="text-white text-3xl mb-2" />
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              {shop.name}
            </h1>
          </div>
        </div>

        {/* Shop Info Card */}
        <div className="max-w-4xl mx-auto -mt-10 bg-white rounded-2xl shadow-lg p-6 z-10 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{shop.name}</h2>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <FaMapMarkerAlt className="text-red-500" />
                <p>{shop.address || "Address not available"}</p>
              </div>
            </div>

            {/* Features Section */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                <span>{shop.rating || "4.5"} Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-blue-500" />
                <span>{shop.deliveryTime || "30-40 mins"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShoppingBasket className="text-green-500" />
                <span>Min. Order ₹{shop.minOrder || 200}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-gray-600 text-sm">
            {shop.description ||
              "Welcome to our store. Best quality products available!"}
          </p>
        </div>

        {/* Available Items Grid */}
        <div className="max-w-7xl mx-auto py-12 px-4">
          <h2 className="flex items-center justify-center gap-3 text-2xl font-bold mb-8 text-gray-800">
            <FaUtensils className="text-red-500" /> Available Products
          </h2>

          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} data={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">
              No items available
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Shop;
