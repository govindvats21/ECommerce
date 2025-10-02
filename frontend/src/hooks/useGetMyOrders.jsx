import axios from 'axios'
import React, { useEffect } from 'react'
import { serverURL } from '../App'
import {useDispatch, useSelector} from 'react-redux'
import { setMyOrders } from '../redux/userSlice'




function useGetMyOrders() {
const dispatch=useDispatch()
const {userData, myOrders} = useSelector((state)=>state.user)

useEffect(()=>{
 const fetchMyOrders=async ()=>{
    const result=await axios.get(`${serverURL}/api/order/my-orders`,{withCredentials:true})
  dispatch(setMyOrders(result.data))
console.log(result.data);

  
 }
fetchMyOrders() 
},[userData])
}

export default useGetMyOrders
