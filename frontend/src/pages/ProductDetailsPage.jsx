import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { CompareContext } from '../context/CompareContext';
import { AuthContext } from '../context/AuthContext';
import RecommendationSection from '../components/RecommendationSection';
import ValueScore from '../components/ValueScore';
import ProductReviewsSection from '../components/ProductReviewsSection';

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);
  const { isInCompare, addToCompare, removeFromCompare } = useContext(CompareContext);
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();

    // Log product view if user is logged in
    const logView = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          await axios.post('/api/recommendations/view', { productId: id });
        } catch (err) {
          console.error('Error tracking product view:', err.message);
        }
      }
    };
    logView();
  }, [id]);

  const handleQuantityChange = (val) => {
    const newQty = quantity + val;
    if (newQty >= 1 && newQty <= (product?.stock || 1)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    setSuccessMsg('');
    const res = await addToCart(product._id, quantity);
    setAdding(false);

    if (res.success) {
      setSuccessMsg('Added to cart successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      navigate('/cart');
    } else {
      alert(res.message);
    }
  };

  const handleBuyNow = async () => {
    const res = await addToCart(product._id, quantity);
    if (res.success) {
      navigate('/cart');
    } else {
      alert(res.message);
    }
  };

  // Helper to render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Fetching product information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-error-page">
        <div className="error-card">
          <div className="alert alert-danger">{error}</div>
          <Link to="/products" className="btn btn-primary" style={{ maxWidth: '200px' }}>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price.toFixed(2);

  return (
    <div className="details-layout-container">
      <div className="details-back-link">
        <Link to="/products">&larr; Back to Catalog</Link>
      </div>

      <div className="product-details-grid">
        {/* Left Side: Product Image */}
        <div className="details-image-panel">
          <img src={product.image} alt={product.name} className="details-main-image" />
          {hasDiscount && (
            <span className="details-discount-tag">-{product.discount}% OFF</span>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Controls */}
        <div className="details-info-panel">
          <span className="info-category-label">{product.category}</span>
          <h1 className="info-name-title">{product.name}</h1>

          <div className="info-rating-row">
            <div className="stars-row">{renderStars(product.rating)}</div>
            <span className="reviews-text">
              <strong>{product.rating.toFixed(1)}</strong> ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="info-price-row">
            {hasDiscount ? (
              <div className="pricing-grid">
                <span className="promo-price">₹{discountedPrice}</span>
                <span className="old-strike-price">₹{product.price.toFixed(2)}</span>
                <span className="discount-saved-badge">Save ₹{ (product.price - discountedPrice).toFixed(2) }</span>
              </div>
            ) : (
              <span className="promo-price">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          {product.valueScore && (
            <ValueScore score={product.valueScore} product={product} />
          )}

          <div className="info-description-box">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="purchase-controls-box">
            <div className="stock-status-row">
              <span className="status-label">Availability:</span>
              {product.stock === 0 ? (
                <span className="stock-badge out-stock">Out of Stock</span>
              ) : product.stock < 5 ? (
                <span className="stock-badge out-stock" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#fbbf24', borderColor: '#d97706' }}>
                  ⚠️ Low Stock! Only {product.stock} left
                </span>
              ) : (
                <span className="stock-badge in-stock">
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="quantity-selector-row">
                <span className="qty-label">Quantity:</span>
                <div className="qty-picker">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="qty-picker-btn"
                  >
                    -
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="qty-picker-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="purchase-cta-actions" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="btn btn-primary"
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn btn-buy-now"
              >
                Buy Now
              </button>
              <button
                onClick={() => {
                  if (isInCompare(product._id)) {
                    removeFromCompare(product._id);
                  } else {
                    const res = addToCompare(product);
                    if (!res.success) alert(res.message);
                  }
                }}
                className="btn"
                style={{ border: '1px solid var(--border-color)', color: '#fff', backgroundColor: isInCompare(product?._id) ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)' }}
              >
                {isInCompare(product?._id) ? '✓ Comparing' : '+ Compare'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Product Reviews Dashboard Section */}
        <ProductReviewsSection
          productId={product._id}
          reviews={product.reviews || []}
          averageRating={product.rating}
          onReviewSubmitted={(updatedProduct) => setProduct(updatedProduct)}
          user={user}
        />

        {/* Recommended Products Shelf */}
        <RecommendationSection title="Related Products" excludeProductId={product._id} />
      </div>
    </div>
  );
}

export default ProductDetailsPage;
