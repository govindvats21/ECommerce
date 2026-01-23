import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setAllItems, setItemsInMyCity } from '../redux/userSlice';

const useGetItemsByCity = () => {
  const dispatch = useDispatch();
  const API_URL = "https://e-commerce-backend-one-inky.vercel.app";

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await axios.get(`${API_URL}/api/item/get-all-items`, {
          withCredentials: true,
        });
        
        if (result.data) {
          dispatch(setAllItems(result.data));
          dispatch(setItemsInMyCity(result.data));
        }
      } catch (error) {
        console.log("Fetch items error:", error);
      }
    };

    fetchItems();
  }, [dispatch]);
};

export default useGetItemsByCity;
