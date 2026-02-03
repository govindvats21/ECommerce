import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaLocationDot, FaPlus, FaTruckFast } from "react-icons/fa6"; // Added Delivery Icon
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { TbReceipt2 } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { setSearchItems, setUserData, logoutUser } from "../redux/userSlice";
import axios from "axios";
import { serverURL } from "../App";

const Nav = () => {
  const { userData, userCity, cartItems } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showInfo, setShowInfo] = useState(false);
  const [query, setQuery] = useState("");
const location = useLocation();

// Jin pages par search hide karni hai, unhe yahan likh do
const hideSearchPages = ["/all-products", "/cart", "/checkout", "/my-orders", "/track-order/:orderId"];
const shouldHideSearch = hideSearchPages.includes(location.pathname);
  const themeText = "text-blue-600";
  const themeBg = "bg-blue-600";
  const themeBorder = "border-blue-200";

  const handleLogout = async () => {
    try {
      await axios.get(`${serverURL}/api/auth/signOut`, {
        withCredentials: true,
      });

      dispatch(logoutUser());

      localStorage.removeItem("isLoggedIn");
      setShowInfo(false);
      navigate("/");
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };
  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `${serverURL}/api/item/search-items?query=${query}`,
        { withCredentials: true },
      );
      dispatch(setSearchItems(res.data));
    } catch (error) {
      console.log("Search error:", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 0) {
        handleSearch();
      } else {
        dispatch(setSearchItems(null));
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="w-full fixed top-0 left-0 z-[9999] bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto h-[75px] flex items-center justify-between px-4 md:px-8">
        {/* Logo Section */}
        <div
          className="flex flex-col cursor-pointer"
          onClick={() => navigate("/")}
        >
          <h1
            className={`text-xl md:text-2xl font-black tracking-tighter ${themeText}`}
          >
            Vats<span className="text-gray-800 font-bold">Store</span>
          </h1>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">
            Ecommerce Mall
          </span>
        </div>

        {/* Search Bar - ONLY for User or Guests */}
        {(!userData || userData?.role === "user") && !shouldHideSearch && (
          <div className="hidden md:flex items-center flex-1 max-w-[500px] mx-8">
            <div
              className={`flex items-center w-full bg-gray-50 border-2 border-transparent focus-within:border-blue-600 focus-within:bg-white rounded-2xl h-[45px] transition-all px-4 gap-3`}
            >
              <div className="flex items-center border-r pr-3 border-gray-200 min-w-[120px]">
                <FaLocationDot className={themeText} size={14} />
                <span className="text-gray-600 truncate text-xs font-bold ml-1">
                  {userCity || "All India"}
                </span>
              </div>
              <IoIosSearch className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Products..."
                className="w-full outline-none bg-transparent text-gray-700 text-sm font-medium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* USER & GUEST LINKS - (All Products yahan se remove kar diya gaya hai for non-users) */}
          {(!userData || userData?.role === "user") && (
            <>
              <nav className="hidden lg:flex items-center gap-6 mr-2">
                <button
                  onClick={() => navigate("/home")}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition"
                >
                  Home
                </button>
                {/* Only Users can see All Products */}
                <button
                  onClick={() => navigate("/all-products")}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition"
                >
                  Shop All
                </button>
              </nav>
              <div
                className="relative cursor-pointer group"
                onClick={() => navigate("/cart")}
              >
                <div
                  className={`p-2 rounded-xl group-hover:bg-gray-50 transition-colors`}
                >
                  <FiShoppingCart className={`w-6 h-6 ${themeText}`} />
                </div>
                {cartItems?.length > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] font-black text-white ${themeBg} rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white`}
                  >
                    {cartItems.length}
                  </span>
                )}
              </div>
            </>
          )}

          {/* OWNER ACTIONS - (No All Products) */}
          {userData?.role === "owner" && (
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${themeBg} text-white text-xs font-bold shadow-md hover:opacity-90 transition-all`}
                onClick={() => navigate("/add-item")}
              >
                <FaPlus size={14} />{" "}
                <span className="hidden sm:block">Add Item</span>
              </button>
              <button
                className={`p-2 rounded-xl border-2 ${themeBorder} ${themeText}`}
                onClick={() => navigate("/my-orders")}
              >
                <TbReceipt2 size={20} />
              </button>
            </div>
          )}

          {/* DELIVERY BOY ACTIONS - (No All Products) */}
          {userData?.role === "delivery" && (
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-md hover:opacity-90 transition-all`}
                onClick={() => navigate("/delivery-dashboard")}
              >
                <FaTruckFast size={16} />{" "}
                <span className="hidden sm:block">Deliveries</span>
              </button>
            </div>
          )}

          {/* User Profile / Login */}
          <div className="relative">
            {!userData ? (
              <button
                onClick={() => navigate("/signin")}
                className={`text-xs font-black uppercase tracking-widest ${themeBg} text-white px-5 py-2.5 rounded-xl shadow-lg hover:opacity-90 transition active:scale-95`}
              >
                Login
              </button>
            ) : (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer shadow-sm border border-gray-100 bg-gray-50 hover:bg-white transition-all`}
                onClick={() => setShowInfo(!showInfo)}
              >
                <span className={`font-black text-sm ${themeText}`}>
                  {userData?.fullName?.[0]?.toUpperCase()}
                </span>
              </div>
            )}

            {showInfo && userData && (
              <div className="absolute top-[55px] right-0 w-[200px] bg-white shadow-2xl rounded-2xl p-3 border border-gray-50 z-[10000] animate-in fade-in zoom-in duration-200">
                <div className="px-3 py-2 mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Signed in as
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {userData?.fullName}
                  </p>
                </div>
                <hr className="mb-2 border-gray-50" />

                {/* Profile Dropdown Logic: Hidden "All Products" for Owner/Delivery */}
                <button
                  className="w-full text-left px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  onClick={() => {
                    navigate("/");
                    setShowInfo(false);
                  }}
                >
                  Dashboard
                </button>

                {userData.role === "user" && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                    onClick={() => {
                      navigate("/all-products");
                      setShowInfo(false);
                    }}
                  >
                    Shop All
                  </button>
                )}

                <button
                  className="w-full text-left px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  onClick={() => {
                    navigate("/my-orders");
                    setShowInfo(false);
                  }}
                >
                  {userData.role === "delivery" ? "My Tasks" : "My Orders"}
                </button>

                <button
                  className="w-full text-left px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
