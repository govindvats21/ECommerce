import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUserAddress, setUserCity, setUserState } from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();

  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        dispatch(setLocation({ lat: latitude, lon: longitude }));

        const res = await axios.get(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
        );
        //  const result = res?.data?.results?.[0];

        if (res) {
          dispatch(
            setUserCity(res?.data?.results?.[0].county) ||
              res?.data?.results?.[0].city
          );
          dispatch(setUserState(res?.data?.results?.[0].state));
          dispatch(setUserAddress(res?.data?.results?.[0].address_line2));
          dispatch(setAddress(res?.data?.results?.[0].address_line2));
        }
      } catch (error) {
        console.log(error);
      }
    });
  }, [dispatch, apiKey]);
}

export default useGetCity;
