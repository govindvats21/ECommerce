import React from "react";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import { setMyShopData } from "../redux/ownerSlice";

const OwnerItemCard = ({ item }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCartDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await axios.get(`${serverURL}/api/item/delete/${item._id}`, {
        withCredentials: true,
      });
      dispatch(setMyShopData(res.data));
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const displayImage = item?.images?.[0] || "https://via.placeholder.com/150";

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-green-500 w-full max-w-2xl">
      <div className="w-36 flex-shrink-0 bg-gray-50 flex items-center justify-center">
        <img
          src={displayImage}
          alt={item?.name || "item image"}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-base font-semibold text-green-600 line-clamp-1">
              {item?.name}
            </h3>
            {/* Stock Badge */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded ${item?.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              {item?.stock > 0 ? `Stock: ${item?.stock}` : "Out of Stock"}
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-medium text-gray-700">Category:</span>{" "}
              {item?.category || "N/A"}
            </p>
            <p>
              <span className="font-medium text-gray-700">Brand:</span>{" "}
              {item?.brand || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-green-700 font-bold">
              ₹{item?.discountPrice}
            </span>
            {item?.originalPrice > item?.discountPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{item?.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/edit-item/${item._id}`)}
              className="p-2 rounded-full hover:bg-green-600/10 text-green-600"
              title="Edit"
            >
              <FiEdit size={16} />
            </button>
            <button
              onClick={handleCartDelete}
              className="p-2 rounded-full hover:bg-red-600/10 text-red-500"
              title="Delete"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
