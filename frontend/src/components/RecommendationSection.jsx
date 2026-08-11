import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

function RecommendationSection({ title = "Recommended For You", excludeProductId = null }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/recommendations');
        if (res.data.success) {
          // Exclude current product if displayed on details page
          let list = res.data.data;
          if (excludeProductId) {
            list = list.filter(p => p._id !== excludeProductId);
          }
          // Cap at 4 items for visual aesthetics
          setRecommendations(list.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [excludeProductId]);

  if (loading) {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>✨</span> {title}
      </h2>
      <div className="products-grid">
        {recommendations.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default RecommendationSection;
