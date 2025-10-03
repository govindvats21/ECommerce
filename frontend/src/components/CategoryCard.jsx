import React from "react";

const CategoryCard = ({ name, image }) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-3 rounded-lg bg-green-50 shadow-md hover:shadow-lg cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-105"
    >
      {/* Image Container */}
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center ring-2 ring-green-300 hover:ring-green-500 transition-all">
        <img
          src={image || "https://via.placeholder.com/80"}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Category Name */}
      <span className="text-sm md:text-base text-green-800 font-medium text-center truncate w-full px-2">
        {name}
      </span>
    </div>
  );
};

export default CategoryCard;
