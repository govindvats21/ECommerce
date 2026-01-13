import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { serverURL } from "../App";
import { setAllItems } from "../redux/userSlice"; 

import eBaner from "../assets/bn.avif";
import Nav from "./Nav";
import { categories } from "../category"; 
import CategoryCard from "./CategoryCard";
import ItemCard from "./ItemCard";
import Footer from "./Footer";

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { allItems, searchItems } = useSelector((state) => state.user);
  const [ecommerceItems, setEcommerceItems] = useState({});

  // Shopping Categories List
 const ecommerceList = [
  "Mobiles", "Laptops", 
  "Speakers", "Watches", "Gaming", "Fashion", "Tablets", 
  "Cameras", "Smart Home",  "Accessories", "Clothes",
  "Appliances", "Furniture", "Backpack",   "Smart LED TV","Covers",  
    "Footwear",  
 ,
];

  const fetchAllItems = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/item/get-all-items`);
      dispatch(setAllItems(res.data)); 
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAllItems();
  }, []);

  useEffect(() => {
    if (allItems && allItems.length > 0) {
      const eItems = {};

      allItems.forEach((item) => {
        const cat = item.category;
        const brand = item.brand || "Others";

        // Check if category matches our list
        const isEcommerce = ecommerceList.some(e => e.toLowerCase() === cat?.toLowerCase());

        if (isEcommerce) {
          // Logic: Mobile phones are grouped by Brand, others by Category
          let sectionName = cat;
          if (cat === "Mobiles") {
            sectionName = `${brand} Phones`;
          }

          if (!eItems[sectionName]) eItems[sectionName] = [];
          eItems[sectionName].push(item);
        }
      });
      setEcommerceItems(eItems);
    }
  }, [allItems]); 

  return (
    <>
      <div className="w-screen min-h-screen bg-[#fcfcfc] flex flex-col items-center overflow-x-hidden">
        <Nav />

        {/* 1. Search Results Section */}
        {searchItems && searchItems.length > 0 && (
          <div className="w-full max-w-7xl p-8 bg-white shadow-2xl shadow-blue-100/50 rounded-[2.5rem] mt-24 border border-blue-50 mx-4 z-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-yellow-400 rounded-xl text-lg">🔍</span> 
                  Found for you
                </h1>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full uppercase tracking-widest">
                    {searchItems.length} Items
                </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchItems.map((item) => (
                <ItemCard data={item} key={item._id} />
              ))}
            </div>
          </div>
        )}

        {/* 2. Professional Hero Banner */}
        <div className="relative w-full overflow-hidden">
          <img
            src={eBaner}
            alt="Shopping Banner"
            className="w-full h-[250px] md:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex items-center px-12">
             <div className="text-white space-y-4 hidden md:block">
                <span className="bg-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.3em]">New Season</span>
                <h1 className="text-6xl font-black leading-none">UPGRADE YOUR<br/>STYLE</h1>
                <p className="text-gray-300 font-medium">Get up to 40% off on latest electronics & fashion.</p>
             </div>
          </div>
        </div>

 <div className="w-full max-w-7xl mt-16 px-4 mx-auto">
  {/* Header Section */}
  <div className="flex items-center justify-between mb-10 px-2">
    <div className="flex flex-col">
      <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">
        Top Categories
      </h2>
      <p className="text-sm text-gray-400 font-medium">Explore our wide range of premium products</p>
    </div>
    <div className="h-[1px] flex-grow mx-8 bg-gray-200 hidden lg:block"></div>
    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">
      View All
    </button>
  </div>
  
<div className="w-full bg-white pt-6 pb-2 border-b border-gray-50">
  <div className="max-w-[1600px] mx-auto">
    
    <div className="flex items-center justify-between px-5 mb-5">
      <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Shop by Category</h2>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
      </div>
    </div>

    <div className="flex items-start gap-4 overflow-x-auto no-scrollbar px-5 pb-4 scroll-smooth">
      {categories?.map((cate, index) => (
  <div 
    key={index} 
    onClick={() => navigate(`/category/${cate?.category}`)} // Ye click handler add kiya
    className="flex-shrink-0 group cursor-pointer"
  >
    <div className="flex flex-col items-center gap-2.5 w-[75px] md:w-[100px]">
      
      {/* Round Icon Style */}
      <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center p-3 ring-1 ring-gray-100 group-active:scale-95 transition-all duration-300 overflow-hidden shadow-sm">
        <img 
          src={cate?.image} 
          alt={cate?.category} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <span className="text-[12px] md:text-[13px] font-semibold text-gray-700 text-center leading-tight">
        {cate?.category}
      </span>
    </div>
  </div>
))}
    </div>

  </div>
</div>



  
</div>

        {/* 4. Dynamic Product Sections */}
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-10 p-4 mt-12 mb-24">
          {Object.keys(ecommerceItems).length > 0 ? (
            Object.keys(ecommerceItems).map((section, index) => (
              <div key={index} className="flex flex-col gap-6">
                <div className="flex items-end justify-between px-2 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {section}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Curated Collection</p>
                  </div>
                  <button onClick={() => navigate('/all-products')} className="group flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-black transition-all">
                    Explore All <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
                
                <div className="flex overflow-x-auto pb-8 pt-2 no-scrollbar snap-x scroll-smooth">
                  {ecommerceItems[section].map((item) => (
                    <div key={item._id} className="flex-shrink-0 w-[220px] md:w-[230px] snap-start">
                      <ItemCard data={item} />
                    </div>
                  ))}
                  {/* Empty Spacer for scroll feel */}
                  <div className="flex-shrink-0 w-3"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-32 flex flex-col items-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🛍️</div>
              </div>
              <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">
                Loading Marketplace...
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;