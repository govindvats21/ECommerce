import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from 'socket.io-client';

// Layout
import Nav from "./components/Nav"; // Nav ko yahan import karein

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
import useGetCity from "./hooks/useGetCity";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetMyShop from "./hooks/useGetMyShop";
import useGetShopsByCity from "./hooks/useGetShopsByCity";
import useGetItemsByCity from "./hooks/useGetItemByCity";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useGetupdateLocation from "./hooks/useGetUpdateLocation";

// Redux
import { setSocket } from "./redux/userSlice";

// Ise export rakhein par hook mein direct use karein
export const serverURL = "https://ecommerce-backend-4hiu.onrender.com";

const App = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Hooks call
  useGetCurrentUser(); 
  useGetCity();        
  useGetMyShop();      
  useGetShopsByCity(); 
  useGetItemsByCity(); 
  useGetMyOrders();    
  useGetupdateLocation(); 

  useEffect(() => {
    if (userData?._id) {
      const socketInstance = io(serverURL, { withCredentials: true });
      dispatch(setSocket(socketInstance));
      socketInstance.on('connect', () => {
        socketInstance.emit('identify', { userId: userData._id });
      });
      return () => socketInstance.disconnect();
    }
  }, [userData?._id, dispatch]);

  return (
    <>
      <Nav /> {/* Nav bar har page par dikhega */}
      <div className="pt-[75px]"> {/* Space for fixed nav */}
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/all-products" element={<AllProducts />} />
          <Route path="/single-item/:itemId" element={<SingleItem />} />
          <Route path="/shop/:shopId" element={<Shop />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/signup" element={!userData ? <Signup /> : <Navigate to="/" />} />
          <Route path="/signin" element={!userData ? <Signin /> : <Navigate to="/" />} />
          
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
