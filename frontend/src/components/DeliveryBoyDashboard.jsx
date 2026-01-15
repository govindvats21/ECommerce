import axios from "axios";
import React, { useState, useEffect } from "react";
import { serverURL } from "../App";
import { useSelector } from "react-redux";
import Nav from "./Nav";
import DeliveryBoyTracking from "./DeliveryBoyTracking";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  CiDeliveryTruck, CiShoppingCart, CiWallet, CiTimer,
} from "react-icons/ci";

const DeliveryBoyDashboard = () => {
  const { userData, socket } = useSelector((state) => state.user);

  const [assignments, setAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [todayDeliveries, setTodayDeliveries] = useState([]);

  // 1. Fetch Assignments (Backend se data lana)
  const getAssignments = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/order/get-assignments`, {
        withCredentials: true,
      });
      // Backend se jo data aa raha hai usme itemsCount aur subTotal hum bhej rahe hain
      setAssignments(res.data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const getcurrentOrder = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/order/get-current-order`, {
        withCredentials: true,
      });
      setCurrentOrder(res.data);
    } catch (error) {
      console.error("Error current order:", error);
    }
  };

  const acceptOrder = async (id) => {
    try {
      await axios.get(`${serverURL}/api/order/accept-order/${id}`, {
        withCredentials: true,
      });
      await getcurrentOrder();
      getAssignments();
    } catch (error) {
      console.error("Accept order error:", error);
    }
  };

  const sendOtp = async () => {
    try {
      await axios.post(`${serverURL}/api/order/send-delivery-otp`, {
        orderId: currentOrder?._id,
        shopOrderId: currentOrder?.shopOrder?._id,
      }, { withCredentials: true });
      setShowOtpBox(true);
    } catch (error) {}
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${serverURL}/api/order/verify-delivery-otp`, {
        orderId: currentOrder?._id,
        shopOrderId: currentOrder?.shopOrder._id,
        otp,
      }, { withCredentials: true });

      if (res.status === 200) {
        setCurrentOrder(null);
        setShowOtpBox(false);
        setOtp("");
        handleTodayDeliveries();
      }
    } catch (error) {}
  };

  const handleTodayDeliveries = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/order/get-today-deliveries`, {
        withCredentials: true,
      });
      setTodayDeliveries(res.data || []);
    } catch (error) {}
  };

  // --- Socket Logic (Live Order Alert) ---
  useEffect(() => {
    if (!socket) return;

    const handleNewAssignment = (data) => {
      console.log("Socket New Assignment Received:", data);
      
      const isForMe = data.broadcastedTo?.includes(userData._id) || data.sendTo === userData._id;

      if (isForMe) {
        setAssignments((prev) => {
          const exists = prev.find(a => (a.assignmentId === data.assignmentId) || (a._id === data.assignmentId));
          if (exists) return prev;
          return [data, ...prev];
        });
      }
    };

    socket.on("newAssignment", handleNewAssignment);
    return () => socket.off("newAssignment", handleNewAssignment);
  }, [socket, userData._id]);

  useEffect(() => {
    if (userData?._id) {
      getAssignments();
      getcurrentOrder();
      handleTodayDeliveries();
    }
  }, [userData]);

  const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * 50, 0);

  return (
    <div className="w-screen min-h-screen bg-gray-50 pt-[90px] flex flex-col items-center overflow-y-auto pb-10">
      <Nav />

      <div className="w-full max-w-[900px] flex flex-col gap-6 items-center">
        {/* Welcome & Stats */}
        <div className="w-[92%] grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<CiDeliveryTruck size={28} className="text-green-500" />} label="Orders" value={assignments.length} />
          <StatCard icon={<CiShoppingCart size={28} className="text-orange-500" />} label="Active" value={currentOrder ? 1 : 0} />
          <StatCard icon={<CiWallet size={28} className="text-blue-600" />} label="Earned" value={`₹${totalEarning}`} />
          <StatCard icon={<CiTimer size={28} className="text-yellow-500" />} label="Today" value={todayDeliveries.length} />
        </div>

        {/* Assignments List */}
        {!currentOrder && (
          <div className="bg-white rounded-2xl p-6 shadow-sm w-[92%] border border-gray-100">
            <h1 className="text-xl font-bold mb-4 text-gray-800">📦 New Requests</h1>
            <div className="space-y-4">
              {assignments.length > 0 ? (
                assignments.map((a, index) => {
                  // FAIL-SAFE LOGIC: Data Socket se ho ya API se, ye nikal lega
                  const price = a.subTotal || a.shopOrderId?.subTotal || 0;
                  const itemsCount = a.itemsCount || a.shopOrderId?.shopOrderItems?.length || a.items?.length || 0;
                  const shopName = a.shopName || a.shopOrderId?.shop?.name || "Order Request";
                  const address = a.deliveryAddress?.text || a.deliveryAddress || "Check after accept";

                  return (
                    <div className="border rounded-2xl p-5 flex justify-between items-center bg-white hover:border-orange-200 transition" key={index}>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg uppercase italic tracking-tighter">{shopName}</p>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">{address}</p>
                        <div className="flex gap-4 mt-3">
                          <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full">
                            {itemsCount} ITEMS
                          </span>
                          <span className="text-[10px] font-black bg-green-100 text-green-600 px-3 py-1.5 rounded-full">
                            ₹{price}
                          </span>
                        </div>
                      </div>
                      <button
                        className="bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-orange-600 active:scale-95 transition ml-4"
                        onClick={() => acceptOrder(a.assignmentId || a._id)}
                      >
                        Accept
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10">
                   <p className="text-gray-400 font-medium italic">No orders available right now...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Order Card */}
        {currentOrder && (
          <div className="bg-white rounded-[2rem] p-8 shadow-xl w-[92%] border-2 border-orange-500">
            <h2 className="text-2xl font-black italic uppercase mb-4 text-orange-600 tracking-tighter">Active Delivery</h2>
            <div className="bg-gray-50 p-5 rounded-[1.5rem] mb-6 border-l-4 border-orange-500">
              <p className="text-xs font-black text-gray-400 uppercase">Deliver To</p>
              <p className="font-bold text-xl text-gray-800">{currentOrder?.user?.fullName || "Customer"}</p>
              <p className="text-sm text-gray-600 mt-1 italic">{currentOrder?.deliveryAddress?.text}</p>
            </div>

            <DeliveryBoyTracking data={currentOrder} />

            <div className="mt-8">
              {!showOtpBox ? (
                <button
                  className="w-full bg-black text-white font-black uppercase py-5 rounded-2xl hover:bg-green-600 transition-all duration-300 shadow-lg active:scale-95"
                  onClick={sendOtp}
                >
                  Confirm Arrival & Send OTP
                </button>
              ) : (
                <div className="space-y-4">
                   <p className="text-center text-xs font-bold text-gray-400 uppercase">Enter 4-Digit OTP</p>
                   <input
                    type="text"
                    maxLength="4"
                    className="w-full border-2 border-gray-200 px-4 py-4 rounded-2xl text-center text-4xl font-black tracking-[15px] focus:border-orange-500 outline-none transition-all"
                    placeholder="0000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button
                    className="w-full bg-orange-600 text-white font-black uppercase py-5 rounded-2xl hover:bg-orange-700 transition active:scale-95 shadow-lg"
                    onClick={verifyOtp}
                  >
                    Verify & Complete Order
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-4 rounded-2xl flex flex-col items-center border border-gray-100 shadow-sm transition hover:shadow-md">
    <div className="mb-1">{icon}</div>
    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{label}</p>
    <p className="font-black text-xl text-gray-800">{value}</p>
  </div>
);

export default DeliveryBoyDashboard;