import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import ReceiptDownloadButton from "./ReceiptDownloadButton";
import { useState } from "react";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState({});

  const dateFormat = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  console.log(data);
  // State

// Rating Handler
const handleRating = async (item) => {
  try {
    const itemId = item?.item?._id; // safe itemId
    const rating = selectedRating[itemId]; // current rating

    if (!itemId) return console.error("Item ID not found");

    const res = await axios.post(
      `${serverURL}/api/item/rateItem`,
      { itemId, rating },
      { withCredentials: true }
    );

    console.log("Rating response:", res.data);

    // frontend update
    setSelectedRating(prev => ({
      ...prev,
      [itemId]: rating,
    }));

  } catch (error) {
    console.error("Rating error:", error.response?.data || error.message);
  }
};


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-100 hover:shadow-xl transition duration-200">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Order #{data?._id.slice(-6)}
          </h2>
          <p className="text-sm text-gray-500">
            Placed on: {dateFormat(data?.createdAt)}
          </p>
          <span className="mt-1 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {data.paymentMethod.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-blue-600 capitalize">
            {data.shopOrders?.[0]?.status}
          </div>
        </div>
      </div>

      {/* Shop Orders */}
      {data.shopOrders?.map((shopOrder, idx) => (
        <div
          key={idx}
          className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
        >
          {/* Shop Name & Logo */}
          {shopOrder?.shop?.name && (
            <div className="flex items-center gap-2 mb-2">
              {shopOrder.shop?.logo && (
                <img
                  src={shopOrder.shop.logo}
                  alt={shopOrder.shop.name}
                  className="w-6 h-6 object-contain rounded-full"
                />
              )}
              <span className="font-semibold text-gray-700">
                {shopOrder.shop.name}
              </span>
            </div>
          )}

          {/* Items Horizontal Scroll */}
          <div className="flex space-x-4 overflow-x-auto pb-1">
            {shopOrder.shopOrderItems.map((item, index) => (
              <div
                key={index}
                className="w-36 shrink-0 rounded-lg bg-white shadow-sm p-2 hover:shadow-md transition cursor-pointer"
              >
                <img
                  src={
                    item?.item?.images?.[0]?.image1 ||
                    Object.values(item?.item?.images || {})[0] ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item?.name}
                  className="w-full h-24 object-cover rounded-md"
                />
                <p className="text-sm font-medium mt-2">{item.name}</p>
                <p className="text-xs text-gray-500">
                  Qty: {item.quantity} × ₹{item.price}
                </p>

                {shopOrder?.status === "delivered" && (
  <div className="flex space-x-1 mt-2">
    {[1, 2, 3, 4, 5].map((star) => {
      const itemId =  item?._id;
      return (
        <button
          key={star}
          className={`text-lg ${
            selectedRating[itemId] >= star ? "text-yellow-400" : "text-gray-400"
          }`}
          onClick={() =>
            setSelectedRating(prev => {
              const newRating = { ...prev, [itemId]: star };
              // call backend immediately
              handleRating({ ...item, _id: itemId });
              return newRating;
            })
          }
        >
          ★
        </button>
      );
    })}
  </div>
)}

              </div>
            ))}
          </div>

          {/* Subtotal + Status */}
          <div className="flex justify-between items-center text-sm text-gray-700">
            <p>Subtotal: ₹{shopOrder.subTotal}</p>
            <span className="font-medium text-blue-600 capitalize">
              {shopOrder.status}
            </span>
          </div>
        </div>
      ))}

      {data.shopOrders?.[0]?.status == "delivered" && (
        <ReceiptDownloadButton order={data} />
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <p className="text-base font-semibold text-gray-800">
          Total: ₹{data?.totalAmount}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/track-order/${data._id}`)}
            className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-md text-sm font-medium transition shadow"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate(`/reorder/${data._id}`)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow"
          >
            Reorder
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrderCard;
