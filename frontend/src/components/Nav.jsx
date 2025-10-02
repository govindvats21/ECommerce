import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { TbReceipt2 } from "react-icons/tb";
import { useDispatch, useSelector } from 'react-redux';
import { setSearchItems, setUserData } from '../redux/userSlice';
import axios from 'axios';
import { serverURL } from '../App';

const Nav = () => {
const {userData,userCity,cartItems} = useSelector((state)=>state.user)

    const navigate = useNavigate()
    const dispatch = useDispatch()
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState(false);


const handleLogout = async () => {
    try {
      await axios.get(`${serverURL}/api/auth/signOut`, { withCredentials: true });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };
  
  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `${serverURL}/api/item/search-items?query=${query}&city=${userCity}`,
        {
          withCredentials: true,
        })
        console.log(res.data)
        dispatch(setSearchItems(res.data))
    } catch (error) {
      console.log(error);
      
    }
  }

useEffect(()=>{
  if(query){
handleSearch()
  } else{
        dispatch(setSearchItems(null))

  }
},[query])


  return (
       <div className="w-full fixed top-0 left-0 z-[9999] bg-white shadow-sm border-b border-gray-200">

<div className="max-w-7xl mx-auto h-[70px] flex items-center justify-between px-4 md:px-8">

 {/* Logo */}
        <h1
          className="text-2xl font-bold text-green-700 cursor-pointer hover:text-green-800 transition"
          onClick={() => navigate("/")}
        >
          Vingo
        </h1>

 {/* Search Bar */}
        {userData?.role === "user" && (
          <>
            {/* Mobile Search */}
            {showSearch && (
              <div className="md:hidden fixed top-[75px] left-[5%] w-[90%] h-[45px] bg-white shadow-md rounded-lg flex items-center z-[9999]">
                <div className="flex items-center px-3 border-r border-gray-200 min-w-[120px]">
                  <FaLocationDot className="text-green-600 mr-2" />
                                    <span className="text-gray-600 truncate text-sm">{userCity}</span>

                </div>
                <div className="flex items-center w-full px-3 gap-2">
                  <IoIosSearch className="text-green-600" size={18} />
                  <input
                    type="text"
                    placeholder="Search groceries..."
                    className="w-full outline-none text-gray-700 placeholder:text-gray-400 text-sm"
                      onChange={(e) => setQuery(e.target.value)} 

                  />
                </div>
              </div>
            )}

            {/* Desktop Search */}
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg h-[45px] w-full max-w-[500px] mx-4">
              <div className="flex items-center px-3 border-r border-gray-200 min-w-[120px]">
                <FaLocationDot className="text-green-600 mr-2" />
                <span className="text-gray-600 truncate text-sm">{userCity}</span>
              </div>
              <div className="flex items-center w-full px-3 gap-2">
                <IoIosSearch className="text-green-600" size={18} />
                <input
                  type="text"
                  placeholder="Search groceries..."
                  className="w-full outline-none bg-transparent text-gray-700 placeholder:text-gray-400 text-sm"
                      onChange={(e) => setQuery(e.target.value)} 

                />
              </div>
            </div>
          </>
        )}

    <div className="flex items-center gap-4">
          {userData?.role === "user" && (
            <>
              {/* Mobile Search Toggle */}
              {showSearch ? (
                <RxCross2
                  size={22}
                  className="text-green-600 md:hidden cursor-pointer"
                  onClick={() => setShowSearch(false)}
                />
              ) : (
                <IoIosSearch
                  size={22}
                  className="text-green-600 md:hidden cursor-pointer"
                  onClick={() => setShowSearch(true)}
                />
              )}

                 {/* Home */}
              <button
                className="hidden md:block text-green-700 bg-green-50 border border-green-200 rounded-md text-sm font-medium px-3 py-1 hover:bg-green-100 transition"
                onClick={() => navigate("/")}
              >
                Home  
                </button>

                  {/* All items */}
              <button
                className="hidden md:block text-green-700 bg-green-50 border border-green-200 rounded-md text-sm font-medium px-3 py-1 hover:bg-green-100 transition"
                onClick={() => navigate("/all-products")}
              >
                All Products
              </button>

                 {/* My Orders */}
              <button
                className="hidden md:block text-green-700 bg-green-50 border border-green-200 rounded-md text-sm font-medium px-3 py-1 hover:bg-green-100 transition"
                onClick={() => navigate("/my-orders")}
              >
                My Orders
              </button>

              {/* Cart */}
              <div
                className="relative cursor-pointer"
                onClick={() => navigate("/cart")}
              >
                <FiShoppingCart className="w-6 h-6 text-green-600" />
                
                  <span className="absolute -top-3 -right-2 text-xs font-bold text-white bg-green-600 rounded-full px-[5px] py-[1px] shadow">
                    {cartItems?.length}
                    
                  </span>
                
              </div>

           
            </>
          )}


 {userData?.role === "owner" && (
            <>
              <button
                className="hidden md:flex items-center gap-2 p-2 ml-5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition text-sm"
                onClick={() => navigate("/add-item")}
              >
                <FaPlus size={16} />
                <span>Add Item</span>
              </button>

              <button
                className="flex items-center gap-2 relative text-green-700 bg-green-50 border border-green-200 rounded-md text-sm font-medium px-3 py-1 hover:bg-green-100 transition"
                onClick={() => navigate("/my-orders")}
              >
                <TbReceipt2 size={18} />
                <span className="hidden md:block">My Orders</span>
                <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-green-600 rounded-full px-[5px] py-[1px] shadow">
                  0
                </span>
              </button>
            </>
          )}


 {/* Avatar */}
          <div
            className="bg-green-600 text-white rounded-full w-9 h-9 flex items-center justify-center font-semibold text-sm cursor-pointer shadow hover:bg-green-700 transition"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            {userData?.fullName?.[0]?.toUpperCase()}
          </div>

          {/* Dropdown */}
          {showInfo && (
            <div className="absolute top-[80px] right-4 md:right-[10%] lg:right-[15%] w-[200px] bg-white shadow-lg border border-gray-200 rounded-lg p-4 flex flex-col gap-3 z-[9999]">
              <p className="text-sm font-semibold text-gray-800">
                {userData?.fullName}
              </p>

              {userData?.role === "user" && (
                <>
  <button
                  className="md:hidden text-green-700 font-medium hover:underline text-left cursor-pointer text-sm"
                  onClick={() => navigate("/")}
                >
                  Home
                </button>

                <button
                  className="md:hidden text-green-700 font-medium hover:underline text-left cursor-pointer text-sm"
                  onClick={() => navigate("/my-orders")}
                >
                  My Orders
                </button>


              <button
                className="md:hidden text-green-700 font-medium hover:underline text-left cursor-pointer text-sm"
                onClick={() => navigate("/all-products")}
              >
                All Products
              </button>
              </>

              )}


              <button
                className="text-green-700 font-medium hover:underline text-left cursor-pointer text-sm"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          )}

          </div>
        </div>

    </div>
  )
}

export default Nav