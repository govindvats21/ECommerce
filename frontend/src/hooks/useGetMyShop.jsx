import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverURL } from '../App';
import { setMyShopData } from '../redux/ownerSlice';

const useGetMyShop = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchShop = async () => {
      // ✨ Sabse zaroori check: Agar user login nahi hai, toh request mat bhejo
      if (!userData || !userData._id) {
        return; 
      }

      try {
        const result = await axios.get(`${serverURL}/api/shop/get-my-shop`, {
          withCredentials: true,
        });
        dispatch(setMyShopData(result.data));
      } catch (error) {
        // 400 error ab yahan handle hoga agar session expire ho gaya ho
        console.log("Shop fetch error:", error.response?.status);
      }
    };

    fetchShop();
  }, [userData, dispatch]); // dependency array mein dispatch bhi add kar diya
};

export default useGetMyShop;