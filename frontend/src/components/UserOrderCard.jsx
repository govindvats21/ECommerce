import { useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import ReceiptDownloadButton from "./ReceiptDownloadButton";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();

  const dateFormat = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --- Image Logic Fix (Safe for Vercel) ---
  const getImageUrl = (item) => {
    const path = 
      (item?.images && item.images.length > 0 ? item.images[0] : null) || 
      (item?.item?.images && item.item.images.length > 0 ? item.item.images[0] : null);

    if (!path) return "https://via.placeholder.com/150?text=No+Image";
    if (path.startsWith("http")) return path;
    
    const cleanPath = path.replace(/\\/g, "/");
    return `${serverURL}/${cleanPath}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-100 hover:shadow-xl transition duration-200">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Order #{data?._id?.slice(-6) || "------"}
          </h2>
          <p className="text-sm text-gray-500">
            Placed on: {data?.createdAt ? dateFormat(data.createdAt) : "Loading..."}
          </p>
          <span className="mt-1 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase font-bold">
            {data?.paymentMethod || "Payment"}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-blue-600 capitalize">
            {/* Vercel Guard: Status agar missing ho toh 'Processing' dikhao */}
            {data?.shopOrders?.[0]?.status || "Processing"}
          </div>
        </div>
      </div>

      {/* Shop Orders */}
      {data?.shopOrders?.map((shopOrder, idx) => (
        <div
          key={idx}
          className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
        >
          {/* Shop Name & Logo (Safe Check) */}
          {shopOrder?.shop && (
            <div className="flex items-center gap-2 mb-2">
              {shopOrder.shop?.logo && (
                <img
                  src={shopOrder.shop.logo.startsWith('http') ? shopOrder.shop.logo : `${serverURL}/${shopOrder.shop.logo.replace(/\\/g, "/")}`}
                  alt=""
                  className="w-6 h-6 object-contain rounded-full"
                />
              )}
              <span className="font-semibold text-gray-700">
                {shopOrder.shop?.name || "Loading Shop..."}
              </span>
            </div>
          )}

          {/* Items Horizontal Scroll (Safe Mapping) */}
          <div className="flex space-x-4 overflow-x-auto pb-1 scrollbar-hide">
            {shopOrder?.shopOrderItems && shopOrder.shopOrderItems.length > 0 ? (
              shopOrder.shopOrderItems.map((item, index) => (
                <div
                  key={index}
                  className="w-36 shrink-0 rounded-lg bg-white shadow-sm p-2"
                >
                  <img
                    src={getImageUrl(item)}
                    alt={item?.name || "item"}
                    className="w-full h-24 object-cover rounded-md"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                  />
                  <p className="text-sm font-medium mt-2 truncate">{item?.name || "Product"}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {item?.quantity || 0} × ₹{item?.price || 0}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic">No items found</p>
            )}
          </div>

          {/* Subtotal + Status */}
          <div className="flex justify-between items-center text-sm text-gray-700">
            <p className="font-medium">Subtotal: ₹{shopOrder?.subTotal || 0}</p>
            <span className="font-bold text-blue-600 capitalize">
              {shopOrder?.status || "Pending"}
            </span>
          </div>
        </div>
      ))}

      {/* Receipt Button */}
      {data?.shopOrders?.[0]?.status === "delivered" && (
        <ReceiptDownloadButton order={data} />
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <p className="text-base font-black text-gray-800">
          Total: ₹{data?.totalAmount || 0}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/track-order/${data?._id}`)}
            className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-md text-sm font-bold transition shadow"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate(`/reorder/${data?._id}`)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-bold transition shadow"
          >
            Reorder
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrderCard;