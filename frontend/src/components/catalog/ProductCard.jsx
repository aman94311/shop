// ============================================================
//  components/catalog/ProductCard.jsx — Individual Product Item Card
//  Abhi Sanitary and Hardware
// ============================================================

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ProductCard = ({ item, onAdd, onEdit }) => {
  const [added, setAdded] = useState(false);
  const { isAuthenticated, userRole } = useAuth();

  const handleAdd = () => {
    onAdd(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className={`product-card product-card--${item.category}`}>
      {/* Tag badge */}
      {item.tag && (
        <span className={`product-tag product-tag--${item.category}`}>{item.tag}</span>
      )}

      {/* Product info */}
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <p className="product-description">{item.description}</p>
      </div>

      {/* Price + Add button */}
      <div className="product-footer">
        <div className="product-price-wrap">
          <span className={`product-price product-price--${item.category}`}>{item.price}</span>
          <span className="product-unit">/ {item.unit}</span>
        </div>

        <div className="product-actions">
          {isAuthenticated && userRole === "admin" && onEdit && (
            <button
              className="edit-icon-btn"
              onClick={() => onEdit(item)}
              title="Edit product details"
            >
              ✏️
            </button>
          )}

          <button
            className={`add-btn ${added ? "add-btn--added" : ""} add-btn--${item.category}`}
            onClick={handleAdd}
            title="Add to quotation list"
          >
            {added ? (
              <>
                <span>✓</span>
                <span>Added!</span>
              </>
            ) : (
              <>
                <span>+</span>
                <span>Add to List</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
