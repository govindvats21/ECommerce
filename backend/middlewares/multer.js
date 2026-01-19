import multer from "multer";

// Vercel par diskStorage kaam nahi karta, isliye memoryStorage use karein
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB per file
});