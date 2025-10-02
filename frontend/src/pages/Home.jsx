import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import OwnerDashboard from '../components/OwnerDashboard';
import DeliveryBoyDashboard from "../components/DeliveryBoyDashboard";
import UserDashboard from '../components/UserDashboard';

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  return (
     <div className="w-[100vw] min-h-[100vh] pt-[15px] flex flex-col items-center">
      {userData?.role == "user" && <UserDashboard  />  }
      {userData?.role == "owner" && <OwnerDashboard />}
      {userData?.role == "deliveryBoy" && <DeliveryBoyDashboard />}
    </div>
  )
}

export default Home