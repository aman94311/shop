// ============================================================
//  components/catalog/CatalogSection.jsx — Category Section Wrapper
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState } from "react";
import ProductCard from "./ProductCard";

const SECTION_META = {
  paints: {
    emoji:    "🎨",
    title:    "Asian Paints",
    subtitle: "Interior · Exterior · Primers · Putty",
    color:    "paints",
  },
  sanitary: {
    emoji:    "🚰",
    title:    "Sanitary & Pipes",
    subtitle: "CPVC · PVC SWR · Fittings · Valves",
    color:    "sanitary",
  },
  hardware: {
    emoji:    "🔨",
    title:    "General Hardware",
    subtitle: "Adhesives · Tools · Waterproofing · Fasteners",
    color:    "hardware",
  },
};

const CatalogSection = ({ category, items, activeFilter, onAdd, onEdit }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const meta = SECTION_META[category];
  const isVisible = activeFilter === "all" || activeFilter === category;

  // Filter items based on search query (name, description, or tag)
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(q);
    const descMatch = item.description?.toLowerCase().includes(q);
    const tagMatch = item.tag?.toLowerCase().includes(q);
    return nameMatch || descMatch || tagMatch;
  });

  return (
    <section
      className={`catalog-section catalog-section--${meta.color} ${isVisible ? "catalog-section--visible" : "catalog-section--hidden"}`}
      id={`section-${category}`}
      aria-hidden={!isVisible}
    >
      {/* Section header */}
      <div className={`section-header section-header--${meta.color}`}>
        <div className="section-header-left">
          <span className="section-emoji">{meta.emoji}</span>
          <div>
            <h2 className="section-title">{meta.title}</h2>
            <p className="section-subtitle">{meta.subtitle}</p>
          </div>
        </div>
        
        <div className="section-header-right">
          <div className="section-search-wrap">
            <span className="section-search-icon">🔍</span>
            <input
              type="text"
              placeholder={`Search ${meta.title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`section-search-input section-search-input--${meta.color}`}
            />
            {searchQuery && (
              <button
                className="section-search-clear"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <span className={`section-count section-count--${meta.color}`}>
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* Products grid */}
      <div className="products-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ProductCard key={item._id || item.id} item={item} onAdd={onAdd} onEdit={onEdit} />
          ))
        ) : (
          <div className="section-empty-search">
            <span>📭</span>
            <p>No items found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CatalogSection;
