// ============================================================
//  src/services/api.js — Cookie-Based API Helper
//  Abhi Sanitary and Hardware
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fail-safe wrapper to prevent crashes in WebViews where localStorage might be blocked/disabled
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("localStorage.getItem blocked:", e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("localStorage.setItem blocked:", e);
    }
  },
  removeItem: (key) => {
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
