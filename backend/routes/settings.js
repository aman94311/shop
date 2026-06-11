// ============================================================
//  routes/settings.js — Banner & Settings Routes
//  GET /api/settings/banner  — Public
//  PUT /api/settings/banner  — Admin protected
//  Abhi Sanitary and Hardware
// ============================================================

const express    = require("express");
const router     = express.Router();
const Settings   = require("../models/Settings");
const verifyAdmin  = require("../middleware/verifyAdmin");
const verifyUser  = require("../middleware/verifyUser");
const mongoose   = require("mongoose");

const isDbConnected = () => mongoose.connection.readyState === 1;

// ── Helper: get-or-create the single settings document ──────
const getSettings = async () => {
  let doc = await Settings.findOne({ key: "global" });
  if (!doc) {
    // Auto-create defaults on first access
    doc = await Settings.create({ key: "global" });
  }
  return doc;
};

// ----------------------------------------------------------------
// GET /api/settings/banner — Public
// Returns { banner_text, is_banner_active }
// ----------------------------------------------------------------
router.get("/banner", verifyUser, async (req, res) => {
  try {
    if (!isDbConnected()) {
      // Graceful fallback when DB is offline — return default active banner so it is visible immediately
      return res.json({
        success: true,
        banner_text: "🎉 Welcome to Abhi Sanitary and Hardware! Best prices on Pipes, Paints & Hardware.",
        is_banner_active: true,
        offline: true,
      });
    }

    const settings = await getSettings();

    const responseData = {
      success:          true,
      banner_text:      settings.banner_text,
      is_banner_active: settings.is_banner_active,
    };

    if (req.user && req.user.role === "admin") {
      responseData.visit_count = settings.visit_count || 0;
    }

    return res.json(responseData);
  } catch (error) {
    console.error("❌  Error fetching banner settings:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------------------------------------------
// PUT /api/settings/banner — Admin Protected
// Body: { banner_text?, is_banner_active? }
// ----------------------------------------------------------------
router.put("/banner", verifyAdmin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const { banner_text, is_banner_active } = req.body;

    // Build update object — only include fields that were sent
    const update = {};
    if (banner_text !== undefined)      update.banner_text      = banner_text.trim();
    if (is_banner_active !== undefined) update.is_banner_active = Boolean(is_banner_active);

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field: banner_text or is_banner_active",
      });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "global" },
      update,
      { new: true, upsert: true, runValidators: true }
    );

    console.log(
      `📢  Banner updated — Active: ${settings.is_banner_active} | Text: "${settings.banner_text}"`
    );

    return res.json({
      success:          true,
      message:          "Banner settings updated",
      banner_text:      settings.banner_text,
      is_banner_active: settings.is_banner_active,
    });
  } catch (error) {
    console.error("❌  Error updating banner:", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------------------------------------------
// POST /api/settings/visit — Increment visit count (User only)
// ----------------------------------------------------------------
router.post("/visit", verifyUser, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    // Only count non-admin visits
    if (req.user.role === "admin") {
      return res.json({ success: true, message: "Admin visit, count not incremented" });
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "global" },
      { $inc: { visit_count: 1 } },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      visit_count: settings.visit_count,
    });
  } catch (error) {
    console.error("❌  Error updating visit count:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
