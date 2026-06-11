// ============================================================
//  components/layout/Navbar.jsx — Sticky Top Navigation
//  Abhi Sanitary and Hardware
// ============================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logoImg from "../../assets/logo.png";

const SHOP_NAME = import.meta.env.VITE_SHOP_NAME || "ABHI SANITARY AND HARDWARE";

const filters = [
  { key: "all",      label: "Show All",   emoji: "🏠" },
  { key: "paints",   label: "Paints",     emoji: "🎨" },
  { key: "sanitary", label: "Sanitary",   emoji: "🚰" },
  { key: "hardware", label: "Hardware",   emoji: "🔨" },
];

const Navbar = ({ activeFilter, setActiveFilter, onQuoteClick }) => {
  const { isAuthenticated, adminUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* ── Logo ── */}
      <div className="navbar-brand">
        <img src={logoImg} alt="AS Logo" className="navbar-logo-img" />
        <div className="navbar-title-wrap">
          <span className="navbar-title">{SHOP_NAME}</span>
          <span className="navbar-subtitle">Pipes · Paints · Hardware</span>
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="navbar-filters">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-pill ${activeFilter === f.key ? "filter-pill--active-" + f.key : ""}`}
            onClick={() => setActiveFilter(f.key)}
            aria-pressed={activeFilter === f.key}
          >
            <span>{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* ── Right Actions ── */}
      <div className="navbar-right">
        {isAuthenticated ? (
          <div className="navbar-user-info">
            <span className="navbar-username">
              👤 {adminUser}
            </span>
            {userRole === "admin" && (
              <button 
                className="navbar-admin-btn-subtle" 
                onClick={() => navigate("/admin")} 
                title="Go to Admin Dashboard"
              >
                ⚙️ Admin
              </button>
            )}
            <button 
              className="navbar-logout-btn-subtle" 
              onClick={logout} 
              title="Log out of session"
            >
              🔴 Logout
            </button>
          </div>
        ) : (
          <button className="navbar-admin-btn" onClick={() => navigate("/admin/login")} title="Admin Login">
            🔑 Login
          </button>
        )}

        {/* Get Quote CTA */}
        <button className="navbar-cta" onClick={onQuoteClick}>
          📋 Get Quote
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
