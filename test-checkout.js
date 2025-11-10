const SHOP = 'test-store-1100000000000000000000000000000002096.myshopify.com';
const TOKEN = '0de9562e7ade2498e3d47d9b739635cb';

async function testCheckout() {
  console.log('Fetching a product variant first...\n');
  
  const productsQuery = `
    query {
      products(first: 1) {
        edges {
          node {
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const productsRes = await fetch(`https://${SHOP}/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN
    },
    body: JSON.stringify({ query: productsQuery })
  });

  const productsData = await productsRes.json();
  
  if (productsData.errors) {
    console.error('Error fetching products:', productsData.errors);
    return;
  }

  const product = productsData.data.products.edges[0]?.node;
  if (!product) {
    console.error('No products found in store');
    return;
  }

  const variant = product.variants.edges[0]?.node;
  console.log('Found product:', product.title);
  console.log('Variant ID:', variant.id);
  console.log('Price:', variant.price.amount);
  console.log('\n--- Testing cartCreate ---\n');

  const cartMutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          code
          field
          message
        }
      }
    }
  `;

  const cartRes = await fetch(`https://${SHOP}/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN
    },
    body: JSON.stringify({
      query: cartMutation,
      variables: {
        input: {
          lines: [
            {
              merchandiseId: variant.id,
              quantity: 1
            }
          ]
        }
      }
    })
  });

  const cartData = await cartRes.json();
  
  if (cartData.errors) {
    console.error('❌ GraphQL Errors:', JSON.stringify(cartData.errors, null, 2));
    return;
  }

  if (cartData.data.cartCreate.userErrors.length > 0) {
    console.error('❌ User Errors:', JSON.stringify(cartData.data.cartCreate.userErrors, null, 2));
    return;
  }

  const checkoutUrl = cartData.data.cartCreate.cart.checkoutUrl;
  console.log('✅ SUCCESS!');
  console.log('\nCheckout URL:', checkoutUrl);
  console.log('\nOpen this URL in your browser to test Bogus Gateway:');
  console.log(checkoutUrl);
}

testCheckout().catch(err => {
  console.error('Fatal error:', err);
});
