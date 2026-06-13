// ============================================================
//  src/pages/AdminDashboard.jsx — Full Admin Control Panel
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchProducts, deleteProduct, fetchBannerSettings, fetchFeedbacks, deleteFeedback } from "../services/api";
import ProductFormModal from "../components/admin/ProductFormModal";
import BannerControl from "../components/admin/BannerControl";

const CATEGORY_LABELS = { paints: "🎨 Paints", sanitary: "🚰 Sanitary", hardware: "🔨 Hardware" };
const CATEGORY_COLORS = { paints: "paints", sanitary: "sanitary", hardware: "hardware" };

const parsePriceNum = (priceStr) => {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const AdminDashboard = () => {
  const { adminUser, logout } = useAuth();

  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [filterCat, setFilterCat]     = useState("all");
  const [search, setSearch]           = useState("");
  const [modal, setModal]             = useState({ open: false, mode: "add", product: null });
  const [deleting, setDeleting]       = useState(null);
  const [toast, setToast]             = useState(null);

  // New visit count & feedbacks state
  const [visitCount, setVisitCount]   = useState(0);
  const [feedbacks, setFeedbacks]     = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [deletingFeedback, setDeletingFeedback] = useState(null);

  // ── Load dashboard data ──────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadingFeedbacks(true);
    setError("");
    try {
      const res = await fetchProducts();
      if (res.success) setProducts(res.data || []);
      else setError(res.message || "Failed to load products.");

      // Load visits count
      const bannerRes = await fetchBannerSettings();
      if (bannerRes.success && bannerRes.visit_count !== undefined) {
        setVisitCount(bannerRes.visit_count);
      }

      // Load feedbacks
      const fbRes = await fetchFeedbacks();
      if (fbRes.success) setFeedbacks(fbRes.data || []);
    } catch {
      setError("Cannot connect to backend.");
    } finally {
      setLoading(false);
      setLoadingFeedbacks(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Toast helper ─────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Delete Feedback ──────────────────────────────────────
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback? This cannot be undone.")) return;
    setDeletingFeedback(id);
    try {
      const res = await deleteFeedback(id);
      if (res.success) {
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
        showToast("Feedback deleted.");
      } else {
        showToast(res.message || "Delete failed.", "error");
      }
    } catch {
      showToast("Server error during delete.", "error");
    } finally {
      setDeletingFeedback(null);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(product._id);
    try {
      const res = await deleteProduct(product._id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p._id !== product._id));
        showToast(`"${product.name}" deleted.`);
      } else {
        showToast(res.message || "Delete failed.", "error");
      }
    } catch {
      showToast("Server error during delete.", "error");
    } finally {
      setDeleting(null);
    }
  };

  // ── Filter / Search ──────────────────────────────────────
  const visible = products.filter((p) => {
    const catMatch = filterCat === "all" || p.category === filterCat;
    const srchMatch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && srchMatch;
  });

  // ── Counts ───────────────────────────────────────────────
  const counts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* ── Top Bar ── */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <span className="admin-topbar-icon">🏗️</span>
          <div>
            <h1 className="admin-topbar-title">Admin Dashboard</h1>
            <p className="admin-topbar-sub">ABHI SANITARY AND HARDWARE</p>
          </div>
        </div>
        <div className="admin-topbar-right">
          <span className="admin-topbar-user">👤 {adminUser}</span>
          <a href="/" className="admin-btn admin-btn--ghost">🏠 Shop</a>
          <button 
            className="admin-btn admin-btn--danger-outline" 
            onClick={logout} 
            title="Log out of session"
          >
            🔴 Logout
          </button>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="admin-stats-row">
        {[
          { label: "Total Products", val: products.length, icon: "📦", color: "all" },
          { label: "Paints",   val: counts.paints   || 0, icon: "🎨", color: "paints" },
          { label: "Sanitary", val: counts.sanitary || 0, icon: "🚰", color: "sanitary" },
          { label: "Hardware", val: counts.hardware || 0, icon: "🔨", color: "hardware" },
          { label: "User Visits", val: visitCount,   icon: "👥", color: "all" },
        ].map((s) => (
          <div key={s.label} className={`admin-stat-card admin-stat-card--${s.color}`}>
            <span className="admin-stat-icon">{s.icon}</span>
            <div>
              <div className="admin-stat-val">{s.val}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Discount Banner Control ── */}
      <div className="admin-banner-section">
        <BannerControl />
      </div>

      {/* ── Toolbar ── */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          {/* Category filter */}
          <div className="admin-filter-group">
            {["all", "paints", "sanitary", "hardware"].map((c) => (
              <button
                key={c}
                className={`admin-filter-btn ${filterCat === c ? "admin-filter-btn--active" : ""}`}
                onClick={() => setFilterCat(c)}
              >
                {c === "all" ? "All" : CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="search"
            className="admin-search"
            placeholder="🔍 Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="admin-btn admin-btn--primary" onClick={() => setModal({ open: true, mode: "add", product: null })}>
          ＋ Add Product
        </button>
      </div>

      {/* ── Error ── */}
      {error && <div className="admin-alert admin-alert--error">⚠️ {error}</div>}

      {/* ── Table ── */}
      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">
            <span className="spinner" /> Loading products…
          </div>
        ) : visible.length === 0 ? (
          <div className="admin-empty">
            <span>📭</span>
            <p>{search ? "No products match your search." : "No products found. Add one above!"}</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Buying Price</th>
                <th>Unit</th>
                <th>Tag</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p, i) => {
                const sPrice = parsePriceNum(p.price);
                const bPrice = parsePriceNum(p.buyingPrice);
                const profit = sPrice && bPrice && sPrice > bPrice ? sPrice - bPrice : 0;
                const margin = sPrice && profit ? (profit / sPrice) * 100 : 0;

                return (
                  <tr key={p._id} className="admin-table-row">
                    <td className="admin-table-idx">{i + 1}</td>
                    <td className="admin-table-name">
                      <div>{p.name}</div>
                      {p.description && <small className="admin-table-desc">{p.description}</small>}
                    </td>
                    <td>
                      <span className={`admin-cat-badge admin-cat-badge--${CATEGORY_COLORS[p.category]}`}>
                        {CATEGORY_LABELS[p.category]}
                      </span>
                    </td>
                    <td className={`admin-table-price admin-table-price--${p.category}`}>{p.price}</td>
                    <td>
                      {p.buyingPrice ? (
                        <div>
                          <span className="admin-buying-price-badge">{p.buyingPrice}</span>
                          {profit > 0 && (
                            <span className="admin-profit-text" title="Profit margin percentage based on selling price">
                              Profit: ₹{Math.round(profit).toLocaleString("en-IN")} ({Math.round(margin)}%)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="admin-table-none">—</span>
                      )}
                    </td>
                    <td className="admin-table-unit">{p.unit}</td>
                    <td>
                      {p.tag ? (
                        <span className={`admin-tag admin-tag--${p.category}`}>{p.tag}</span>
                      ) : (
                        <span className="admin-table-none">—</span>
                      )}
                    </td>
                    <td className="admin-table-actions">
                      <button
                        className="admin-action-btn admin-action-btn--edit"
                        title="Edit product"
                        onClick={() => setModal({ open: true, mode: "edit", product: p })}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--delete"
                        title="Delete product"
                        disabled={deleting === p._id}
                        onClick={() => handleDelete(p)}
                      >
                        {deleting === p._id ? <span className="spinner spinner--sm" /> : "🗑️ Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="admin-table-footer">{visible.length} of {products.length} products shown</p>

      {/* ── Customer Feedbacks Section ── */}
      <div className="admin-table-wrap" style={{ marginTop: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <span style={{ fontSize: "1.5rem" }}>💬</span>
          <h2 style={{ fontFamily: "Outfit, sans-serif", fontSize: "1.3rem", fontWeight: "800" }}>Customer Feedback &amp; Suggestions</h2>
        </div>

        {loadingFeedbacks ? (
          <div className="admin-loading">
            <span className="spinner" /> Loading feedback...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="admin-empty" style={{ background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border-subtle)" }}>
            <span>📭</span>
            <p>No feedback received yet.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "150px" }}>User</th>
                <th>Feedback Message</th>
                <th style={{ width: "180px" }}>Submitted At</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb._id} className="admin-table-row">
                  <td style={{ fontWeight: "600", color: "#60a5fa" }}>
                    👤 {fb.username}
                  </td>
                  <td style={{ color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                    {fb.message}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                    {new Date(fb.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="admin-table-actions">
                    <button
                      className="admin-action-btn admin-action-btn--delete"
                      title="Delete feedback"
                      disabled={deletingFeedback === fb._id}
                      onClick={() => handleDeleteFeedback(fb._id)}
                    >
                      {deletingFeedback === fb._id ? <span className="spinner spinner--sm" /> : "🗑️ Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal.open && (
        <ProductFormModal
          mode={modal.mode}
          product={modal.product}
          onClose={() => setModal({ open: false, mode: "add", product: null })}
          onSaved={(updated, mode) => {
            if (mode === "add") {
              setProducts((prev) => [...prev, updated]);
              showToast(`"${updated.name}" added!`);
            } else {
              setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
              showToast(`"${updated.name}" updated!`);
            }
            setModal({ open: false, mode: "add", product: null });
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
