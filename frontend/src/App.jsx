import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider, CartContext } from './context/CartContext';
import { CompareProvider, CompareContext } from './context/CompareContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ComparePage from './pages/ComparePage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function AppContent() {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { compareItems } = useContext(CompareContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} onClick={closeMenu}>ShopSphere</Link>
        </div>
        
        {/* Mobile Hamburger Toggle Button */}
        <button className="nav-toggle-btn" onClick={toggleMenu} aria-label="Toggle Navigation Menu">
          <div className={`hamburger-line ${menuOpen ? 'open' : ''}`}></div>
          <div className={`hamburger-line ${menuOpen ? 'open' : ''}`}></div>
          <div className={`hamburger-line ${menuOpen ? 'open' : ''}`}></div>
        </button>

        <nav className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/products" onClick={closeMenu}>Shop</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: 'var(--accent)', fontWeight: 600 }} onClick={closeMenu}>Admin Panel</Link>
              )}
              <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={closeMenu}>
                Cart
                {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" onClick={closeMenu}>Orders</Link>
              <Link to="/profile" onClick={closeMenu}>Profile</Link>
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="nav-btn-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/register" onClick={closeMenu}>Register</Link>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={
            <div className="app-hero">
              <div className="hero-content">
                <h1>Welcome to ShopSphere</h1>
                <p>Explore premium products, seamless orders, and a beautiful full-stack interface.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                  <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', width: 'auto' }}>
                    Shop Products
                  </Link>
                  {!user && (
                    <Link to="/login" className="btn" style={{ display: 'inline-flex', textDecoration: 'none', width: 'auto', border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#fff' }}>
                      Sign In
                    </Link>
                  )}
                </div>
                {user && (
                  <div className="user-greeting" style={{ marginTop: '1.5rem' }}>
                    Logged in as: <strong>{user.name}</strong> ({user.role})
                  </div>
                )}
              </div>
            </div>
          } />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />

          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />

          <Route path="/order-confirmation/:id" element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />

          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetailsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            </ProtectedRoute>
          } />

          <Route path="/compare" element={<ComparePage />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      {/* Floating Comparison Badge */}
      {compareItems && compareItems.length > 0 && (
        <Link to="/compare" className="floating-compare-badge" title="Go to Product Comparison">
          📊 Compare ({compareItems.length}/3)
        </Link>
      )}

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <Router>
            <AppContent />
          </Router>
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
