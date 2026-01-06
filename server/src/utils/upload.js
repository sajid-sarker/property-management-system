import multer from "multer";
import path from "path";

// Use memory storage - files stay in memory as buffers for base64 conversion
const storage = multer.memoryStorage();

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: Images Only!"));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: fileFilter,
});

export default upload;
