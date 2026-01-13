import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { serverURL } from '../App';
import { setShopsInMyCity } from '../redux/userSlice';

const useGetShopsByCity = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        // City hata kar get-all-shops kar diya
        const result = await axios.get(`${serverURL}/api/shop/get-all-shops`, {
          withCredentials: true,
        });
        dispatch(setShopsInMyCity(result.data));
      } catch (error) {
        console.log("Fetch shops error:", error);
      }
    };

    fetchShops();
  }, [dispatch]); // Ab ye city badalne ka intezar nahi karega
};

export default useGetShopsByCity;