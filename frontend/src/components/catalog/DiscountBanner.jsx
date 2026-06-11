// ============================================================
//  components/catalog/DiscountBanner.jsx — Live Discount Announcement Bar
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useEffect, useState } from "react";
import { fetchBannerSettings } from "../../services/api";

const DiscountBanner = () => {
  const [banner, setBanner]   = useState(null);   // null = still loading
  const [visible, setVisible] = useState(true);   // X button dismiss

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetchBannerSettings();
        if (!cancelled && res.success) {
          setBanner({
            text:   res.banner_text,
            active: res.is_banner_active,
          });
        }
      } catch {
        // Silently hide — don't break the page
        if (!cancelled) setBanner({ text: "", active: false });
      }
    };

    load();

    // Poll every 60 seconds so live updates appear without hard refresh
    const interval = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Nothing to show yet or dismissed or inactive
  if (!banner || !banner.active || !visible || !banner.text.trim()) return null;

  // Duplicate text for seamless marquee loop
  const marqueePairs = [banner.text, banner.text, banner.text];

  return (
    <div className="discount-banner" role="banner" aria-label="Discount announcement">
      {/* Marquee track */}
      <div className="discount-banner-track" aria-hidden="false">
        <div className="discount-banner-inner">
          {marqueePairs.map((txt, i) => (
            <span key={i} className="discount-banner-segment">
              {txt}
              <span className="discount-banner-dot" aria-hidden="true">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        className="discount-banner-close"
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default DiscountBanner;
