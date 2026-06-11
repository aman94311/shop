// ============================================================
//  components/forms/FeedbackForm.jsx — Sleek Customer Feedback Form
//  WITH: Interactive slow vertical auto-scroller for recent reviews
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { submitFeedback, fetchPublicFeedbacks } from "../../services/api";

const FeedbackForm = () => {
  const [message, setMessage]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");
  const [charCount, setCharCount]   = useState(0);

  const [publicFeedbacks, setPublicFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  const MAX_CHARS = 1000;
  const tickerRef = useRef(null);

  // ── Load public feedbacks ──────────────────────────────────
  const loadFeedbacks = async () => {
    try {
      const res = await fetchPublicFeedbacks();
      if (res.success) {
        setPublicFeedbacks(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // ── JS-based Slow Auto-Scrolling Loop ──────────────────────
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker || publicFeedbacks.length <= 2) return;

    let intervalId;

    const startScrolling = () => {
      intervalId = setInterval(() => {
        ticker.scrollTop += 1;
        // If we scroll past the end, reset back to 0
        if (ticker.scrollTop >= ticker.scrollHeight - ticker.clientHeight - 1) {
          ticker.scrollTop = 0;
        }
      }, 45); // 45ms per pixel is slow and readable
    };

    startScrolling();

    // Mouse listeners to pause/resume auto-scroll
    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => startScrolling();

    ticker.addEventListener("mouseenter", handleMouseEnter);
    ticker.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      if (ticker) {
        ticker.removeEventListener("mouseenter", handleMouseEnter);
        ticker.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [publicFeedbacks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please enter your feedback first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitFeedback(message.trim());
      if (res.success) {
        setSubmitted(true);
        setMessage("");
        setCharCount(0);
        loadFeedbacks(); // Instantly reload list to show user's new feedback!
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        setError(res.message || "Failed to submit feedback. Please try again.");
      }
    } catch {
      setError("Server error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setMessage(val);
      setCharCount(val.length);
      if (error) setError("");
    }
  };

  return (
    <section className="feedback-section" id="feedback-form">
      <div className="quotation-card" style={{ boxShadow: "var(--shadow-xl), 0 0 60px rgba(59,130,246,0.04)", maxWidth: "950px" }}>
        
        <div className="feedback-layout">
          {/* Left Column: Form */}
          <div className="feedback-form-col">
            {/* Header */}
            <div className="quotation-header" style={{ marginBottom: "1.5rem" }}>
              <div className="quotation-header-icon" style={{ backgroundColor: "rgba(96,165,250,0.1)", borderColor: "rgba(96,165,250,0.25)" }}>
                ✍️
              </div>
              <div>
                <h2 className="quotation-title">Feedback &amp; Suggestions</h2>
                <p className="quotation-subtitle">Help us improve! Send your ideas directly to our Admin.</p>
              </div>
            </div>

            {/* Success Banner */}
            {submitted && (
              <div className="success-banner" style={{ backgroundColor: "rgba(96,165,250,0.08)", borderColor: "rgba(96,165,250,0.25)", marginBottom: "1.25rem" }}>
                <span className="success-icon">✅</span>
                <div>
                  <strong style={{ color: "#60a5fa" }}>Feedback Submitted!</strong>
                  <p style={{ color: "var(--text-secondary)" }}>Thank you for sharing your thoughts with us.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="quotation-form">
              <div className="form-group">
                <label className="form-label" htmlFor="feedbackMessage">
                  💬 Message / Suggestions <span className="required">*</span>
                </label>
                <textarea
                  id="feedbackMessage"
                  className={`form-input form-textarea ${error ? "form-input--error" : ""}`}
                  style={{ minHeight: "110px" }}
                  placeholder="Tell us what you liked, what can be improved, or any features you would like to see..."
                  value={message}
                  onChange={handleTextChange}
                  disabled={submitting}
                />
                {error && <span className="form-error">⚠️ {error}</span>}
                <div className="textarea-footer">
                  <span className="char-count">{charCount} / {MAX_CHARS} characters</span>
                  {message && !submitting && (
                    <button type="button" className="clear-btn" onClick={() => { setMessage(""); setCharCount(0); }}>
                      🗑 Clear
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 4px 24px rgba(59,130,246,0.3)",
                  marginTop: "0.25rem",
                }}
                disabled={submitting || !message.trim()}
              >
                {submitting ? (
                  <>
                    <span className="spinner" />
                    <span>Submitting feedback…</span>
                  </>
                ) : (
                  <>
                    <span>📨</span>
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Scrolling feedbacks feed */}
          <div className="feedback-ticker-col">
            <h3 className="feedback-ticker-title">💬 What Others Are Saying</h3>

            {loadingFeedbacks ? (
              <div className="feedback-ticker-loading">
                <span className="spinner spinner--sm" /> Loading reviews...
              </div>
            ) : publicFeedbacks.length === 0 ? (
              <div className="feedback-ticker-empty">
                <p>Be the first to share your feedback!</p>
              </div>
            ) : (
              <div className="feedback-ticker-container" ref={tickerRef}>
                <div className="feedback-ticker-track">
                  {/* Show each feedback exactly once — NO duplicate repeats! */}
                  {publicFeedbacks.map((fb) => (
                    <div key={fb._id} className="feedback-ticker-card">
                      <div className="feedback-ticker-meta">
                        <span className="feedback-ticker-user">👤 {fb.username}</span>
                        <span className="feedback-ticker-date">
                          {new Date(fb.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                        </span>
                      </div>
                      <p className="feedback-ticker-msg">{fb.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeedbackForm;
