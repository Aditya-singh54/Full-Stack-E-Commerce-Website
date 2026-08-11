const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('===================================================');
  console.log('🚀 SHOPSPHERE END-TO-END REST API VERIFICATION SUITE');
  console.log('===================================================');

  let token = '';
  let prodId = '';
  let prodName = '';
  let orderId = '';

  try {
    // TEST 1: LOGIN AUTHENTICATION
    console.log('\n📝 TEST 1: Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shopsphere.com',
        password: 'admin123'
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.success) {
      token = loginData.data.token;
      console.log('   [PASS] Login successful. JWT token received.');
    } else {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    // TEST 2: GET PRODUCTS LIST
    console.log('\n📝 TEST 2: Retrieving products catalog...');
    const prodRes = await fetch(`${BASE_URL}/products?limit=10`);
    const prodData = await prodRes.json();
    if (prodRes.ok && prodData.success && prodData.data.products.length > 0) {
      const firstProduct = prodData.data.products[0];
      prodId = firstProduct._id;
      prodName = firstProduct.name;
      console.log(`   [PASS] Retrieved ${prodData.data.products.length} products successfully.`);
      console.log(`          Selected Product for Cart Tests: "${prodName}" (${prodId})`);
    } else {
      throw new Error(`Products retrieval failed: ${prodData.message}`);
    }

    // TEST 3: ADD ITEM TO SHOPPING CART
    console.log('\n📝 TEST 3: Adding item to user shopping cart...');
    const cartAddRes = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: prodId,
        quantity: 1
      })
    });
    const cartAddData = await cartAddRes.json();
    if (cartAddRes.ok && cartAddData.success) {
      console.log('   [PASS] Product added to shopping cart in Mongoose.');
    } else {
      throw new Error(`Add to cart failed: ${cartAddData.message}`);
    }

    // TEST 4: RETRIEVE USER CART
    console.log('\n📝 TEST 4: Querying active shopping cart...');
    const cartGetRes = await fetch(`${BASE_URL}/cart`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cartGetData = await cartGetRes.json();
    if (cartGetRes.ok && cartGetData.success) {
      const items = cartGetData.data.products;
      if (items.some(i => i.product._id === prodId)) {
        console.log(`   [PASS] Cart contains matching item. Cart Size: ${items.length}`);
      } else {
        throw new Error('Retrieved cart is missing the added product.');
      }
    } else {
      throw new Error(`Fetch cart failed: ${cartGetData.message}`);
    }

    // TEST 5: CHECKOUT ORDER CREATION
    console.log('\n📝 TEST 5: Placing Cash on Delivery order...');
    const orderItems = [{
      name: prodName,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      price: 99.99,
      product: prodId
    }];
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        orderItems,
        shippingAddress: {
          address: '456 Verification Lane',
          city: 'QA City',
          state: 'Testing State',
          postalCode: '90210',
          phone: '9876543210'
        },
        paymentMethod: 'Cash on Delivery',
        totalAmount: 99.99
      })
    });
    const orderData = await orderRes.json();
    if (orderRes.ok && orderData.success) {
      orderId = orderData.data._id;
      console.log(`   [PASS] Order placed successfully. Order ID: #${orderId}`);
    } else {
      throw new Error(`Order placement failed: ${orderData.message}`);
    }

    // TEST 6: VERIFY CART IS CLEARED ON CHECKOUT
    console.log('\n📝 TEST 6: Verifying checkout cart auto-reset...');
    const postCartRes = await fetch(`${BASE_URL}/cart`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const postCartData = await postCartRes.json();
    if (postCartRes.ok && postCartData.success) {
      const items = postCartData.data.products;
      if (items.length === 0) {
        console.log('   [PASS] Cart cleared correctly upon successful order checkout.');
      } else {
        throw new Error(`Cart should be empty, but contains ${items.length} items.`);
      }
    } else {
      throw new Error(`Post-checkout cart query failed: ${postCartData.message}`);
    }

    // TEST 7: ADMIN STATS RETRIEVAL
    console.log('\n📝 TEST 7: Querying Admin Dashboard Stats...');
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    if (statsRes.ok && statsData.success) {
      const { totalProducts, totalOrders, totalRevenue } = statsData.data;
      console.log('   [PASS] Admin stats retrieved successfully.');
      console.log(`          Catalog Size: ${totalProducts} | Orders Volume: ${totalOrders} | Revenue Sum: $${totalRevenue}`);
    } else {
      throw new Error(`Fetch stats failed: ${statsData.message}`);
    }

    // TEST 8: UPDATE ORDER STATUS (ADMIN ACTION)
    console.log('\n📝 TEST 8: Triggering Admin Order Fulfillment Update...');
    const statusUpdateRes = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'Shipped' })
    });
    const statusUpdateData = await statusUpdateRes.json();
    if (statusUpdateRes.ok && statusUpdateData.success) {
      console.log(`   [PASS] Order status updated to "Shipped" successfully.`);
    } else {
      throw new Error(`Order status update failed: ${statusUpdateData.message}`);
    }

    // TEST 9: VERIFY CUSTOMER ORDER DETAILS REFLECTS STATUS
    console.log('\n📝 TEST 9: Verifying customer tracking details...');
    const detailRes = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const detailData = await detailRes.json();
    if (detailRes.ok && detailData.success) {
      if (detailData.data.orderStatus === 'Shipped') {
        console.log('   [PASS] Customer details successfully reflects fulfillment status change.');
      } else {
        throw new Error(`Expected order status "Shipped", but got "${detailData.data.orderStatus}"`);
      }
    } else {
      throw new Error(`Fetch order details failed: ${detailData.message}`);
    }

    console.log('\n===================================================');
    console.log('💚 ALL API ENDPOINT TESTS PASSED SUCCESSFULLY! 💚');
    console.log('===================================================');
    process.exit(0);

  } catch (error) {
    console.log('\n===================================================');
    console.log(`❌ TEST SUITE FAILED: ${error.message}`);
    console.log('===================================================');
    process.exit(1);
  }
}

// Ensure the local backend server is running before executing this script
runTests();
