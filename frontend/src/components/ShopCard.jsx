import React from "react";
import { useNavigate } from "react-router-dom";

const ShopCard = ({ name, image, id }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/shop/${id}`)}
      className="min-w-[140px] sm:min-w-[160px] md:min-w-[180px] cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl bg-white transform transition duration-300 hover:-translate-y-1 hover:scale-105"
    >
      {/* Shop Image */}
      <div className="w-full h-30 sm:h-40 md:h-30 bg-gray-100 overflow-hidden">
        <img
          src={image || "https://via.placeholder.com/180x160"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Shop Name */}
      <div className="bg-white px-3 py-2 text-center">
        <span className="text-gray-800 font-semibold text-sm sm:text-base md:text-lg truncate block">
          {name}
        </span>
      </div>
    </div>
  );
};

export default ShopCard;
