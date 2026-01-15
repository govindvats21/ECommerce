import React, { useState, useEffect } from "react";
import { MdLocationOn, MdDirectionsBike } from "react-icons/md";
import { serverURL } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

const OwnerOrderCard = ({ data }) => {
  const dispatch = useDispatch();
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");

  // 1. Delivery Boys ki list fetch karna
  useEffect(() => {
    axios.get(`${serverURL}/api/order/get-all-boys`, { withCredentials: true })
      .then(res => setRiders(res.data || []))
      .catch(err => console.error("Riders load error", err));
  }, []);

  // Image path helper
  const getImageUrl = (item) => {
    const path = item?.images?.[0] || item?.item?.images?.[0] || item?.item?.image1;
    if (!path) return "https://placehold.co/400x400?text=No+Image";
    return path.startsWith("http") ? path : `${serverURL}/${path.replace(/\\/g, "/")}`;
  };

  // 2. Status Update Logic
  const handleUpdateStatus = async (status) => {
    try {
      const orderId = data._id;
      const shopId = data.shopOrders?.shop?._id || data.shopOrders?.shop;

      if (status === "out of delivery" && !selectedRider) {
        return alert("Pehle Rider select karein!");
      }

      await axios.post(
        `${serverURL}/api/order/update-status/${orderId}/${shopId}`,
        { status, riderId: selectedRider },
        { withCredentials: true }
      );

      dispatch(updateOrderStatus({ orderId, shopId, status }));
      alert("Status updated!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-6 mb-6 border border-gray-100 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black uppercase italic">{data?.user?.fullName || "Customer"}</h2>
        <span className="bg-orange-100 text-[#ff4d2d] px-4 py-1 rounded-full text-[10px] font-black uppercase">
          {data?.shopOrders?.status}
        </span>
      </div>

      {/* Address */}
      <div className="bg-gray-50 p-4 rounded-3xl mb-6 flex gap-3 border border-dashed">
        <MdLocationOn className="text-[#ff4d2d] shrink-0" size={18} />
        <p className="text-xs font-bold text-gray-500 italic">
          {data?.deliveryAddress?.text || "No address provided"}
        </p>
      </div>

      {/* Items Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {data?.shopOrders?.shopOrderItems?.map((item, index) => (
          <div key={index} className="w-24 shrink-0">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              <img src={getImageUrl(item)} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-[9px] font-black mt-2 truncate text-center uppercase">{item.name || item.item?.name}</p>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t mt-4 space-y-4">
        {/* Rider Selection Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
            <MdDirectionsBike size={14} /> Assign Delivery Boy
          </label>
          <select
            className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
          >
            <option value="">-- Select Rider --</option>
            {riders.map((boy) => (
              <option key={boy._id} value={boy._id}>
                {boy.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Footer: Price & Status Action */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-2xl font-black text-gray-900">₹{data?.shopOrders?.subTotal}</span>
          <select
            className="bg-black text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase outline-none"
            value={data?.shopOrders?.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out of delivery">Out of delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OwnerOrderCard;