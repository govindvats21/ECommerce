import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaCreditCard, FaTruck, FaCheckCircle, FaShoppingBag } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { serverURL } from "../App";

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) { map.setView(center, 16); }
  }, [center]);
  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const { cartItems, totalAmount, user } = useSelector((state) => state.user);

  const [position, setPosition] = useState([28.6139, 77.2090]); 
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.mobileNumber || "",
    flatNo: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const { lat, lon, address } = result;
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setFormData((prev) => ({
          ...prev,
          area: result.display_name || "",
          city: address.city || address.town || address.village || address.suburb || address.city_district || address.county || "",
          state: address.state || "",
          pincode: address.postcode || "",
        }));
      }
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return alert("Please select payment method!");
    const orderData = {
      paymentMethod,
      totalAmount,
      cartItems: cartItems.map(item => ({
        product: item.product?._id || item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })),
      deliveryAddress: { ...formData, latitude: position[0], longitude: position[1] },
    };
    try {
      const res = await axios.post(`${serverURL}/api/order/place-order`, orderData, { withCredentials: true });
      if (res.status === 200) navigate("/order-success");
    } catch (err) { alert("Order failed!"); }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      <header className="bg-white border-b py-4 px-6 sticky top-0 z-[1000] flex justify-between items-center shadow-sm">
        <h1 onClick={() => navigate("/")} className="font-black text-2xl tracking-tighter cursor-pointer uppercase">
          Vats<span className="text-blue-600">Store</span>
        </h1>
        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
          <FaShieldAlt className="text-green-500" size={18} /> Secure Transaction
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: ADDRESS */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</span>
                <h2 className="text-xl font-bold italic uppercase">Delivery Details</h2>
              </div>
              {step === 2 && (
                <button onClick={() => setStep(1)} className="text-blue-600 text-xs font-black uppercase underline">Edit Address</button>
              )}
            </div>

            <div className={`p-8 space-y-8 ${step !== 1 ? "pointer-events-none opacity-60" : ""}`}>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" placeholder="Search area..." 
                    className="flex-1 px-6 py-3.5 bg-slate-100 border-none rounded-2xl text-sm"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button onClick={handleSearch} className="bg-slate-900 text-white px-8 rounded-2xl font-bold text-xs uppercase">Search</button>
                </div>
                <div className="h-64 rounded-[2rem] overflow-hidden border-4 border-slate-50 relative">
                  <MapContainer center={position} zoom={13} className="h-full w-full">
                    <ChangeView center={position} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={position} />
                  </MapContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-sm" placeholder="Full Name" />
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-sm" placeholder="Mobile Number" />
                <input name="flatNo" value={formData.flatNo} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-sm md:col-span-2" placeholder="House/Flat/Building" />
                <textarea name="area" value={formData.area} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-sm md:col-span-2 h-20" placeholder="Street Address" />
                <input name="city" value={formData.city} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-sm" placeholder="City" />
                <input name="state" value={formData.state} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-sm" placeholder="State" />
                <input name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-sm" placeholder="Pincode" />
                <input name="landmark" value={formData.landmark} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl text-sm" placeholder="Landmark" />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Confirm & Continue</button>
            </div>
          </div>

          {/* STEP 2: PAYMENT */}
          <div className={`bg-white rounded-3xl shadow-sm border ${step !== 2 ? "opacity-50" : ""}`}>
            <div className="p-6 bg-slate-50 border-b flex items-center gap-4">
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-200"}`}>2</span>
              <h2 className="text-xl font-bold italic uppercase">Payment</h2>
            </div>
            {step === 2 && (
              <div className="p-8 space-y-4">
                <div onClick={() => setPaymentMethod("online")} className={`p-6 rounded-3xl border-2 flex items-center justify-between cursor-pointer ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4"><FaCreditCard className="text-blue-600" size={24} /> <span className="font-bold uppercase text-sm">Pay Online</span></div>
                  {paymentMethod === 'online' && <FaCheckCircle className="text-blue-600" size={20} />}
                </div>
                <div onClick={() => setPaymentMethod("cod")} className={`p-6 rounded-3xl border-2 flex items-center justify-between cursor-pointer ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4"><FaTruck className="text-blue-600" size={24} /> <span className="font-bold uppercase text-sm">Cash on Delivery</span></div>
                  {paymentMethod === 'cod' && <FaCheckCircle className="text-blue-600" size={20} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- FIXED SUMMARY SECTION --- */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sticky top-28 shadow-2xl transition-all border border-white/5">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
              <FaShoppingBag className="text-blue-500" />
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Order Summary</h3>
            </div>
            
            {/* Scrollable Item List */}
            <div className="space-y-4 max-h-60 overflow-y-auto mb-8 pr-2 custom-scrollbar">
              {cartItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase truncate w-32">{item.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                  </div>
                  <span className="text-sm font-black">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Delivery Charge</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Total Payable</span>
                <span className="text-4xl font-black tracking-tighter italic leading-none text-blue-500">₹{totalAmount}</span>
              </div>
            </div>

            <button 
              disabled={!paymentMethod || step === 1}
              onClick={handlePlaceOrder}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl ${paymentMethod && step === 2 ? 'bg-blue-600 hover:bg-white hover:text-blue-600 shadow-blue-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
              {paymentMethod === 'cod' ? 'Confirm COD Order' : 'Pay & Place Order'}
            </button>
            
            <p className="text-center mt-4 text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em]">
              100% Secure & Encrypted Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;