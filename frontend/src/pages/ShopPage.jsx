// ============================================================
//  pages/ShopPage.jsx — Main Customer Catalog & Shop Front
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import DiscountBanner from "../components/catalog/DiscountBanner";
import CatalogSection from "../components/catalog/CatalogSection";
import QuotationForm from "../components/forms/QuotationForm";
import FeedbackForm from "../components/forms/FeedbackForm";
import ProductFormModal from "../components/admin/ProductFormModal";
import { fetchProducts, recordPageVisit } from "../services/api";

const SHOP_NAME     = import.meta.env.VITE_SHOP_NAME || "ABHI SANITARY AND HARDWARE";
const CATEGORY_ORDER = ["paints", "sanitary", "hardware"];

// ── Group products array by category ────────────────────────
const groupByCategory = (items) =>
  items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

function ShopPage() {
  const { isAuthenticated, userRole } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [materialList, setMaterialList] = useState("");
  const quotationRef = useRef(null);

  const handleActiveFilterChange = useCallback((filterKey) => {
    setActiveFilter(filterKey);
    // Smooth scroll to catalog section
    setTimeout(() => {
      const catalogEl = document.getElementById("catalog");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  // ── Live product data from DB ──────────────────────────────
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, product: null });

  // ── Record Visit (Once per session for regular users) ──────
  useEffect(() => {
    const hasVisited = sessionStorage.getItem("visit_recorded");
    if (!hasVisited && isAuthenticated && userRole !== "admin") {
      recordPageVisit()
        .then((res) => {
          if (res.success) {
            sessionStorage.setItem("visit_recorded", "true");
          }
        })
        .catch((err) => console.error("Error recording visit:", err));
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetchProducts(); // GET /api/products
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived values ─────────────────────────────────────────
  const categorized = useMemo(() => groupByCategory(products), [products]);

  const stats = useMemo(() => ({
    total:    products.length,
    paints:   categorized.paints?.length   || 0,
    sanitary: categorized.sanitary?.length || 0,
    hardware: categorized.hardware?.length || 0,
  }), [products, categorized]);

  // ── Handlers ───────────────────────────────────────────────
  const handleAddItem = useCallback((item) => {
    setMaterialList((prev) => {
      const line = `- ${item.name} (${item.unit}): `;
      return prev ? `${prev}\n${line}` : line;
    });
    setTimeout(() => {
      quotationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, []);

  const handleQuoteClick = useCallback(() => {
    quotationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleEditItem = useCallback((item) => {
    setEditModal({ open: true, product: item });
  }, []);

  const listItemCount = materialList.split("\n").filter((l) => l.trim()).length;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="app">

      {/* ── Live Discount Banner (above everything) ── */}
      <DiscountBanner />

      {/* ── Sticky Navbar ── */}
      <Navbar
        activeFilter={activeFilter}
        setActiveFilter={handleActiveFilterChange}
        onQuoteClick={handleQuoteClick}
      />

      {/* ── Hero Banner ── */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-badge">🏗️ B2B &amp; B2C Wholesale &amp; Retail</div>
          <h1 className="hero-title">{SHOP_NAME}</h1>
          <p className="hero-tagline">
            Your one-stop shop for{" "}
            <span className="hero-highlight">Asian Paints</span>,{" "}
            <span className="hero-highlight">Sanitary Pipes &amp; Fittings</span>, and{" "}
            <span className="hero-highlight">General Hardware</span>
          </p>

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">
                1000+
              </span>
              <span className="hero-stat-label">Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">🎨 200+</span>
              <span className="hero-stat-label">Paint Items</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">🚰 180+</span>
              <span className="hero-stat-label">Sanitary Items</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">🔨 60+</span>
              <span className="hero-stat-label">Hardware Items</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={handleQuoteClick}>
              📋 Request a Quote
            </button>
            <a href="#catalog" className="hero-btn-secondary">Browse Catalog ↓</a>
          </div>
        </div>
        <div className="hero-blob hero-blob--1" />
        <div className="hero-blob hero-blob--2" />
        <div className="hero-blob hero-blob--3" />
      </header>

      {/* ── Floating cart badge ── */}
      {listItemCount > 0 && (
        <button className="float-badge" onClick={handleQuoteClick} title="Go to quotation form">
          📋
          <span className="float-badge-count">{listItemCount}</span>
          <span className="float-badge-label">items in list</span>
        </button>
      )}

      {/* ── Catalog ── */}
      <main className="catalog-main" id="catalog">

        {/* Loading skeleton */}
        {loading && (
          <div className="catalog-loading">
            <div className="catalog-loading-spinner">
              <span className="spinner" style={{ width: "32px", height: "32px", borderWidth: "3px" }} />
            </div>
            <p className="catalog-loading-text">Loading latest prices from database…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && loadError && (
          <div className="catalog-error">
            <span className="catalog-error-icon">⚠️</span>
            <h3>Could not load catalog</h3>
            <p>Backend server may be offline. Please try refreshing.</p>
            <button
              className="hero-btn-primary"
              style={{ marginTop: "1rem" }}
              onClick={() => window.location.reload()}
            >
              🔄 Retry
            </button>
          </div>
        )}

        {/* Live catalog sections */}
        {!loading && !loadError && (
          <>
            {products.length === 0 ? (
              <div className="catalog-error">
                <span className="catalog-error-icon">📭</span>
                <h3>No products yet</h3>
                <p>The admin hasn't added any products. Check back soon!</p>
              </div>
            ) : (
              CATEGORY_ORDER
                .filter((cat) => categorized[cat]?.length > 0)
                .map((cat) => (
                  <CatalogSection
                    key={cat}
                    category={cat}
                    items={categorized[cat]}
                    activeFilter={activeFilter}
                    onAdd={handleAddItem}
                    onEdit={handleEditItem}
                  />
                ))
            )}
          </>
        )}
      </main>

      {/* ── WhatsApp Quotation Form ── */}
      <QuotationForm
        ref={quotationRef}
        materialList={materialList}
        setMaterialList={setMaterialList}
      />

      {/* ── Customer Feedback Form ── */}
      <FeedbackForm />

      {/* ── Add / Edit Modal (For direct catalog editing) ── */}
      {editModal.open && (
        <ProductFormModal
          mode="edit"
          product={editModal.product}
          onClose={() => setEditModal({ open: false, product: null })}
          onSaved={(updated) => {
            setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
            setEditModal({ open: false, product: null });
          }}
        />
      )}

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

export default ShopPage;
