import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered';
      case 'Shipped':
        return 'status-shipped';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Pending':
      default:
        return 'status-pending';
    }
  };

  // Helper to check timeline step completion
  const getStepIndex = (status) => {
    const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  const getStepClass = (stepName, currentStatus) => {
    const targetIdx = getStepIndex(stepName);
    const currentIdx = getStepIndex(currentStatus);

    if (currentStatus === 'Cancelled') {
      return 'timeline-step cancelled';
    }
    if (targetIdx < currentIdx) {
      return 'timeline-step completed';
    }
    if (targetIdx === currentIdx) {
      return 'timeline-step active';
    }
    return 'timeline-step';
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Retrieving order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-error-page">
        <div className="error-card">
          <div className="alert alert-danger">{error}</div>
          <Link to="/orders" className="btn btn-primary" style={{ maxWidth: '200px' }}>
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  // Calculate items sum
  const itemsSubtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingCharge = order.totalAmount > 100 || order.totalAmount === itemsSubtotal ? 0 : 10;

  return (
    <div className="details-layout-container">
      <div className="details-back-link">
        <Link to="/orders">&larr; Back to Order History</Link>
      </div>

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
            Order Details
          </h1>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginTop: '0.25rem' }}>
            Placed on {new Date(order.createdAt).toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            ID: #{order._id}
          </span>
          <span className={`order-status-badge ${getStatusClass(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
        </div>
      </div>

      {/* Delivery Tracking Timeline */}
      <div
        style={{
          background: 'rgba(19, 26, 44, 0.4)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.75rem',
          backdropFilter: 'blur(5px)',
          margin: '0.5rem 0'
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.5rem', margin: 0 }}>Order Progress</h3>
        
        {/* Timeline wrapper */}
        <div className="timeline-container">
          {order.orderStatus === 'Cancelled' ? (
            <div className="timeline-step cancelled" style={{ width: '100%', textAlign: 'center' }}>
              <div className="timeline-dot">✕</div>
              <span className="timeline-label">Order Cancelled</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>This order has been cancelled.</p>
            </div>
          ) : (
            <>
              <div className={getStepClass('Pending', order.orderStatus)}>
                <div className="timeline-dot">1</div>
                <span className="timeline-label">Pending</span>
                <span className="timeline-sub">Awaiting confirmation</span>
              </div>
              
              <div className={getStepClass('Confirmed', order.orderStatus)}>
                <div className="timeline-dot">2</div>
                <span className="timeline-label">Confirmed</span>
                <span className="timeline-sub">Preparing package</span>
              </div>

              <div className={getStepClass('Shipped', order.orderStatus)}>
                <div className="timeline-dot">3</div>
                <span className="timeline-label">Shipped</span>
                <span className="timeline-sub">In transit</span>
              </div>

              <div className={getStepClass('Delivered', order.orderStatus)}>
                <div className="timeline-dot">4</div>
                <span className="timeline-label">Delivered</span>
                <span className="timeline-sub">Fulfillment complete</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main details grid */}
      <div className="product-details-grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '2.5rem', padding: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Shipping & Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
          
          {/* Shipping Address */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0 }}>
              Shipping & Delivery
            </h3>
            <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.3)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <strong style={{ color: '#fff' }}>Recipient Name: </strong>
                {order.user?.name || 'Customer'}
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Phone Contact: </strong>
                {order.shippingAddress.phone}
              </div>
              <div>
                <strong style={{ color: '#fff' }}>Shipping Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </div>
            </div>
          </div>

          {/* Items Purchased */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', margin: 0 }}>
              Items Ordered
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {order.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    background: 'rgba(15, 23, 42, 0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                      {item.product ? (
                        <Link to={`/products/${item.product}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Quantity: {item.quantity} &times; ₹{item.price.toFixed(2)}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing Summary Card */}
        <div className="info-price-row" style={{ width: '100%', padding: '1.75rem', background: 'rgba(19, 26, 44, 0.55)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>
            Payment Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <span>Items Total</span>
              <span>₹{itemsSubtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <span>Shipping Fee</span>
              <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toFixed(2)}`}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <span>Payment Mode</span>
              <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
            </div>
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
            <span>Total Paid</span>
            <span style={{ color: 'var(--primary)' }}>
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '1rem' }}>🛡️</span>
            <div>
              Order is protected by ShopSphere customer guarantee terms.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrderDetailsPage;
