const BASE_URL = 'http://localhost:5000/api';

async function verifyReviews() {
  console.log('===================================================');
  console.log('🚀 SHOPSPHERE PHASE 7: PRODUCT REVIEWS VERIFIER');
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

    // 2. Fetch catalog to choose a product
    console.log('\n📝 Loading product catalog...');
    const prodRes = await fetch(`${BASE_URL}/products?limit=1`);
    const prodData = await prodRes.json();
    if (!prodRes.ok || !prodData.success || prodData.data.products.length === 0) {
      throw new Error('Product catalog fetch failed.');
    }
    const testProduct = prodData.data.products[0];
    const testProductId = testProduct._id;
    console.log(`   [PASS] Selected Product: "${testProduct.name}" (${testProductId})`);

    // 3. Place order containing this product to pass the Verified Buyer Check!
    console.log('\n📝 Placing order to satisfy Verified Buyer constraint...');
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        orderItems: [{
          name: testProduct.name,
          quantity: 1,
          image: testProduct.image,
          price: testProduct.price,
          product: testProductId
        }],
        shippingAddress: {
          address: '123 Test Street',
          city: 'ReviewCity',
          state: 'RC',
          postalCode: '12345',
          phone: '1234567890'
        },
        paymentMethod: 'Cash on Delivery',
        totalAmount: testProduct.price
      })
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.success) {
      throw new Error(`Mock order placement failed: ${orderData.message}`);
    }
    console.log(`   [PASS] Order placed successfully. Order ID: #${orderData.data._id}`);

    // 4. Submit review
    console.log('\n📝 Submitting new product review...');
    const reviewRes = await fetch(`${BASE_URL}/products/${testProductId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Absolutely amazing product! Highly recommend.'
      })
    });
    const reviewData = await reviewRes.json();
    if (reviewRes.ok && reviewData.success) {
      console.log('   [PASS] Review added successfully.');
    } else {
      throw new Error(`Review submission failed: ${reviewData.message}`);
    }

    // 5. Submit duplicate review (should fail)
    console.log('\n📝 Submitting duplicate review (should be rejected)...');
    const dupRes = await fetch(`${BASE_URL}/products/${testProductId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: 4,
        comment: 'Nice duplicate review comment.'
      })
    });
    const dupData = await dupRes.json();
    if (!dupRes.ok && dupData.message === 'You have already reviewed this product') {
      console.log('   [PASS] Duplicate review successfully blocked by server.');
    } else {
      throw new Error(`Duplicate review check failed. Status: ${dupRes.status}, Message: ${dupData.message}`);
    }

    // 6. Delete review as Admin
    const updatedProduct = reviewData.data;
    const addedReviewId = updatedProduct.reviews[updatedProduct.reviews.length - 1]._id;
    console.log(`\n📝 Triggering admin review deletion (Review ID: ${addedReviewId})...`);
    const delRes = await fetch(`${BASE_URL}/products/${testProductId}/reviews/${addedReviewId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const delData = await delRes.json();
    if (delRes.ok && delData.success) {
      console.log('   [PASS] Review deleted by admin successfully.');
    } else {
      throw new Error(`Review deletion failed: ${delData.message}`);
    }

    console.log('\n===================================================');
    console.log('💚 PHASE 7 SYSTEM IS 100% OPERATIONAL! 💚');
    console.log('===================================================');
    process.exit(0);

  } catch (error) {
    console.log('\n===================================================');
    console.log(`❌ VERIFICATION SUITE FAILED: ${error.message}`);
    console.log('===================================================');
    process.exit(1);
  }
}

verifyReviews();
