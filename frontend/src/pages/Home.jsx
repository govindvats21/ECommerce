import React from 'react'
import { useSelector } from 'react-redux';
import OwnerDashboard from '../components/OwnerDashboard';
import DeliveryBoyDashboard from "../components/DeliveryBoyDashboard";
import UserDashboard from '../components/UserDashboard';

const Home = () => {
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="w-full min-h-screen">
      {/* Agar login nahi hai (Guest) YA role user hai, toh Dashboard dikhao */}
      {(!userData || userData.role === "user") ? (
        <UserDashboard />
      ) : userData.role === "owner" ? (
        <OwnerDashboard />
      ) : userData.role === "deliveryBoy" ? (
        <DeliveryBoyDashboard />
      ) : (
        <UserDashboard /> // Fallback: Kuch nahi mile toh ye dikhao
      )}
    </div>
  )
}

export default Home;