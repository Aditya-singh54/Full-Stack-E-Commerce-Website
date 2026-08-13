import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
  const [portal, setPortal] = useState(null); // 'user' | 'admin' | null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Custom email regex validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return setError('Please enter a valid email address');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      const loggedUser = result.data;
      
      // Portal level authorization check
      if (portal === 'admin' && loggedUser.role !== 'admin') {
        logout(); // Reset token context
        return setError('Access Denied: This portal is reserved for administrators only.');
      }

      // Route based on role
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } else {
      setError(result.message);
    }
  };

  // 1. Render Portal selection gateways
  if (portal === null) {
    return (
      <div className="auth-page" style={{ padding: '3rem 1rem' }}>
        <div className="portal-selection-container">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
            Access Gateway
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '3rem', fontSize: '0.95rem' }}>
            Select your destination portal to sign in to your account
          </p>

          <div className="portal-cards">
            {/* Customer card */}
            <div className="portal-card" onClick={() => setPortal('user')}>
              <div className="portal-icon">🛒</div>
              <h3>Customer Portal</h3>
              <p>Browse the catalog, compare spec matrices, view recommendation sliders, and place checkouts.</p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                Enter Customer Portal
              </button>
            </div>

            {/* Admin card */}
            <div className="portal-card admin" onClick={() => setPortal('admin')}>
              <div className="portal-icon">⚙️</div>
              <h3>Admin Console</h3>
              <p>Review business stats, check sales category progress bars, view trends, and update inventories.</p>
              <button className="btn" style={{ width: '100%', marginTop: 'auto', background: 'linear-gradient(135deg, var(--accent), #7c3aed)', color: '#fff', border: 'none' }}>
                Enter Admin Console
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Login Form for selected Portal
  return (
    <div className="auth-page">
      <div className="auth-card" style={{ animation: 'fadeIn 0.3s ease-out' }}>
        
        <button
          onClick={() => {
            setPortal(null);
            setError('');
          }}
          className="clear-filters-btn"
          style={{ alignSelf: 'flex-start', fontSize: '0.85rem', marginBottom: '1.5rem', padding: 0 }}
        >
          &larr; Back to Portal Selection
        </button>

        <h2>{portal === 'admin' ? 'Admin Console Sign In' : 'Customer Sign In'}</h2>
        <p className="auth-subtitle">
          {portal === 'admin'
            ? 'Sign in to access shop administrative tools'
            : 'Sign in to browse products and place checkouts'}
        </p>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {portal === 'user' && (
          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
