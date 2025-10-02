import express from 'express'

import isAuth from '../middlewares/isAuth.js'

import { upload } from '../middlewares/multer.js'
import { addItem,  deleteItem, editItemById, getItemBycity, getItemById, getItemsByShop, rateItem, searchItmes,} from '../controllers/itemController.js'

 const itemRouter= express.Router()

itemRouter.post("/add-item",isAuth,upload.array("images",4),addItem)
itemRouter.get("/get-item-by/:itemId",isAuth,getItemById)
itemRouter.post("/edit-item/:itemId",isAuth,upload.array("images",4),editItemById)
itemRouter.post("/rateItem",isAuth,rateItem)
itemRouter.get("/search-items",isAuth,searchItmes)

itemRouter.get("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/get-items-by-shop/:shopId",isAuth,getItemsByShop)

itemRouter.get("/get-items-by-city/:city",isAuth,getItemBycity)


export default itemRouter