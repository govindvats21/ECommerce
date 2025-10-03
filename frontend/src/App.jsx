import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Signin from "./pages/Sigin";
import { useDispatch, useSelector } from "react-redux";
import ForgotPassword from "./pages/ForgotPassword";
import useGetCity from "./hooks/useGetCity";
import useGetCurrentUser from "./hooks/useGetCurrentUser";
import CreateAndEditShop from "./pages/CreateAndEditShop";
import useGetMyShop from "./hooks/useGetMyShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import useGetShopsByCity from "./hooks/useGetShopsByCity";
import useGetItemsByCity from "./hooks/useGetItemByCity";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlaced from "./pages/orderPlaced";
import MyOrders from "./pages/MyOrders";
import useGetMyOrders from "./hooks/useGetMyOrders";
import useGetupdateLocation from "./hooks/useGetUpdateLocation";
import TrackOrderPage from "./pages/TrackOrderPage";
import SingleItem from "./pages/SingleItem";
import AllProducts from "./pages/AllProducts";
import { useEffect } from "react";
import {io} from 'socket.io-client'
import { setSocket } from "./redux/userSlice";
import Shop from "./pages/Shop";
export const serverURL = "https://grocery-4ltf.onrender.com"


const App = () => {
  const { userData } = useSelector((state) => state.user);
const dispatch = useDispatch()

  useGetCity();
  useGetCurrentUser()
  useGetMyShop()
  useGetShopsByCity()
  useGetItemsByCity()
  useGetMyOrders()
  useGetupdateLocation()





useEffect(()=>{
const socketInstance = io(serverURL,{withCredentials:true})
dispatch(setSocket(socketInstance))
socketInstance.on('connect',()=>{
if(userData?._id){
  socketInstance.emit('identify',{userId:userData._id})
}
  
})

return ()=>{
  socketInstance.disconnect()
}
},[userData?._id])

  return (
    <Routes>
      <Route
        path="/signup"
        element={!userData ? <Signup /> : <Navigate to={"/"} />}
      />
      <Route
        path="/signin"
        element={!userData ? <Signin /> : <Navigate to={"/"} />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />}
      />
      <Route path="/" element={userData?<Home />: <Navigate to={"/signin"} />} />
    <Route path="/create-edit-shop" element={userData?<CreateAndEditShop />: <Navigate to={"/signin"} />} />
    <Route path="/add-item" element={userData?<AddItem />: <Navigate to={"/signin"} />} />
     <Route path="/edit-item/:id" element={userData?<EditItem/>: <Navigate to={"/signin"} />} />
     <Route path="/single-item/:itemId" element={userData?<SingleItem/>: <Navigate to={"/signin"} />} />
     <Route path="/shop/:shopId" element={userData?<Shop/>: <Navigate to={"/signin"} />} />


       <Route path="/cart" element={userData?<CartPage />: <Navigate to={"/signin"} />} />
     <Route path='/checkout' element={userData?<CheckOut />:<Navigate to={"/signin"}/>}/>
       <Route path='/order-placed' element={userData?<OrderPlaced />:<Navigate to={"/signin"}/>}/>
<Route path='/my-orders' element={userData?<MyOrders />:<Navigate to={"/signin"}/>}/>
<Route path='/track-order/:orderId' element={userData?<TrackOrderPage />:<Navigate to={"/signin"}/>}/>
<Route path='/all-products' element={userData?<AllProducts />:<Navigate to={"/signin"}/>}/>




    </Routes>
  );
};

export default App;
