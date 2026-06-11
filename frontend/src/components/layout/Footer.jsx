// ============================================================
//  components/layout/Footer.jsx — Custom Shop Footer
//  Abhi Sanitary and Hardware
// ============================================================

import React from "react";

const SHOP_NAME = import.meta.env.VITE_SHOP_NAME || "ABHI SANITARY AND HARDWARE";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-icon">🏗️</span>
          <div>
            <strong>{SHOP_NAME}</strong>
            <p>Pipes · Paints · Hardware</p>
          </div>
        </div>
        <div className="footer-links">
          <span>📍 Contact us on WhatsApp for pricing &amp; availability</span>
          <span>🕐 Mon – Sat: 9:00 AM – 8:00 PM</span>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} {SHOP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
