import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

// Layout
import Nav from "./components/Nav";

// Pages
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import Signup from "./pages/Signup";
import Signin from "./pages/Sigin";
import ForgotPassword from "./pages/ForgotPassword";
import CreateAndEditShop from "./pages/CreateAndEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/orderPlaced";
import MyOrders from "./pages/MyOrders";
import TrackOrderPage from "./pages/TrackOrderPage";
import SingleItem from "./pages/SingleItem";
import AllProducts from "./pages/AllProducts";
import Shop from "./pages/Shop";

// Hooks
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetMyShop from "./hooks/useGetMyShop";
import useGetShopsByCity from "./hooks/useGetShopsByCity";
import useGetItemsByCity from "./hooks/useGetItemByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useGetupdateLocation from "./hooks/useGetUpdateLocation";

// --- GLOBAL CONFIGURATION ---
axios.defaults.withCredentials = true;

// 🔥 Filhal Localhost URL
export const serverURL = import.meta.env.VITE_BACKEND_URL;

// AXIOS INTERCEPTOR: Token management
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const App = () => {
  const { userData } = useSelector((state) => state.user);

  // Saare data fetching hooks
  useGetCurrentUser(); 
  useGetCity();        
  useGetMyShop();      
  useGetShopsByCity(); 
  useGetItemsByCity(); 
  useGetMyOrders();    
  useGetupdateLocation(); 

  // Socket logic poori tarah se remove kar di gayi hai
  // Isse localhost aur deployment dono par koi connection error nahi aayega

  return (
    <>
      <Nav />
      <div className="pt-[75px]">
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/all-products" element={<AllProducts />} />
          <Route path="/single-item/:itemId" element={<SingleItem />} />
          <Route path="/shop/:shopId" element={<Shop />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Auth Routes */}
          <Route path="/signup" element={!userData ? <Signup /> : <Navigate to="/" />} />
          <Route path="/signin" element={!userData ? <Signin /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/create-edit-shop" element={userData ? <CreateAndEditShop /> : <Navigate to="/signin" />} />
          <Route path="/add-item" element={userData ? <AddItem /> : <Navigate to="/signin" />} />
          <Route path="/edit-item/:id" element={userData ? <EditItem /> : <Navigate to="/signin" />} />
          <Route path="/checkout" element={userData ? <CheckOut /> : <Navigate to="/signin" />} />
          <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/signin" />} />
          <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to="/signin" />} />
          <Route path="/track-order/:orderId" element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
};

export default App;