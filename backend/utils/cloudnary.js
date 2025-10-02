import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const uploadOnCloudinary = async (filePath) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUDNAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
   const result = await cloudinary.uploader.upload(filePath,{
    folder: "items"
   });

    fs.unlinkSync(filePath);
return result.secure_url

  } catch (error) {
    fs.unlinkSync(filePath);

    console.log(error);
  }
};

export default uploadOnCloudinary;
