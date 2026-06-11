// ============================================================
//  components/admin/BannerControl.jsx — Admin Banner Settings Panel
//  Live edit banner text + toggle active/inactive
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, useEffect } from "react";
import { fetchBannerSettings, updateBannerSettings } from "../../services/api";

const BannerControl = () => {
  const [text, setText]           = useState("");
  const [isActive, setIsActive]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 300;

  // ── Load current settings ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchBannerSettings();
        if (res.success) {
          setText(res.banner_text || "");
          setIsActive(res.is_banner_active);
          setCharCount((res.banner_text || "").length);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!text.trim()) {
      showToast("Banner text cannot be empty.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await updateBannerSettings({ banner_text: text.trim(), is_banner_active: isActive });
      if (res.success) {
        showToast("✅ Banner updated! Changes are live on the shop.");
      } else {
        showToast(res.message || "Update failed.", "error");
      }
    } catch {
      showToast("Server error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle only (quick save) ──────────────────────────────
  const handleToggle = async () => {
    const newState = !isActive;
    setIsActive(newState);
    try {
      await updateBannerSettings({ is_banner_active: newState });
      showToast(newState ? "📢 Banner is now LIVE on shop!" : "🔕 Banner hidden from shop.");
    } catch {
      // Revert on failure
      setIsActive(!newState);
      showToast("Toggle failed. Please try again.", "error");
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setText(val);
      setCharCount(val.length);
    }
  };

  if (loading) return (
    <div className="banner-control-card banner-control-loading">
      <span className="spinner spinner--sm" /> Loading banner settings…
    </div>
  );

  return (
    <div className="banner-control-card">
      {/* Toast */}
      {toast && (
        <div className={`banner-toast banner-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="banner-control-header">
        <div className="banner-control-header-left">
          <span className="banner-control-icon">📢</span>
          <div>
            <h3 className="banner-control-title">Discount Announcement Banner</h3>
            <p className="banner-control-sub">
              Appears at the very top of the shop website for all visitors
            </p>
          </div>
        </div>

        {/* ON / OFF Toggle */}
        <div className="banner-toggle-wrap">
          <span className="banner-toggle-label">
            {isActive ? "🟢 LIVE" : "🔴 Hidden"}
          </span>
          <button
            className={`banner-toggle ${isActive ? "banner-toggle--on" : "banner-toggle--off"}`}
            onClick={handleToggle}
            title={isActive ? "Click to hide banner" : "Click to show banner"}
            aria-pressed={isActive}
          >
            <span className="banner-toggle-knob" />
          </button>
        </div>
      </div>

      {/* Preview */}
      {text.trim() && (
        <div className={`banner-preview ${!isActive ? "banner-preview--inactive" : ""}`}>
          <div className="banner-preview-label">
            {isActive ? "👁️ Live Preview" : "👁️ Preview (hidden from shop)"}
          </div>
          <div className="banner-preview-bar">
            <span>{text} ✦ {text} ✦ {text}</span>
          </div>
        </div>
      )}

      {/* Text input */}
      <div className="banner-input-group">
        <label className="admin-label" htmlFor="banner-text-input">
          Announcement Text
        </label>
        <textarea
          id="banner-text-input"
          className="admin-input banner-textarea"
          rows={3}
          placeholder='e.g. "🎉 Monsoon Sale: 15% OFF on all CPVC Pipes today only!"'
          value={text}
          onChange={handleTextChange}
        />
        <div className="banner-char-row">
          <span className="banner-quick-label">💡 Quick Examples:</span>
          <div className="banner-quick-tags">
            {[
              "🔥 10% OFF on Asian Paints this week!",
              "🚰 CPVC Pipes: Buy 10 get 1 FREE!",
              "🎉 Monsoon Sale: 15% OFF on Hardware!",
              "⚡ Special rate on Supreme Pipes today!",
            ].map((t) => (
              <button
                key={t}
                type="button"
                className="banner-quick-tag"
                onClick={() => { setText(t); setCharCount(t.length); }}
              >
                {t}
              </button>
            ))}
          </div>
          <span className={`banner-char-count ${charCount > MAX_CHARS * 0.85 ? "banner-char-count--warn" : ""}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Save button */}
      <button
        className="admin-btn admin-btn--primary banner-save-btn"
        onClick={handleSave}
        disabled={saving || !text.trim()}
      >
        {saving ? <><span className="spinner" /> Saving…</> : "💾 Save & Go Live"}
      </button>
    </div>
  );
};

export default BannerControl;
