import axios from "axios";
import React from "react";
import { serverURL } from "../App";
import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Nav from "./Nav";
import DeliveryBoyTracking from "./DeliveryBoyTracking";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  CiDeliveryTruck,
  CiShoppingCart,
  CiWallet,
  CiTimer,
} from "react-icons/ci";

const deliveryBoyDashboard = () => {
  const { userData, socket } = useSelector((state) => state.user);

  const [assignments, setAssignments] = useState(null);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [todayDeliveries, setTodayDeliveriies] = useState([]);
  const [todayStats, setTodayStats] = useState([]);

  const getAssignments = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAssignments(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getcurrentOrder = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/order/get-current-order`, {
        withCredentials: true,
      });
      console.log(res.data);
      setCurrentOrder(res.data);
    } catch (error) {}
  };

  const acceptOrder = async (assignmentId) => {
    try {
      const res = await axios.get(
        `${serverURL}/api/order/accept-order/${assignmentId}`,
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      await getcurrentOrder();
      getAssignments();
    } catch (error) {
      console.log(error);
    }
  };

  const sendOtp = async () => {
    try {
      const res = await axios.post(
        `${serverURL}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder?._id,
          shopOrderId: currentOrder?.shopOrder?._id,
        },
        {
          withCredentials: true,
        }
      );
      console.log(res.data);

      setShowOtpBox(true);
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(
        `${serverURL}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder?._id,
          shopOrderId: currentOrder?.shopOrder._id,
          otp,
        },
        {
          withCredentials: true,
        }
      );

      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0
  );

  const handleTodayDeliveries = async () => {
    try {
      const res = await axios.get(
        `${serverURL}/api/order/get-today-deliveries`,
        {
          withCredentials: true,
        }
      );

      console.log(res.data);
      setTodayDeliveriies(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket?.on("newAssignment", (data) => {
      if (data.sendTo == userData._id) {
        setAssignments((prev) => [...prev, data]);
      }
    });
    return () => {
      socket?.off("newAssignment");
    };
  }, [socket]);

  useEffect(() => {
    getAssignments();
    getcurrentOrder();
    handleTodayDeliveries();
  }, [userData]);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-orange-50 to-white pt-[90px] flex flex-col gap-6 items-center overflow-y-auto">
      <Nav />

      <div className="w-full max-w-[900px] flex flex-col gap-6 items-center">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-[92%] border border-orange-100 text-center transition hover:shadow-xl">
          <h1 className="text-2xl font-bold text-orange-600">
            Welcome, {userData.fullName}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            <span className="font-semibold text-orange-500">Latitude:</span>{" "}
            {userData.location.coordinates[1]},{" "}
            <span className="font-semibold text-orange-500">Longitude:</span>{" "}
            {userData.location.coordinates[0]}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="w-[92%] grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl flex flex-col items-center border border-gray-200">
            <CiDeliveryTruck size={28} className="text-green-500 mb-2" />
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="font-bold text-lg">{assignments?.length || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-xl flex flex-col items-center border border-gray-200">
            <CiShoppingCart size={28} className="text-orange-500 mb-2" />
            <p className="text-sm text-gray-500">Current Order</p>
            <p className="font-bold text-lg">{currentOrder ? 1 : 0}</p>
          </div>

          <div className="bg-white p-4 rounded-xl flex flex-col items-center border border-gray-200">
            <CiWallet size={28} className="text-green-600 mb-2" />
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="font-bold text-lg">₹{totalEarning}</p>
          </div>

          <div className="bg-white p-4 rounded-xl flex flex-col items-center border border-gray-200">
            <CiTimer size={28} className="text-yellow-500 mb-2" />
            <p className="text-sm text-gray-500">Today's Deliveries</p>
            <p className="font-bold text-lg">{todayDeliveries.length}</p>
          </div>
        </div>

        {/* Today's Delivery Chart */}
        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100">
          <h2 className="text-lg font-bold mb-3">📊 Today's Deliveries</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={todayDeliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, "Orders"]}
                labelFormatter={(label) => `${label}:00`}
              />
              <Bar dataKey="count" fill="#ff4d2d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Available Orders */}
        {!currentOrder && (
          <div className="bg-white rounded-2xl p-6 shadow-lg w-[92%] border border-gray-100">
            <h1 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
              📦 Available Orders
            </h1>

            <div className="space-y-4">
              {assignments?.length > 0 ? (
                assignments?.map((a, index) => (
                  <div
                    className="border rounded-xl p-5 flex justify-between items-start hover:shadow-md transition bg-orange-50/30"
                    key={index}
                  >
                    <div>
                      <p className="font-bold text-gray-800 text-base">
                        {a?.shopName}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        <span className="font-semibold">Delivery Address:</span>{" "}
                        {a?.deliveryAddress.text}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {a?.items?.length || 0} items | ₹{a?.subTotal}
                      </p>
                    </div>
                    <button
                      className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 active:scale-95 transition"
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center text-sm">
                  🚫 No Available Orders
                </p>
              )}
            </div>
          </div>
        )}

        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h2 className="text-lg font-bold mb-3">📦Current Order</h2>
            <div className="border rounded-lg p-4 mb-3">
              {/* <p>{currentOrder?.shopOrder.shop.name}</p> */}
              <p className="text-sm text-gray-500">
                {currentOrder?.deliveryAddress.text}
              </p>
              <p className="text-xs text-gray-400">
                {currentOrder?.shopOrder.shopOrderItems.length} items |{" "}
                {currentOrder?.shopOrder.subTotal}
              </p>
            </div>

            <DeliveryBoyTracking data={currentOrder} />

            {!showOtpBox ? (
              <button
                className="mt-4 w-full bg-green-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
                onClick={sendOtp}
              >
                Mark As Delivered
              </button>
            ) : (
              <div className="mt-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Enter otp send to{" "}
                  <span className="text-orange-500">
                    {currentOrder.user.fullName}
                  </span>
                </p>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                />
                <button
                  className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all"
                  onClick={verifyOtp}
                >
                  Submit OTP{" "}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default deliveryBoyDashboard;
