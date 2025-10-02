import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { MdKeyboardBackspace } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { serverURL } from '../App';
import { useEffect } from 'react';
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';
import OrderProgressBar from '../components/OrderProgressBar';
import Footer from '../components/Footer';

const TrackOrderPage = () => {

  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState();

  const handleGetOrder = async ()=> {
    try {
        const res = await axios.get(`${serverURL}/api/order/get-order-by-id/${orderId}`, {
        withCredentials: true,
      });
      setOrder(res.data)
    } catch (error) {
        console.log(error);
        
    }
  }

  useEffect(()=>{
handleGetOrder()
  },[orderId])

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b pb-3 sticky top-0 bg-white z-50 shadow-sm">
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"
        >
          <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Track Your Order
        </h1>
      </div>

  {order?.shopOrders.map((shopOrder, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-6"
        >
          {/* Shop Info */}
          <div className="flex gap-4 items-center">
            <img
              src={shopOrder?.shop?.image}
              alt={shopOrder?.shop?.name}
              className="w-16 h-16 rounded-lg border object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {shopOrder?.shop?.name || "Shop"}
              </h2>
              <p className="text-sm text-gray-500">
                {shopOrder?.shop?.address}, {shopOrder?.shop?.city}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Items:</span>{" "}
              {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Subtotal:</span> ₹{shopOrder?.subTotal}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Delivery Address:</span>{" "}
              {order?.deliveryAddress?.text}
            </p>
          </div>

          {/* Progress Bar */}
          <OrderProgressBar status={shopOrder.status} />

          {/* Status & Delivery Info */}
          {shopOrder.status !== "delivered" ? (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="font-medium text-yellow-800 capitalize">
                Current Status: {shopOrder.status || "Processing"}
              </p>
              {shopOrder.assignedDeliveryBoy ? (
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Delivery Boy: </span>
                    {shopOrder?.assignedDeliveryBoy.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Contact: </span>
                    {shopOrder?.assignedDeliveryBoy.mobile}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  🚚 Delivery boy is not assigned yet
                </p>
              )}
            </div>
          ) : (
            <p className="text-green-600 font-semibold text-sm">
              ✅ Delivered
            </p>
          )}

          {/* Live Tracking */}
          {(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Live Tracking
              </h3>
              <DeliveryBoyTracking
                data={{
                  deliveryBoyLocation: {
                    lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                    lon: shopOrder.assignedDeliveryBoy.location.coordinates[0],
                  },
                  customerLocation: {
                    lat: order.deliveryAddress.latitude,
                    lon: order.deliveryAddress.longitude,
                  },
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
      <Footer />
    
    </>
  
  )
}

export default TrackOrderPage