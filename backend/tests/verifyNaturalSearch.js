const BASE_URL = 'http://localhost:5000/api';

async function verifyNaturalSearch() {
  console.log('===================================================');
  console.log('🚀 SHOPSPHERE PHASE 3: NATURAL SEARCH VERIFIER');
  console.log('===================================================');

  try {
    const testQueries = [
      'best headphones under 3000',
      'cheap wireless earbuds',
      'shoes under 2000'
    ];

    for (const q of testQueries) {
      console.log(`\n📝 Submitting natural query: "${q}"...`);
      const res = await fetch(`${BASE_URL}/products/natural-search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        console.log(`   [PASS] API response returned success.`);
        console.log(`          Message: "${data.data.message}"`);
        console.log(`          Products Found: ${data.data.products.length}`);
        console.log(`          Extracted Category: ${data.data.extractedIntent.category || 'N/A'}`);
        console.log(`          Extracted Max Price: ${data.data.extractedIntent.maxPrice || 'N/A'}`);
      } else {
        throw new Error(`Query failed: ${data.message}`);
      }
    }

    console.log('\n===================================================');
    console.log('💚 PHASE 3 SYSTEM IS 100% OPERATIONAL! 💚');
    console.log('===================================================');
    process.exit(0);

  } catch (error) {
    console.log('\n===================================================');
    console.log(`❌ VERIFICATION SUITE FAILED: ${error.message}`);
    console.log('===================================================');
    process.exit(1);
  }
}

verifyNaturalSearch();
