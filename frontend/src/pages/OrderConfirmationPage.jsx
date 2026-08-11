import React from 'react';
import { useParams, Link } from 'react-router-dom';

function OrderConfirmationPage() {
  const { id } = useParams();

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '540px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        
        {/* Success Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid var(--success)',
            color: 'var(--success)',
            fontSize: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
            animation: 'pulse 2s infinite'
          }}
        >
          ✓
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Order Confirmed!</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.975rem' }}>
          Thank you for shopping with ShopSphere. Your order has been placed successfully and is being prepared for shipment.
        </p>

        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            width: '100%',
            margin: '0.5rem 0'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Order Reference ID
          </span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
            #{id}
          </strong>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Payment Mode: <strong>Cash on Delivery (COD)</strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1rem' }}>
          <Link to={`/orders/${id}`} className="btn btn-primary">
            View Order Details
          </Link>
          <Link to="/products" className="btn" style={{ border: '1px solid var(--border-color)', color: '#fff', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}

export default OrderConfirmationPage;
