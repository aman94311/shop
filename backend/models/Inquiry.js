// ============================================================
//  models/Inquiry.js — MongoDB Schema for Customer Inquiries
//  Abhi Sanitary and Hardware
// ============================================================

const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"],
    },
    siteAddress: {
      type: String,
      required: [true, "Site address is required"],
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },
    materialList: {
      type: String,
      required: [true, "Material list is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "seen", "quoted", "fulfilled"],
      default: "new",
    },
    // IP for basic spam prevention (not stored in production without consent)
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for fast queries by status and creation date
InquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Inquiry", InquirySchema);
