// ============================================================
//  middleware/verifyAdmin.js — Cookie-Based JWT Middleware
//  Abhi Sanitary and Hardware
// ============================================================

const jwt = require("jsonwebtoken");

const verifyAdmin = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // Fallback: check Authorization header if cookies are disabled/blocked in WebView
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please log in first.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure it's the admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin access only.",
      });
    }

    // Verify session ID in MongoDB to prevent simultaneous logins
    const User = require("../models/User");
    const user = await User.findById(decoded.id);

    if (!user || user.currentSessionId !== decoded.sessionId) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res.status(401).json({
        success: false,
        message: "Your session has been terminated because another login was detected.",
        code: "SESSION_INVALIDATED",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid session token.",
        code: "TOKEN_INVALID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication error.",
    });
  }
};

module.exports = verifyAdmin;
