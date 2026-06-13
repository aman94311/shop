// ============================================================
//  components/forms/QuotationForm.jsx — WhatsApp Quotation Form
//  WITH: Image Upload + Client-side Compression + Cloudinary
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, forwardRef, useRef, useCallback } from "react";
import { logInquiry, uploadImage } from "../../services/api";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "";

// ── Client-side image compression via Canvas ───────────────
const compressImage = (file, maxWidthPx = 1200, qualityVal = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (evt) => {
      const img = new Image();
      img.src = evt.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidthPx) {
          height = Math.round((height * maxWidthPx) / width);
          width = maxWidthPx;
        }

        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          qualityVal
        );
      };
    };
  });
};

// ── Build WhatsApp message ─────────────────────────────────
const buildWhatsAppMessage = ({ customerName, mobileNumber, siteAddress, materialList, imageUrl }) => {
  const lines = materialList
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("-") ? l : `- ${l}`))
    .join("\n");

  let msg =
    `*--- नया कोटेशन अनुरोध ---*\n\n` +
    `*नाम:* ${customerName}\n` +
    `*फ़ोन:* ${mobileNumber}\n` +
    `*पता:* ${siteAddress}\n\n` +
    `*सामान की लिस्ट:*\n${lines}`;

  if (imageUrl) {
    msg += `\n\n*पर्ची की फोटो:* ${imageUrl}`;
  }

  msg += `\n\n_via Abhi Sanitary & Hardware Catalog_`;
  return msg;
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ──────────────────────────────────────────────────────────
const QuotationForm = forwardRef(({ materialList, setMaterialList }, ref) => {
  const [formData, setFormData] = useState({ customerName: "", mobileNumber: "", siteAddress: "" });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // Image upload state
  const [imageFile, setImageFile]         = useState(null);       // compressed File object
  const [imagePreview, setImagePreview]   = useState(null);       // data-url for preview
  const [imageSize, setImageSize]         = useState(null);       // { original, compressed }
  const [uploadStatus, setUploadStatus]   = useState("idle");     // idle | compressing | uploading | done | error
  const [uploadedUrl, setUploadedUrl]     = useState(null);
  const [dragOver, setDragOver]           = useState(false);
  const fileInputRef = useRef();
  const linkRef = useRef(null);

  // ── Validation ─────────────────────────────────────────
  const validate = () => {
    const e = {};
    const safeName = (formData.customerName || "").trim();
    const safeMobile = (formData.mobileNumber || "").trim();
    const safeAddress = (formData.siteAddress || "").trim();
    const safeList = (materialList || "").trim();

    if (!safeName) e.customerName = "नाम / Name is required";
    if (!safeMobile) e.mobileNumber = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(safeMobile)) e.mobileNumber = "Enter a valid 10-digit Indian mobile number";
    if (!safeAddress) e.siteAddress = "Site address is required";
    if (!safeList) e.materialList = "Please add at least one item or type your requirements";
    return e;
  };

  // ── Handle file pick ───────────────────────────────────
  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const origSize = file.size;
    setUploadStatus("compressing");
    setImagePreview(null);
    setUploadedUrl(null);

    const compressed = await compressImage(file, 1200, 0.80);
    const compSize   = compressed.size;

    setImageFile(compressed);
    setImageSize({ original: origSize, compressed: compSize });
    setUploadStatus("idle");

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(compressed);
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageSize(null);
    setUploadedUrl(null);
    setUploadStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setSubmitting(true);
    let finalImageUrl = null;

    // Step 1: Upload image to Cloudinary via backend
    if (imageFile && !uploadedUrl) {
      setUploadStatus("uploading");
      try {
        const res = await uploadImage(imageFile);
        if (res.success) {
          finalImageUrl = res.url;
          setUploadedUrl(res.url);
          setUploadStatus("done");
        } else {
          setUploadStatus("error");
          console.warn("Image upload failed:", res.message);
          // Non-blocking — proceed without image
        }
      } catch {
        setUploadStatus("error");
        console.warn("Image upload error — skipping.");
      }
    } else if (uploadedUrl) {
      finalImageUrl = uploadedUrl;
    }

    const nameVal = (formData.customerName || "").trim();
    const mobileVal = (formData.mobileNumber || "").trim();
    const addressVal = (formData.siteAddress || "").trim();
    const listVal = (materialList || "").trim();

    // Step 2: Log inquiry to backend (fire and forget)
    try {
      await logInquiry({
        customerName:  nameVal,
        mobileNumber:  mobileVal,
        siteAddress:   addressVal,
        materialList:  listVal,
      });
    } catch {
      console.warn("Backend log failed — continuing to WhatsApp.");
    }

    // Step 3: Build + encode WhatsApp message
    const message = buildWhatsAppMessage({
      customerName:  nameVal,
      mobileNumber:  mobileVal,
      siteAddress:   addressVal,
      materialList:  listVal,
      imageUrl:      finalImageUrl,
    });

    // Detect if running inside a mobile WebView (the wrapper app) versus a regular web browser
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroidWebView = 
      (typeof window.AppInventor !== "undefined") || // 100% accurate MIT App Inventor WebView check
      /wv|WebView/i.test(userAgent) || 
      (/Android/i.test(userAgent) && /Version\/[0-9.]+/i.test(userAgent));

    // Construct the WhatsApp URL. For Android WebViews, use intent:// to bypass browser sandboxing 
    // and launch WhatsApp directly. For regular web browsers, use the standard HTTPS API.
    const targetUrl = isAndroidWebView
      ? `intent://send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}#Intent;scheme=whatsapp;package=com.whatsapp;end`
      : `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    
    let redirectSuccess = false;

    // Attempt 1: Programmatic click on hidden anchor tag with target="_blank"
    // This is the safest way in WebViews to trigger external app intent or open system browser
    if (linkRef.current) {
      try {
        linkRef.current.href = targetUrl;
        linkRef.current.click();
        redirectSuccess = true;
      } catch (e) {
        console.warn("Hidden link click failed:", e);
      }
    }

    // Attempt 2: Fallback to window.open if anchor click failed
    if (!redirectSuccess) {
      try {
        const opened = window.open(targetUrl, "_blank", "noopener,noreferrer");
        if (opened) {
          redirectSuccess = true;
        }
      } catch (e) {
        console.warn("window.open failed:", e);
      }
    }

    // Attempt 3: Final fallback to window.location.href
    if (!redirectSuccess) {
      try {
        window.location.href = targetUrl;
      } catch (e) {
        console.error("All redirection methods failed:", e);
      }
    }

    setSubmitted(true);
    setSubmitting(false);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({ customerName: "", mobileNumber: "", siteAddress: "" });
      setMaterialList("");
      setErrors({});
      removeImage();
    }, 4000);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <section className="quotation-section" ref={ref} id="quotation-form">
      <div className="quotation-card">

        {/* Header */}
        <div className="quotation-header">
          <div className="quotation-header-icon">💬</div>
          <div>
            <h2 className="quotation-title">Get a WhatsApp Quote</h2>
            <p className="quotation-subtitle">Fill in your details &amp; send directly to our WhatsApp</p>
          </div>
        </div>

        {/* Success Banner */}
        {submitted && (
          <div className="success-banner">
            <span className="success-icon">✅</span>
            <div>
              <strong>Quote Sent on WhatsApp!</strong>
              <p>We'll get back to you shortly. Form resets in a moment…</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="quotation-form">

          {/* Name + Mobile */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="customerName">
                👤 Customer / Contractor Name <span className="required">*</span>
              </label>
              <input id="customerName" name="customerName" type="text"
                className={`form-input ${errors.customerName ? "form-input--error" : ""}`}
                placeholder="e.g. Ramesh Sharma"
                value={formData.customerName} onChange={handleChange} autoComplete="name" />
              {errors.customerName && <span className="form-error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobileNumber">
                📱 Mobile Number <span className="required">*</span>
              </label>
              <input id="mobileNumber" name="mobileNumber" type="tel"
                className={`form-input ${errors.mobileNumber ? "form-input--error" : ""}`}
                placeholder="10-digit mobile number"
                value={formData.mobileNumber} onChange={handleChange}
                maxLength={10} inputMode="numeric" autoComplete="tel" />
              {errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="siteAddress">
              📍 Delivery / Site Address <span className="required">*</span>
            </label>
            <input id="siteAddress" name="siteAddress" type="text"
              className={`form-input ${errors.siteAddress ? "form-input--error" : ""}`}
              placeholder="e.g. Plot 12, Sector 4, Noida"
              value={formData.siteAddress} onChange={handleChange} autoComplete="street-address" />
            {errors.siteAddress && <span className="form-error">{errors.siteAddress}</span>}
          </div>

          {/* Material List */}
          <div className="form-group">
            <label className="form-label" htmlFor="materialList">
              📋 Material Requirements List <span className="required">*</span>
            </label>
            <p className="form-hint">Items added from catalog appear below. You can also type freely.</p>
            <textarea id="materialList" name="materialList"
              className={`form-textarea ${errors.materialList ? "form-input--error" : ""}`}
              rows={7}
              placeholder={"- CPVC Pipe ½\" 6m: 10 pcs\n- Asian Paints Tractor 20L: 2 buckets\n- Or type your own…"}
              value={materialList}
              onChange={(e) => { setMaterialList(e.target.value); if (errors.materialList) setErrors((p) => ({ ...p, materialList: "" })); }}
            />
            {errors.materialList && <span className="form-error">{errors.materialList}</span>}
            <div className="textarea-footer">
              <span className="char-count">{(materialList || "").length} characters</span>
              {(materialList || "") && <button type="button" className="clear-btn" onClick={() => setMaterialList("")}>🗑 Clear List</button>}
            </div>
          </div>

          {/* ── IMAGE UPLOAD ─────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">
              📷 Upload Parchi / Site Photo <span className="form-label-optional">(Optional)</span>
            </label>
            <p className="form-hint">
              Plumber/painter can upload a handwritten parchi or site photo — it will appear as a link in the WhatsApp message.
            </p>

            {/* Drop zone — shown when no image picked */}
            {!imagePreview && (
              <div
                className={`upload-dropzone ${dragOver ? "upload-dropzone--active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <div className="upload-dropzone-inner">
                  {uploadStatus === "compressing" ? (
                    <><span className="spinner" /> <span>Compressing image…</span></>
                  ) : (
                    <>
                      <span className="upload-icon">📁</span>
                      <p className="upload-text">
                        <strong>Click to upload</strong> or drag &amp; drop
                      </p>
                      <p className="upload-sub">JPG, PNG, WebP — Max 10 MB (auto-compressed)</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Preview — shown when image picked */}
            {imagePreview && (
              <div className="upload-preview-wrap">
                <div className="upload-preview">
                  <img src={imagePreview} alt="Selected parchi" className="upload-preview-img" />
                  <div className="upload-preview-info">
                    <div className="upload-preview-name">{imageFile?.name}</div>
                    {imageSize && (
                      <div className="upload-preview-size">
                        Original: {formatBytes(imageSize.original)} →
                        Compressed: <strong>{formatBytes(imageSize.compressed)}</strong>
                        {" "}
                        <span className="upload-saved">
                          ({Math.round((1 - imageSize.compressed / imageSize.original) * 100)}% saved)
                        </span>
                      </div>
                    )}

                    {/* Upload status */}
                    {uploadStatus === "uploading" && (
                      <div className="upload-status upload-status--uploading">
                        <span className="spinner spinner--sm" /> Uploading to cloud…
                      </div>
                    )}
                    {uploadStatus === "done" && (
                      <div className="upload-status upload-status--done">✅ Uploaded — link will be added to WhatsApp message</div>
                    )}
                    {uploadStatus === "error" && (
                      <div className="upload-status upload-status--error">⚠️ Upload failed — message will be sent without image</div>
                    )}

                    <div className="upload-preview-actions">
                      <button type="button" className="upload-change-btn" onClick={() => fileInputRef.current?.click()}>
                        🔄 Change Photo
                      </button>
                      <button type="button" className="upload-remove-btn" onClick={removeImage}>
                        🗑 Remove
                      </button>
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className={`submit-btn ${submitting ? "submit-btn--loading" : ""}`} disabled={submitting || submitted}>
            {submitting ? (
              <><span className="spinner" /><span>{uploadStatus === "uploading" ? "Uploading photo…" : "Preparing message…"}</span></>
            ) : submitted ? (
              <><span>✅</span><span>Sent on WhatsApp!</span></>
            ) : (
              <><span>📲</span><span>Send Quote on WhatsApp</span></>
            )}
          </button>

          <p className="form-disclaimer">
            By submitting, you'll be redirected to WhatsApp with your quotation pre-filled.
            {imageFile && " Your photo will be securely uploaded to cloud storage."}
          </p>
          {/* Hidden anchor tag for WebView compatibility */}
          <a
            ref={linkRef}
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "none" }}
          />
        </form>
      </div>
    </section>
  );
});

QuotationForm.displayName = "QuotationForm";
export default QuotationForm;
