import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // Ek file max 2MB (Taaki 4 files ka total control mein rahe)
    files: 4 //
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"), false);
    }
  }
});