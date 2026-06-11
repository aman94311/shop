// ============================================================
//  config/db.js — Mongoose MongoDB Connection
//  Abhi Sanitary and Hardware
// ============================================================

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `✅  MongoDB Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`
    );
  } catch (error) {
    console.error(`❌  MongoDB Connection Failed: ${error.message}`);
    // Do NOT crash the server — backend can still serve health checks
    // Frontend will still work (WA redirect is client-side)
  }
};

module.exports = connectDB;
