import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { MdKeyboardBackspace } from 'react-icons/md';
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
      console.error("Tracking Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) handleGetOrder();
  }, [orderId]);

  // Guard 1: Jab tak data fetch ho raha hai (No Blank Page)
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold text-sm">Tracking Info Loading...</p>
        </div>
      </div>
    );
  }

  // Guard 2: Agar data nahi mila (No Blank Page)
  if (!order || !order.shopOrders) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-6">
        <p className="text-gray-500 mb-4">Order details nahi mil payein.</p>
        <button onClick={() => navigate("/")} className="bg-[#ff4d2d] text-white px-6 py-2 rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2 border-b pb-3 sticky top-0 bg-white z-50">
          <div onClick={() => navigate("/")} className="cursor-pointer bg-gray-100 p-2 rounded-full">
            <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Track Order</h1>
        </div>

        {order.shopOrders.map((shopOrder, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            
            {/* Shop Detail */}
            <div className="flex gap-4 items-center">
              <img 
                src={shopOrder?.shop?.logo || "https://via.placeholder.com/150"} 
                className="w-14 h-14 rounded-lg border object-cover" 
                alt="" 
              />
              <div>
                <h2 className="text-base font-bold text-gray-800">{shopOrder?.shop?.name || "Partner Shop"}</h2>
                <p className="text-xs text-gray-500">{shopOrder?.shop?.city || "Update ho raha hai..."}</p>
              </div>
            </div>

            {/* Address Guard - Sabse bada crash point */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[11px] uppercase font-bold text-gray-400 mb-1">Delivery To:</p>
              <div className="text-sm text-gray-700 leading-relaxed">
                {typeof order.deliveryAddress === 'object' ? (
                  <span className="font-medium">
                    {order.deliveryAddress?.flatNo}, {order.deliveryAddress?.area}, <br />
                    {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                  </span>
                ) : (
                  <span className="font-medium">{order.deliveryAddress || "N/A"}</span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <OrderProgressBar status={shopOrder?.status || "pending"} />

            {/* Rider Status */}
            {shopOrder?.status !== "delivered" ? (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm font-bold text-blue-800 mb-2">Status: {shopOrder?.status || "Processing"}</p>
                {shopOrder?.assignedDeliveryBoy ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Delivery Boy</p>
                      <p className="text-sm font-bold text-gray-800">{shopOrder.assignedDeliveryBoy?.fullName}</p>
                    </div>
                    <a href={`tel:${shopOrder.assignedDeliveryBoy?.mobile}`} className="bg-white text-blue-600 px-4 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-sm">📞 Call</a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Assigning rider soon...</p>
                )}
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100 font-bold text-green-700 text-sm">✅ Delivered Successfully</div>
            )}

            {/* Live Map Safety Check */}
            {shopOrder?.assignedDeliveryBoy?.location?.coordinates && shopOrder.status === "out of delivery" && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3 text-center uppercase tracking-widest">Live Tracking</h3>
                <div className="h-[300px] rounded-2xl overflow-hidden border-2 border-white shadow-lg">
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