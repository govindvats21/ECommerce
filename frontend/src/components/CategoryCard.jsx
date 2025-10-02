import React from "react";

const CategoryCard = ({ name, image }) => {
  return (
    <div
      className="min-w-[120px] flex flex-col items-center gap-2 p-2 rounded-2xl bg-green-50 shadow-md hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1 hover:scale-105"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center ring-2 ring-green-300 hover:ring-green-500 transition">
        <img
          src={image || "https://via.placeholder.com/80"}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-sm md:text-base text-green-800 font-semibold w-full text-center truncate">
        {name}
      </span>
    </div>
  );
};

export default CategoryCard;
