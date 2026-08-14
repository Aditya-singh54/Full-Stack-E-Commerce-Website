import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CompareContext } from '../context/CompareContext';
import { CartContext } from '../context/CartContext';

// Sensible specifications fallbacks based on category
const getFallbackSpecs = (category) => {
  switch (category) {
    case 'Electronics':
      return [
        { name: 'Connection', value: 'Wireless/Bluetooth' },
        { name: 'Battery Life', value: 'Up to 30 Hours' },
        { name: 'Warranty', value: '1 Year Manufacturer' }
      ];
    case 'Clothing':
      return [
        { name: 'Material', value: '100% Organic Cotton' },
        { name: 'Fit type', value: 'Regular / Slim Fit' },
        { name: 'Wash care', value: 'Machine Wash Cold' }
      ];
    case 'Shoes':
      return [
        { name: 'Sole Material', value: 'Anti-slip Rubber' },
        { name: 'Closure', value: 'Lace-Up/Slip-On' },
        { name: 'Ideal For', value: 'Running & Training' }
      ];
    case 'Accessories':
      return [
        { name: 'Material', value: 'Premium Grade Canvas/Leather' },
        { name: 'Waterproof', value: 'Water Resistant' },
        { name: 'Warranty', value: '6 Months' }
      ];
    case 'Home':
    default:
      return [
        { name: 'Material', value: 'Eco-friendly Glazed/Wood' },
        { name: 'Fulfillment', value: 'Carefully Packaged Box' },
        { name: 'Ideal For', value: 'Indoor Workspaces' }
      ];
  }
};

function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useContext(CompareContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleAddToCart = async (product) => {
    const res = await addToCart(product._id, 1);
    if (res.success) {
      navigate('/cart');
    } else {
      alert(res.message);
    }
  };

  // Find the index of the best value item based on virtual valueScore
  let bestValueIndex = -1;
  if (compareItems.length > 1) {
    const scores = compareItems.map(item => item.valueScore || 0);
    const maxScore = Math.max(...scores);
    bestValueIndex = scores.indexOf(maxScore);
  }

  if (compareItems.length === 0) {
    return (
      <div className="details-layout-container">
        <div className="empty-catalog-fallback" style={{ padding: '6rem 2rem' }}>
          <h2>Comparison List is Empty</h2>
          <p>Go to the products page and choose up to 3 products to compare details side-by-side.</p>
          <Link to="/products" className="btn btn-primary" style={{ maxWidth: '220px', marginTop: '1.5rem' }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  // 2. Gather Specifications names union across selected products
  const specNames = [];
  compareItems.forEach((item) => {
    const specsList = item.specifications && item.specifications.length > 0
      ? item.specifications
      : getFallbackSpecs(item.category);
    
    specsList.forEach((s) => {
      if (!specNames.includes(s.name)) {
        specNames.push(s.name);
      }
    });
  });

  const getSpecValue = (item, name) => {
    const specsList = item.specifications && item.specifications.length > 0
      ? item.specifications
      : getFallbackSpecs(item.category);
    
    const found = specsList.find(s => s.name === name);
    return found ? found.value : '—';
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= fullStars ? 'var(--warning)' : 'var(--text-muted)' }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="details-layout-container" style={{ padding: '2.5rem 5%' }}>
      <div className="details-back-link" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/products">&larr; Back to Shop</Link>
        <button onClick={clearCompare} className="clear-filters-btn" style={{ fontSize: '0.95rem' }}>
          Clear All Comparisons
        </button>
      </div>

      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '1rem 0 2rem 0' }}>Product Comparison</h1>

      <div style={{ background: 'rgba(19, 26, 44, 0.45)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="compare-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ width: '200px', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Feature</th>
                {compareItems.map((item, idx) => (
                  <th key={item._id} style={{ padding: '1.5rem', verticalAlign: 'top', position: 'relative' }}>
                    
                    {/* Highlight Best Value Deal */}
                    {idx === bestValueIndex && (
                      <span className="best-deal-badge">🔥 Best Value</span>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => removeFromCompare(item._id)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '1.25rem', cursor: 'pointer' }}
                        title="Remove product"
                      >
                        &times;
                      </button>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
                      />
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, maxHeight: '2.8rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.name}
                      </h3>
                      <button onClick={() => handleAddToCart(item)} className="btn btn-primary" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                        Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* PRICE ROW */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price</td>
                {compareItems.map((item) => {
                  const hasDiscount = item.discount > 0;
                  const finalPrice = hasDiscount ? item.price * (1 - item.discount / 100) : item.price;
                  return (
                    <td key={item._id} style={{ padding: '1rem', textAlign: 'center' }}>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>₹{finalPrice.toFixed(2)}</strong>
                      {hasDiscount && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textDecoration: 'line-through' }}>
                          ₹{item.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* RATING ROW */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rating</td>
                {compareItems.map((item) => (
                  <td key={item._id} style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem' }}>{renderStars(item.rating)}</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.rating} ({item.numReviews} Reviews)</span>
                  </td>
                ))}
              </tr>

              {/* VALUE SCORE ROW */}
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(99, 102, 241, 0.03)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Value for Money</td>
                {compareItems.map((item) => (
                  <td key={item._id} style={{ padding: '1rem', textAlign: 'center' }}>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{item.valueScore || 'N/A'}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/100</span>
                  </td>
                ))}
              </tr>

              {/* CATEGORY ROW */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</td>
                {compareItems.map((item) => (
                  <td key={item._id} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {item.category}
                  </td>
                ))}
              </tr>

              {/* STOCK STATUS ROW */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Availability</td>
                {compareItems.map((item) => (
                  <td key={item._id} style={{ padding: '1rem', textAlign: 'center' }}>
                    <span className={`stock-badge ${item.stock > 0 ? 'in-stock' : 'out-stock'}`} style={{ display: 'inline-block' }}>
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* DYNAMIC SPECIFICATIONS ROWS */}
              {specNames.map((name) => (
                <tr key={name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{name}</td>
                  {compareItems.map((item) => (
                    <td key={item._id} style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {getSpecValue(item, name)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ComparePage;
