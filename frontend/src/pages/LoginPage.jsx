import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
  const [portal, setPortal] = useState(null); // 'user' | 'admin' | null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Google SSO Modal states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const { login, logout, loginWithGoogle } = useContext(AuthContext);
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

  const handleGoogleLoginAction = async (name, emailVal) => {
    setShowGoogleModal(false);
    setError('');
    setSubmitting(true);
    
    const result = await loginWithGoogle(name, emailVal);
    setSubmitting(false);

    if (result.success) {
      const loggedUser = result.data;
      
      // Portal level authorization check
      if (portal === 'admin' && loggedUser.role !== 'admin') {
        logout();
        return setError('Access Denied: This portal is reserved for administrators only.');
      }

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
      <div className="auth-card" style={{ animation: 'fadeIn 0.3s ease-out', position: 'relative' }}>
        
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

        {/* OR Divider and Google Login option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
        </div>

        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="btn"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            border: '1px solid #d1d5db',
            padding: '0.75rem',
            fontWeight: 600,
            borderRadius: '8px',
            fontSize: '0.9rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.7-1.57 2.69-3.88 2.69-6.57z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.94v2.32C2.42 15.93 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.95 10.74a5.4 5.4 0 0 1 0-3.48V4.94H.94a9 9 0 0 0 0 8.12l3.01-2.32z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.47.98 11.43 0 9 0 5.48 0 2.42 2.07.94 5.06l3.01 2.32c.71-2.13 2.7-3.71 5.05-3.71z"/>
          </svg>
          Continue with Google
        </button>

        {portal === 'user' && (
          <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        )}

        {/* 3. Google Account Selection Mock Modal */}
        {showGoogleModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999
            }}
          >
            <div
              style={{
                width: '380px',
                background: '#ffffff',
                color: '#1f2937',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Google Brand Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22c-.22-.6-.35-1.28-.35-1.99z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z"/>
                </svg>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Choose an account</h3>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>to continue to ShopSphere</span>
              </div>

              {/* Demo Account List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                
                {/* 1. Admin */}
                <div
                  onClick={() => handleGoogleLoginAction('ShopSphere Administrator', 'admin@shopsphere.com')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    transition: 'background 0.2s'
                  }}
                  className="google-account-row"
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                    A
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <strong style={{ fontSize: '0.85rem' }}>ShopSphere Administrator</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>admin@shopsphere.com</span>
                  </div>
                </div>

                {/* 2. Customer */}
                <div
                  onClick={() => handleGoogleLoginAction('Aditya Singh', 'adityasingh6392944354@gmail.com')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    transition: 'background 0.2s'
                  }}
                  className="google-account-row"
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                    U
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Aditya Singh</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>adityasingh6392944354@gmail.com</span>
                  </div>
                </div>

              </div>

              {/* Custom Account Input Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', alignSelf: 'flex-start' }}>Use another account:</span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#1f2937' }}
                />
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#1f2937' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customName && customEmail) {
                      handleGoogleLoginAction(customName, customEmail);
                    } else {
                      alert('Please fill out both Name and Email fields.');
                    }
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                >
                  Continue passwordless
                </button>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, marginTop: '0.5rem' }}
              >
                Cancel
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
