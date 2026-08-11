import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    clearCartOnCheckout
  } = useContext(CartContext);

  const navigate = useNavigate();

  // Redirect if cart is empty on mount
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const orderItems = cartItems.map((item) => {
      const discountedPrice = item.product.discount > 0
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      
      return {
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.image,
        price: Number(discountedPrice.toFixed(2)),
        product: item.product._id
      };
    });

    const payload = {
      orderItems,
      shippingAddress: {
        address,
        city,
        state,
        postalCode,
        phone
      },
      paymentMethod: 'Cash on Delivery',
      totalAmount: Number(grandTotal.toFixed(2))
    };

    try {
      const res = await axios.post('/api/orders', payload);
      if (res.data.success) {
        clearCartOnCheckout();
        navigate(`/order-confirmation/${res.data.data._id}`);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while placing order.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return null;

  return (
    <div className="details-layout-container">
      <div className="details-back-link">
        <Link to="/cart">&larr; Back to Cart</Link>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Checkout</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="product-details-grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: '3rem', padding: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Side: Shipping Address Form */}
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Shipping Details
          </h2>
          
          <form onSubmit={handlePlaceOrder} className="auth-form" style={{ gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address Line</label>
              <input
                type="text"
                id="address"
                placeholder="Street address, P.O. box, company name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  placeholder="New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  placeholder="Delhi"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Postal Code / PIN Code</label>
              <input
                type="text"
                id="postalCode"
                placeholder="110001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.9rem', fontSize: '1rem', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Processing Order...' : 'Place Order (Cash on Delivery)'}
            </button>
          </form>
        </div>

        {/* Right Side: Order Items Review Summary */}
        <div className="info-price-row" style={{ width: '100%', padding: '1.75rem', background: 'rgba(19, 26, 44, 0.55)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>
            Order Review
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {cartItems.map((item) => {
              if (!item.product) return null;
              const hasDiscount = item.product.discount > 0;
              const unitPrice = hasDiscount
                ? item.product.price * (1 - item.product.discount / 100)
                : item.product.price;

              return (
                <div key={item.product._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.product.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Qty: {item.quantity} &times; ${unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                    ${(unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Items Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success)', fontWeight: 500 }}>
                <span>Discounts Saved</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', color: '#fff' }}>
              <span>Order Total</span>
              <span style={{ color: 'var(--primary)' }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1.15rem' }}>💵</span>
            <div>
              <strong>Payment Method:</strong> Cash on Delivery (COD). Pay in cash when your order reaches your doorstep.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;
