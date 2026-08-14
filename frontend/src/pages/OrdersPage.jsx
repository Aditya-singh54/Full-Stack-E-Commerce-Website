import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="details-layout-container">
      <div className="details-back-link">
        <Link to="/profile">&larr; Back to Profile</Link>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Your Orders</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-catalog-fallback" style={{ padding: '4rem 2rem' }}>
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet on ShopSphere.</p>
          <Link to="/products" className="btn btn-primary" style={{ maxWidth: '200px', marginTop: '1.5rem' }}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                background: 'rgba(19, 26, 44, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Header: Date, Order ID, Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>ORDER PLACED</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>ORDER ID</span>
                  <span style={{ fontSize: '0.95rem', fontFamily: 'monospace', fontWeight: 600 }}>#{order._id}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>STATUS</span>
                  <span className={`order-status-badge ₹{getStatusClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>

              {/* Body: Purchased Items Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {order.orderItems.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '6px',
                        objectFit: 'cover',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)'
                      }}
                    />
                  ))}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      {order.orderItems[0].name}
                    </span>
                    {order.orderItems.length > 1 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        and {order.orderItems.length - 1} other item{order.orderItems.length - 1 !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Summary: Total & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textAlign: 'right' }}>TOTAL AMOUNT</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                      ₹{order.totalAmount.toFixed(2)}
                    </strong>
                  </div>
                  
                  <Link to={`/orders/${order._id}`} className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                    View Details
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
