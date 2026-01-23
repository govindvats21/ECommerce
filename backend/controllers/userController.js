import User from "../models/userModel.js";

// GET CURRENT USER: Login kiye huye user ki profile details nikalne ke liye
export const getCurrentUser = async (req,res) => {
    try {
        // Middleware se user ki ID li ja rahi hai
        const userId = req.userId;

        // ID ke basis par database mein user ko dhunda ja raha hai
        const user = await User.findById(userId);

        // Agar user database mein nahi milta
        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }

        // User ka poora data response mein bhej rahe hain
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `get current user error ${error}` });
    }
}

// UPDATE USER LOCATION: Rider ya User ki live location save karne ke liye
export const updateUserLocation = async (req, res) => {
  try {
    // Frontend se Latitude aur Longitude liye ja rahe hain
    const { lat, lon } = req.body;

    // MongoDB ke GeoJSON format mein location update ho rahi hai
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          // Yaad rakhein: GeoJSON mein pehle Longitude aata hai, phir Latitude
          coordinates: [lon, lat], 
        },
      },
      { new: true } // Taaki update hone ke baad naya data return ho
    );

    // Agar update karte waqt user ID nahi milti
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    return res.status(200).json({ message: "location updated" });
  } catch (error) {
    return res.status(500).json({ message: `get current user error ${error}` });
  }
};