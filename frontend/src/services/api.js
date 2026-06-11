// ============================================================
//  src/services/api.js — Cookie-Based API Helper
//  Abhi Sanitary and Hardware
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  
  const finalOptions = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (options.body instanceof FormData) {
    delete finalOptions.headers["Content-Type"];
  }

  const res = await fetch(url, finalOptions);
  return res.json();
};

// ── Auth ──────────────────────────────────────────────────
export const loginAdmin = async (username, password) => {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
};

export const registerUser = async (username, password) => {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
};

export const logoutAdmin = async () => {
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
