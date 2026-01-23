import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverURL } from '../App';
import { setUserData } from '../redux/userSlice';

const useGetUpdateLocation = () => {
  const dispatch = useDispatch();
  const { userData, city } = useSelector((state) => state.user);

  useEffect(() => {
    const updateLocation = async () => {
      if (!userData?._id || !city) {
        return;
      }

      try {
        const result = await axios.post(
          `${serverURL}/api/user/update-location`,
          { city },
          { withCredentials: true }
        );
        
        if (result.data) {
          dispatch(setUserData(result.data));
        }
      } catch (error) {

        if (error.response?.status !== 400) {
           console.log("Location Update Error:", error.message);
        }
      }
    };

    updateLocation();
  }, [city, userData?._id, dispatch]); // Added proper dependencies
};

export default useGetUpdateLocation;