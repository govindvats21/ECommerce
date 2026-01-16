import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaCreditCard, FaTruck, FaCheckCircle } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { serverURL } from "../App";

// --- Map Jump & Smooth Animation Component ---
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const { cartItems, totalAmount, user } = useSelector((state) => state.user);

  const [position, setPosition] = useState([28.6139, 77.2090]); // Default Delhi
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

  // --- Search Address & Auto-fill Fields ---
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${searchQuery}`
      );
      if (res.data.length > 0) {
        const firstResult = res.data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);
        const addr = firstResult.address;

        setPosition([lat, lon]);

        // Auto-filling fields based on search result
        setFormData((prev) => ({
          ...prev,
          area: firstResult.display_name,
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
        }));
      } else {
        alert("Location not found! Please be more specific.");
      }
    } catch (err) {
      console.log("Search Error:", err);
    }
  };

  // --- Reverse Geocoding when Marker is Dragged ---
  const handleMarkerDrag = async (e) => {
    const { lat, lng } = e.target.getLatLng();
    setPosition([lat, lng]);

    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (res.data) {
        const addr = res.data.address;
        setFormData((prev) => ({
          ...prev,
          area: res.data.display_name,
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- RAZORPAY ONLINE PAYMENT LOGIC ---
  const openRazorpay = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "VatsStore",
      description: "Secure Payment for Order",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const verifyRes = await axios.post(
            `${serverURL}/api/order/verify-razorpay`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            },
            { withCredentials: true }
          );
          if (verifyRes.status === 200) {
            navigate("/order-success");
          }
        } catch (err) {
          console.error("Payment verification failed", err);
          alert("Payment verification failed!");
        }
      },
      prefill: {
        name: formData.fullName,
        contact: formData.phone,
      },
      theme: { color: "#2563eb" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // --- FINAL ORDER SUBMISSION ---
  const handlePlaceOrder = async () => {
    if (!paymentMethod) return alert("Please select payment method!");
    if (!cartItems || cartItems.length === 0) return alert("Cart is empty!");

    const preparedCartItems = cartItems.map((item) => ({
      product: item.product?._id || item.product || item._id,
      shop: item.shop?._id || item.shop,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      images: item.images || [item.image] || [],
    }));

    const orderData = {
      paymentMethod,
      totalAmount,
      cartItems: preparedCartItems,
      deliveryAddress: {
        ...formData,
        latitude: position[0],
        longitude: position[1],
        text: `${formData.flatNo}, ${formData.area}, ${formData.city}`,
      },
    };

    try {
      const res = await axios.post(`${serverURL}/api/order/place-order`, orderData, {
        withCredentials: true,
      });

      if (res.status === 200) {
        if (paymentMethod === "cod") {
          alert("Order Placed!");
          navigate("/order-success");
        } else {
          openRazorpay(res.data.orderId, res.data.razorOrder);
        }
      }
    } catch (err) {
      console.error("Order Error:", err.response?.data);
      alert(err.response?.data?.message || "Order failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-[1000] flex justify-between items-center shadow-sm">
        <h1 onClick={() => navigate("/")} className="font-black text-2xl tracking-tighter cursor-pointer uppercase">
          Vats<span className="text-blue-600">Store</span>
        </h1>
        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
          <FaShieldAlt className="text-green-500" size={18} /> Secure Transaction
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: DELIVERY DETAILS */}
          <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all ${step !== 1 ? "opacity-90" : ""}`}>
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</span>
                <h2 className="text-xl font-bold tracking-tight italic uppercase">Delivery Details</h2>
              </div>
              {/* EDIT BUTTON: User can click to go back to Step 1 */}
              {step === 2 && (
                <button onClick={() => setStep(1)} className="text-blue-600 text-xs font-black uppercase tracking-widest underline cursor-pointer hover:text-blue-800">
                  Edit Address
                </button>
              )}
            </div>

            {/* Step 1 content only interactive when step is 1 */}
            <div className={`p-8 space-y-8 ${step !== 1 ? "pointer-events-none grayscale-[0.5]" : ""}`}>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search your area..."
                    className="flex-1 pl-6 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button onClick={handleSearch} className="bg-slate-900 text-white px-8 rounded-2xl font-bold text-xs uppercase hover:bg-blue-600 transition-colors">
                    Search
                  </button>
                </div>

                <div className="h-64 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner relative">
                  <MapContainer center={position} zoom={13} className="h-full w-full">
                    <ChangeView center={position} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={position} draggable={true} eventHandlers={{ dragend: handleMarkerDrag }} />
                  </MapContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Full Name" />
                <input name="phone" type="text" value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Mobile Number" />
                <input name="flatNo" type="text" value={formData.flatNo} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm md:col-span-2" placeholder="House / Flat / Building" />
                <textarea name="area" value={formData.area} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm md:col-span-2 h-20 resize-none" placeholder="Street Address" />
                <input name="city" type="text" value={formData.city} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm" placeholder="City" />
                <input name="state" type="text" value={formData.state} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm" placeholder="State" />
                <input name="pincode" type="number" value={formData.pincode} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Pincode" />
                <input name="landmark" type="text" value={formData.landmark} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm" placeholder="Landmark" />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em]">
                Confirm Delivery Address
              </button>
            </div>
          </div>

          {/* STEP 2: PAYMENT METHOD */}
          <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all ${step !== 2 ? "opacity-50" : ""}`}>
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 2 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-200 text-slate-500"}`}>2</span>
              <h2 className={`text-xl font-bold tracking-tight italic uppercase ${step === 2 ? "text-slate-900" : "text-slate-400"}`}>Payment Option</h2>
            </div>

            {step === 2 && (
              <div className="p-8 space-y-4 animate-in slide-in-from-bottom-5">
                <div onClick={() => setPaymentMethod("online")} className={`p-6 rounded-3xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "online" ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-slate-200"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === "online" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}><FaCreditCard size={20} /></div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">Pay Online</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UPI, Cards, NetBanking</p>
                    </div>
                  </div>
                  {paymentMethod === "online" && <FaCheckCircle className="text-blue-600" size={24} />}
                </div>

                <div onClick={() => setPaymentMethod("cod")} className={`p-6 rounded-3xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "cod" ? "border-blue-600 bg-blue-50" : "border-slate-100 hover:border-slate-200"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === "cod" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}><FaTruck size={20} /></div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">Cash on Delivery</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pay at your doorstep</p>
                    </div>
                  </div>
                  {paymentMethod === "cod" && <FaCheckCircle className="text-blue-600" size={24} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sticky top-28 shadow-2xl transition-all">
            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 border-b border-white/10 pb-4">Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest"><span>Items</span><span>{cartItems?.length || 0}</span></div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest"><span>Shipping</span><span className="text-blue-400">FREE</span></div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Total</span>
                <span className="text-4xl font-black tracking-tighter italic leading-none">₹{totalAmount}</span>
              </div>
            </div>
            <button
              disabled={!paymentMethod || step === 1}
              onClick={handlePlaceOrder}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl ${paymentMethod && step === 2 ? "bg-blue-600 hover:bg-white hover:text-blue-600 shadow-blue-500/20" : "bg-slate-800 text-slate-600 cursor-not-allowed"}`}
            >
              {paymentMethod === "cod" ? "Place Order Now" : "Pay & Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;