import { v2 as cloudinary } from "cloudinary";

const uploadOnCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // Cloudinary Config
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUDNAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Stream upload logic (No fs required)
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

    // Buffer ko stream mein likhna
    stream.end(fileBuffer);
  });
};

export default uploadOnCloudinary;