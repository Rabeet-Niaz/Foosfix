import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // keep the file in memory, then send it to Cloudinary
  limits: { fileSize: 2 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG or WebP images are allowed."));
  },
});

// Reads up to 3 files from a form field named "photos"
export default function uploadPhotos(req, res, next) {
  upload.array("photos", 3)(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Each photo must be under 2 MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "You can upload up to 3 photos." });
    }
    res.status(400).json({ error: err.message });
  });
}