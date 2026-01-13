// MyOrders.jsx
import React, { useEffect } from "react";
import { MdKeyboardBackspace } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { setMyOrders, updateRealtimeOrderStatus } from "../redux/userSlice";
import Footer from "../components/Footer";

const MyOrders = () => {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Listen for new order via socket
  useEffect(() => {
    socket?.on("newOrder", (data) => {
      if (data?.shopOrders?.owner._id == userData._id) {
        dispatch(setMyOrders([data, ...myOrders]));
      }
    })

socket?.on('update-status',({orderId,shopId,status,userId})=>{{
  if(userId == userData._id){
    dispatch(updateRealtimeOrderStatus({orderId,shopId,status}))
  }
}})

// console.log(myOrders)

    return () => {
      socket?.off("newOrder")
      socket?.off("update-status")
    };
  }, [socket, myOrders, dispatch, userData]);

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 flex justify-center px-4 py-6">
      <div className="w-full max-w-[900px]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {(!myOrders || myOrders.length === 0) && (
            <p className="text-center text-gray-500 text-lg mt-12">
              No orders yet
            </p>
          )}

          {myOrders?.map((order, index) =>
            userData.role === "user" ? (
              <UserOrderCard data={order} key={index} />
            ) : userData.role === "owner" ? (
              <OwnerOrderCard data={order} key={index} />
            ) : null
          )}
        </div>
      </div>
    </div>
      <Footer />
    
    </>
  
  );
};

export default MyOrders;
