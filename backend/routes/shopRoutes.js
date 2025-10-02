import express from 'express'

import isAuth from '../middlewares/isAuth.js'
import { upload } from '../middlewares/multer.js'
import { createAndEditShop, getMyShop, getShopsByCity } from '../controllers/shopController.js'

 const shopRouter= express.Router()

shopRouter.post("/create-edit",isAuth,upload.single("image"),createAndEditShop)
shopRouter.get("/get-my-shop",isAuth,getMyShop)
shopRouter.get("/get-shops-by/:city",isAuth,getShopsByCity)
// Public route (no login required)



export default shopRouter