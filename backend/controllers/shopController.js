import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudnary.js";

// CREATE AND EDIT SHOP: Shop banane ya update karne ka main function
export const createAndEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;

    // Agar request mein file (image) hai, toh use Cloudinary par upload karo
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const owner = req.userId; // Middleware se aayi user ID
    
    // Check karo ki kya is owner ki shop pehle se database mein hai
    let shop = await Shop.findOne({ owner });

    if (!shop) {
      // AGAR SHOP NAHI HAI: Toh nayi shop create karo
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        owner,
        image,
      });
    } else {
      // AGAR SHOP PEHLE SE HAI: Toh use update karo
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          owner,
          // Agar nayi image upload hui hai toh nayi use karo, warna purani rehne do
          image: image || shop.image, 
        },
        { new: true }, // Update ke baad naya data return karega
      );
    }

    // Shop data ke saath Owner aur Items ki details bhi fetch karo (Populate)
    await shop.populate("owner items");

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Create Shop error ${error}` });
  }
};

// GET MY SHOP: Login user (Shop owner) ki apni shop fetch karne ke liye
export const getMyShop = async (req, res) => {
  try {
    // Owner ID se shop dhundo aur password nikaal kar baaki data populate karo
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "owner items",
      select: "-password", // Security ke liye password hide kar diya
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: ` error ${error}` });
  }
};

// GET ALL SHOPS: Saari shops dikhane ke liye (Customer side ke liye)
export const getAllShops = async (req, res) => {
  try {
    // Saari shops fetch karo aur unke items ko bhi sath mein populate karo
    const shops = await Shop.find({}).populate("items");

    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `get all shops error ${error}` });
  }
};