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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters long.",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if username already exists
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken.",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
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
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      currentSessionId: sessionId,
    });

    // Sign JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
    });

    console.log(`👤  New user registered: ${newUser.username} (${newUser.email})`);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      username: newUser.username,
      role: newUser.role,
      token,
    });
  } catch (error) {
    console.error("❌  Registration error:", error.message);
    return res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// ----------------------------------------------------------------
// POST /api/auth/forgot-password
// Body: { email }
// Returns: { success, message }
// ----------------------------------------------------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "No user found with this email address." });
    }

    // Generate 6-digit OTP
    const crypto = require("crypto");
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP & Expiry (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    const { sendEmail } = require("../config/email");
    const mailText = `You requested a password reset. Your OTP code is: ${otp}\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.`;
    const mailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Password Reset Request</h2>
        <p>You requested to reset your password for Abhi Sanitary and Hardware. Use the following One-Time Password (OTP) to complete the process:</p>
        <div style="font-size: 28px; font-weight: bold; padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center; letter-spacing: 5px; margin: 25px 0; color: #2563eb; border: 1px dashed #3b82f6;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. After that, it will expire and you will need to request a new one.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">Abhi Sanitary and Hardware • Automated Email</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP - Abhi Sanitary & Hardware",
      text: mailText,
      html: mailHtml,
    });

    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("❌ Forgot password error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while processing password reset request." });
  }
});

// ----------------------------------------------------------------
// POST /api/auth/reset-password
// Body: { email, otp, newPassword }
// Returns: { success, message }
// ----------------------------------------------------------------
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields (email, OTP, new password) are required." });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ success: false, message: "Password must be at least 4 characters long." });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user: set new password, clear OTP fields, invalidate session
    const crypto = require("crypto");
    const sessionId = crypto.randomBytes(16).toString("hex");

    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    user.currentSessionId = sessionId; // invalidates old logged in sessions
    await user.save();

    console.log(`🔐 Password successfully reset for user: ${user.username}`);

    return res.status(200).json({ success: true, message: "Password has been reset successfully. You can now log in." });
  } catch (error) {
    console.error("❌ Reset password error:", error.message);
    return res.status(500).json({ success: false, message: "Server error while resetting password." });
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
      { expiresIn: "365d" }
    );

    // Set JWT token in an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
    });

    console.log(`🔐  User login successful: ${user.username} [Role: ${user.role}]`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("❌  Login error:", error.message);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// ----------------------------------------------------------------
// POST /api/auth/logout
// Clears the HttpOnly session cookie and invalidates DB session
// ----------------------------------------------------------------
router.post("/logout", async (req, res) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    if (!token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Set currentSessionId to null to invalidate this session in MongoDB
        await User.findByIdAndUpdate(decoded.id, { currentSessionId: null });
        console.log(`🔴 Session invalidated in DB for user: ${decoded.username}`);
      } catch (err) {
        console.warn("Token decode failed during logout:", err.message);
      }
    }
  } catch (error) {
    console.error("Logout DB update error:", error.message);
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  return res.json({ success: true, message: "Logged out successfully" });
});

// ----------------------------------------------------------------
// GET /api/auth/me
// Reads the HttpOnly cookie or Auth header and returns authentication status
// ----------------------------------------------------------------
router.get("/me", async (req, res) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  if (!token) {
    token = req.cookies.token;
  }

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
        path: "/",
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
      path: "/",
    });
    return res.status(401).json({ success: false, isAuthenticated: false, message: "Session expired or invalid" });
  }
});

module.exports = router;
