// ============================================================
//  routes/upload.js — Image Upload Route
//  POST /api/upload  — Upload image to Cloudinary
//  Abhi Sanitary and Hardware
// ============================================================

const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const cloudinary = require("../config/cloudinary");
const fs         = require("fs");
const path       = require("path");

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

    // Check if Cloudinary is fully configured and not placeholder values
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name" &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_KEY !== "your_cloudinary_api_key" &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_API_SECRET !== "your_cloudinary_api_secret";

    if (isCloudinaryConfigured) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      console.log(`📷  Image uploaded to Cloudinary: ${result.secure_url}`);
      return res.status(201).json({
        success:   true,
        url:       result.secure_url,
        publicId:  result.public_id,
        width:     result.width,
        height:    result.height,
        bytes:     result.bytes,
      });
    } else {
      // Local Storage Fallback — saves database/Cloudinary storage
      const uploadsDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileExtension = path.extname(req.file.originalname) || ".jpg";
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, req.file.buffer);

      // Construct server URL dynamically from the request headers
      const secureUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
      console.log(`📁  Image saved locally (no Cloudinary config): ${secureUrl}`);

      return res.status(201).json({
        success: true,
        url:     secureUrl,
        filename,
      });
    }
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
