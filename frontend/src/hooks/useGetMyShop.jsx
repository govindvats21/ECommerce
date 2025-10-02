import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverURL } from '../App';
import { setMyShopData } from '../redux/ownerSlice';

const useGetMyShop = () => {
  const dispatch = useDispatch();
const {userData} = useSelector((state)=>state.user)
  

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/shop/get-my-shop`, {
          withCredentials: true,
        });
        dispatch(setMyShopData(result.data));
  
        
      } catch (error) {
        console.log(error);
      }
    };

    fetchShop();
  }, [userData]);
};

export default useGetMyShop;
