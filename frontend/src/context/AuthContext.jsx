// ============================================================
//  src/context/AuthContext.jsx — Admin & User Auth State
//  Abhi Sanitary and Hardware
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchMe, logoutAdmin } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser]             = useState(null);
  const [userRole, setUserRole]               = useState(null); // 'user' or 'admin'
  const [loading, setLoading]                 = useState(true);

  // On mount: verify cookie session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Detect App Wrapper
        const isAppParam = new URLSearchParams(window.location.search).get("app") === "true";
        const isAndroidWebView = /android/i.test(navigator.userAgent) && /wv/i.test(navigator.userAgent);
        const isAppWrapper = isAppParam || isAndroidWebView;

        if (isAppWrapper && typeof window.AppInventor === "undefined") {
          // Wait for AppInventor bridge to initialize (up to 800ms)
          await new Promise((resolve) => {
            const start = Date.now();
            const timer = setInterval(() => {
              if (typeof window.AppInventor !== "undefined" || Date.now() - start > 800) {
                clearInterval(timer);
                resolve();
              }
            }, 30);
          });
        }

        const res = await fetchMe();
        if (res.success && res.isAuthenticated) {
          setIsAuthenticated(true);
          setAdminUser(res.username);
          setUserRole(res.role);
        } else {
          setIsAuthenticated(false);
          setAdminUser(null);
          setUserRole(null);
        }
      } catch {
        setIsAuthenticated(false);
        setAdminUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (username, role) => {
    setIsAuthenticated(true);
    setAdminUser(username);
    setUserRole(role);
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      setIsAuthenticated(false);
      setAdminUser(null);
      setUserRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminUser, userRole, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
