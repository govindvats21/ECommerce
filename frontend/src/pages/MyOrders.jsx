import React from "react";
import { MdKeyboardBackspace, MdRefresh } from "react-icons/md"; // Refresh icon add kiya
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import Footer from "../components/Footer";
import useGetMyOrders from "../hooks/useGetMyOrders"; // Hook reuse karenge

const MyOrders = () => {
  const { userData, myOrders } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  // Naye orders fetch karne ke liye hook ko call karenge
  const fetchOrders = useGetMyOrders(); 

  // Socket wala useEffect block poora hata diya gaya hai
  // kyunki ab real-time updates polling ya manual refresh se honge.

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 flex justify-center px-4 py-6">
        <div className="w-full max-w-[900px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                onClick={() => navigate("/")}
                className="cursor-pointer p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
              >
                <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            </div>

            {/* Refresh Button - Taaki Owner naye orders dekh sake */}
            <button 
              onClick={() => fetchOrders()} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition"
            >
              <MdRefresh className="w-5 h-5 text-[#ff4d2d]" />
              <span className="text-sm font-medium">Refresh Orders</span>
            </button>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {(!myOrders || myOrders.length === 0) && (
              <p className="text-center text-gray-500 text-lg mt-12">
                No orders yet
              </p>
            )}

            {myOrders?.map((order, index) =>
              userData?.role === "user" ? (
                <UserOrderCard data={order} key={order._id || index} />
              ) : userData?.role === "owner" ? (
                <OwnerOrderCard data={order} key={order._id || index} />
              ) : null
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;