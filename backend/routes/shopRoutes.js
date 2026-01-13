import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { upload } from '../middlewares/multer.js'
import { createAndEditShop, getMyShop, getAllShops } from '../controllers/shopController.js'

const shopRouter = express.Router()

// --- PUBLIC ROUTE ---
// Dashboard pe shops dikhane ke liye isAuth hata diya
shopRouter.get("/get-all-shops", getAllShops) 

// --- PRIVATE ROUTES ---
shopRouter.post("/create-edit", isAuth, upload.single("image"), createAndEditShop)
shopRouter.get("/get-my-shop", isAuth, getMyShop)

export default shopRouter