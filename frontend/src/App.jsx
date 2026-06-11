// ============================================================
//  App.jsx — Root Application with Routing
//  Abhi Sanitary and Hardware
// ============================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ShopPage from "./pages/ShopPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// ── Protected Route ──────────────────────────────────────────
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="admin-loading-screen">
      <span className="spinner" /> Checking auth…
    </div>
  );

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (adminOnly && userRole !== "admin") {
    // If not admin, redirect to catalog home
    return <Navigate to="/" replace />;
  }

  return children;
};

// ══════════════════════════════════════════════════════════════
//  ROOT APP with Router + Auth
// ══════════════════════════════════════════════════════════════
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ShopPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
