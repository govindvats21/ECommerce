import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setAllItems, setItemsInMyCity } from '../redux/userSlice';

const useGetItemsByCity = () => {
  const dispatch = useDispatch();
  // Loop todne ke liye URL direct likhein
  const API_URL = "http://localhost:8000"; 

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await axios.get(`${API_URL}/api/item/get-all-items`, {
          withCredentials: true,
        });
        
        if (result.data) {
          // Dono state update karein taaki kahin bhi data miss na ho
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