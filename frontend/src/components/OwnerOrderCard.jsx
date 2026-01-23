import React, { useState, useEffect } from "react";
import { MdLocationOn, MdDirectionsBike } from "react-icons/md";
import { serverURL } from "../App";
import axios from "axios";

const OwnerOrderCard = ({ data }) => {
  const [riders, setRiders] = useState([]);
  const [selectedRider, setSelectedRider] = useState("");

  // Riders Load karne ke liye
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/order/get-all-boys`, { withCredentials: true });
        setRiders(res.data || []);
      } catch (err) {
        console.error("Riders load error", err);
      }
    };
    fetchRiders();
  }, []);

  const getImageUrl = (item) => {
    const path = item?.images?.[0] || item?.item?.images?.[0];
    if (!path) return "https://placehold.co/400x400?text=No+Image";
    return path.startsWith("http") ? path : `${serverURL}/${path.replace(/\\/g, "/")}`;
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const orderId = data._id;

      const shopId = data.shopOrders?.[0]?.shop?._id || data.shopOrders?.[0]?.shop;

      if (newStatus === "out of delivery" && !selectedRider) {
        alert("Pehle Delivery Boy assign karein!");
        return;
      }

      const res = await axios.post(
        `${serverURL}/api/order/update-status/${orderId}/${shopId}`,
        { status: newStatus, riderId: selectedRider },
        { withCredentials: true }
      );

      if (res.status === 200) {
        alert(`Order ${newStatus} successfully!`);
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Status update fail ho gaya!");
    }
  };

  const currentShopOrder = data?.shopOrders?.[0];

  const displayAddress = data?.deliveryAddress?.text || 
    `${data?.deliveryAddress?.flatNo || ""}, ${data?.deliveryAddress?.area || ""}, ${data?.deliveryAddress?.landmark || ""}, ${data?.deliveryAddress?.city || ""}`.replace(/^, |, $/g, '');

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-6 mb-6 border border-gray-100 max-w-2xl mx-auto hover:shadow-2xl transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black uppercase italic text-gray-800">{data?.user?.fullName || "Customer"}</h2>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest">ORDER ID: #{data._id?.slice(-6).toUpperCase()}</p>
        </div>
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
          currentShopOrder?.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-[#ff4d2d]'
        }`}>
          {currentShopOrder?.status || "Pending"}
        </span>
      </div>

      <div className="bg-gray-50 p-4 rounded-3xl mb-6 flex gap-3 border border-dashed border-gray-300">
        <MdLocationOn className="text-[#ff4d2d] shrink-0" size={18} />
        <div>
           <p className="text-xs font-black text-gray-800 uppercase mb-1">Delivery Address:</p>
           <p className="text-[11px] font-bold text-gray-500 italic leading-relaxed">
             {displayAddress}
           </p>
           {data?.deliveryAddress?.phone && (
             <p className="text-[10px] font-black text-blue-600 mt-2">📞 {data.deliveryAddress.phone}</p>
           )}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {currentShopOrder?.shopOrderItems?.map((item, index) => (
          <div key={index} className="w-24 shrink-0 group">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-transparent group-hover:border-orange-500 transition-all">
              <img src={getImageUrl(item)} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-[9px] font-black mt-2 truncate text-center uppercase text-gray-700">{item.name}</p>
            <p className="text-[8px] text-center font-bold text-gray-400">Qty: {item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t mt-4 space-y-4">
        {currentShopOrder?.status !== "delivered" && (
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
              <MdDirectionsBike size={14} className="text-blue-500" /> Assign Delivery Boy
            </label>
            <select
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
              value={selectedRider}
              onChange={(e) => setSelectedRider(e.target.value)}
            >
              <option value="">-- Choose available rider --</option>
              {riders.map((boy) => (
                <option key={boy._id} value={boy._id}>{boy.fullName}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div>
            <span className="text-[10px] block font-black text-gray-400 uppercase">Total Amount</span>
            <span className="text-2xl font-black text-gray-900">₹{currentShopOrder?.subTotal || data?.totalAmount}</span>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] font-black text-gray-400 uppercase">Update Progress</span>
             <select
                className="bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase outline-none hover:bg-gray-800 transition-colors cursor-pointer"
                value={currentShopOrder?.status}
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
    </div>
  );
};

export default OwnerOrderCard;