import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { MdKeyboardBackspace, MdCall } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { serverURL } from '../App';
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';
import OrderProgressBar from '../components/OrderProgressBar';
import Footer from '../components/Footer';

const TrackOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleGetOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverURL}/api/order/get-order-by-id/${orderId}`, {
        withCredentials: true,
      });
      setOrder(res.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) handleGetOrder();
  }, [orderId]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">Tracking Details Load Ho Rahi Hain...</p>
      </div>
    );
  }

  // 2. Data Not Found Guard
  if (!order || !order.shopOrders) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-6">
        <p className="text-gray-500 mb-4">Order details nahi mil payein.</p>
        <button onClick={() => navigate("/")} className="bg-[#ff4d2d] text-white px-8 py-2 rounded-lg font-bold">Wapas Jayein</button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6 min-h-screen pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2 border-b pb-3 sticky top-0 bg-white z-50">
          <div onClick={() => navigate("/")} className="cursor-pointer bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
            <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Track Order</h1>
        </div>

        {order.shopOrders.map((shopOrder, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 space-y-6">
            
            {/* Shop Detail */}
            <div className="flex gap-4 items-center">
             <img 
  src={
    shopOrder?.shop?.image 
      ? (shopOrder.shop.image.startsWith("http") 
          ? shopOrder.shop.image 
          : `${serverURL}/${shopOrder.shop.image.replace(/\\/g, "/")}`)
      : "https://via.placeholder.com/150" 
  } 
  className="w-16 h-16 rounded-xl border-2 border-gray-100 object-cover shadow-sm" 
  alt={shopOrder?.shop?.name || "shop"} 
  onError={(e) => { 
    e.target.onerror = null; 
    e.target.src = "https://via.placeholder.com/150"; 
  }} 
/>


              <div>
                <h2 className="text-base font-bold text-gray-800">{shopOrder?.shop?.name || "Partner Shop"}</h2>
                <p className="text-xs text-gray-500">{shopOrder?.shop?.city || "Location Updating..."}</p>
              </div>
            </div>

            {/* Address Guard */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Delivery Address</p>
              <div className="text-sm text-gray-700 leading-relaxed font-semibold">
                {typeof order.deliveryAddress === 'object' ? (
                  <>
                    {order.deliveryAddress?.flatNo}, {order.deliveryAddress?.area}, <br />
                    {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                  </>
                ) : (
                  order.deliveryAddress || "N/A"
                )}
              </div>
            </div>

            {/* Progress Stepper */}
            <OrderProgressBar status={shopOrder?.status || "pending"} />

            {/* Rider & Phone Number Section */}
            {shopOrder?.status !== "delivered" ? (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-tighter">Current Status: {shopOrder?.status || "Preparing"}</p>
                
                {shopOrder?.assignedDeliveryBoy ? (
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">🚚</div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Delivery Partner</p>
                        <p className="text-sm font-bold text-gray-800">{shopOrder.assignedDeliveryBoy?.fullName}</p>
                        <p className="text-xs text-blue-600 font-medium">{shopOrder.assignedDeliveryBoy?.mobile}</p>
                      </div>
                    </div>
                    {/* Phone Call Button */}
                    {shopOrder.assignedDeliveryBoy?.mobile && (
                      <a 
                        href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`}
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform active:scale-90"
                      >
                        <MdCall className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-500 italic p-2 bg-white/50 rounded-lg border border-dashed">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                    Waiting for rider assignment...
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-xl text-center border border-green-100 text-green-700 font-bold text-sm">
                ✅ Order Delivered Successfully
              </div>
            )}

            {/* Map Section */}
            {shopOrder?.assignedDeliveryBoy?.location?.coordinates && 
             (shopOrder.status === "out of delivery" || shopOrder.status === "assigned") && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Live Tracking Map</h3>
                  <span className="flex items-center gap-1 text-[10px] text-red-600 font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> LIVE
                  </span>
                </div>
                <div className="h-[300px] w-full rounded-2xl overflow-hidden border-4 border-white shadow-xl relative z-10">
                  <DeliveryBoyTracking data={{
                    deliveryBoyLocation: { 
                      lat: shopOrder.assignedDeliveryBoy.location.coordinates[1], 
                      lon: shopOrder.assignedDeliveryBoy.location.coordinates[0] 
                    },
                    customerLocation: { 
                      lat: order?.deliveryAddress?.latitude || 0, 
                      lon: order?.deliveryAddress?.longitude || 0 
                    },
                  }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default TrackOrderPage;