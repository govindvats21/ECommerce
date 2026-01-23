import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaCreditCard, FaTruck, FaCheckCircle, FaShoppingBag } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useNavigate, useLocation } from "react-router-dom"; // location add kiya
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { serverURL } from "../App";
import Swal from "sweetalert2";
import { clearCart, setBuyNowItem } from "../redux/userSlice"; // setBuyNowItem add kiya

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) { map.setView(center, 16); }
  }, [center]);
  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  // URL se check kar rahe hain ki Buy Now hai ya Cart
  const queryParams = new URLSearchParams(location.search);
  const isBuyNow = queryParams.get("type") === "buynow";

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  
  const { cartItems, buyNowItem, totalAmount, userData } = useSelector((state) => state.user);

  const displayItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems;
  const displayTotal = isBuyNow ? (buyNowItem?.price * buyNowItem?.quantity || 0) : totalAmount;

  const [position, setPosition] = useState([28.6139, 77.2090]);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    fullName: userData?.fullName || "",
    phone: userData?.mobile || "",
    flatNo: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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
          city: address.city || address.town || address.village || "",
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
      totalAmount: displayTotal,
      cartItems: displayItems.map(item => ({
        product: item.product?._id || item.id || item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        shop: item.shop?._id || item.shop,
        images: Array.isArray(item.images) ? item.images : [item.image || item.images],
        variant: item.variant || {}
      })),
      deliveryAddress: { 
        ...formData, 
        text: `${formData.flatNo}, ${formData.area}, ${formData.city}`,
        latitude: position[0], 
        longitude: position[1] 
      },
    };

    try {
      const res = await axios.post(`${serverURL}/api/order/place-order`, orderData, { withCredentials: true });
      
      const handleSuccessCleanup = () => {
        if (isBuyNow) {
          dispatch(setBuyNowItem(null)); // Buy now item clear
        } else {
          dispatch(clearCart()); // Cart clear
        }
        
        Swal.fire({
          title: '<span style="font-family: inherit; font-weight: 900;">ORDER PLACED!</span>',
          html: 'Bhai, aapka order successfully mil gaya hai. <br/> <b>VatsStore</b> par bharosa karne ke liye shukriya!',
          icon: 'success',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'Check My Orders',
          customClass: {
            popup: 'rounded-[2rem]',
            confirmButton: 'rounded-xl font-bold px-8 py-3'
          }
        }).then(() => {
          navigate("/order-placed");
        });
      };

      if (paymentMethod === "online" && res.data.razorOrder) {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) return alert("Razorpay SDK failed to load!");

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: res.data.razorOrder.amount,
          currency: "INR",
          name: "Vats Store",
          order_id: res.data.razorOrder.id,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(`${serverURL}/api/order/verify-payment`, {
                razorpay_payment_id: response.razorpay_payment_id,
                orderId: res.data.orderId
              }, { withCredentials: true });

              if (verifyRes.status === 200) {
                handleSuccessCleanup();
              }
            } catch (err) {
              alert("Payment Verification Failed!");
            }
          },
          prefill: { name: formData.fullName, contact: formData.phone },
          theme: { color: "#2563eb" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        handleSuccessCleanup();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Order placement failed!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="bg-white border-b py-4 px-6 flex justify-between items-center shadow-sm sticky top-0 z-[1000]">
        <h1 onClick={() => navigate("/")} className="font-black text-2xl tracking-tighter cursor-pointer uppercase">
          Vats<span className="text-blue-600">Store</span>
        </h1>
        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
          <FaShieldAlt className="text-green-500" size={18} /> Secure Transaction
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: ADDRESS */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold italic">1</span>
                <h2 className="text-xl font-bold italic uppercase tracking-tighter">Delivery Details</h2>
              </div>
              {step === 2 && <button onClick={() => setStep(1)} className="text-blue-600 text-xs font-black uppercase underline">Edit</button>}
            </div>

            <div className={`p-8 space-y-6 ${step !== 1 ? "pointer-events-none opacity-40" : ""}`}>
              <div className="flex gap-2">
                <input type="text" placeholder="Search your area..." className="flex-1 px-5 py-4 bg-slate-100 rounded-2xl text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button onClick={handleSearch} className="bg-slate-900 text-white px-6 rounded-2xl font-bold text-xs uppercase">Search</button>
              </div>
              
              <div className="h-60 rounded-3xl overflow-hidden border">
                <MapContainer center={position} zoom={13} className="h-full w-full">
                  <ChangeView center={position} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={position} />
                </MapContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="px-5 py-4 bg-slate-50 rounded-2xl text-sm border focus:border-blue-500 outline-none" placeholder="Full Name" />
                <input name="phone" value={formData.phone} onChange={handleInputChange} className="px-5 py-4 bg-slate-50 rounded-2xl text-sm border focus:border-blue-500 outline-none" placeholder="Phone Number" />
                <input name="flatNo" value={formData.flatNo} onChange={handleInputChange} className="md:col-span-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm border" placeholder="Flat / House No / Building" />
                <textarea name="area" value={formData.area} onChange={handleInputChange} className="md:col-span-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm border h-20" placeholder="Street Address / Area" />
                <input name="city" value={formData.city} onChange={handleInputChange} className="px-5 py-4 bg-slate-50 rounded-2xl text-sm border" placeholder="City" />
                <input name="pincode" value={formData.pincode} onChange={handleInputChange} className="px-5 py-4 bg-slate-50 rounded-2xl text-sm border" placeholder="Pincode" />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition">Confirm Address</button>
            </div>
          </div>

          {/* STEP 2: PAYMENT */}
          <div className={`bg-white rounded-3xl shadow-sm border ${step !== 2 ? "opacity-50" : ""}`}>
            <div className="p-6 bg-slate-50 border-b flex items-center gap-4">
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-200"}`}>2</span>
              <h2 className="text-xl font-bold italic uppercase tracking-tighter">Payment Method</h2>
            </div>
            {step === 2 && (
              <div className="p-8 space-y-4">
                <div onClick={() => setPaymentMethod("online")} className={`p-6 rounded-3xl border-2 flex items-center justify-between cursor-pointer transition ${paymentMethod === 'online' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4"><FaCreditCard className="text-blue-600" size={24} /> <span className="font-bold uppercase text-sm">Online Payment (UPI/Cards)</span></div>
                  {paymentMethod === 'online' && <FaCheckCircle className="text-blue-600" size={20} />}
                </div>
                <div onClick={() => setPaymentMethod("cod")} className={`p-6 rounded-3xl border-2 flex items-center justify-between cursor-pointer transition ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4"><FaTruck className="text-blue-600" size={24} /> <span className="font-bold uppercase text-sm">Cash on Delivery</span></div>
                  {paymentMethod === 'cod' && <FaCheckCircle className="text-blue-600" size={20} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SUMMARY */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sticky top-28 shadow-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
              <FaShoppingBag className="text-blue-500" />
              <h3 className="text-xl font-black italic uppercase tracking-tighter">
                {isBuyNow ? "Quick Order" : "Summary"}
              </h3>
            </div>
            
            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {displayItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase truncate w-32">{item.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Qty: {item.quantity}</span>
                  </div>
                  <span className="text-sm font-black italic">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <span>Total Payable</span>
                <span>₹{displayTotal}</span>
              </div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Final Amount</span>
                <span className="text-4xl font-black italic text-blue-500 tracking-tighter leading-none">₹{displayTotal}</span>
              </div>
            </div>

            <button 
              disabled={!paymentMethod || step === 1 || displayItems.length === 0}
              onClick={handlePlaceOrder}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${paymentMethod && step === 2 ? 'bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
              {paymentMethod === 'cod' ? 'Place COD Order' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;