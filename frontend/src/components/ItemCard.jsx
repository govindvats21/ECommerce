import React, { useState } from "react";
import {
  FaStar,
  FaRegStar,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0);
  const [showStepper, setShowStepper] = useState(false);

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    dispatch(
      addToCart({
        id: data._id,
        name: data.name,
        shop: data.shop,
        price: data.discountPrice,
        quantity: newQty,
        image: data?.images?.[0]?.image1,
      })
    );
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      dispatch(
        addToCart({
          id: data._id,
          name: data.name,
          shop: data.shop,
          price: data.discountPrice,
          quantity: newQty,
          image: data?.images?.[0]?.image1,
        })
      );
    } else {
      setQuantity(0);
      setShowStepper(false);
    }
  };

  const discountAmount = data?.originalPrice - data?.discountPrice;
  const discountPercentage = data?.originalPrice
    ? Math.round((discountAmount / data?.originalPrice) * 100)
    : 0;

  

  return (
    <div
      className="w-[180px] md:w-[200px] rounded-lg border border-gray-200 bg-white p-2 flex flex-col gap-1 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/single-item/${data._id}`);
      }}
    >
      {/* Image */}
      <div className="relative w-full h-24 md:h-32 flex items-center justify-center overflow-hidden rounded-md bg-white">
        <img
          src={data?.images?.[0]?.image1 || "https://via.placeholder.com/150"}
          alt={data?.name}
          className="object-contain max-h-full"
        />
        {discountPercentage > 0 && (
          <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-[15px] font-medium text-gray-900 truncate">
        {data?.name}
      </h1>

      {/* Category */}
      {data?.category && (
        <p className="text-[12px] text-gray-400 truncate">{data.category}</p>
      )}

    

      {/* Price */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            ₹{data?.discountPrice}
          </span>
          {discountPercentage > 0 && (
            <span className="text-xs text-gray-400 line-through">
              ₹{data?.originalPrice}
            </span>
          )}
        </div>
        {discountAmount > 0 && (
          <span className="text-[11px] text-red-500 font-medium">
            Save ₹{discountAmount}
          </span>
        )}
      </div>

      {/* Add/Quantity Controls */}
      <div className="mt-1">
        {showStepper ? (
          <div className="flex items-center justify-between border border-gray-300 rounded-md h-8 overflow-hidden">
            <button
              className="px-2 bg-gray-100 hover:bg-gray-200 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDecrease();
              }}
            >
              <FaMinus size={10} />
            </button>
            <span className="text-sm font-medium">{quantity}</span>
            <button
              className="px-2 bg-gray-100 hover:bg-gray-200 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleIncrease();
              }}
            >
              <FaPlus size={10} />
            </button>
          </div>
        ) : (
          <button
            className="w-full h-8 rounded-md border border-green-500 text-green-600 bg-green-50 hover:bg-green-100 text-sm font-semibold flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setShowStepper(true);
              setQuantity(1);
              dispatch(
                addToCart({
                  id: data._id,
                  name: data.name,
                  shop: data.shop,
                  price: data.discountPrice,
                  quantity: 1,
                  image: data?.images?.[0]?.image1,
                })
              );
            }}
          >
            <FaShoppingCart size={12} className="mr-1" />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
