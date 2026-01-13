import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { upload } from '../middlewares/multer.js'
import { 
    addItem,  
    deleteItem, 
    editItemById, 
    getAllItems, 
    getItemById, 
    getItemsByShop, 
    searchItmes 
} from '../controllers/itemController.js'

const itemRouter = express.Router()

// --- PUBLIC ROUTES (No Login Required) ---
// Inhe koi bhi dekh sakta hai
itemRouter.get("/get-all-items", getAllItems) 
itemRouter.get("/get-item-by/:itemId", getItemById)
itemRouter.get("/get-items-by-shop/:shopId", getItemsByShop)
itemRouter.get("/search-items", searchItmes) // Search ko public kiya taaki user browse kare

// --- PRIVATE ROUTES (Login Required) ---
// Ye sirf shop owners ke liye hain
itemRouter.post("/add-item", isAuth, upload.array("images", 4), addItem)
itemRouter.post("/edit-item/:itemId", isAuth, upload.array("images", 4), editItemById)
itemRouter.get("/delete/:itemId", isAuth, deleteItem)

export default itemRouter