// ============================================================
//  components/catalog/ColorExplorer.jsx — Paint Color Visualizer
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState, useMemo } from "react";
import { COLOR_FAMILIES, COLOR_SHADES } from "../../data/colors";

const PAINT_TYPES = [
  { id: "Royale Glitz", name: "Royale Glitz (Ultra-Premium Sheen)", priceMultiplier: 1.8 },
  { id: "Royale Luxury", name: "Royale Luxury Emulsion (Premium Sheen)", priceMultiplier: 1.4 },
  { id: "Tractor Emulsion", name: "Tractor Emulsion (Washable Matte)", priceMultiplier: 0.8 },
  { id: "Apex Exterior", name: "Apex Exterior Emulsion (Weatherproof)", priceMultiplier: 1.2 },
  { id: "Apex Ultima", name: "Apex Ultima (Dustproof Exterior)", priceMultiplier: 1.6 },
];

const BUCKET_SIZES = ["1L", "4L", "10L", "20L"];

const ColorExplorer = ({ onAdd }) => {
  const [activeFamily, setActiveFamily] = useState("reds");
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_SHADES.find((s) => s.family === "reds"));
  
  // Customization state
  const [paintType, setPaintType]       = useState("Royale Luxury");
  const [bucketSize, setBucketSize]     = useState("4L");
  const [quantity, setQuantity]         = useState(1);
  const [added, setAdded]               = useState(false);

  // ── Filter shades based on search & family ──────────────────
  const filteredShades = useMemo(() => {
    return COLOR_SHADES.filter((shade) => {
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        // If searching, ignore family filter and search globally
        return (
          shade.name.toLowerCase().includes(q) ||
          shade.code.includes(q) ||
          COLOR_FAMILIES[shade.family]?.label.toLowerCase().includes(q)
        );
      }
      return shade.family === activeFamily;
    });
  }, [activeFamily, searchQuery]);

  // Handle color click
  const handleSelectColor = (color) => {
    setSelectedColor(color);
  };

  // Handle quantity modification
  const adjustQty = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  // Add customized color to catalog inquiry list
  const handleAddColor = () => {
    if (!selectedColor) return;

    const customItem = {
      name: `Asian Paints ${paintType} [Shade: ${selectedColor.name} #${selectedColor.code}]`,
      unit: `${bucketSize} Bucket x ${quantity}`,
    };

    onAdd(customItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="color-explorer">
      {/* ── Heading ── */}
      <div className="color-explorer-intro">
        <h3 className="color-explorer-title">🎨 Asian Paints Wall Color Explorer</h3>
        <p className="color-explorer-sub">
          Browse 120+ authentic color shades, visualize them on a wall, select your finish, and add it to your quotation list.
        </p>
      </div>

      {/* ── Core Visualizer & Control Layout ── */}
      <div className="color-explorer-grid">
        
        {/* Left: SVG Room Visualizer */}
        <div className="visualizer-preview-card">
          <div className="visualizer-room-wrap">
            <svg
              viewBox="0 0 800 500"
              className="visualizer-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Floor Gradient */}
                <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8D6E63" />
                  <stop offset="30%" stopColor="#5D4037" />
                  <stop offset="100%" stopColor="#3E2723" />
                </linearGradient>

                {/* Wall Shadow Gradient */}
                <linearGradient id="wallShadow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="black" stopOpacity="0.3" />
                  <stop offset="15%" stopColor="black" stopOpacity="0.05" />
                  <stop offset="85%" stopColor="black" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="black" stopOpacity="0.35" />
                </linearGradient>

                {/* Lamp Light Gradient */}
                <linearGradient id="lampLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFE082" stopOpacity="0.55" />
                  <stop offset="40%" stopColor="#FFD54F" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FFCA28" stopOpacity="0.0" />
                </linearGradient>

                {/* Sun Light Gradient */}
                <linearGradient id="sunLight" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#FFF9C4" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* 1. Main Background Wall (linked to selected color) */}
              <rect
                x="0"
                y="0"
                width="800"
                height="400"
                fill={selectedColor ? selectedColor.hex : "#ECEFF1"}
                className="visualizer-wall"
                style={{ transition: "fill 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />

              {/* Wall shading (corners & bottom shadow) */}
              <rect x="0" y="0" width="800" height="400" fill="url(#wallShadow)" opacity="0.6" pointerEvents="none" />

              {/* 2. Floor */}
              <rect x="0" y="400" width="800" height="100" fill="url(#floorGrad)" />
              {/* Floor highlight line */}
              <line x1="0" y1="400" x2="800" y2="400" stroke="#4E342E" strokeWidth="2" />

              {/* 3. Baseboard (Skirting) */}
              <rect x="0" y="388" width="800" height="12" fill="#CFD8DC" />
              <line x1="0" y1="388" x2="800" y2="388" stroke="#90A4AE" strokeWidth="1" />
              <line x1="0" y1="399" x2="800" y2="399" stroke="#78909C" strokeWidth="1" />

              {/* 4. Sunlight Ray from Left Window */}
              <polygon points="50,40 160,110 320,388 150,388" fill="url(#sunLight)" opacity="0.4" pointerEvents="none" />

              {/* 5. Window on the Left Wall */}
              <g id="window-layer">
                {/* Outer Frame */}
                <rect x="40" y="40" width="120" height="240" fill="none" stroke="#263238" strokeWidth="6" rx="2" />
                {/* Glass (Semi-transparent backdrop) */}
                <rect x="43" y="43" width="114" height="234" fill="#E0F7FA" opacity="0.25" />
                {/* Grids */}
                <line x1="100" y1="43" x2="100" y2="277" stroke="#263238" strokeWidth="3" />
                <line x1="43" y1="120" x2="157" y2="120" stroke="#263238" strokeWidth="3" />
                <line x1="43" y1="200" x2="157" y2="200" stroke="#263238" strokeWidth="3" />
              </g>

              {/* 6. Artwork Frame in Center */}
              <g id="artwork-frame">
                {/* Shadow */}
                <rect x="352" y="52" width="126" height="136" fill="black" opacity="0.2" rx="4" />
                {/* Frame border */}
                <rect x="350" y="50" width="120" height="130" fill="#ECEFF1" stroke="#212121" strokeWidth="5" rx="3" />
                {/* Mat board */}
                <rect x="360" y="60" width="100" height="110" fill="#FFFFFF" />
                {/* Abstract Painting */}
                <rect x="370" y="70" width="80" height="90" fill="#F5F5F5" />
                <circle cx="410" cy="110" r="24" fill="#FF8F00" opacity="0.8" />
                <polygon points="370,160 410,115 440,160" fill="#37474F" />
                <polygon points="390,160 425,125 450,160" fill="#546E7A" opacity="0.9" />
              </g>

              {/* 7. Modern Minimalist Couch */}
              <g id="couch-layer">
                {/* Couch Shadow on Floor */}
                <ellipse cx="400" cy="405" rx="190" ry="12" fill="black" opacity="0.4" />

                {/* Wooden legs */}
                <line x1="240" y1="365" x2="225" y2="395" stroke="#3E2723" strokeWidth="7" strokeLinecap="round" />
                <line x1="560" y1="365" x2="575" y2="395" stroke="#3E2723" strokeWidth="7" strokeLinecap="round" />

                {/* Main Couch Base */}
                <rect x="230" y="335" width="340" height="40" rx="6" fill="#37474F" />

                {/* Backrest Cushions */}
                <rect x="235" y="240" width="160" height="100" rx="12" fill="#263238" />
                <rect x="405" y="240" width="160" height="100" rx="12" fill="#263238" />

                {/* Seat Cushions */}
                <rect x="235" y="310" width="162" height="35" rx="10" fill="#455A64" />
                <rect x="403" y="310" width="162" height="35" rx="10" fill="#455A64" />

                {/* Left Armrest */}
                <rect x="210" y="280" width="30" height="80" rx="8" fill="#1A202C" />

                {/* Right Armrest */}
                <rect x="560" y="280" width="30" height="80" rx="8" fill="#1A202C" />

                {/* Accent Pillows */}
                {/* Left Pillow (Ivory) */}
                <rect
                  x="250"
                  y="280"
                  width="50"
                  height="45"
                  rx="6"
                  fill="#ECEFF1"
                  transform="rotate(-12 250 280)"
                  stroke="#CFD8DC"
                  strokeWidth="1"
                />
                {/* Right Pillow (Golden Yellow Accent) */}
                <rect
                  x="490"
                  y="275"
                  width="50"
                  height="45"
                  rx="6"
                  fill="#FFC107"
                  transform="rotate(15 490 275)"
                  stroke="#FFB300"
                  strokeWidth="1"
                />
              </g>

              {/* 8. Floor Lamp casting light */}
              <g id="floor-lamp">
                {/* Light ray cone */}
                <polygon points="650,115 540,388 760,388" fill="url(#lampLight)" opacity="0.32" style={{ mixBlendMode: "screen" }} pointerEvents="none" />

                {/* Base */}
                <ellipse cx="710" cy="420" rx="22" ry="5" fill="#212121" />

                {/* Stem */}
                <path d="M710,420 L710,180" stroke="#212121" strokeWidth="5" strokeLinecap="round" />
                {/* Arc */}
                <path d="M710,180 C710,130 680,110 650,110" fill="none" stroke="#212121" strokeWidth="4" />

                {/* Lamp Shade */}
                <polygon points="635,110 665,110 672,130 628,130" fill="#37474F" stroke="#212121" strokeWidth="1" />
                
                {/* Light Source Bulb Glow */}
                <circle cx="650" cy="132" r="8" fill="#FFF59D" filter="drop-shadow(0 0 6px #FFF)" />
              </g>

              {/* 9. Potted Plant on Floor */}
              <g id="potted-plant">
                {/* Pot shadow */}
                <ellipse cx="140" cy="425" rx="18" ry="4" fill="black" opacity="0.3" />
                {/* Ceramic Pot */}
                <polygon points="125,385 155,385 150,425 130,425" fill="#FFF" stroke="#CFD8DC" strokeWidth="2" />
                
                {/* Stems & Leaves */}
                {/* Stem 1 */}
                <path d="M140,385 Q120,350 100,340" fill="none" stroke="#2E7D32" strokeWidth="3" />
                <path d="M100,340 C80,335 70,350 65,360 C75,370 95,355 100,340 Z" fill="#388E3C" />
                
                {/* Stem 2 */}
                <path d="M140,385 Q150,335 170,310" fill="none" stroke="#2E7D32" strokeWidth="3" />
                <path d="M170,310 C185,295 200,305 205,315 C195,325 180,325 170,310 Z" fill="#2E7D32" />

                {/* Stem 3 (Center Leaf) */}
                <path d="M140,385 Q135,330 138,295" fill="none" stroke="#2E7D32" strokeWidth="3.5" />
                <path d="M138,295 C125,275 140,260 148,270 C150,285 145,290 138,295 Z" fill="#4CAF50" />
              </g>

              {/* 10. Frame Glass shine reflection overlay */}
              <path d="M0,0 L180,0 L0,180 Z" fill="#FFF" opacity="0.03" pointerEvents="none" />
            </svg>

            {/* Floating indicator inside room preview */}
            {selectedColor && (
              <div className="visualizer-current-pill">
                <span className="current-color-dot" style={{ backgroundColor: selectedColor.hex }} />
                <span className="current-color-text">
                  <strong>{selectedColor.name}</strong> ({selectedColor.code})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Configure & Add to Quotation */}
        <div className="color-configure-card">
          <h4 className="config-card-title">⚙️ Configure Paint Order</h4>
          
          <div className="config-form">
            {/* Selected Shade Details */}
            <div className="selected-shade-box">
              <span className="shade-box-label">Selected Color</span>
              <div className="shade-box-display">
                <div 
                  className="shade-box-preview" 
                  style={{ backgroundColor: selectedColor ? selectedColor.hex : "#transparent" }}
                />
                <div className="shade-box-info">
                  <div className="shade-box-name">{selectedColor ? selectedColor.name : "Select a color"}</div>
                  <div className="shade-box-code">Shade Code: {selectedColor ? selectedColor.code : "—"}</div>
                </div>
              </div>
            </div>

            {/* 1. Select Paint Finish */}
            <div className="config-group">
              <label className="config-label" htmlFor="paint-type-select">Paint Finish / Quality</label>
              <select
                id="paint-type-select"
                className="config-select"
                value={paintType}
                onChange={(e) => setPaintType(e.target.value)}
              >
                {PAINT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Size + Quantity */}
            <div className="config-row">
              <div className="config-group">
                <label className="config-label">Bucket Size</label>
                <div className="size-selector-grid">
                  {BUCKET_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      className={`size-btn ${bucketSize === sz ? "size-btn--active" : ""}`}
                      onClick={() => setBucketSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="config-group" style={{ maxWidth: "130px" }}>
                <label className="config-label">Quantity</label>
                <div className="qty-counter">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => adjustQty(-1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="qty-val">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => adjustQty(1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Add to List CTA Button */}
            <button
              type="button"
              className={`color-add-cta-btn ${added ? "color-add-cta-btn--added" : ""}`}
              onClick={handleAddColor}
              disabled={!selectedColor}
            >
              {added ? (
                <>
                  <span>✓</span>
                  <span>Shade Added to Inquiry!</span>
                </>
              ) : (
                <>
                  <span>➕</span>
                  <span>Add Shade to Materials List</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Color Palette Browser ── */}
      <div className="color-palette-browser">
        <div className="palette-header">
          <h4 className="palette-title">🎨 Select a Shade</h4>
          
          {/* Search Input */}
          <div className="palette-search">
            <span className="palette-search-icon">🔍</span>
            <input
              type="text"
              className="palette-search-input"
              placeholder="Search by shade name or 4-digit code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="palette-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Family Tabs (only shown when not searching) */}
        {!searchQuery && (
          <div className="family-tabs">
            {Object.entries(COLOR_FAMILIES).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                className={`family-tab ${activeFamily === key ? "family-tab--active family-tab--" + key : ""}`}
                onClick={() => {
                  setActiveFamily(key);
                  // Auto-select first color in that family
                  const firstColor = COLOR_SHADES.find((s) => s.family === key);
                  if (firstColor) setSelectedColor(firstColor);
                }}
              >
                {meta.label}
              </button>
            ))}
          </div>
        )}

        {searchQuery && (
          <div className="palette-search-results-info">
            Found <strong>{filteredShades.length}</strong> matching shades for "{searchQuery}"
          </div>
        )}

        {/* Color Grid */}
        <div className="colors-grid-container">
          {filteredShades.length > 0 ? (
            <div className="colors-shades-grid">
              {filteredShades.map((shade) => {
                const isSelected = selectedColor && selectedColor.code === shade.code;
                return (
                  <button
                    key={shade.code}
                    type="button"
                    className={`shade-card ${isSelected ? "shade-card--selected" : ""}`}
                    onClick={() => handleSelectColor(shade)}
                    title={`${shade.name} (#${shade.code})`}
                  >
                    <div
                      className="shade-card-color-preview"
                      style={{ backgroundColor: shade.hex }}
                    />
                    <div className="shade-card-meta">
                      <span className="shade-card-name">{shade.name}</span>
                      <span className="shade-card-code">{shade.code}</span>
                    </div>
                    {isSelected && <span className="shade-card-badge">✓</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="palette-empty-state">
              <span>📭</span>
              <p>No shades matching "{searchQuery}" found.</p>
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorExplorer;
