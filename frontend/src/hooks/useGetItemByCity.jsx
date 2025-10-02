import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverURL } from '../App';
import { setItemsInMyCity } from '../redux/userSlice';

const useGetItemsByCity = () => {
  const dispatch = useDispatch();
const {userCity} = useSelector((state)=>state.user)
  

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/item/get-items-by-city/${userCity}`, {
          withCredentials: true,
        });
        dispatch(setItemsInMyCity(result.data));
        
      } catch (error) {
        console.log(error);
      }
    };

    fetchItems();
  }, [userCity]);
};

export default useGetItemsByCity;
