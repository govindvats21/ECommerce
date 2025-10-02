// OwnerDashboard.jsx
import React from "react";
import { useSelector } from "react-redux";
import OwnerItemCard from "./OwnerItemCard";
import Nav from "./Nav";
import { useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Nav />
      <header className="flex justify-between items-center mt-15 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Shop Dashboard</h1>
        <button
          onClick={() => navigate("/add-item")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition"
        >
          + Add New Item
        </button>
      </header>

      {/* Shop Info */}
      <section className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6 mb-10 max-w-4xl mx-auto">
        <img
          src={myShopData?.image || "/default-shop.jpg"}
          alt={myShopData?.name || "Shop Image"}
          className="w-28 h-28 rounded-lg object-cover border border-gray-300"
        />
        <div>
          <h2 className="text-2xl font-semiboldtext-gray-800">{myShopData?.name || "Your Shop"}</h2>
          <p className="text-gray-600 mt-1">{myShopData?.address || "Shop address not set"}</p>
          <p className="text-gray-600 mt-1">Contact: {myShopData?.contact || "Not available"}</p>
        </div>
      </section>

      {/* Items List */}
      <section className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {myShopData?.items && myShopData.items.length > 0 ? (
          myShopData.items.map((item) => <OwnerItemCard key={item._id} item={item} />)
        ) : (
          <p className="text-center text-gray-500 col-span-full">No items found. Add your first item!</p>
        )}
      </section>
    </div>
  );
};

export default OwnerDashboard;
