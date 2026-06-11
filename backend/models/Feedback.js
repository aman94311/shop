// ============================================================
//  models/Feedback.js — MongoDB Schema for Customer Feedback
//  Abhi Sanitary and Hardware
// ============================================================

const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      trim: true,
      maxlength: [1000, "Feedback cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
