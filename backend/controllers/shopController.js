import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudnary.js";

export const createAndEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }
    const owner = req.userId;
    let shop = await Shop.findOne({ owner });

    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        owner,
        image,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          owner,
          image: image || shop.image, // agar nayi image nahi hai toh purani rehne de
        },
        { new: true }
      );
    }

    await shop.populate("owner items");

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Create Shop error ${error}` });
  }
};

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "owner items",
      select: "-password",
    });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: ` error ${error}` });
  }
};

// --- LOCATION LOGIC REMOVED: Get All Shops instead of by city ---
export const getAllShops = async (req, res) => {
  try {
    // Ab koi city parameter nahi chahiye, seedha saari shops find karein
    const shops = await Shop.find({}).populate("items");
    
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `get all shops error ${error}` });
  }
};