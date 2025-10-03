import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";
import { FaShoppingCart } from "react-icons/fa";

const RelatedItems = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 const discountAmount = data?.originalPrice - data?.discountPrice;
  const discountPercentage = data?.originalPrice
    ? Math.round((discountAmount / data?.originalPrice) * 100)
    : 0;
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-16 px-4 md:px-10 lg:px-20">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Related Products
      </h1>

      {/* Grid of cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ">
        {data.map((item) => (
           <div
                className="w-[180px] md:w-[230px] rounded-lg border border-gray-200 bg-white p-2 flex flex-col gap-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/single-item/${item._id}`);
                }}
              >
                {/* Image */}
                <div className="relative w-full h-24 md:h-32 flex items-center justify-center overflow-hidden rounded-md bg-white">
                  <img
                    src={item?.images?.[0]?.image1 || "https://via.placeholder.com/150"}
                    alt={item?.name}
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
                  {item?.name}
                </h1>
          
                {/* Category */}
                {item?.category && (
                  <p className="text-[12px] text-gray-400 truncate">{item?.category}</p>
                )}
        
          
                {/* Price */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{item?.discountPrice}
                    </span>
                    {discountPercentage > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{item?.originalPrice}
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
                  
                    <button
                      className="w-full h-8 rounded-md border border-green-500 text-green-600 bg-green-50 hover:bg-green-100 text-sm font-semibold flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStepper(true);
                        setQuantity(1);
                        dispatch(
                          addToCart({
                            id: item._id,
                            name: item.name,
                            shop: item.shop,
                            price: item.discountPrice,
                            quantity: 1,
                            image: item?.images?.[0]?.image1,
                          })
                        );
                      }}
                    >
                      <FaShoppingCart size={12} className="mr-1" />
                      Add
                    </button>
                 
                </div>
              </div>
          
        ))}
      </div>
    </div>
  );
};

export default RelatedItems;
