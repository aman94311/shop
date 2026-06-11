// ============================================================
//  src/pages/AdminLogin.jsx — Login & Registration Page
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAdmin, registerUser } from "../services/api";

const AdminLogin = () => {
  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm]                     = useState({ username: "", password: "" });
  const [error, setError]                   = useState("");
  const [successMsg, setSuccessMsg]         = useState("");
  const [loading, setLoading]               = useState(false);

  const from = location.state?.from?.pathname || "/";

  // If already logged in, redirect immediately based on role
  useEffect(() => {
    if (isAuthenticated) {
      const dest = userRole === "admin" ? (from === "/" ? "/admin" : from) : "/";
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate, from]);

  const handleTabChange = (mode) => {
    setIsRegisterMode(mode);
    setError("");
    setSuccessMsg("");
    setForm({ username: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const usernameTrimmed = form.username.trim();
    if (!usernameTrimmed || !form.password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        // Register standard customer user
        const res = await registerUser(usernameTrimmed, form.password);
        if (res.success) {
          setSuccessMsg("Registration successful! Logging in...");
          setTimeout(() => {
            login(res.username, res.role);
            navigate("/", { replace: true });
          }, 1000);
        } else {
          setError(res.message || "Registration failed.");
        }
      } else {
        // Login admin or customer user
        const res = await loginAdmin(usernameTrimmed, form.password);
        if (res.success) {
          login(res.username, res.role);
          const dest = res.role === "admin" ? (from === "/" ? "/admin" : from) : "/";
          navigate(dest, { replace: true });
        } else {
          setError(res.message || "Invalid credentials.");
        }
      }
    } catch (err) {
      setError("Server error. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-login-icon">🔑</span>
          <h1 className="admin-login-title">
            {isRegisterMode ? "Create Account" : "Access Portal"}
          </h1>
          <p className="admin-login-sub">ABHI SANITARY AND HARDWARE</p>
        </div>

        {/* Tab Selection */}
        <div className="admin-login-tabs">
          <button
            type="button"
            className={`admin-login-tab ${!isRegisterMode ? "admin-login-tab--active" : ""}`}
            onClick={() => handleTabChange(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`admin-login-tab ${isRegisterMode ? "admin-login-tab--active" : ""}`}
            onClick={() => handleTabChange(true)}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="admin-alert admin-alert--error">
            <span>⚠️</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="admin-alert admin-alert--success">
            <span>✅</span> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="login-username">👤 Username</label>
            <input
              id="login-username"
              type="text"
              className="admin-input"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" htmlFor="login-password">🔒 Password</label>
            <input
              id="login-password"
              type="password"
              className="admin-input"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-btn admin-btn--primary admin-btn--full" disabled={loading}>
            {loading ? (
              <><span className="spinner" />  Processing…</>
            ) : (
              isRegisterMode ? "Create Account →" : "Sign In →"
            )}
          </button>
        </form>

        <p className="admin-login-hint">
          {isRegisterMode 
            ? "Create an account to browse the digital catalog."
            : "Sign in using your account to view pipes, paints & hardware catalog."}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
