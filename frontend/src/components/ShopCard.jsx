import React from "react";
import { useNavigate } from "react-router-dom";

const ShopCard = ({ name, image, id }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/shop/${id}`)}
      className="w-full sm:max-w-[250px] md:max-w-[200px] cursor-pointer rounded-lg bg-white shadow-md hover:shadow-lg transition duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Shop Image */}
      <div className="w-full h-32 sm:h-40 md:h-32 bg-gray-200 overflow-hidden rounded-t-lg">
        <img
          src={image || "https://via.placeholder.com/200x150"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 "
        />
      </div>

      {/* Shop Name */}
      <div className="p-4 text-center">
        <span className="text-gray-800 font-semibold text-sm sm:text-base md:text-sm block truncate">
          {name}
        </span>
      </div>
    </div>
  );
};

export default ShopCard;
