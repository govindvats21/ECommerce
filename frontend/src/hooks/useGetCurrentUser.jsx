import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const API_URL = "https://ecommerce-backend-kx5b.onrender.com";

  useEffect(() => {
    const fetchUser = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn) return; // Silent return for guest users

      try {
        const res = await axios.get(`${API_URL}/api/user/current`, {
          withCredentials: true,
          validateStatus: (status) => status < 500
        });
        if (res.status === 200) {
          dispatch(setUserData(res.data));
        } else {
          localStorage.removeItem("isLoggedIn");
        }
      } catch (error) {
        console.log("Session expired");
      }
    };
    fetchUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
