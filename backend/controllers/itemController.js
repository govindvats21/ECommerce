import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudnary.js";
import { v2 as cloudinary } from "cloudinary";

// --- 1. ADD ITEM: Naya product shop mein add karne ke liye ---
export const addItem = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      discountPrice,
      originalPrice,
      stock,
      description,
      colors,
      sizes,
      ram,
      storage,
    } = req.body;

    // String data ko array mein convert karne ka helper function
    const toArray = (data) =>
      data ? data.split(",").map((item) => item.trim()) : [];

    let images = [];

    // Multiple images handling (Vercel ke liye buffer use ho raha hai)
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        // req.files[i].path ki jagah .buffer bhej rahe hain
        const uploadedUrl = await uploadOnCloudinary(req.files[i].buffer);
        if (uploadedUrl) {
          images.push(uploadedUrl);
        }
      }
    }

    const owner = req.userId;
    const shop = await Shop.findOne({ owner });

    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }

    // Naye fields (brand, stock) ke saath item database mein create ho raha hai
    const item = await Item.create({
      name,
      category,
      brand: brand || "Generic",
      discountPrice: Number(discountPrice) || 0,
      originalPrice: Number(originalPrice) || 0,
      stock: Number(stock) || 0,
      description,
      images, // [url1, url2, ...]
      shop: shop._id,
      attributes: {
        colors: toArray(colors),
        sizes: toArray(sizes),
        ram: toArray(ram),
        storage: toArray(storage),
      },
    });

    // Shop model ke items array mein naye item ki ID save ho rahi hai
    shop.items.push(item._id);
    await shop.save();

    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });

    return res.status(201).json(shop);
  } catch (error) {
    console.error("Add Item Error:", error.message);
    return res
      .status(500)
      .json({ message: "Add item error", error: error.message });
  }
};

// --- 2. GET ITEM BY ID: Single product details fetch karne ke liye ---
export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId).populate(
      "shop",
      "name image city",
    );
    if (!item) return res.status(400).json({ message: "item not found" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error.message}` });
  }
};

// --- 3. EDIT ITEM: Purane product ki details change karne ke liye ---
export const editItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const {
      name,
      category,
      brand,
      discountPrice,
      originalPrice,
      stock,
      description,
      colors,
      sizes,
      ram,
      storage,
    } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(400).json({ message: "Item not found" });

    const toArray = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      return data.split(",").map((i) => i.trim());
    };

    // Purani images ko default rakha gaya hai
    let images = item.images || [];

    // Nayi images update logic (Agar user ne upload ki ho)
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (let i = 0; i < req.files.length; i++) {
        const uploadedUrl = await uploadOnCloudinary(req.files[i].buffer);
        if (uploadedUrl) newImages.push(uploadedUrl);
      }
      images = newImages;
    }

    // Ek ek karke saare fields update ho rahe hain
    item.name = name || item.name;
    item.category = category || item.category;
    item.brand = brand || item.brand;
    item.discountPrice =
      discountPrice !== undefined ? Number(discountPrice) : item.discountPrice;
    item.originalPrice =
      originalPrice !== undefined ? Number(originalPrice) : item.originalPrice;
    item.stock = stock !== undefined ? Number(stock) : item.stock;
    item.description = description || item.description;
    item.images = images;

    // Attributes (Color, Size etc.) update ho rahe hain
    if (item.attributes) {
      if (colors !== undefined) item.attributes.colors = toArray(colors);
      if (sizes !== undefined) item.attributes.sizes = toArray(sizes);
      if (ram !== undefined) item.attributes.ram = toArray(ram);
      if (storage !== undefined) item.attributes.storage = toArray(storage);
    } else {
      item.attributes = {
        colors: toArray(colors),
        sizes: toArray(sizes),
        ram: toArray(ram),
        storage: toArray(storage),
      };
    }

    await item.save();

    // Latest shop data frontend ko wapas bheja ja raha hai
    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });

    return res.status(200).json(shop);
  } catch (error) {
    console.error("Edit Error:", error.message);
    return res
      .status(500)
      .json({ message: `Edit item error: ${error.message}` });
  }
};

// --- 4. DELETE ITEM: Product ko DB aur Cloudinary dono se delete karna ---
export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) return res.status(400).json({ message: "item not found" });

    // Cloudinary storage se physical files delete ho rahi hain
    if (item.images && item.images.length > 0) {
      for (const imageUrl of item.images) {
        try {
          // URL se public_id extract karne ka logic
          const publicId = imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary Delete Error:", err.message);
        }
      }
    }

    // Database se product ki entry delete ho rahi hai
    await Item.findByIdAndDelete(itemId);

    // Shop ke items array se is product ki ID filter ho rahi hai
    const shop = await Shop.findOne({ owner: req.userId });
    if (shop) {
      shop.items = shop.items.filter((i) => i.toString() !== itemId);
      await shop.save();
      await shop.populate({
        path: "items",
        options: { sort: { createdAt: -1 } },
      });
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `delete item error ${error.message}` });
  }
};

// --- 5. GET ALL ITEMS: Home page ke liye saare products ---
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({}).populate("shop", "name image city");
    return res.status(200).json(items);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get items error ${error.message}` });
  }
};

// --- 6. SEARCH ITEMS: Search bar ke liye logic ---
export const searchItmes = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      const items = await Item.find({}).populate("shop", "name image");
      return res.status(200).json(items);
    }

    // Regex ka use karke partial match search kiya ja raha hai
    const items = await Item.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
      ],
    }).populate("shop", "name image");

    return res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: `search item error: ${error.message}` });
  }
};

// --- 7. GET ITEMS BY SHOP: Kisi specific shop ke products dekhne ke liye ---
export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findById(shopId).populate("items");
    if (!shop) return res.status(400).json({ message: "shop not found" });

    return res.status(200).json({
      shop,
      items: shop.items,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get item by shop error ${error.message}` });
  }
};