// ============================================================
//  routes/products.js — Product CRUD Routes
//  GET  /api/products       — Public (catalog display)
//  POST /api/products       — Admin only (create)
//  PUT  /api/products/:id   — Admin only (update)
//  DELETE /api/products/:id — Admin only (delete)
//  Abhi Sanitary and Hardware
// ============================================================

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyUser = require("../middleware/verifyUser");
const mongoose = require("mongoose");

const isDbConnected = () => mongoose.connection.readyState === 1;

// ----------------------------------------------------------------
// GET /api/products — Public: Fetch all active products
// Query: ?category=paints|sanitary|hardware
// ----------------------------------------------------------------
router.get("/", verifyUser, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const filter = { isActive: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Only allow admin to query the buying price
    const projection = req.user && req.user.role === "admin" ? {} : { buyingPrice: 0 };

    const products = await Product.find(filter, projection)
      .sort({ category: 1, createdAt: 1 })
      .lean();

    return res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("❌  Error fetching products:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------------------------------------------
// POST /api/products — Admin: Create new product
// Body: { name, category, price, unit, description, tag }
// ----------------------------------------------------------------
router.post("/", verifyAdmin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const { name, category, price, unit, description, tag, buyingPrice } = req.body;

    if (!name || !category || !price || !unit) {
      return res.status(400).json({
        success: false,
        message: "name, category, price, and unit are required.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category,
      price: price.trim(),
      unit: unit.trim(),
      description: description ? description.trim() : "",
      tag: tag ? tag.trim() : null,
      buyingPrice: buyingPrice ? buyingPrice.trim() : "",
    });

    console.log(`✅  Product created [${product._id}]: ${product.name}`);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("❌  Error creating product:", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------------------------------------------
// PUT /api/products/:id — Admin: Update product
// Body: any subset of { name, category, price, unit, description, tag, isActive }
// ----------------------------------------------------------------
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const allowedFields = ["name", "category", "price", "unit", "description", "tag", "isActive", "buyingPrice"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] =
          typeof req.body[field] === "string" ? req.body[field].trim() : req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update." });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    console.log(`✏️   Product updated [${product._id}]: ${product.name}`);

    return res.json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    console.error("❌  Error updating product:", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------------------------------------------
// DELETE /api/products/:id — Admin: Permanently delete product
// ----------------------------------------------------------------
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    console.log(`🗑️   Product deleted [${req.params.id}]: ${product.name}`);

    return res.json({ success: true, message: "Product permanently deleted." });
  } catch (error) {
    console.error("❌  Error deleting product:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
