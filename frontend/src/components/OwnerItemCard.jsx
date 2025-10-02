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
    try {
      const res = await axios.get(
        `${serverURL}/api/item/delete/${item._id}`,
        {
          withCredentials: true,
        }
      );
      dispatch(setMyShopData(res.data));
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-green-500 w-full max-w-2xl">
      <div className="w-36 flex-shrink-0 bg-gray-50">
        <img
          src={item?.images[0]?.image1}
          alt={item?.name || "item image"}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <h3 className="text-base font-semibold text-green-600">
            {item?.name}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {/* {item?.description} */}
          </p>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>
              <span className="font-medium text-gray-700">Category:</span>{" "}
              {item?.category || "N/A"}
            </p>
            <p>
              <span className="font-medium text-gray-700">Type:</span>{" "}
              {item?.type || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-green-700 font-bold">₹{item?.discountPrice}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/edit-item/${item._id}`)}
              className="p-2 rounded-full hover:bg-green-600/10 text-green-600"
              aria-label="Edit item"
            >
              <FiEdit size={16} />
            </button>
            <button
              className="p-2 rounded-full hover:bg-green-600/10 text-green-600"
              onClick={handleCartDelete}
              aria-label="Delete item"
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
