import React, { useState, useEffect } from "react";
import {
  FaCreditCard,
  FaCrosshairs,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaSearch,
} from "react-icons/fa";
import { MdDeliveryDining, MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from "../redux/mapSlice";
import { serverURL } from "../App";
import { addMyOrders } from "../redux/userSlice";
import Footer from "../components/Footer";

// 🔄 Recenter map when location changes
function Recenter({ location }) {
  if (location?.lat && location?.lon) {
    const map = useMap();
    map.setView([location.lat, location.lon], 16, { animate: true });
  }
  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const amountWithDeliveryFee = totalAmount + deliveryFee;

  const [searchText, setSearchText] = useState(""); 
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // 📍 Drag marker to update location
  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  // 📌 Use browser's geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(setLocation({ lat: latitude, lon: longitude }));
        getAddressByLatLng(latitude, longitude);
      },
      (error) => {
        alert("Location access denied. Please type your address manually.");
      }
    );
  };

  // 🌐 Convert coordinates to address
  const getAddressByLatLng = async (lat, lng) => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
      );
      const addressLine = res?.data?.results?.[0]?.address_line2;
      if (addressLine) {
        dispatch(setAddress(addressLine));
        setSearchText(addressLine); // Manual input sync
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 📌 Convert address to coordinates
  const getLatLngByAddress = async () => {
    if (!searchText) return;
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          searchText
        )}&apiKey=${apiKey}`
      );
      if (res.data.features.length > 0) {
        const { lat, lon } = res.data.features[0].properties;
        dispatch(setLocation({ lat, lon }));
      } else {
        alert("Location not found. Please check the address.");
      }
    } catch (error) {
      console.log(error);
    }
  };

const handlePlaceOrder = async () => {
  if (!searchText || searchText.trim().length < 5) {
    alert("Please enter a valid delivery address.");
    return;
  }

  // --- ERROR FIX START ---
  // cartItems ko saaf karein taaki shop sirf ek ID ho (string), object nahi.
  const cleanedCartItems = cartItems.map((item) => ({
    ...item,
    shop: typeof item.shop === "object" ? item.shop._id : item.shop,
  }));
  // --- ERROR FIX END ---

  try {
    const res = await axios.post(
      `${serverURL}/api/order/place-order`,
      {
        cartItems: cleanedCartItems, // Ab cleaned data jayega
        paymentMethod,
        deliveryAddress: {
          text: searchText,
          latitude: location?.lat || 0,
          longitude: location?.lon || 0,
        },
        totalAmount: amountWithDeliveryFee,
      },
      { withCredentials: true }
    );

    if (paymentMethod === "cod") {
      dispatch(addMyOrders(res.data));
      navigate("/order-placed");
    } else {
      const orderId = res.data.orderId;
      const razorOrder = res.data.razorOrder;
      openRazorPayWindow(orderId, razorOrder);
    }
  } catch (error) {
    console.log(error);
    // Behtar error message ke liye:
    const msg = error.response?.data?.message || "Error placing order.";
    alert(msg);
  }
};

  const openRazorPayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      currency: "INR",
      amount: razorOrder.totalAmount,
      name: "VatsGroceryHub",
      description: "Grocery Order",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const res = await axios.post(
            `${serverURL}/api/order/verify-paymnet`,
            { razorpay_payment_id: response.razorpay_payment_id, orderId },
            { withCredentials: true }
          );
          dispatch(addMyOrders(res.data));
          navigate("/order-placed");
        } catch (error) {
          console.log(error);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    if (address) setSearchText(address);
  }, [address]);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div
          className="absolute top-[20px] left-[20px] z-10 cursor-pointer"
          onClick={() => navigate("/cart")}
        >
          <MdKeyboardBackspace className="w-[25px] h-[25px] text-[#ff4d2d]" />
        </div>

        <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>

          <section>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
              <FaMapMarkerAlt className="text-[#ff4d2d]" />
              Delivery Location
            </h2>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-[#ff4d2d]"
                placeholder="Enter Your Delivery Address..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <button
                onClick={getLatLngByAddress}
                className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center"
              >
                <FaSearch />
              </button>

              <button
                onClick={getCurrentLocation}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
              >
                <FaCrosshairs />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border">
              <div className="h-64 w-full flex items-center justify-center">
                <MapContainer
                  className="h-full w-full"
                  center={[location?.lat || 20.5937, location?.lon || 78.9629]}
                  zoom={location?.lat ? 17 : 5}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Recenter location={location} />
                  <Marker
                    position={[location?.lat || 20.5937, location?.lon || 78.9629]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  />
                </MapContainer>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border border-[#ff4d2d] bg-orange-50 shadow"
                    : "border border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("cod")}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <MdDeliveryDining className="text-green-600 text-xl" />
                </span>
                <div>
                  <p className="font-medium text-gray-800">Cash On Delivery</p>
                  <p className="text-xs text-gray-500">Pay at your doorstep</p>
                </div>
              </div>

              <div
                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === "online"
                    ? "border border-[#ff4d2d] bg-orange-50 shadow"
                    : "border border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("online")}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <FaMobileAlt className="text-lg text-purple-700" />
                </span>
                <div>
                  <p className="font-medium text-gray-800">Online Payment</p>
                  <p className="text-xs text-gray-500">UPI / Cards / Net Banking</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Order Summary
            </h2>
            <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
              {cartItems?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-700">
                  <span>{item?.name} x {item?.quantity}</span>
                  <span>₹{item?.price * item?.quantity}</span>
                </div>
              ))}
              <hr className="border-gray-200 my-2" />
              <div className="flex justify-between font-medium text-gray-700">
                <span>Sub Total</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between font-medium text-gray-700">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-[#ff4d2d] pt-2">
                <span>Total Amount</span>
                <span>₹{amountWithDeliveryFee}</span>
              </div>
            </div>
          </section>

          <div className="pt-4 flex justify-end">
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white font-semibold px-6 py-3 rounded-xl shadow-md transition duration-200"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckOut;