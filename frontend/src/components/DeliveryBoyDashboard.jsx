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

  const sendOtpToCustomer = async () => {
    setLoading(true);
    try {
      await axios.post(`${serverURL}/api/order/send-delivery-otp`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true });
      
      alert("OTP Sent to Customer!");
      setShowOtpBox(true);
    } catch (error) {
      alert("OTP Send Failed. Check Backend/Internet.");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="w-full min-h-screen bg-[#F8F9FA] pt-7 flex flex-col items-center pb-10 px-4">
      <Nav />
      
      {/* Header: Responsive Width */}
      <div className="w-full max-w-[900px] flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 uppercase italic">Dashboard</h1>
          <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
          </p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border relative">
          <IoMdNotificationsOutline size={22} className="text-gray-600" />
          {assignments.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
        </div>
      </div>

      <div className="w-full max-w-[900px] space-y-6">
        {/* Stats: Better spacing for PC & Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatItem icon={<CiDeliveryTruck size={22}/>} label="Requests" value={assignments.length} color="orange" />
          <StatItem icon={<CiShoppingCart size={22}/>} label="Active" value={currentOrder ? 1 : 0} color="green" />
          <StatItem icon={<CiWallet size={22}/>} label="Earnings" value={`₹${todayDeliveries.reduce((s,d)=>s+(d.count || 0)*50,0)}`} color="blue" />
          <StatItem icon={<CiTimer size={22}/>} label="Today" value={todayDeliveries[0]?.count || 0} color="green" />
        </div>

        {!currentOrder ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-black uppercase text-gray-400 mb-6 tracking-widest">Available Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.length > 0 ? assignments.map((a) => (
                <div key={a.assignmentId} className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-black text-lg text-gray-800 uppercase italic">{a.shopName}</p>
                    <p className="font-black text-green-600 italic">₹{a.subTotal}</p>
                  </div>
                  <div className="flex items-start gap-2 mb-5">
                    <CiLocationOn className="text-orange-500 shrink-0 mt-1" size={18} />
                    <p className="text-[12px] font-bold text-gray-500 leading-snug">{formatAddress(a)}</p>
                  </div>
                  <button onClick={() => acceptOrder(a.assignmentId)} className="w-full bg-black text-white font-bold py-3.5 rounded-xl uppercase text-[10px] tracking-widest active:scale-95 transition-all">Accept Job</button>
                </div>
              )) : (
                <div className="col-span-full text-center py-10 opacity-30 font-bold uppercase text-[10px] tracking-[4px]">Waiting for requests...</div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 max-w-[700px] mx-auto">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-slate-900 p-4 flex justify-between items-center">
                    <p className="text-white text-[10px] font-black uppercase tracking-[2px]">Ongoing Delivery</p>
                    <p className="text-orange-500 text-[10px] font-black italic">ID: #{currentOrder._id.slice(-6)}</p>
                </div>
                
                <div className="p-5 md:p-8">
                    <div className="flex items-start gap-3 mb-6 bg-orange-50/50 p-4 rounded-xl border border-dashed border-orange-200">
                        <CiLocationOn className="text-orange-600 mt-1 shrink-0" size={22} />
                        <p className="text-xs md:text-sm font-bold text-gray-700 leading-relaxed italic">{formatAddress(currentOrder)}</p>
                    </div>

                    <div className="rounded-2xl overflow-hidden border shadow-sm mb-6 h-[250px] md:h-[300px] relative z-0">
                        <RiderTracking data={currentOrder} />
                    </div>

                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-sm font-black italic">{currentOrder?.user?.fullName?.charAt(0)}</div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-400 uppercase text-[8px] tracking-widest leading-none">Customer</p>
                            <p className="font-black text-gray-800 text-sm">{currentOrder?.user?.fullName}</p>
                            <p className="font-bold text-orange-600 text-sm mt-0.5">{currentOrder?.user?.mobileNumber}</p>
                        </div>
                    </div>

                    {showOtpBox ? (
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 animate-in slide-in-from-bottom duration-300">
                        <p className="font-black text-center text-gray-400 uppercase text-[9px] tracking-widest mb-3">Confirm OTP</p>
                        <input 
                          type="text" maxLength="4" value={otp} onChange={(e) => setOtp(e.target.value)}
                          placeholder="----"
                          className="w-full text-center text-2xl font-black py-3 rounded-xl border-2 border-slate-300 bg-white mb-4 outline-none focus:border-orange-500"
                        />
                        <div className="flex gap-2">
                           <button onClick={() => setShowOtpBox(false)} className="flex-1 py-3 bg-white border rounded-xl font-bold uppercase text-[9px]">Cancel</button>
                           <button onClick={handleVerifyOtp} className="flex-[2] py-3 bg-orange-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest">Verify & Finish</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={sendOtpToCustomer} disabled={loading} className="w-full bg-black text-white font-black py-4 md:py-5 rounded-2xl uppercase text-[11px] tracking-[2px] shadow-lg active:scale-95 transition-all">
                        {loading ? "SENDING..." : "Send OTP & Delivered"}
                      </button>
                    )}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value, color }) => (
  <div className="bg-white p-4 md:p-5 rounded-2xl flex flex-col items-center border border-gray-100 shadow-sm transition-transform active:scale-95">
    <div className={`mb-2 text-${color}-500 p-2.5 bg-${color}-50 rounded-xl`}>{icon}</div>
    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm md:text-lg font-black text-gray-800 mt-0.5">{value}</p>
  </div>
);

export default DeliveryBoyDashboard;