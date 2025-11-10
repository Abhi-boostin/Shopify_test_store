// Quick test script to verify Storefront token
const SHOP = 'test-store-1100000000000000000000000000000002096.myshopify.com';
const TOKEN = '0de9562e7ade2498e3d47d9b739635cb';

console.log('Testing Shopify Storefront API...');
console.log('Shop:', SHOP);
console.log('Token (first 10 chars):', TOKEN.substring(0, 10) + '...');
console.log('');

fetch(`https://${SHOP}/api/2024-10/graphql.json`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': TOKEN
  },
  body: JSON.stringify({ 
    query: '{ shop { name } }' 
  })
})
.then(res => res.json())
.then(json => {
  console.log('Response:');
  console.log(JSON.stringify(json, null, 2));
  
  if (json.errors) {
    console.log('\n❌ ERROR: Token is invalid or missing permissions');
    console.log('\nTo fix:');
    console.log('1. Go to Shopify Admin → Settings → Apps and sales channels');
    console.log('2. Click "Develop apps" → Select your app');
    console.log('3. Go to "Configuration" tab');
    console.log('4. Under "Storefront API access scopes", enable:');
    console.log('   - unauthenticated_read_product_listings');
    console.log('   - unauthenticated_write_checkouts');
    console.log('5. Click "Save"');
    console.log('6. Go to "API credentials" tab');
    console.log('7. Click "Install app" (if not installed)');
    console.log('8. Copy the new Storefront access token');
  } else if (json.data) {
    console.log('\n✅ SUCCESS: Token is valid!');
    console.log('Shop name:', json.data.shop.name);
  }
})
.catch(err => {
  console.error('❌ Network error:', err.message);
});
