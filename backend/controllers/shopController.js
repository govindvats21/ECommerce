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
      await Shop.create({
        name,
        city,
        state,
        address,
        owner,
        image,
      });
    } else {
      await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          owner,
          image,
        },
        { new: true }
      );
    }

    await shop.populate("owner items")

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
      return null;
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: ` error ${error}` });
  }
};

export const getShopsByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    // Case-insensitive search

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    });
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: `get shop by city error ${error}` });
  }
};
