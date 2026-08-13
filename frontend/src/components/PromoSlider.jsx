import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PROMO_SLIDES = [
  {
    id: 1,
    title: "Vivid Sound Revolution",
    subtitle: "AcousticMax active noise cancellation with 40-hour battery life. Premium memory foam comfort.",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&q=80",
    buttonText: "Explore Audio",
    category: "Electronics",
    code: "AUDIO15",
    discount: "15% OFF"
  },
  {
    id: 2,
    title: "Summer Wardrobe Refresh",
    subtitle: "Premium organic linen clothing, tailored leather accessories, and minimal street-style wear.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    buttonText: "Shop Clothing",
    category: "Clothing",
    code: "CLOTHES20",
    discount: "20% OFF"
  },
  {
    id: 3,
    title: "Elevate Your Home Sanctuary",
    subtitle: "Artisan pottery, natural linen blankets, and hand-poured soy wax candles for cozy living spaces.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&q=80",
    buttonText: "View Home Decor",
    category: "Home",
    code: "HOME10",
    discount: "10% OFF"
  }
];

function PromoSlider() {
  const [current, setCurrent] = useState(0);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  };

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const slide = PROMO_SLIDES[current];

  return (
    <div
      className="promo-slider"
      style={{
        position: 'relative',
        height: '420px',
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
        marginBottom: '2.5rem',
        border: '1px solid var(--border-color)'
      }}
    >
      {/* Background Image with Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(to right, rgba(18, 18, 20, 0.9) 35%, rgba(18, 18, 20, 0.4) 70%, rgba(18, 18, 20, 0.1)), url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.6s ease-in-out',
          zIndex: 1
        }}
      />

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="clear-filters-btn"
        style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.2s'
        }}
      >
        &#8592;
      </button>
      <button
        onClick={handleNext}
        className="clear-filters-btn"
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.2s'
        }}
      >
        &#8594;
      </button>

      {/* Content Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 8%',
          color: '#fff',
          zIndex: 5
        }}
      >
        <div style={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }} className="slide-content">
          
          {/* Discount Badge */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ background: 'var(--accent)', color: '#000', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              PROMOTIONAL OFFER
            </span>
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
              {slide.discount}
            </span>
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            {slide.title}
          </h2>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {slide.subtitle}
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              onClick={() => navigate(`/products?category=${slide.category}`)}
              className="btn btn-primary"
              style={{ width: 'auto', padding: '0.75rem 1.75rem' }}
            >
              {slide.buttonText} &rarr;
            </button>

            {/* Promo Code Copy Trigger */}
            <div
              onClick={(e) => handleCopyCode(e, slide.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px dashed var(--border-color)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s'
              }}
              title="Click to copy promo code"
              className="promo-code-badge"
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Code:</span>
              <strong style={{ fontSize: '0.9rem', color: '#fff', fontFamily: 'monospace' }}>{slide.code}</strong>
              <span style={{ fontSize: '0.75rem', color: copiedCode === slide.code ? 'var(--success)' : 'var(--primary)' }}>
                {copiedCode === slide.code ? '✓ Copied' : '📋 Copy'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators / Dots */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10
        }}
      >
        {PROMO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: idx === current ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default PromoSlider;
