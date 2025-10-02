import React, { useState } from "react";
import { MdPhone } from "react-icons/md";
import { serverURL } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

const OwnerOrderCard = ({ data }) => {
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();

  const handleUpdateStatus = async (orderId, shopId, status) => {
    if (!status) return; // ignore if no status selected

    try {
      const res = await axios.post(
        `${serverURL}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(res.data.availableBoys);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto">
      {/* User Info */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">{data?.user?.fullName || "User"}</h2>
        <p className="text-sm text-gray-500">{data?.user?.email || "No email"}</p>
        <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
          <MdPhone className="text-[#ff4d2d]" aria-hidden="true" />
          <span>{data?.user?.mobile || "No phone"}</span>
        </p>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
        <p>{data?.deliveryAddress?.text || "No delivery address provided"}</p>
        <p className="text-xs text-gray-500">
          Lat: {data?.deliveryAddress?.latitude ?? "N/A"}, {data?.deliveryAddress?.longitude ?? "N/A"}
        </p>
      </div>

      {/* Items */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {data?.shopOrders?.shopOrderItems?.map((item, index) => {
          const imgSrc = item?.item?.images?.image1 || "/default-item.png";
          return (
            <div
              key={index}
              className="w-36 shrink-0 rounded-lg bg-gray-50 hover:bg-gray-100 shadow p-2 transition-colors"
              title={item?.name}
            >
              <img
                src={imgSrc}
                alt={item?.name || "Order item"}
                className="w-full h-24 object-cover rounded-md"
                loading="lazy"
              />
              <p className="text-sm font-semibold mt-2 text-gray-800 truncate">{item?.name || "Item"}</p>
              <p className="text-xs text-gray-500">
                Qty: {item?.quantity || 1} × ₹{item?.price || 0}
              </p>
            </div>
          );
        })}
      </div>

      {/* Status + Change */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">
          Status:{" "}
          <span className="font-semibold text-[#ff4d2d] capitalize">
            {data?.shopOrders?.status || "unknown"}
          </span>
        </span>
        <select
          aria-label="Change order status"
          className="rounded-md px-3 py-1 text-[#ff4d2d] text-sm border border-[#ff4d2d] focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/50"
          onChange={(e) =>
            handleUpdateStatus(data._id, data.shopOrders.shop._id, e.target.value)
          }
          defaultValue=""
        >
          <option value="" disabled>
            Change
          </option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out of delivery</option>
        </select>
      </div>

      {/* Delivery Boy Section */}
      {data?.shopOrders?.status === "out of delivery" && (
        <div className="mt-3 p-4 rounded-lg border text-sm bg-orange-50 space-y-2">
          <p className="font-semibold text-gray-800 mb-1">
            {data.shopOrders.assignedDeliveryBoy
              ? "Assigned Delivery Boy"
              : "Available Delivery Boys"}
          </p>

          {availableBoys?.length > 0 ? (
            availableBoys.map((boy, idx) => (
              <div
                key={idx}
                className="flex flex-col p-2 bg-white rounded-md shadow-sm border text-gray-700 hover:shadow-md transition"
                tabIndex={0}
              >
                <span className="font-medium">{boy?.fullName || "Name not available"}</span>
                <span className="text-xs text-gray-500">{boy?.email || "-"}</span>
                <span className="text-xs text-gray-500">{boy?.mobileNumber || "-"}</span>
              </div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? (
            <div
              className="flex flex-col bg-white p-2 rounded-md shadow border"
              tabIndex={0}
            >
              <span className="font-medium">
                {data.shopOrders.assignedDeliveryBoy?.fullName || "Name not available"}
              </span>
              <span className="text-xs text-gray-500">{data.shopOrders.assignedDeliveryBoy?.email || "-"}</span>
              <span className="text-xs text-gray-500">{data.shopOrders.assignedDeliveryBoy?.mobileNumber || "-"}</span>
            </div>
          ) : (
            <div className="italic text-gray-500">Waiting for delivery boys...</div>
          )}
        </div>
      )}

      {/* Total */}
      <div className="text-right font-bold text-gray-900 text-base">
        Total: ₹{data?.shopOrders?.subTotal || 0}
      </div>
    </div>
  );
};

export default OwnerOrderCard;
