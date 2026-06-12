// ============================================================
//  src/pages/AdminLogin.jsx — Login & Registration Page
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAdmin, registerUser, forgotPassword, resetPassword } from "../services/api";
import logoImg from "../assets/logo.png";

const AdminLogin = () => {
  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm]                     = useState({ username: "", email: "", password: "" });
  const [error, setError]                   = useState("");
  const [successMsg, setSuccessMsg]         = useState("");
  const [loading, setLoading]               = useState(false);

  // Forgot Password Flow States
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep]     = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset Password
  const [forgotPasswordEmail, setForgotPasswordEmail]   = useState("");
  const [otp, setOtp]                                   = useState("");
  const [newPassword, setNewPassword]                   = useState("");

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
    setForm({ username: "", email: "", password: "" });
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

    if (isRegisterMode) {
      const emailTrimmed = form.email.trim();
      if (!emailTrimmed) {
        setError("Please enter your email address.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        // Register standard customer user
        const res = await registerUser(usernameTrimmed, form.email.trim(), form.password);
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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (forgotPasswordStep === 1) {
      const emailTrimmed = forgotPasswordEmail.trim();
      if (!emailTrimmed) {
        setError("Please enter your email address.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        setError("Please enter a valid email address.");
        return;
      }

      setLoading(true);
      try {
        const res = await forgotPassword(emailTrimmed);
        if (res.success) {
          setSuccessMsg(res.message || "OTP code sent to email.");
          setForgotPasswordStep(2);
        } else {
          setError(res.message || "Failed to request OTP.");
        }
      } catch (err) {
        setError("Server error. Please check if backend is running.");
      } finally {
        setLoading(false);
      }
    } else {
      const otpTrimmed = otp.trim();
      const newPwdTrimmed = newPassword.trim();

      if (!otpTrimmed || !newPwdTrimmed) {
        setError("Please enter both the OTP code and your new password.");
        return;
      }

      if (newPwdTrimmed.length < 4) {
        setError("New password must be at least 4 characters long.");
        return;
      }

      setLoading(true);
      try {
        const res = await resetPassword(forgotPasswordEmail.trim(), otpTrimmed, newPwdTrimmed);
        if (res.success) {
          setSuccessMsg("Password reset successfully! Redirecting to login...");
          setTimeout(() => {
            setIsForgotPasswordMode(false);
            setForgotPasswordStep(1);
            setForgotPasswordEmail("");
            setOtp("");
            setNewPassword("");
            setError("");
            setSuccessMsg("");
          }, 2000);
        } else {
          setError(res.message || "Failed to reset password.");
        }
      } catch (err) {
        setError("Server error. Please check if backend is running.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        
        {/* Card Header */}
        <div className="admin-login-header">
          <img 
            src={logoImg} 
            alt="Abhi Sanitary Logo" 
            className="admin-login-logo" 
            style={{ 
              width: "64px", 
              height: "64px", 
              objectFit: "contain", 
              margin: "0 auto 12px auto", 
              display: "block",
              borderRadius: "8px"
            }} 
          />
          <h1 className="admin-login-title">
            {isForgotPasswordMode 
              ? "Reset Password" 
              : isRegisterMode ? "Create Account" : "Access Portal"}
          </h1>
          <p className="admin-login-sub">ABHI SANITARY AND HARDWARE</p>
        </div>

        {/* Conditional Tabs Selection */}
        {!isForgotPasswordMode && (
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
        )}

        {/* Feedback Alerts */}
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

        {/* Forms Container */}
        {isForgotPasswordMode ? (
          /* Forgot Password OTP Flow Forms */
          <form onSubmit={handleForgotPasswordSubmit} className="admin-login-form">
            {forgotPasswordStep === 1 ? (
              /* Step 1: Request OTP Form */
              <>
                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="forgot-email">📧 Registered Email Address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="admin-input"
                    placeholder="Enter your registered email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" className="admin-btn admin-btn--primary admin-btn--full" disabled={loading}>
                  {loading ? (
                    <><span className="spinner" />  Sending OTP…</>
                  ) : (
                    "Send Reset OTP →"
                  )}
                </button>
              </>
            ) : (
              /* Step 2: Verification and Reset Password Form */
              <>
                <div className="admin-form-group">
                  <label className="admin-label">📧 Email Address</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={forgotPasswordEmail}
                    disabled
                    style={{ opacity: 0.7, cursor: "not-allowed", backgroundColor: "#f9fafb" }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="otp-code">🔢 OTP Code</label>
                  <input
                    id="otp-code"
                    type="text"
                    className="admin-input"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="new-password">🔒 New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    className="admin-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="admin-btn admin-btn--primary admin-btn--full" disabled={loading}>
                  {loading ? (
                    <><span className="spinner" />  Updating Password…</>
                  ) : (
                    "Change Password →"
                  )}
                </button>
              </>
            )}

            {/* Back to Sign In Link */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  textDecoration: "underline",
                  padding: 0
                }}
                onClick={() => {
                  setIsForgotPasswordMode(false);
                  setForgotPasswordStep(1);
                  setError("");
                  setSuccessMsg("");
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          /* Standard Sign In & Sign Up Form */
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

            {isRegisterMode && (
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="login-email">📧 Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="admin-input"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            )}

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

            {/* Forgot password link below password input in Sign In mode */}
            {!isRegisterMode && (
              <div className="admin-forgot-password-link-container" style={{ textAlign: "right", marginTop: "-10px", marginBottom: "15px" }}>
                <button
                  type="button"
                  className="admin-forgot-password-btn"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#3b82f6",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    textDecoration: "underline",
                    padding: 0
                  }}
                  onClick={() => {
                    setIsForgotPasswordMode(true);
                    setForgotPasswordStep(1);
                    setError("");
                    setSuccessMsg("");
                    setForgotPasswordEmail("");
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" className="admin-btn admin-btn--primary admin-btn--full" disabled={loading}>
              {loading ? (
                <><span className="spinner" />  Processing…</>
              ) : (
                isRegisterMode ? "Create Account →" : "Sign In →"
              )}
            </button>
          </form>
        )}

        <p className="admin-login-hint">
          {isForgotPasswordMode 
            ? "Enter your email address to receive a verification OTP."
            : isRegisterMode 
              ? "Create an account to browse the digital catalog."
              : "Sign in using your account to view pipes, paints & hardware catalog."}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
