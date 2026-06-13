// ============================================================
//  src/components/admin/ProductFormModal.jsx
//  Add / Edit Product Modal
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, useEffect } from "react";
import { createProduct, updateProduct } from "../../services/api";

const EMPTY = { name: "", category: "paints", price: "", unit: "", description: "", tag: "", buyingPrice: "" };

const CATEGORY_OPTIONS = [
  { value: "paints",   label: "🎨 Asian Paints" },
  { value: "sanitary", label: "🚰 Sanitary & Pipes" },
  { value: "hardware", label: "🔨 General Hardware" },
];

const TAG_OPTIONS = ["Best Seller", "Popular", "Premium", "Economy", "New", ""];

const ProductFormModal = ({ mode, product, onClose, onSaved }) => {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (mode === "edit" && product) {
      setForm({
        name:        product.name        || "",
        category:    product.category    || "paints",
        price:       product.price       || "",
        unit:        product.unit        || "",
        description: product.description || "",
        tag:         product.tag         || "",
        buyingPrice: product.buyingPrice || "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
    setApiError("");
  }, [mode, product]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Product name is required.";
    if (!form.price.trim()) e.price = "Price is required.";
    if (!form.unit.trim())  e.unit  = "Unit is required.";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    setApiError("");

    const payload = {
      name:        form.name.trim(),
      category:    form.category,
      price:       form.price.trim(),
      unit:        form.unit.trim(),
      description: form.description.trim(),
      tag:         form.tag.trim() || null,
      buyingPrice: form.buyingPrice.trim(),
    };

    try {
      let res;
      if (mode === "edit") {
        res = await updateProduct(product._id, payload);
      } else {
        res = await createProduct(payload);
      }

      if (res.success) {
        onSaved(res.data, mode);
      } else {
        setApiError(res.message || "Operation failed.");
      }
    } catch {
      setApiError("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === "add" ? "➕ Add New Product" : "✏️ Edit Product"}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {apiError && <div className="admin-alert admin-alert--error">⚠️ {apiError}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Category */}
          <div className="admin-form-group">
            <label className="admin-label">Category *</label>
            <div className="admin-seg-group">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`admin-seg-btn admin-seg-btn--${opt.value} ${form.category === opt.value ? "admin-seg-btn--active" : ""}`}
                  onClick={() => handleChange("category", opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="pf-name">Product Name *</label>
            <input
              id="pf-name"
              type="text"
              className={`admin-input ${errors.name ? "admin-input--error" : ""}`}
              placeholder='e.g. Asian Paints Tractor Emulsion 20L'
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && <span className="admin-field-error">{errors.name}</span>}
          </div>

          {/* Selling Price + Buying Price row */}
          <div className="modal-row">
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="pf-price">Selling Price *</label>
              <input
                id="pf-price"
                type="text"
                className={`admin-input ${errors.price ? "admin-input--error" : ""}`}
                placeholder="e.g. ₹2,850"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
              />
              {errors.price && <span className="admin-field-error">{errors.price}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="pf-buying-price">Buying Price (Admin Only)</label>
              <input
                id="pf-buying-price"
                type="text"
                className="admin-input"
                placeholder="e.g. ₹2,000"
                value={form.buyingPrice}
                onChange={(e) => handleChange("buyingPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Unit */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="pf-unit">Unit *</label>
            <input
              id="pf-unit"
              type="text"
              className={`admin-input ${errors.unit ? "admin-input--error" : ""}`}
              placeholder="e.g. 20L Bucket, Per Piece, 6 Meter Length"
              value={form.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
            />
            {errors.unit && <span className="admin-field-error">{errors.unit}</span>}
          </div>

          {/* Description */}
          <div className="admin-form-group">
            <label className="admin-label" htmlFor="pf-desc">Description</label>
            <input
              id="pf-desc"
              type="text"
              className="admin-input"
              placeholder="Short description (optional)"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Tag */}
          <div className="admin-form-group">
            <label className="admin-label">Badge / Tag</label>
            <div className="admin-tag-group">
              {TAG_OPTIONS.map((t) => (
                <button
                  type="button"
                  key={t || "none"}
                  className={`admin-tag-opt ${form.tag === t ? "admin-tag-opt--active" : ""}`}
                  onClick={() => handleChange("tag", t)}
                >
                  {t || "None"}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className={`admin-btn admin-btn--primary`} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving…</> : mode === "add" ? "Add Product" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
