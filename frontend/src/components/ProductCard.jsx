import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CompareContext } from '../context/CompareContext';

function ProductCard({ product }) {
  const { isInCompare, addToCompare, removeFromCompare } = useContext(CompareContext);
  
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price.toFixed(2);

  const isCompared = isInCompare(product._id);

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product._id);
    } else {
      const res = addToCompare(product);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  // Helper to render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-card-image" />
          
          {hasDiscount && (
            <span className="discount-badge">-{product.discount}% OFF</span>
          )}
          {product.stock === 0 && (
            <span className="sold-out-badge">Sold Out</span>
          )}
          
          {/* Best Value Deal Overlay Badge */}
          {product.valueScore >= 85 && (
            <span
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                background: 'linear-gradient(135deg, var(--warning), #ea580c)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              Best Value
            </span>
          )}

          {/* Compare Badge Trigger */}
          <button
            onClick={handleCompareClick}
            className={`compare-card-badge ${isCompared ? 'active' : ''}`}
            aria-label="Compare Product"
          >
            {isCompared ? '✓ Compare' : '+ Compare'}
          </button>
        </div>

        <div className="product-card-body">
          <span className="product-category">{product.category}</span>
          <h3 className="product-name-title">{product.name}</h3>
          
          <div className="product-rating-box" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="stars-row">{renderStars(product.rating)}</div>
            <span className="reviews-count">({product.numReviews})</span>
            
            {/* Value score rating label */}
            {product.valueScore && (
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginLeft: 'auto' }}>
                Value: {product.valueScore}
              </span>
            )}
          </div>

          <div className="product-price-box">
            {hasDiscount ? (
              <>
                <span className="current-price">${discountedPrice}</span>
                <span className="original-price">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="current-price">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
