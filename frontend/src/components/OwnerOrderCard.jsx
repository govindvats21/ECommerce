import React from "react";
import { MdPhone, MdLocationOn } from "react-icons/md";
import { serverURL } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

const OwnerOrderCard = ({ data }) => {
  const dispatch = useDispatch();

  // Ye function sahi se bracket ke andar hona chahiye
  const getImageUrl = (item) => {
    // Logic to handle different image path formats
    const path = item?.images?.[0] || item?.image || item?.item?.images?.[0];

    if (!path) return "https://placehold.co/400x400?text=No+Image";
    if (path.startsWith("http")) return path;

    const cleanPath = path.replace(/\\/g, "/");
    return `${serverURL}/${cleanPath}`;
  };

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      await axios.post(
        `${serverURL}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      alert("Status updated successfully!");
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-6 mb-6 border border-gray-100 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black uppercase italic">{data?.user?.fullName || "Customer"}</h2>
        <span className="bg-orange-100 text-[#ff4d2d] px-4 py-1 rounded-full text-[10px] font-black uppercase">
          {data?.shopOrders?.status}
        </span>
      </div>

      <div className="bg-gray-50 p-4 rounded-3xl mb-6 flex gap-3 border border-dashed">
        <MdLocationOn className="text-[#ff4d2d] shrink-0" size={18} />
        <p className="text-xs font-bold text-gray-500 italic leading-snug">
          {data?.deliveryAddress?.text || "No address provided"}
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {data?.shopOrders?.shopOrderItems?.map((item, index) => (
          <div key={index} className="w-32 shrink-0">
            <div className="h-32 w-32 rounded-[2rem] overflow-hidden bg-gray-100 border-2 border-white shadow-md">
              <img
                src={getImageUrl(item)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "https://placehold.co/400x400?text=Error")}
              />
            </div>
            <p className="text-[10px] font-black mt-3 truncate text-center uppercase">{item.name}</p>
            <p className="text-[10px] text-orange-600 font-black text-center">QTY: {item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-6 border-t mt-4">
        <span className="text-2xl font-black text-gray-900">₹{data?.shopOrders?.subTotal}</span>
        <select
          className="bg-black text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer"
          value={data?.shopOrders?.status}
          onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop?._id || data.shopOrders.shop, e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out of delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
    </div>
  );
};

export default OwnerOrderCard;