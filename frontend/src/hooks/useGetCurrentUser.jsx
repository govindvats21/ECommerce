import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { serverURL } from '../App';

const useGetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverURL}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(result.data));
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
