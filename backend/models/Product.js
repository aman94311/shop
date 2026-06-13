// ============================================================
//  models/Product.js — Product Catalog Schema
//  Abhi Sanitary and Hardware
// ============================================================

const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["paints", "sanitary", "hardware"],
        message: "Category must be paints, sanitary, or hardware",
      },
    },
    price: {
      type: String,
      required: [true, "Price is required"],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    tag: {
      type: String,
      trim: true,
      default: null,
    },
    buyingPrice: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", ProductSchema);
