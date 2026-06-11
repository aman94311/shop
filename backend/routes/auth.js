// ============================================================
//  routes/auth.js — Admin Authentication Routes
//  POST /api/auth/login
//  Abhi Sanitary and Hardware
// ============================================================

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ----------------------------------------------------------------
// POST /api/auth/register
// Body: { username, password }
// Returns: { success, username, role }
// ----------------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters long.",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({ username: normalizedUsername });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default 'user' role
    const crypto = require("crypto");
    const sessionId = crypto.randomBytes(16).toString("hex");

    const newUser = await User.create({
      username: normalizedUsername,
      password: hashedPassword,
      role: "user",
      currentSessionId: sessionId,
    });

    // Sign JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    console.log(`👤  New user registered: ${newUser.username}`);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      username: newUser.username,
      role: newUser.role,
    });
  } catch (error) {
    console.error("❌  Registration error:", error.message);
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// ----------------------------------------------------------------
// POST /api/auth/login
// Body: { username, password }
// Returns: { success, username, role }
// ----------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    // Query user from MongoDB
    const user = await User.findOne({ username: username.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Sign JWT — generate unique session
    const crypto = require("crypto");
    const sessionId = crypto.randomBytes(16).toString("hex");

    user.currentSessionId = sessionId;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Set JWT token in an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    console.log(`🔐  User login successful: ${user.username} [Role: ${user.role}]`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("❌  Login error:", error.message);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// ----------------------------------------------------------------
// POST /api/auth/logout
// Clears the HttpOnly session cookie
// ----------------------------------------------------------------
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ success: true, message: "Logged out successfully" });
});

// ----------------------------------------------------------------
// GET /api/auth/me
// Reads the HttpOnly cookie and returns authentication status
// ----------------------------------------------------------------
router.get("/me", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, isAuthenticated: false, message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Query user to verify session validity
    const user = await User.findById(decoded.id);
    if (!user || user.currentSessionId !== decoded.sessionId) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      return res.status(401).json({ success: false, isAuthenticated: false, message: "Session invalidated by another login" });
    }

    return res.json({ success: true, isAuthenticated: true, username: decoded.username, role: decoded.role });
  } catch (err) {
    // Clear invalid cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(401).json({ success: false, isAuthenticated: false, message: "Session expired or invalid" });
  }
});

module.exports = router;
