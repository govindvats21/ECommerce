import Item from "../models/itemModel.js";
import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudnary.js";

// --- 1. ADD ITEM ---
export const addItem = async (req, res) => {
  try {
    const { name, category, brand, discountPrice, originalPrice, stock, description, colors, sizes, ram, storage } = req.body;
    
    // Sabse important: images ko array [string] banana
    let images = []; 

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const uploadedUrl = await uploadOnCloudinary(req.files[i].path);
        if (uploadedUrl) {
          images.push(uploadedUrl); // Array mein direct URL push kar rahe hain
        }
      }
    }

    const owner = req.userId;
    const shop = await Shop.findOne({ owner });

    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }

const toArray = (data) => data ? data.split(",").map(item => item.trim()) : [];
    // Naye fields (brand, stock) ke saath item create karein
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
      attributes:{
        colors:toArray(colors),
        sizes: toArray(sizes),
        ram: toArray(ram),
        storage: toArray(storage),
       
      }
    });

    shop.items.push(item._id);
    await shop.save();
    
    await shop.populate({
      path: "items",
      options: { sort: { createdAt: -1 } },
    });

    return res.status(201).json(shop);
  } catch (error) {
    console.error("Add Item Error:", error.message);
    return res.status(500).json({ message: "Add item error", error: error.message });
  }
};

// --- 2. GET ITEM BY ID ---
export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId).populate("shop", "name image city");
    if (!item) return res.status(400).json({ message: "item not found" });
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `get item error ${error.message}` });
  }
};

// --- 3. EDIT ITEM ---
export const editItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, category, brand, discountPrice, originalPrice, stock, description,colors, sizes, ram, storage, weight } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(400).json({ message: "Item not found" });

    // Purani images rakhein ya nayi upload karein
    let images = item.images || []; 

    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (let i = 0; i < req.files.length; i++) {
        const uploadedUrl = await uploadOnCloudinary(req.files[i].path);
        if (uploadedUrl) newImages.push(uploadedUrl);
      }
      images = newImages; // Nayi images se replace kar rahe hain
    }

    // Update fields
    item.name = name || item.name;
    item.category = category || item.category;
    item.brand = brand || item.brand;
    item.discountPrice = Number(discountPrice) || item.discountPrice;
    item.originalPrice = Number(originalPrice) || item.originalPrice;
    item.stock = stock !== undefined ? Number(stock) : item.stock;
    item.description = description || item.description;
    item.images = images;
    // ✨ Attributes Update
    if (item.attributes) {
        if (colors) item.attributes.colors = toArray(colors);
        if (sizes) item.attributes.sizes = toArray(sizes);
        if (ram) item.attributes.ram = toArray(ram);
        if (storage) item.attributes.storage = toArray(storage);

    }

    await item.save();

    const shop = await Shop.findOne({ owner: req.userId })
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Edit item error: ${error.message}` });
  }
};

// --- 4. DELETE ITEM ---
export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) return res.status(400).json({ message: "item not found" });

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
    return res.status(500).json({ message: `delete item error ${error.message}` });
  }
};

// --- 5. GET ALL ITEMS ---
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({}).populate("shop", "name image city");
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: `get items error ${error.message}` });
  }
};

// --- 6. SEARCH ITEMS ---
export const searchItmes = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
       const items = await Item.find({}).populate("shop", "name image");
       return res.status(200).json(items);
    }

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

// --- 7. GET ITEMS BY SHOP ---
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
    return res.status(500).json({ message: `get item by shop error ${error.message}` });
  }
};