// ============================================================
//  routes/feedback.js — Feedback Routes
//  POST /api/feedback — Authenticated users submit feedback
//  GET /api/feedback  — Admin gets all feedbacks
//  Abhi Sanitary and Hardware
// ============================================================

const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");
const mongoose = require("mongoose");

const isDbConnected = () => mongoose.connection.readyState === 1;

// ----------------------------------------------------------------
// POST /api/feedback — User submits feedback
// ----------------------------------------------------------------
router.post("/", verifyUser, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Feedback message is required." });
    }

    const feedback = await Feedback.create({
      username: req.user.username,
      message: message.trim(),
    });

    console.log(`💬  New feedback from ${req.user.username}: "${message.trim().substring(0, 30)}..."`);

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: feedback,
    });
  } catch (error) {
    console.error("❌  Error submitting feedback:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------------------------------------------
// GET /api/feedback — Admin fetches all feedbacks
// ----------------------------------------------------------------
router.get("/", verifyAdmin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("❌  Error fetching feedbacks:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------------------------------------------
// GET /api/feedback/public — Get recent feedbacks (User only)
// ----------------------------------------------------------------
router.get("/public", verifyUser, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    // Return the last 15 feedbacks, only username, message, and createdAt fields
    const feedbacks = await Feedback.find()
      .select("username message createdAt")
      .sort({ createdAt: -1 })
      .limit(15);

    return res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("❌  Error fetching public feedbacks:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ----------------------------------------------------------------
// DELETE /api/feedback/:id — Admin deletes feedback
// ----------------------------------------------------------------
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable" });
    }

    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found." });
    }

    console.log(`🗑️  Feedback ${id} deleted by Admin`);

    return res.json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (error) {
    console.error("❌  Error deleting feedback:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
