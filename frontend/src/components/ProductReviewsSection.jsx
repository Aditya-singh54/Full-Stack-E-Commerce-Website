import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductReviewsSection({ productId, reviews = [], averageRating = 0, onReviewSubmitted, user }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await axios.post(`/api/products/${productId}/reviews`, {
        rating,
        comment
      });
      if (res.data.success) {
        setSuccessMsg('Thank you! Your review has been added.');
        setComment('');
        setRating(5);
        if (onReviewSubmitted) {
          // Tell details page to reload product details
          onReviewSubmitted(res.data.data);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await axios.delete(`/api/products/${productId}/reviews/${reviewId}`);
      if (res.data.success) {
        alert('Review deleted successfully.');
        if (onReviewSubmitted) {
          onReviewSubmitted(res.data.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  const renderStars = (count, size = '1rem') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= count ? 'var(--warning)' : 'var(--text-muted)', fontSize: size }}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
      
      {/* Title Grid */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>💬</span> Customer Reviews ({reviews.length})
      </h2>

      <div className="product-details-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '3rem', background: 'transparent', padding: 0, alignItems: 'flex-start' }}>
        
        {/* Left Side: Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          {reviews.length === 0 ? (
            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>No reviews yet for this product. Be the first to purchase and review it!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r._id}
                style={{
                  padding: '1.25rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  position: 'relative'
                }}
              >
                {/* Admin Delete Action */}
                {user && user.role === 'admin' && (
                  <button
                    onClick={() => handleDeleteReview(r._id)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Delete Review
                  </button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{r.name}</strong>
                  <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ✓ Verified Purchase
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.1rem' }}>{renderStars(r.rating)}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Review Writer Form */}
        <div style={{ padding: '1.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', width: '100%' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Write a Review
          </h3>

          {!user ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, textAlign: 'center', padding: '1rem 0' }}>
              Please <a href="/login" style={{ color: 'var(--primary)' }}>log in</a> to write a review.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Star selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Rating</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(val)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: val <= rating ? 'var(--warning)' : 'var(--text-muted)' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment field */}
              <div>
                <label htmlFor="review-comment" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Review Details</label>
                <textarea
                  id="review-comment"
                  rows="4"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
                  required
                ></textarea>
              </div>

              {errorMsg && <div className="alert alert-danger" style={{ fontSize: '0.825rem', padding: '0.6rem' }}>{errorMsg}</div>}
              {successMsg && <div className="alert alert-success" style={{ fontSize: '0.825rem', padding: '0.6rem' }}>{successMsg}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductReviewsSection;
