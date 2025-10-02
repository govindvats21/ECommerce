import React, { useState } from "react";
import { FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(0);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => quantity > 0 && setQuantity((prev) => prev - 1);

  const discountAmount = data?.originalPrice - data?.discountPrice;
  const discountPercentage = data?.originalPrice
    ? Math.round((discountAmount / data?.originalPrice) * 100)
    : 0;

   // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-yellow-400" />
        )
      );
    }
    return stars;
  };

  return (
<div
  className="w-[45vw] sm:w-[180px] md:w-[220px] rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all p-2 flex flex-col gap-1 cursor-pointer hover:-translate-y-1"
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/single-item/${data._id}`);
  }}
>
 {/* Image with Discount Badge */}
<div className="relative w-full h-28 sm:h-32 md:h-36 flex items-center justify-center rounded-xl overflow-hidden">
  <img
    src={data?.images?.[0]?.image1 || "https://via.placeholder.com/150"}
    alt={data?.name}
    className="max-h-full max-w-full object-contain"
  />
  {discountPercentage > 0 && (
    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
      {discountPercentage}% OFF
    </span>
  )}
</div>



  {/* Category */}
  <p className="text-gray-400 text-xs md:text-sm line-clamp-1 mt-1">{data?.category}</p>

  {/* Name */}
  <h1 className="text-gray-900 font-medium text-sm md:text-base truncate">{data?.name}</h1>

  {/* Rating */}
  <div className="flex items-center gap-1">
    {renderStars(data?.rating?.average || 0)}
    <span className="text-xs text-gray-500">({data?.rating?.count || 0})</span>
  </div>

  {/* Price */}
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1">
      <span className="text-gray-900 font-semibold text-sm md:text-base">₹{data?.discountPrice}</span>
      {discountPercentage > 0 && (
        <span className="text-gray-400 text-xs md:text-sm line-through">₹{data?.originalPrice}</span>
      )}
       {discountAmount > 0 && (
      <span className="text-red-500 text-xs md:text-sm font-semibold">Save ₹{discountAmount}</span>
    )}
    </div>
   
  </div>


  {/* Quantity + Cart */}
<div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  {/* Quantity control */}
  <div className="flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden w-full sm:w-auto">
    <button
      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition text-gray-700 text-sm"
      onClick={(e) => {
        e.stopPropagation();
        handleDecrease();
      }}
    >
      <FaMinus size={12} />
    </button>
    <span className="px-4 py-1 text-sm font-medium">{quantity}</span>
    <button
      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition text-gray-700 text-sm"
      onClick={(e) => {
        e.stopPropagation();
        handleIncrease();
      }}
    >
      <FaPlus size={12} />
    </button>
  </div>

  {/* Add to cart */}
  <button
    className="w-full sm:w-auto flex items-center justify-center px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition shadow-md text-sm font-medium"
    onClick={() =>
      quantity > 0 &&
      dispatch(
        addToCart({
          id: data._id,
          name: data.name,
          shop: data.shop,
          price: data.discountPrice,
          quantity,
          image: data?.images?.[0]?.image1,
        })
      )
    }
  >
    <FaShoppingCart size={14} className="mr-1" />
    Add
  </button>
</div>




</div>


  );
};

export default ItemCard;
