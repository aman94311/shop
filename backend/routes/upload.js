// ============================================================
//  routes/upload.js — Image Upload Route
//  POST /api/upload  — Upload image to Cloudinary
//  Abhi Sanitary and Hardware
// ============================================================

const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const cloudinary = require("../config/cloudinary");

// ── Multer: store file in memory (no disk writes) ──────────
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WebP, GIF) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// ── Helper: Upload buffer to Cloudinary ───────────────────
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:          "abhi_sanitary_quotes",
        resource_type:   "image",
        transformation:  [
          { width: 1200, height: 1200, crop: "limit" },   // max size
          { quality: "auto:good" },                        // smart compression
          { fetch_format: "auto" },                        // webp/avif on supporting browsers
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ── POST /api/upload ───────────────────────────────────────
// Body: multipart/form-data with field name "image"
// Returns: { success, url, publicId, width, height }
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded." });
    }

    // Check Cloudinary credentials
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY    ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary is not configured. Add CLOUDINARY_* keys to backend .env",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    console.log(`📷  Image uploaded: ${result.secure_url}`);

    return res.status(201).json({
      success:   true,
      url:       result.secure_url,
      publicId:  result.public_id,
      width:     result.width,
      height:    result.height,
      bytes:     result.bytes,
    });
  } catch (error) {
    console.error("❌  Upload error:", error.message);
    return res.status(500).json({ success: false, message: "Image upload failed: " + error.message });
  }
});

// ── Multer error handler ───────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ success: false, message: "Image too large. Max size is 10 MB." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
