// ============================================================
//  src/services/api.js — Cookie-Based API Helper
//  Abhi Sanitary and Hardware
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// In-memory token fallback cache in case DOM Storage is disabled in WebView
let cachedToken = null;

// Helper to read cookies on the frontend
const getCookie = (name) => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  } catch (e) {
    console.warn("Failed to read cookie:", e);
  }
  return null;
};

// Helper to validate JWT token format (starts with eyJ and contains 3 dot-separated segments)
const isValidToken = (t) => {
  return typeof t === "string" && t.trim().startsWith("eyJ") && t.split(".").length === 3;
};

// Helper to write cookies on the frontend
const setCookie = (name, value, days = 365) => {
  try {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    // Only apply Secure/SameSite flags if served over HTTPS to avoid blocks in cleartext/local envs
    const isHttps = window.location.protocol === "https:";
    const secureFlag = isHttps ? "; SameSite=Lax; Secure" : "";
    document.cookie = `${name}=${value}; ${expires}; path=/${secureFlag}`;
  } catch (e) {
    console.warn("Failed to write cookie:", e);
  }
};

// Helper to erase cookies on the frontend
const eraseCookie = (name) => {
  try {
    const isHttps = window.location.protocol === "https:";
    const secureFlag = isHttps ? "; SameSite=Lax; Secure" : "";
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
  } catch (e) {
    console.warn("Failed to erase cookie:", e);
  }
};

// Fail-safe wrapper to prevent crashes in WebViews where localStorage might be blocked/disabled
const safeStorage = {
  getItem: (key) => {
    if (key === "token" && cachedToken) return cachedToken;
    try {
      let val = localStorage.getItem(key);
      if (!val && key === "token") {
        // Fallback to first-party cookie for WebViews
        val = getCookie("webview_token");
      }
      // Fallback to App Inventor WebViewString
      if (!val && key === "token" && typeof window.AppInventor !== "undefined") {
        try {
          const appInvToken = window.AppInventor.getWebViewString();
          if (isValidToken(appInvToken)) {
            val = appInvToken.trim();
            // Cache it in localStorage and cookie for faster checks during this session
            localStorage.setItem("token", val);
            setCookie("webview_token", val, 365);
          }
        } catch (err) {
          console.warn("Failed to read from AppInventor WebViewString:", err);
        }
      }
      if (key === "token" && val) cachedToken = val; // Keep memory cache synced
      return val;
    } catch (e) {
      console.warn("localStorage.getItem blocked:", e);
      // Fallback to cookie if localStorage is blocked
      if (key === "token") {
        let val = getCookie("webview_token");
        if (!val && typeof window.AppInventor !== "undefined") {
          try {
            const appInvToken = window.AppInventor.getWebViewString();
            if (isValidToken(appInvToken)) {
              val = appInvToken.trim();
              setCookie("webview_token", val, 365);
            }
          } catch (err) {
            console.warn("Failed to read from AppInventor WebViewString in catch:", err);
          }
        }
        if (val) cachedToken = val;
        return val || cachedToken;
      }
      return null;
    }
  },
  setItem: (key, value) => {
    if (key === "token") {
      cachedToken = value;
      // Save in first-party cookie as backup for WebViews
      setCookie("webview_token", value, 365);
      
      // Save to App Inventor persistent TinyDB container via WebViewString
      if (typeof window.AppInventor !== "undefined") {
        try {
          window.AppInventor.setWebViewString(value);
        } catch (err) {
          console.warn("Failed to set AppInventor WebViewString:", err);
        }
      }
    }
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem blocked:", e);
    }
  },
  removeItem: (key) => {
    if (key === "token") {
      cachedToken = null;
      // Erase from first-party cookie
      eraseCookie("webview_token");
      
      // Inform App Inventor to delete the token from TinyDB
      if (typeof window.AppInventor !== "undefined") {
        try {
          window.AppInventor.setWebViewString("logout");
        } catch (err) {
          console.warn("Failed to clear AppInventor WebViewString:", err);
        }
      }
    }
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("localStorage.removeItem blocked:", e);
    }
  }
};

const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  
  // Retrieve token safely from localStorage fallback
  const token = safeStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const finalOptions = {
    ...options,
    credentials: "include",
    headers,
  };

  if (options.body instanceof FormData) {
    delete finalOptions.headers["Content-Type"];
  }

  const res = await fetch(url, finalOptions);
  return res.json();
};

// ── Auth ──────────────────────────────────────────────────
export const loginAdmin = async (username, password) => {
  // Clear any existing session before performing new login
  safeStorage.removeItem("token");
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (res.success && res.token) {
    safeStorage.setItem("token", res.token);
  }
  return res;
};

export const registerUser = async (username, email, password) => {
  // Clear any existing session before performing new registration
  safeStorage.removeItem("token");
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
  if (res.success && res.token) {
    safeStorage.setItem("token", res.token);
  }
  return res;
};

export const forgotPassword = async (email) => {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (email, otp, newPassword) => {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  });
};

export const logoutAdmin = async () => {
  safeStorage.removeItem("token");
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
};

export const fetchMe = async () => {
  return apiFetch("/api/auth/me");
};

// ── Products ──────────────────────────────────────────────
export const fetchProducts = async (category = "") => {
  const path = category
    ? `/api/products?category=${category}`
    : `/api/products`;
  return apiFetch(path);
};

export const createProduct = async (data) => {
  return apiFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateProduct = async (id, data) => {
  return apiFetch(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteProduct = async (id) => {
  return apiFetch(`/api/products/${id}`, {
    method: "DELETE",
  });
};

// ── Image Upload ───────────────────────────────────────────
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiFetch("/api/upload", {
    method: "POST",
    body: formData,
  });
};

// ── Inquiries ─────────────────────────────────────────────
export const logInquiry = async (data) => {
  return apiFetch("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const fetchInquiries = async ({ page = 1, limit = 20 } = {}) => {
  return apiFetch(`/api/inquiries?page=${page}&limit=${limit}`);
};

// ── Banner Settings ───────────────────────────────────────
export const fetchBannerSettings = async () => {
  return apiFetch("/api/settings/banner");
};

export const updateBannerSettings = async ({ banner_text, is_banner_active }) => {
  return apiFetch("/api/settings/banner", {
    method: "PUT",
    body: JSON.stringify({ banner_text, is_banner_active }),
  });
};

export const recordPageVisit = async () => {
  return apiFetch("/api/settings/visit", {
    method: "POST",
  });
};

export const submitFeedback = async (message) => {
  return apiFetch("/api/feedback", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
};

export const fetchFeedbacks = async () => {
  return apiFetch("/api/feedback");
};

export const fetchPublicFeedbacks = async () => {
  return apiFetch("/api/feedback/public");
};

export const deleteFeedback = async (id) => {
  return apiFetch(`/api/feedback/${id}`, {
    method: "DELETE",
  });
};
