import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "items" },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          console.error("Cloudinary Error:", error);
          reject(error);
        }
      }
    );
    stream.end(fileBuffer);
  });
};

export default uploadOnCloudinary;