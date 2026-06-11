// ============================================================
//  routes/inquiries.js — Inquiry API Routes
//  Abhi Sanitary and Hardware
// ============================================================

const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const mongoose = require("mongoose");

// ----------------------------------------------------------------
// Helper: Check if MongoDB is actually connected
// ----------------------------------------------------------------
const isDbConnected = () => mongoose.connection.readyState === 1;

// ----------------------------------------------------------------
// POST /api/inquiries
// Body: { customerName, mobileNumber, siteAddress, materialList }
// Saves inquiry to DB. Returns 503 gracefully if DB is offline.
// ----------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { customerName, mobileNumber, siteAddress, materialList } = req.body;

    // Basic validation
    if (!customerName || !mobileNumber || !siteAddress || !materialList) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: customerName, mobileNumber, siteAddress, materialList",
      });
    }

    // If DB is not connected, acknowledge but skip saving
    if (!isDbConnected()) {
      console.warn("⚠️  DB offline — inquiry NOT saved:", { customerName, mobileNumber });
      return res.status(503).json({
        success: false,
        message: "Database unavailable. WhatsApp redirect will still work on frontend.",
        dbOffline: true,
      });
    }

    // Get client IP for basic spam prevention
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || null;

    const inquiry = await Inquiry.create({
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      siteAddress: siteAddress.trim(),
      materialList: materialList.trim(),
      ipAddress,
    });

    console.log(`📋  New inquiry saved [${inquiry._id}] — ${customerName} | ${mobileNumber}`);

    return res.status(201).json({
      success: true,
      message: "Inquiry logged successfully",
      id: inquiry._id,
    });
  } catch (error) {
    console.error("❌  Error saving inquiry:", error.message);

    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
    });
  }
});

// ----------------------------------------------------------------
// GET /api/inquiries
// Admin route — list all inquiries (paginated, newest first)
// Future: protect with JWT auth middleware
// ----------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [inquiries, total] = await Promise.all([
      Inquiry.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Inquiry.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌  Error fetching inquiries:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ----------------------------------------------------------------
// PATCH /api/inquiries/:id/status
// Update inquiry status (new → seen → quoted → fulfilled)
// Future: protect with JWT auth middleware
// ----------------------------------------------------------------
router.patch("/:id/status", async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const { status } = req.body;
    const validStatuses = ["new", "seen", "quoted", "fulfilled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    return res.json({ success: true, data: inquiry });
  } catch (error) {
    console.error("❌  Error updating inquiry status:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
