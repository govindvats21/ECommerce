import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserAddress, setUserCity, setUserState } from "../redux/userSlice";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch();

  useEffect(() => {
    // --- LOCATION AUTO-DETECTION REMOVED ---
    // Ab hum GPS coordinates nahi maangenge. 
    // Seedha default values set karenge taaki app bina popup ke chale.

    const setDefaultLocation = () => {
      try {
        // Aap yahan apni marzi ki default city/state rakh sakte hain
        dispatch(setUserCity("All Cities"));
        dispatch(setUserState("Available"));
        dispatch(setUserAddress("Select Delivery Address"));
        
        // Map slice ke liye default coordinates (optional)
        dispatch(setLocation({ lat: 0, lon: 0 }));
        dispatch(setAddress("Select Delivery Address"));
        
      } catch (error) {
        console.log("Error setting default city:", error);
      }
    };

    setDefaultLocation();
  }, [dispatch]);
}

export default useGetCity;