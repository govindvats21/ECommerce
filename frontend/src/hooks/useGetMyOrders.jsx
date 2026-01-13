import axios from 'axios'
import React, { useEffect } from 'react'
import { serverURL } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../redux/userSlice'

function useGetMyOrders() {
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)

  useEffect(() => {
    const fetchMyOrders = async () => {
      // ✨ Sabse zaroori logic: Agar user login nahi hai, toh API call mat karo
      if (!userData || !userData._id) {
        return; 
      }

      try {
        const result = await axios.get(`${serverURL}/api/order/my-orders`, {
          withCredentials: true
        })
        dispatch(setMyOrders(result.data))
      } catch (error) {
        console.log("Orders fetch error:", error.response?.data?.message || error.message);
      }
    }

    fetchMyOrders() 
  }, [userData, dispatch]) // Dependency array updated
}

export default useGetMyOrders