import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { HiOutlineShoppingBag } from "react-icons/hi2";

const RelatedItems = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!data || data.length === 0) return null;

  return (
    <div className="mt-16 mb-20 px-4 md:px-10 lg:px-16 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Style With These
          </h2>
          <div className="w-10 h-1 bg-black mt-1.5 rounded-full"></div>
        </div>
        <div className="hidden sm:flex">
           <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Swipe to explore</span>
        </div>
      </div>

      {/* Fixed Height & Width Slider */}
      <div className="flex overflow-x-auto gap-6 pb-10 scrollbar-hide snap-x">
        {data.map((item) => {
          const displayImg = item?.images?.[0]?.image1 || item?.images?.[0] || item?.image;
          const sPrice = item.discountPrice || item.price;
          const discount = item.originalPrice > sPrice 
            ? Math.round(((item.originalPrice - sPrice) / item.originalPrice) * 100) 
            : 0;

          return (
            <div 
              key={item._id} 
              /* Width and Height are now FIXED */
              className="min-w-[190px] w-[190px] md:min-w-[240px] md:w-[240px] lg:min-w-[280px] lg:w-[280px] h-[340px] md:h-[400px] group snap-start bg-white rounded-3xl border border-gray-100 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Image Section - Fixed 65% height */}
              <div 
                className="relative h-[65%] bg-[#F9F9F9] cursor-pointer overflow-hidden flex items-center justify-center p-6"
                onClick={() => {
                  navigate(`/single-item/${item._id}`);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {discount > 0 && (
                  <div className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                    {discount}% OFF
                  </div>
                )}
                
                <img 
                  src={displayImg} 
                  alt={item.name} 
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover Add to Bag */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(addToCart({ ...item, id: item._id, quantity: 1, image: displayImg, price: sPrice }));
                    }}
                    className="bg-white text-black p-3.5 rounded-full shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-black hover:text-white"
                  >
                    <HiOutlineShoppingBag size={20} />
                  </button>
                </div>
              </div>

              {/* Text Details Section - Fixed 35% height */}
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {item.category || "Collection"}
                  </p>
                  
                  <h3 className="text-[14px] font-semibold text-gray-800 line-clamp-1 group-hover:text-black transition-colors">
                    {item.name}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">₹{sPrice}</span>
                    {discount > 0 && (
                      <span className="text-[11px] text-gray-300 line-through font-medium">₹{item.originalPrice}</span>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(addToCart({ ...item, id: item._id, quantity: 1, image: displayImg, price: sPrice }));
                    }}
                    className="text-gray-300 hover:text-black transition-colors md:block hidden"
                  >
                    <HiOutlineShoppingBag size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedItems;