import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverURL } from '../App';
import { setShopsInMyCity } from '../redux/userSlice';

const useGetShopsByCity = () => {
  const dispatch = useDispatch();
  const { userCity } = useSelector((state) => state.user)


  useEffect(() => {
    const fetchShops = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/shop/get-shops-by/${userCity}`, {
          withCredentials: true,
        });
        dispatch(setShopsInMyCity(result.data));
        // console.log(result.data);
        
      } catch (error) {
        console.log(error);
      }
    };

    fetchShops();
  }, [userCity]);
};

export default useGetShopsByCity;
