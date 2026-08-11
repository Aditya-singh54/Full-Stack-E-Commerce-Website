const BASE_URL = 'http://localhost:5000/api';

async function verifyAdminStats() {
  console.log('===================================================');
  console.log('🚀 SHOPSPHERE PHASE 6: ADMIN STATS VERIFIER');
  console.log('===================================================');

  try {
    // 1. Login as Admin
    console.log('\n📝 Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shopsphere.com',
        password: 'admin123'
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.success) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    const token = loginData.data.token;
    console.log('   [PASS] Login successful.');

    // 2. Fetch admin stats
    console.log('\n📝 Retrieving extended admin dashboard metrics...');
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    
    if (statsRes.ok && statsData.success) {
      const stats = statsData.data;
      console.log('   [PASS] Admin stats retrieved successfully.');
      console.log(`          Total Revenue: $${stats.totalRevenue}`);
      console.log(`          Total Orders: ${stats.totalOrders}`);
      console.log(`          Out of Stock Products: ${stats.outOfStockCount}`);
      console.log(`          Low Stock Warnings: ${stats.lowStockCount}`);
      console.log(`          Sales by Category Count: ${stats.salesByCategory.length}`);
      console.log(`          Daily Sales Trend Points: ${stats.salesTrend.length}`);
      
      // Assertions
      if (stats.outOfStockCount === undefined || stats.lowStockCount === undefined) {
        throw new Error('Stock metric aggregation missing from stats response.');
      }
      if (!Array.isArray(stats.salesByCategory) || !Array.isArray(stats.salesTrend)) {
        throw new Error('Sales distribution or trend arrays are missing.');
      }
    } else {
      throw new Error(`Failed to load admin stats: ${statsData.message}`);
    }

    console.log('\n===================================================');
    console.log('💚 PHASE 6 SYSTEM IS 100% OPERATIONAL! 💚');
    console.log('===================================================');
    process.exit(0);

  } catch (error) {
    console.log('\n===================================================');
    console.log(`❌ VERIFICATION SUITE FAILED: ${error.message}`);
    console.log('===================================================');
    process.exit(1);
  }
}

verifyAdminStats();
