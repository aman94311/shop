// ============================================================
//  server.js — Express App Entry Point (Updated with Auth + Products + Upload)
//  Abhi Sanitary and Hardware
// ============================================================

require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Routes
const inquiryRoutes  = require("./routes/inquiries");
const authRoutes     = require("./routes/auth");
const productRoutes  = require("./routes/products");
const uploadRoutes   = require("./routes/upload");
const settingsRoutes = require("./routes/settings");
const feedbackRoutes = require("./routes/feedback");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ─────────────────────────────────────
connectDB();

// ── Middleware ─────────────────────────────────────────────
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://abhisanitary.vercel.app", // Fallback for production deployment
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, "");
      return normalizedOrigin === normalizedAllowed || normalizedOrigin.startsWith(normalizedAllowed);
    });

    if (isAllowed || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error(`CORS Blocked: Origin ${origin} is not authorized.`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Routes ─────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const mongoose = require("mongoose");
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ status: "ok", shop: "Abhi Sanitary and Hardware", db: dbStatus, timestamp: new Date().toISOString() });
});

app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/upload",    uploadRoutes);
app.use("/api/settings",  settingsRoutes);
app.use("/api/feedback",  feedbackRoutes);

// Serve static uploads (local storage fallback)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("🔥 Unhandled error:", err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
});

// ── Start ──────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🏗️  Abhi Sanitary and Hardware — Backend`);
  console.log(`🚀  http://localhost:${PORT}`);
  console.log(`🔑  Admin login: POST /api/auth/login`);
  console.log(`📦  Products:    GET  /api/products`);
  console.log(`📷  Upload:      POST /api/upload\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌  Port ${PORT} is already in use!`);
    console.error(`    Another instance of the backend server is already running.`);
    console.error(`    Please close the other process or set a different PORT in your .env file.\n`);
    process.exit(1);
  } else {
    console.error("❌  Server error:", err.message);
  }
});

module.exports = app;
