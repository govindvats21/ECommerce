import React from "react";
import { useNavigate } from "react-router-dom";
import { categories as categoryData } from "../category"; 

const CategoryCard = ({ name, image }) => {
  const navigate = useNavigate();

  // Sabhi categories ab Ecommerce (Premium) hain
  const themeStyles = {
    cardBg: "bg-white hover:bg-indigo-50",
    ring: "ring-gray-100 hover:ring-indigo-200",
    text: "text-gray-800 group-hover:text-indigo-600",
    imgShape: "rounded-2xl", 
    shadow: "hover:shadow-xl hover:shadow-indigo-100/50"
  };

  return (
    <div
      onClick={() => navigate(`/category/${name}`)}
      className={`
        group flex flex-col items-center justify-center gap-3 p-4 
        w-28 h-36 md:h-44 md:w-36 
        rounded-[2rem] border border-gray-100
        ${themeStyles.cardBg} 
        shadow-sm ${themeStyles.shadow} 
        cursor-pointer transition-all duration-500 ease-out transform hover:-translate-y-2
      `}
    >
      {/* Image Container */}
      <div className={`
        w-16 h-16 md:w-24 md:h-24 
        ${themeStyles.imgShape} 
        overflow-hidden bg-[#f9f9f9] flex items-center justify-center 
        ring-4 ${themeStyles.ring} 
        transition-all duration-500 group-hover:rotate-3
      `}>
        <img
          src={image || "https://via.placeholder.com/80"}
          alt={name}
          className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Category Name */}
      <span className={`
        text-[11px] md:text-[13px] 
        ${themeStyles.text} 
        font-bold text-center w-full uppercase tracking-wider leading-tight
        transition-colors duration-300
      `}>
        {name}
      </span>

      {/* Bottom Accent Line */}
      <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="w-4 h-1 rounded-full bg-indigo-500"></div>
        <div className="w-1 h-1 rounded-full bg-indigo-300"></div>
      </div>
    </div>
  );
};

export default CategoryCard;