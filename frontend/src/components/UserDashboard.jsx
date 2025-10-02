import mainBaner from "../assets/main_banner_bg.png";
import Nav from "./Nav";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { useSelector } from "react-redux";
import ShopCard from "./ShopCard";
import ItemCard from "./ItemCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { userCity, shopsInMyCity, itemsInMyCity, searchItems } = useSelector(
    (state) => state.user
  );

  const [updatedItemsList, setupdatedItemsList] = useState([]);

  useEffect(() => {
    setupdatedItemsList(itemsInMyCity);
  }, [itemsInMyCity]);

  // 🟢 Category-wise grouping using forEach
  const itemsByCategory = {};
  updatedItemsList.forEach((item) => {
    const cat = item.category || "Others";
    if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
    itemsByCategory[cat].push(item);
  });

  return (
    <>
    <div className="w-screen min-h-screen bg-white flex flex-col gap-5 items-center overflow-y-auto">
      <Nav />

      {searchItems && searchItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col gap-6 items-start p-6 bg-white shadow-lg rounded-2xl mt-4 border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 border-b pb-2 w-full">
            🔍 Search Results
          </h1>
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {searchItems.map((item) => (
              <ItemCard data={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

     {/* Banner */}
<div className="relative w-full">
  <img
    src={mainBaner}
    alt="Banner"
    className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
  />
  <button className="absolute bottom-4 sm:bottom-8 left-4 sm:left-10 font-bold text-sm sm:text-lg text-white bg-green-500 px-4 py-2 rounded shadow-md hover:bg-green-600 transition">
    Shop now
  </button>
</div>

      {/* Categories */}
      <div className="w-full grid grid-cols-3 md:flex md:flex-wrap items-center justify-center gap-5 md:px-40 px-2">
        {categories?.map((cate, index) => (
          <CategoryCard
            name={cate?.category}
            image={cate?.image}
            key={index}
          />
        ))}
      </div>

      {/* Shops */}
      <div className="w-full max-w-6xl mx-auto mt-7 flex flex-col gap-5 p-[10px]">
        <h1 className="text-gray-800 text-2xl">Best Shop in {userCity}</h1>
        <div className="w-full grid grid-cols-3 md:flex md:flex-wrap items-center justify-center overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#ff4d2d] scrollbar-track-transparent scroll-smooth">
          {shopsInMyCity?.map((shop, index) => (
            <ShopCard
              key={shop._id || index}
              name={shop?.name}
              image={shop?.image}
              id={shop?._id}
              onClick={() => navigate(`/shop/${shop._id}`)}
            />
          ))}
        </div>
      </div>

     {/* Items Category-wise */}
<div className="w-full max-w-6xl mx-auto flex flex-col gap-10 p-[10px] ">
  {Object.keys(itemsByCategory).map((category, index) => (
    <div key={index} className="flex flex-col gap-4">
      <h2 className="text-gray-800 text-2xl font-semibold">{category}</h2>
      
      {/* Horizontal Scroll */}
      <div className="flex gap-5 md:gap-20 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {itemsByCategory[category].map((item, idx) => (
          <div key={idx} className=" flex-shrink-0  w-[190px]  ">
            <ItemCard data={item} />
          </div>
        ))}
      </div>
    </div>
  ))}
</div>



    </div>
<Footer />
    
    
  </>
  );
};

export default UserDashboard;
