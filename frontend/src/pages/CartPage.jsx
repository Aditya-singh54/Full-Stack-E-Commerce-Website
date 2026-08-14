import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

function CartPage() {
  const {
    cartItems,
    loading,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    updateQty,
    removeItem
  } = useContext(CartContext);

  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const handleQtyChange = async (productId, currentQty, stock, increment) => {
    const newQty = currentQty + increment;
    if (newQty < 1) return;
    if (newQty > stock) {
      setErrorMsg(`Cannot exceed available stock of ${stock} items.`);
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    setUpdatingId(productId);
    setErrorMsg('');
    const res = await updateQty(productId, newQty);
    setUpdatingId(null);
    if (!res.success) {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingId(productId);
    const res = await removeItem(productId);
    setUpdatingId(null);
    if (!res.success) {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading your shopping cart...</p>
      </div>
    );
  }

  return (
    <div className="details-layout-container">
      <div className="details-back-link">
        <Link to="/products">&larr; Continue Shopping</Link>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Your Shopping Cart</h1>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      {cartItems.length === 0 ? (
        <div className="empty-catalog-fallback" style={{ padding: '4rem 2rem' }}>
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any products to your shopping cart yet.</p>
          <Link to="/products" className="btn btn-primary" style={{ maxWidth: '200px', marginTop: '1.5rem' }}>
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="product-details-grid" style={{ gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem', padding: '2rem', alignItems: 'flex-start' }}>
          
          {/* Left: Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {cartItems.map((item) => {
              if (!item.product) return null;
              
              const product = item.product;
              const hasDiscount = product.discount > 0;
              const unitPrice = hasDiscount
                ? product.price * (1 - product.discount / 100)
                : product.price;

              return (
                <div
                  key={product._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    position: 'relative',
                    opacity: updatingId === product._id ? 0.6 : 1
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>
                      {product.category}
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                      <Link to={`/products/${product._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {product.name}
                      </Link>
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                        ${unitPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <div className="qty-picker">
                      <button
                        onClick={() => handleQtyChange(product._id, item.quantity, product.stock, -1)}
                        disabled={item.quantity <= 1 || updatingId === product._id}
                        className="qty-picker-btn"
                        style={{ width: '28px', height: '28px', fontSize: '1rem' }}
                      >
                        -
                      </button>
                      <span className="qty-display" style={{ minWidth: '30px', height: '28px', fontSize: '0.9rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(product._id, item.quantity, product.stock, 1)}
                        disabled={item.quantity >= product.stock || updatingId === product._id}
                        className="qty-picker-btn"
                        style={{ width: '28px', height: '28px', fontSize: '1rem' }}
                      >
                        +
                      </button>
                    </div>
                    {product.stock <= 5 && product.stock > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>
                        Only {product.stock} left
                      </span>
                    )}
                  </div>

                  {/* Item Subtotal & Delete Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', minWidth: '100px' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      ${(unitPrice * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(product._id)}
                      disabled={updatingId === product._id}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Cart Summary Panel */}
          <div className="info-price-row" style={{ width: '100%', padding: '1.75rem', background: 'rgba(19, 26, 44, 0.55)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>
              Order Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal (Items price)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--success)', fontWeight: 500 }}>
                  <span>Discounts Saved</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span>
              </div>
              
              {shippingFee > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.25rem', textAlign: 'right' }}>
                  Free shipping on orders above ₹100
                </span>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 800,
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                color: '#fff'
              }}
            >
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary)', textShadow: '0 0 10px rgba(99, 102, 241, 0.15)' }}>
                ${grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
