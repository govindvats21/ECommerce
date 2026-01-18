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

  const handleGetOrder = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/order/get-order-by-id/${orderId}`, {
        withCredentials: true,
      });
      setOrder(res.data);
    } catch (error) {
      console.log("Tracking Fetch Error:", error);
    }
  };

  useEffect(() => {
    if (orderId) handleGetOrder();
  }, [orderId]);

  // Loading Guard: Jab tak data na aaye tab tak crash na ho
  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff4d2d] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Fetching Tracking Data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 border-b pb-3 sticky top-0 bg-white z-50">
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer bg-gray-100 p-2 rounded-full hover:bg-gray-200"
          >
            <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Track Order</h1>
        </div>

        {order?.shopOrders?.map((shopOrder, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-6"
          >
            {/* Shop Detail */}
            <div className="flex gap-4 items-center">
              <img
                src={shopOrder?.shop?.logo || "https://via.placeholder.com/150"}
                alt=""
                className="w-14 h-14 rounded-lg border object-cover"
              />
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {shopOrder?.shop?.name || "Partner Shop"}
                </h2>
                <p className="text-xs text-gray-500">{shopOrder?.shop?.city}</p>
              </div>
            </div>

            {/* Address & Items Box */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="mb-3">
                <p className="text-[11px] uppercase font-bold text-gray-400 mb-1">Delivery Address</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {/* FIXED ADDRESS LOGIC: Object access instead of .text */}
                  {typeof order.deliveryAddress === 'object' ? (
                    <>
                      {order.deliveryAddress.flatNo}, {order.deliveryAddress.area}, <br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.pincode}
                    </>
                  ) : (
                    order.deliveryAddress || "Address not available"
                  )}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-gray-400 mb-1">Items Summary</p>
                <p className="text-sm text-gray-700">
                  {shopOrder.shopOrderItems?.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                </p>
              </div>
            </div>

            {/* Progress */}
            <OrderProgressBar status={shopOrder?.status} />

            {/* Rider Status Section */}
            {shopOrder?.status !== "delivered" ? (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm font-bold text-blue-800 mb-2 capitalize">
                  Status: {shopOrder?.status || "Preparing"}
                </p>
                {shopOrder?.assignedDeliveryBoy ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">Delivery Partner</p>
                      <p className="text-sm font-bold text-gray-800">{shopOrder.assignedDeliveryBoy.fullName}</p>
                    </div>
                    <a 
                      href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`}
                      className="bg-white border border-blue-200 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                    >
                      📞 Call
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Waiting for rider assignment...</p>
                )}
              </div>
            ) : (
              <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                <p className="text-green-700 font-bold text-sm">✅ Order Delivered</p>
              </div>
            )}

            {/* Live Map (Only if Rider is assigned and moving) */}
            {shopOrder?.assignedDeliveryBoy?.location?.coordinates && shopOrder.status === "out of delivery" && (
              <div className="mt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Live Delivery Map</h3>
                <div className="h-[250px] rounded-2xl overflow-hidden border shadow-inner">
                  <DeliveryBoyTracking
                    data={{
                      deliveryBoyLocation: {
                        lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                        lon: shopOrder.assignedDeliveryBoy.location.coordinates[0],
                      },
                      customerLocation: {
                        lat: order?.deliveryAddress?.latitude || 0,
                        lon: order?.deliveryAddress?.longitude || 0,
                      },
                    }}
                  />
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