import axios from "axios";
import React, { useEffect } from "react";
import { serverURL } from "../App";
import { useDispatch, useSelector } from "react-redux";

function useGetupdateLocation() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    const updateLocation = async (lat, lon) => {
      const res = await axios.post(
        `${serverURL}/api/user/update-location`,
        {
          lat,
          lon,
        },
        {
          withCredentials: true,
        }
      );
    };

    navigator.geolocation.watchPosition((pos) => {
      updateLocation(pos.coords.latitude, pos.coords.longitude);
    });
  }, [userData]);
}

export default useGetupdateLocation;
