
import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import Order from "../models/orderModel.js";

import uploadOnCloudinary from "../utils/cloudnary.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, discountPrice,originalPrice,description } = req.body;
    let images = {};

    // multer se max 4 images aayengi (order important hoga)
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const uploadedUrl = await uploadOnCloudinary(req.files[i].path);
        images[`image${i + 1}`] = uploadedUrl;
      }
    } else {
      console.warn("No image file sent");
    }

    const owner = req.userId;
    const shop = await Shop.findOne({ owner });

    if (!shop) {
      console.error("Shop not found for user:", owner);
      return res.status(400).json({ message: "Shop not found" });
    }

    const item = await Item.create({
      name,
      category,
      discountPrice,
      originalPrice,
      description,
      images,
      shop: shop._id,
    });

    shop.items.push(item._id);

    await shop.save();
    // await shop.populate("owner")
    await shop.populate({
      path: "items",
      options: { createdAt: -1 },
    });

    return res.status(201).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Add item error", error: error.message });
  }
};

// Get Item

export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error}` });
  }
};




// Edit Item

export const editItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, category, discountPrice, originalPrice, description } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(400).json({ message: "Item not found" });

    // merge old + new images
    const images = item.images || {}; // current images

    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        const uploadedUrl = await uploadOnCloudinary(req.files[i].path);
        images[`image${i + 1}`] = uploadedUrl; // overwrite only the uploaded slot
      }
    }

    // update basic fields
    item.name = name;
    item.category = category;
    item.discountPrice = discountPrice;
    item.originalPrice = originalPrice;
    item.description = description;

    item.images = images;
    await item.save();

    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });

    return res.status(200).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Edit item error: ${error.message}` });
  }
};

// delete item

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findByIdAndDelete(itemId);

    if (!item) {
      return res.status(400).json({ message: "item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId });

    shop.items = shop.items.filter((i) => i !== item._id);
    await shop.save();

    await shop.populate({
      path: "items",
      options: {
        sort: { createdAt: -1 },
      },
    });

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `delete item error ${error}` });
  }
};

export const getItemBycity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "City parameter is required" });
    }

    // Case-insensitive search
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    const shopIds = shops.map((shop) => shop._id);

    const items = await Item.find({
      shop: { $in: shopIds },
    });

    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: `get item by city error ${error}` });
  }
};


export const rateItem = async (req, res) => {
  try {
    const { itemId, rating } = req.body;

    if (!itemId || !rating) {
      return res.status(400).json({ message: "ItemId & rating required" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // user ne pehle rating di hai to update kar do
    const existingRating = item.ratings.find(
      (r) => r.user.toString() === req.userId
    );

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      item.ratings.push({ user: req.userId, rating });
    }

    item.calculateAverageRating();
    await item.save();

    return res.status(200).json({ message: "Rating submitted", item });
  } catch (error) {
    return res.status(500).json({ message: `Rating error: ${error.message}` });
  }
};






export const searchItmes = async (req, res) => {
  try {
    const { query, city } = req.query;
    if (!query || !city) {
      return null;
    }

    // Case-insensitive search
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");

    if (!shops) {
      return res.status(404).json({ message: "shops not found" });
    }
    const shopIds = shops.map((shop) => shop._id);

    const items = await Item.find({
      shop: { $in: shopIds },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).populate("shop","name image")

    return res.status(200).json(items)
  } catch (error) {
          res.status(500)
      .json({ message: `search item error: ${error.message}` });
  }
};


export const getItemsByShop = async (req,res) => {
  try {
    const {shopId} = req.params

const shop = await Shop.findById(shopId).populate("items")
if(!shop){
      return res.status(400).json({ message: "shop not found" });

}
return res.status(200).json({
  shop,items:shop.items
})

  } catch (error) {
    return res.status(500).json({ message: `get item by shop error ${error}` });
    
  }
}