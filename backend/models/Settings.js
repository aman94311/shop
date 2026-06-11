// ============================================================
//  models/Settings.js — Shop Settings (Single Document)
//  Stores banner text, active state, and future settings
//  Abhi Sanitary and Hardware
// ============================================================

const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema(
  {
    // Singleton key — always "global"
    key: {
      type: String,
      default: "global",
      unique: true,
    },
    banner_text: {
      type: String,
      trim: true,
      default: "🎉 Welcome to Abhi Sanitary and Hardware! Best prices on Pipes, Paints & Hardware.",
      maxlength: [300, "Banner text cannot exceed 300 characters"],
    },
    is_banner_active: {
      type: Boolean,
      default: true,
    },
    visit_count: {
      type: Number,
      default: 0,
    },
    // Future settings can be added here
    // e.g., shop_open: Boolean, announcement: String, etc.
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", SettingsSchema);
