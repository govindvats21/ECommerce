import axios from "axios";
import React, { useState, useEffect } from "react";
import { serverURL } from "../App";
import { useSelector } from "react-redux";
import Nav from "./Nav";
import RiderTracking from "./RiderTracking";
import { CiDeliveryTruck, CiShoppingCart, CiWallet, CiTimer, CiLocationOn } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";

const DeliveryBoyDashboard = () => {
  const { userData } = useSelector((state) => state.user);
  const [assignments, setAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayDeliveries, setTodayDeliveries] = useState([]);

  const formatAddress = (order) => {
    const addr = order?.deliveryAddress || order?.order?.deliveryAddress;
    if (!addr) return "Address Details Loading...";
    return typeof addr === 'string' ? addr : `${addr.flatNo || ""}, ${addr.area || ""}, ${addr.city || ""}`;
  };

  const fetchData = async () => {
    try {
      const [assignRes, activeRes, earningsRes] = await Promise.all([
        axios.get(`${serverURL}/api/order/get-assignments`, { withCredentials: true }),
        axios.get(`${serverURL}/api/order/get-current-order`, { withCredentials: true }),
        axios.get(`${serverURL}/api/order/get-today-deliveries`, { withCredentials: true })
      ]);
      setAssignments(assignRes.data || []);
      setCurrentOrder(activeRes.data?._id ? activeRes.data : null);
      setTodayDeliveries(earningsRes.data || []);
    } catch (error) { console.error("Data Fetch Error:", error); }
  };

  useEffect(() => { if (userData?._id) fetchData(); }, [userData]);

  const acceptOrder = async (id) => {
    try {
      await axios.get(`${serverURL}/api/order/accept-order/${id}`, { withCredentials: true });
      fetchData();
    } catch (error) { alert("Accept Action Failed"); }
  };

  // 🔥 1. Pehle OTP Send hoga
  const sendOtpToCustomer = async () => {
    setLoading(true);
    try {
      await axios.post(`${serverURL}/api/order/send-delivery-otp`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true });
      
      alert("OTP Sent to Customer!");
      setShowOtpBox(true); // OTP jaane ke baad box dikhao
    } catch (error) {
      alert("OTP Send Failed. Check Backend/Internet.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 2. Fir OTP Verify hoga
  const handleVerifyOtp = async () => {
    if(!otp || otp.length < 4) return alert("Enter 4-digit OTP");
    try {
      await axios.post(`${serverURL}/api/order/verify-delivery-otp`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id,
        otp: otp
      }, { withCredentials: true });
      
      alert("Order Delivered Successfully! 🎉");
      setShowOtpBox(false);
      setOtp("");
      setCurrentOrder(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="w-screen min-h-screen bg-[#F8F9FA] pt-[50px] flex flex-col items-center pb-20 font-sans">
      <Nav />
      
      <div className="w-[92%] max-w-[800px] flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic leading-none">Rider Dashboard</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px] mt-1">Status: Online</p>
        </div>
       
      </div>

      <div className="w-[92%] max-w-[800px] flex flex-col gap-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem icon={<CiDeliveryTruck size={28}/>} label="Requests" value={assignments.length} color="orange" />
          <StatItem icon={<CiShoppingCart size={28}/>} label="Active" value={currentOrder ? 1 : 0} color="green" />
          <StatItem icon={<CiWallet size={28}/>} label="Earnings" value={`₹${(todayDeliveries[0]?.count || todayDeliveries.length || 0) * 50}`} color="blue" />
          <StatItem icon={<CiTimer size={28}/>} label="Today"value={todayDeliveries[0]?.count || todayDeliveries.length || 0} color="green" />
        </div>

        {!currentOrder ? (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-black uppercase italic text-gray-800 mb-8">Available Jobs</h2>
            <div className="flex flex-col gap-6">
              {assignments.length > 0 ? assignments.map((a) => (
                <div key={a.assignmentId} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <p className="font-black text-2xl text-gray-900 uppercase italic leading-none">{a.shopName}</p>
                    <p className="text-xl font-black text-green-600 italic">₹{a.subTotal}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl mb-8 flex items-start gap-3">
                    <CiLocationOn className="text-orange-500 shrink-0" size={24} />
                    <p className="text-sm font-bold text-gray-600 italic">{formatAddress(a)}</p>
                  </div>
                  <button onClick={() => acceptOrder(a.assignmentId)} className="w-full bg-black text-white font-black py-5 rounded-2xl uppercase tracking-widest">Accept Order</button>
                </div>
              )) : (
                <div className="text-center py-10 opacity-20 font-black uppercase tracking-widest text-sm">Waiting...</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl border-t-[12px] border-orange-500 p-8 md:p-12 animate-in fade-in zoom-in duration-500">
            <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-dashed border-orange-200 mb-8 flex items-start gap-4">
                <CiLocationOn className="text-orange-600 shrink-0" size={30} />
                <p className="text-md font-black text-gray-800 italic leading-snug">{formatAddress(currentOrder)}</p>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl mb-8 h-[350px] relative z-0">
                <RiderTracking data={currentOrder} />
            </div>

            {/* Customer Details & Number */}
            <div className="flex items-center gap-4 mb-8 p-6 bg-gray-50 rounded-[2rem] border">
                <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-black italic shadow-lg">
                    {currentOrder?.user?.fullName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest leading-none">Customer Contact</p>
                  <p className="font-bold text-gray-800 text-lg mb-1">{currentOrder?.user?.fullName}</p>
                  <p className="font-black text-orange-600 text-2xl tracking-tighter">
                    {currentOrder?.user?.mobile || "No Number"}
                  </p>
                </div>
            </div>

            {/* OTP FLOW UI */}
            {showOtpBox ? (
              <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-200 animate-in slide-in-from-bottom">
                <p className="font-black text-center text-orange-600 uppercase text-[10px] tracking-[2px] mb-4">Enter Customer OTP</p>
                <input 
                  type="text" 
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="0 0 0 0"
                  className="w-full text-center text-3xl font-black tracking-[15px] py-4 rounded-2xl border-2 border-orange-300 bg-white mb-4 outline-none focus:border-orange-500 shadow-inner"
                />
                <div className="flex gap-3">
                   <button onClick={() => setShowOtpBox(false)} className="flex-1 py-4 bg-gray-200 rounded-xl font-bold uppercase text-[10px]">Back</button>
                   <button onClick={handleVerifyOtp} className="flex-[2] py-4 bg-orange-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg">Confirm Delivery</button>
                </div>
              </div>
            ) : (
              <button 
                disabled={loading}
                onClick={sendOtpToCustomer} 
                className={`w-full ${loading ? 'bg-gray-400' : 'bg-black'} text-white font-black py-7 rounded-[2rem] uppercase text-sm shadow-2xl tracking-[2px] active:scale-95 transition-all`}
              >
                {loading ? "SENDING OTP..." : "Send OTP & Mark Delivered"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center border border-gray-100 shadow-sm">
    <div className={`mb-3 text-${color}-500 p-3 bg-${color}-50 rounded-2xl`}>{icon}</div>
    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-black text-gray-800 italic mt-1">{value}</p>
  </div>
);

export default DeliveryBoyDashboard; 