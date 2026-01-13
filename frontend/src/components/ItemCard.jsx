import React, { useState } from "react";
import { FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0);
  const [showStepper, setShowStepper] = useState(false);

  const itemImage = data?.images && data?.images.length > 0 ? data.images[0] : "https://via.placeholder.com/150";

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    dispatch(addToCart({
        id: data._id,
        name: data.name,
        shop: data.shop,
        price: data.discountPrice,
        quantity: newQty,
        image: itemImage,
    }));
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      dispatch(addToCart({
          id: data._id,
          name: data.name,
          shop: data.shop,
          price: data.discountPrice,
          quantity: newQty,
          image: itemImage,
      }));
    } else {
      setQuantity(0);
      setShowStepper(false);
    }
  };

  const discountAmount = data?.originalPrice - data?.discountPrice;
  const discountPercentage = data?.originalPrice ? Math.round((discountAmount / data?.originalPrice) * 100) : 0;

  return (
    <div
      className="w-[180px] md:w-[210px] h-[300px] md:h-[300px] rounded-2xl border border-gray-100 bg-white p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-50 relative group"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/single-item/${data._id}`);
      }}
    >
      {/* 1. Image Section - Fixed Height */}
      <div className="relative w-full h-32 md:h-40 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50/50 mb-2">
        <img
          src={itemImage}
          alt={data?.name}
          className="object-contain max-h-[85%] w-full transition-transform duration-300 group-hover:scale-110"
        />
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black py-1 px-2 rounded-lg shadow-sm">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      {/* 2. Content Section - Using flex-grow to push footer down */}
      <div className="flex flex-col flex-grow">
        {/* Category */}
        {data?.category && (
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">{data.category}</p>
        )}
        
        {/* Title - Fixed to 2 lines height */}
        <h1 className="text-[13px] md:text-[14px] font-bold text-gray-800 leading-tight line-clamp-2 h-[34px] md:h-[3px]">
          {data?.name}
        </h1>

        {/* Price Section */}
        <div className="">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-gray-900">₹{data?.discountPrice}</span>
            {discountPercentage > 0 && (
              <span className="text-[11px] text-gray-400 line-through">₹{data?.originalPrice}</span>
            )}
          </div>
          {discountAmount > 0 && (
            <p className="text-[10px] text-green-600 font-bold">You Save ₹{discountAmount}</p>
          )}
          
        </div>
      </div>

      {/* 3. Footer / Buttons - Always stays at the bottom */}
      <div className="mt-3">
        {showStepper ? (
          <div className="flex items-center justify-between border-2 border-green-500 rounded-xl h-9 overflow-hidden bg-white">
            <button
              className="px-3 h-full hover:bg-green-50 text-green-600 transition-colors"
              onClick={(e) => { e.stopPropagation(); handleDecrease(); }}
            >
              <FaMinus size={10} />
            </button>
            <span className="text-sm font-black text-gray-800">{quantity}</span>
            <button
              className="px-3 h-full hover:bg-green-50 text-green-600 transition-colors"
              onClick={(e) => { e.stopPropagation(); handleIncrease(); }}
            >
              <FaPlus size={10} />
            </button>
          </div>
        ) : (
          <button
            className="w-full h-9 rounded-xl bg-gray-900 text-white hover:bg-blue-600 transition-all text-[11px] font-black flex items-center justify-center gap-2 uppercase tracking-widest"
            onClick={(e) => {
              e.stopPropagation();
              setShowStepper(true);
              setQuantity(1);
              handleIncrease();
            }}
          >
            <FaShoppingCart size={12} />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemCard;