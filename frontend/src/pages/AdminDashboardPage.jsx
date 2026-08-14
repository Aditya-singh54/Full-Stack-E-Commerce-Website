import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CATEGORIES = ['Electronics', 'Clothing', 'Shoes', 'Accessories', 'Home'];

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin state lists
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    salesByCategory: [],
    salesTrend: []
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCat, setProdCat] = useState('Electronics');
  const [prodImg, setProdImg] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDisc, setProdDisc] = useState('0');

  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error('Stats loading failed:', err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      // Query catalog with a high limit for dashboard list
      const res = await axios.get('/api/products?limit=1000');
      if (res.data.success) setProducts(res.data.data.products);
    } catch (err) {
      console.error('Products loading failed:', err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/admin/orders');
      if (res.data.success) setOrders(res.data.data);
    } catch (err) {
      console.error('Orders loading failed:', err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error('Users loading failed:', err.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      await fetchStats();
      if (activeTab === 'overview') {
        // Fetch all in background for tab swaps
        fetchProducts();
        fetchOrders();
        fetchUsers();
      } else if (activeTab === 'products') {
        await fetchProducts();
      } else if (activeTab === 'orders') {
        await fetchOrders();
      } else if (activeTab === 'users') {
        await fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync admin console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Handle Order status edits
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        // Refresh local orders and stats
        setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Handle Product deletes
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await axios.delete(`/api/products/${productId}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  // Open modal helper
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProdName(product.name);
      setProdPrice(product.price);
      setProdDesc(product.description);
      setProdCat(product.category);
      setProdImg(product.image);
      setProdStock(product.stock);
      setProdDisc(product.discount);
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdPrice('');
      setProdDesc('');
      setProdCat('Electronics');
      setProdImg('');
      setProdStock('');
      setProdDisc('0');
    }
    setShowModal(true);
  };

  // Save/Create Product Form
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    const payload = {
      name: prodName,
      price: Number(prodPrice),
      description: prodDesc,
      category: prodCat,
      image: prodImg,
      stock: Number(prodStock),
      discount: Number(prodDisc)
    };

    try {
      let res;
      if (editingProduct) {
        res = await axios.put(`/api/products/${editingProduct._id}`, payload);
      } else {
        res = await axios.post('/api/products', payload);
      }

      if (res.data.success) {
        setShowModal(false);
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product details.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'status-delivered';
      case 'Shipped': return 'status-shipped';
      case 'Confirmed': return 'status-confirmed';
      case 'Cancelled': return 'status-cancelled';
      case 'Pending':
      default:
        return 'status-pending';
    }
  };

  const downloadCSVReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ShopSphere E-Commerce Sales Report\n\n";
    csvContent += "Category Sales Performance\n";
    csvContent += "Category,Sales Volume (₹)\n";
    (stats.salesByCategory || []).forEach(item => {
      csvContent += `"${item.category}",${item.sales.toFixed(2)}\n`;
    });
    
    csvContent += "\nDaily Sales & Orders Trend\n";
    csvContent += "Date,Revenue,Orders Count\n";
    (stats.salesTrend || []).forEach(item => {
      csvContent += `${item.date},${item.revenue.toFixed(2)},${item.ordersCount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shopsphere_sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="details-layout-container" style={{ padding: '2rem 5%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Admin Control Panel</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={downloadCSVReport} className="btn" style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.9rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#fff' }}>
            📥 Download CSV Report
          </button>
          {activeTab === 'products' && (
            <button onClick={() => openModal()} className="btn btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
              + Add New Product
            </button>
          )}
        </div>
      </div>

      {/* Tabs side header menu */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`pagination-btn number ${activeTab === 'overview' ? 'active' : ''}`}
          style={{ width: 'auto', padding: '0.5rem 1.5rem', height: 'auto', borderRadius: '8px 8px 0 0' }}
        >
          Overview Stats
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pagination-btn number ${activeTab === 'products' ? 'active' : ''}`}
          style={{ width: 'auto', padding: '0.5rem 1.5rem', height: 'auto', borderRadius: '8px 8px 0 0' }}
        >
          Manage Catalog
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pagination-btn number ${activeTab === 'orders' ? 'active' : ''}`}
          style={{ width: 'auto', padding: '0.5rem 1.5rem', height: 'auto', borderRadius: '8px 8px 0 0' }}
        >
          Manage Orders
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pagination-btn number ${activeTab === 'users' ? 'active' : ''}`}
          style={{ width: 'auto', padding: '0.5rem 1.5rem', height: 'auto', borderRadius: '8px 8px 0 0' }}
        >
          Customer Directory
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loader-container" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
          <p>Syncing control panels...</p>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales (Revenue)</span>
                  <strong style={{ fontSize: '2rem', color: 'var(--success)' }}>₹{stats.totalRevenue.toFixed(2)}</strong>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders Placed</span>
                  <strong style={{ fontSize: '2rem', color: 'var(--primary)' }}>{stats.totalOrders}</strong>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Pending Orders</span>
                  <strong style={{ fontSize: '2rem', color: 'var(--warning)' }}>{stats.pendingOrders}</strong>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Out of Stock Items</span>
                  <strong style={{ fontSize: '2rem', color: 'var(--danger)' }}>{stats.outOfStockCount || 0}</strong>
                </div>

                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock Warnings</span>
                  <strong style={{ fontSize: '2rem', color: '#fbbf24' }}>{stats.lowStockCount || 0}</strong>
                </div>
              </div>

              {/* Graphical Visualizations (Sales Category Shares & Trends) */}
              <div className="product-details-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', background: 'transparent', padding: 0 }}>
                {/* Sales by Category progress list */}
                <div style={{ padding: '1.75rem', background: 'rgba(19, 26, 44, 0.3)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Sales Distribution by Category
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {(stats.salesByCategory || []).map((item) => {
                      const share = stats.totalRevenue > 0 ? (item.sales / stats.totalRevenue) * 100 : 0;
                      return (
                        <div key={item.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: 600 }}>{item.category}</span>
                            <span style={{ color: 'var(--text-muted)' }}>₹{item.sales.toFixed(2)} ({share.toFixed(0)}%)</span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${share}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      );
                    })}
                    {(!stats.salesByCategory || stats.salesByCategory.length === 0) && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No category sales data recorded.</p>
                    )}
                  </div>
                </div>

                {/* Sales Daily Trend chart */}
                <div style={{ padding: '1.75rem', background: 'rgba(19, 26, 44, 0.3)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Daily Sales Trends (Last 14 Days)
                  </h3>
                  <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', padding: '0 0.5rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                    {(stats.salesTrend || []).map((day) => {
                      const maxRevenue = Math.max(...stats.salesTrend.map(d => d.revenue), 10);
                      const heightPercent = (day.revenue / maxRevenue) * 100;
                      return (
                        <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative' }} className="trend-bar-column">
                          <div style={{ width: '14px', height: `${Math.max(8, heightPercent)}%`, background: 'var(--accent)', borderRadius: '4px 4px 0 0', position: 'relative', minHeight: '4px' }} className="trend-bar-fill">
                            <span className="trend-bar-tooltip">₹{day.revenue.toFixed(0)}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', transform: 'rotate(-45deg)', display: 'block', height: '20px', whiteSpace: 'nowrap' }}>
                            {day.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                    {(!stats.salesTrend || stats.salesTrend.length === 0) && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', width: '100%', padding: '2rem 0' }}>No sales trend recorded.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Summary Cards/Timelines */}
              <div className="product-details-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '2rem', background: 'transparent', padding: 0 }}>
                <div style={{ padding: '1.75rem', background: 'rgba(19, 26, 44, 0.3)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Recent Order Logs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {orders.slice(0, 5).map((o) => (
                      <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.3)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <div>
                          <strong>{o.user?.name || 'Customer'}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>ID: #{o._id}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{o.totalAmount.toFixed(2)}</span>
                        <span className={`order-status-badge ${getStatusClass(o.orderStatus)}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>{o.orderStatus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '1.75rem', background: 'rgba(19, 26, 44, 0.3)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Low Stock Inventory warnings</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {products.filter(p => p.stock <= 3).slice(0, 5).map((p) => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.3)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <span>{p.name}</span>
                        <span style={{ color: p.stock === 0 ? 'var(--danger)' : 'var(--warning)', fontWeight: 700 }}>
                          {p.stock === 0 ? 'Out of Stock' : `${p.stock} Left`}
                        </span>
                      </div>
                    ))}
                    {products.filter(p => p.stock <= 3).length === 0 && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>All product stocks are healthy!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT CATALOG */}
          {activeTab === 'products' && (
            <div style={{ background: 'rgba(19, 26, 44, 0.3)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem' }}>Thumbnail</th>
                      <th style={{ padding: '1rem' }}>Product Name</th>
                      <th style={{ padding: '1rem' }}>Category</th>
                      <th style={{ padding: '1rem' }}>Base Price</th>
                      <th style={{ padding: '1rem' }}>Discount</th>
                      <th style={{ padding: '1rem' }}>Stock</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }} className="table-row-hover">
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: 'var(--bg-secondary)' }} />
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500, maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{p.category}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>₹{p.price.toFixed(2)}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{p.discount > 0 ? `${p.discount}%` : '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: p.stock === 0 ? 'var(--danger)' : p.stock <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                          {p.stock}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => openModal(p)}
                              style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER FULFILLMENT */}
          {activeTab === 'orders' && (
            <div style={{ background: 'rgba(19, 26, 44, 0.3)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem' }}>Order ID</th>
                      <th style={{ padding: '1rem' }}>Date Placed</th>
                      <th style={{ padding: '1rem' }}>Customer</th>
                      <th style={{ padding: '1rem' }}>Revenue Amount</th>
                      <th style={{ padding: '1rem' }}>Order Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Change Fulfullment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>#{o._id}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong>{o.user?.name || 'Customer'}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{o.user?.email || 'N/A'}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>₹{o.totalAmount.toFixed(2)}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`order-status-badge ${getStatusClass(o.orderStatus)}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            style={{
                              backgroundColor: 'rgba(15, 23, 42, 0.7)',
                              color: '#fff',
                              border: '1px solid var(--border-color)',
                              borderRadius: '4px',
                              padding: '0.3rem 0.5rem',
                              fontFamily: 'inherit',
                              fontSize: '0.85rem',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USER DIRECTORY */}
          {activeTab === 'users' && (
            <div style={{ background: 'rgba(19, 26, 44, 0.3)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '1rem' }}>User ID</th>
                      <th style={{ padding: '1rem' }}>Full Name</th>
                      <th style={{ padding: '1rem' }}>Email Address</th>
                      <th style={{ padding: '1rem' }}>Role Permission</th>
                      <th style={{ padding: '1rem' }}>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>#{u._id}</td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{u.name}</td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* OVERLAY MODAL: PRODUCT CREATE / EDIT FORM */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div className="auth-card" style={{ maxWidth: '600px', width: '100%', padding: '2.25rem 2.5rem', maxStatus: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="auth-form" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="Premium Bluetooth Speaker"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Base Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="99.99"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Discount Percentage (%)</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={prodDisc}
                    onChange={(e) => setProdDisc(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Warehouse Stock Inventory</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL Path</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={prodImg}
                  onChange={(e) => setProdImg(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Product Description</label>
                <textarea
                  rows="4"
                  placeholder="Write a clear, detailed product description here..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  required
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    fontSize: '0.95rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn"
                  style={{ border: '1px solid var(--border-color)', color: '#fff', backgroundColor: 'rgba(255,255,255,0.02)' }}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Saving changes...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboardPage;
