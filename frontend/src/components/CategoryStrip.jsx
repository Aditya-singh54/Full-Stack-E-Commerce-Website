import React from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ITEMS = [
  {
    name: 'All Shop',
    categoryName: 'All',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=120&h=120&fit=crop&q=80'
  },
  {
    name: 'Electronics',
    categoryName: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=120&h=120&fit=crop&q=80'
  },
  {
    name: 'Fashion',
    categoryName: 'Clothing',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=120&h=120&fit=crop&q=80'
  },
  {
    name: 'Footwear',
    categoryName: 'Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop&q=80'
  },
  {
    name: 'Accessories',
    categoryName: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=120&h=120&fit=crop&q=80'
  },
  {
    name: 'Home Decor',
    categoryName: 'Home',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=120&h=120&fit=crop&q=80'
  }
];

function CategoryStrip() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2.5rem',
        padding: '1.25rem 2rem',
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none', // Hide scrollbar for clean UI
        msOverflowStyle: 'none'
      }}
      className="category-strip-scroll"
    >
      {CATEGORY_ITEMS.map((item, idx) => (
        <div
          key={idx}
          onClick={() => {
            if (item.categoryName === 'All') {
              navigate('/products');
            } else {
              navigate(`/products?category=${item.categoryName}`);
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '80px'
          }}
          className="category-strip-item"
        >
          {/* Circular Image Container */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--border-color)',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="category-strip-img-box"
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
            />
          </div>
          <span
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              transition: 'color 0.2s'
            }}
          >
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default CategoryStrip;
