import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import RecommendationSection from '../components/RecommendationSection';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Shoes', 'Accessories', 'Home'];

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Natural Search states
  const [isNaturalSearch, setIsNaturalSearch] = useState(true);
  const [naturalMessage, setNaturalMessage] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  
  // Filter & Search states
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sort, setSort] = useState('newest');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      if (isNaturalSearch && keyword) {
        const res = await axios.get('/api/products/natural-search', {
          params: { query: keyword }
        });
        if (res.data.success) {
          setProducts(res.data.data.products);
          setPages(1);
          setTotal(res.data.data.products.length);
          setNaturalMessage(res.data.data.message);
          setIsFallback(res.data.data.isFallback);
        } else {
          setError(res.data.message);
        }
      } else {
        setNaturalMessage('');
        setIsFallback(false);
        const params = {
          page,
          sort,
          maxPrice,
          category: category === 'All' ? '' : category,
          keyword
        };
        
        const res = await axios.get('/api/products', { params });
        
        if (res.data.success) {
          setProducts(res.data.data.products);
          setPages(res.data.data.pages);
          setTotal(res.data.data.total);
        } else {
          setError(res.data.message);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, maxPrice, sort, keyword, isNaturalSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1); // Reset to page 1 on new search
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setKeyword('');
    setCategory('All');
    setMaxPrice(2000);
    setSort('newest');
    setIsNaturalSearch(true);
    setNaturalMessage('');
    setIsFallback(false);
    setPage(1);
  };

  return (
    <div className="products-layout-container">
      {/* Sidebar for Filters */}
      <aside className="filters-sidebar">
        <div className="filter-header-box">
          <h3>Filters</h3>
          <button onClick={handleClearFilters} className="clear-filters-btn">Clear All</button>
        </div>

        <div className="filter-section">
          <h4>Category</h4>
          <div className="category-list-inputs">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="filter-checkbox-label">
                <input
                  type="radio"
                  name="category"
                  checked={category === cat}
                  onChange={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                />
                <span className="checkbox-text">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Max Price</h4>
          <div className="price-slider-container">
            <input
              type="range"
              min="0"
              max="2000"
              step="20"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
              className="price-slider"
            />
            <div className="price-range-labels">
              <span>₹0</span>
              <span className="price-current-badge">${maxPrice}</span>
              <span>₹2000+</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Catalog Workspace */}
      <main className="catalog-workspace">
        <div className="catalog-header-bar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, maxPrice: '500px', minWidth: '250px' }}>
            <form onSubmit={handleSearchSubmit} className="catalog-search-form" style={{ width: '100%' }}>
              <input
                type="text"
                placeholder={isNaturalSearch ? "Try: best headphones under 3000..." : "Search products..."}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="catalog-search-input"
              />
              <button type="submit" className="search-submit-btn">Search</button>
            </form>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={isNaturalSearch}
                onChange={(e) => setIsNaturalSearch(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Enable Smart AI Natural Language Search</span>
            </label>
          </div>

          <div className="sort-selector-box">
            <label htmlFor="sort-dropdown">Sort By:</label>
            <select
              id="sort-dropdown"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
        
        {keyword === '' && page === 1 && (
          <RecommendationSection title="Recommended For You" />
        )}

        <div className="catalog-stats">
          <p>{total} products found</p>
        </div>

        {naturalMessage && (
          <div className={`natural-search-banner ${isFallback ? 'fallback' : ''}`} style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 800 }}>🤖 AI Search Interpretation:</span> {naturalMessage}
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loader-container" style={{ minHeight: '300px' }}>
            <div className="spinner"></div>
            <p>Loading products catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-catalog-fallback">
            <h3>No Products Found</h3>
            <p>Try modifying your search or filter values to view items.</p>
            <button onClick={handleClearFilters} className="btn btn-primary" style={{ maxWidth: '200px', marginTop: '1rem' }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="pagination-wrapper">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="pagination-btn arrow"
                >
                  &laquo; Prev
                </button>
                
                {[...Array(pages).keys()].map((pNum) => (
                  <button
                    key={pNum + 1}
                    onClick={() => setPage(pNum + 1)}
                    className={`pagination-btn number ${page === pNum + 1 ? 'active' : ''}`}
                  >
                    {pNum + 1}
                  </button>
                ))}

                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className="pagination-btn arrow"
                >
                  Next &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ProductsPage;
