import React, { useState } from 'react';

function ValueScore({ score, product }) {
  const [showInfo, setShowInfo] = useState(false);

  const getScoreColor = (val) => {
    if (val >= 85) return 'var(--success)';
    if (val >= 65) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getScoreLabel = (val) => {
    if (val >= 85) return 'Outstanding Value';
    if (val >= 70) return 'Good Value';
    return 'Standard Value';
  };

  return (
    <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.04)', border: '1px solid var(--border-color)', borderRadius: '12px', marginTop: '1.25rem' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          📊 Value for Money Score
        </span>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
        >
          {showInfo ? 'Hide breakdown' : 'How is this calculated?'}
        </button>
      </div>

      {/* Progress score bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ flex: 1, height: '8px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${score}%`,
              height: '100%',
              background: getScoreColor(score),
              borderRadius: '10px',
              boxShadow: `0 0 10px ${getScoreColor(score)}`
            }}
          ></div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '60px' }}>
          <strong style={{ fontSize: '1.25rem', color: getScoreColor(score) }}>{score}</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/100</span>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontWeight: 500 }}>
        Rating: <strong>{getScoreLabel(score)}</strong>
      </div>

      {/* Breakdown Tooltip panel */}
      {showInfo && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', animation: 'fadeIn 0.3s ease' }}>
          <p style={{ margin: 0 }}>This simulated index scores price, popularity, and consumer reviews side-by-side:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <li>
              ⭐️ <strong>User Satisfaction (Rating)</strong>: contributes up to 45 pts ({((product.rating/5)*45).toFixed(0)} pts achieved)
            </li>
            <li>
              💵 <strong>Affordability (Price)</strong>: contributes up to 20 pts based on competitive pricing limits
            </li>
            <li>
              🏷️ <strong>Promotional Savings (Discount)</strong>: contributes up to 20 pts based on active {product.discount}% discount
            </li>
            <li>
              💬 <strong>Buyer Validation (Reviews)</strong>: contributes up to 15 pts based on total {product.numReviews} review signals
            </li>
          </ul>
        </div>
      )}

    </div>
  );
}

export default ValueScore;
