const BASE_URL = 'http://localhost:5000/api';

async function verifyValueScore() {
  console.log('===================================================');
  console.log('🚀 SHOPSPHERE PHASE 4: VALUE SCORE VERIFIER');
  console.log('===================================================');

  try {
    console.log('\n📝 Querying product catalog...');
    const res = await fetch(`${BASE_URL}/products?limit=5`);
    const data = await res.json();
    
    if (res.ok && data.success && data.data.products.length > 0) {
      console.log(`   [PASS] API response returned success.`);
      
      data.data.products.forEach((prod, i) => {
        console.log(`\n📦 Product [${i + 1}]: "${prod.name}"`);
        console.log(`   - Price: $${prod.price}`);
        console.log(`   - Discount: ${prod.discount}%`);
        console.log(`   - Rating: ${prod.rating}`);
        console.log(`   - Reviews: ${prod.numReviews}`);
        console.log(`   - Value-for-Money Score: ${prod.valueScore}/100`);
        
        // Assertions
        if (prod.valueScore === undefined || prod.valueScore < 0 || prod.valueScore > 100) {
          throw new Error(`Invalid value score returned: ${prod.valueScore}`);
        }
      });
      console.log('\n   [PASS] All product valueScores verified inside safe ranges.');
    } else {
      throw new Error(`Failed to load product catalog: ${data.message}`);
    }

    console.log('\n===================================================');
    console.log('💚 PHASE 4 SYSTEM IS 100% OPERATIONAL! 💚');
    console.log('===================================================');
    process.exit(0);

  } catch (error) {
    console.log('\n===================================================');
    console.log(`❌ VERIFICATION SUITE FAILED: ${error.message}`);
    console.log('===================================================');
    process.exit(1);
  }
}

verifyValueScore();
