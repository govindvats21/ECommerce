import React from "react";
import { MdPhone, MdLocationOn } from "react-icons/md";
import { serverURL } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

const OwnerOrderCard = ({ data }) => {
  const dispatch = useDispatch();

  const getImageUrl = (item) => {
    // 1. Direct item images array check karein
    // 2. Populated item object ki images check karein
    const path = item?.images?.[0] || item?.item?.images?.[0];

    if (!path) return "https://placehold.co/400x400?text=No+Path+In+DB";

    // Agar full URL hai (Cloudinary/Firebase)
    if (path.startsWith("http")) return path;
    
    // Local path formatting (Windows slashes fix)
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
      alert("Status Updated!");
    } catch (error) {
      console.error("Status update error", error);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-6 mb-6 border border-gray-100 max-w-2xl mx-auto">
      {/* Customer Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-black uppercase italic text-gray-800 tracking-tight">
            {data?.user?.fullName}
          </h2>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mt-1">
            <MdPhone className="text-[#ff4d2d]" /> {data?.user?.mobileNumber}
          </div>
        </div>
        <div className="bg-orange-50 text-[#ff4d2d] px-3 py-1 rounded-xl text-[10px] font-black uppercase border border-orange-100">
          {data?.shopOrders?.status}
        </div>
      </div>

      {/* Address */}
      <div className="bg-gray-50 p-3 rounded-2xl mb-4 border border-dashed border-gray-200">
        <p className="text-[11px] font-bold text-gray-500 italic leading-snug flex gap-2">
          <MdLocationOn className="text-[#ff4d2d] shrink-0" size={16} />
          {data?.deliveryAddress?.text}
        </p>
      </div>

      {/* Horizontal Images Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {data?.shopOrders?.shopOrderItems?.map((item, index) => (
          <div key={index} className="w-28 shrink-0">
            <div className="h-28 w-28 rounded-2xl overflow-hidden bg-white border-2 border-gray-50 shadow-sm">
              <img
                src={getImageUrl(item)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "https://placehold.co/400x400?text=Broken+Link")}
              />
            </div>
            <p className="text-[10px] font-black mt-2 truncate text-center uppercase tracking-tighter">
              {item.name}
            </p>
            <p className="text-[9px] text-[#ff4d2d] font-bold text-center">Qty: {item.quantity}</p>
          </div>
        ))}
      </div>

      {/* Bill & Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <div>
          <span className="text-[9px] font-black text-gray-300 uppercase block tracking-widest">Total Bill</span>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{data?.shopOrders?.subTotal}</span>
        </div>
        
        <select
          className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none hover:bg-[#ff4d2d] transition-colors cursor-pointer"
          onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop?._id || data.shopOrders.shop, e.target.value)}
          value={data?.shopOrders?.status}
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