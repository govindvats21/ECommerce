import multer from "multer";

// Memory storage is correct for Vercel
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // ✅ 1. Ek file max 2MB (Taaki 4 files ka total control mein rahe)
    files: 4 // ✅ 2. Max 4 files hi allow karo
  },
  fileFilter: (req, file, cb) => {
    // ✅ 3. Sirf images allow karein
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"), false);
    }
  }
});