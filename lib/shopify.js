// Shopify API configuration and helpers

// Shop domain - can be public or server-side
export const SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOP_DOMAIN || process.env.SHOP_DOMAIN;

// Storefront token - can be public or server-side
export const STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_STOREFRONT_TOKEN || process.env.STOREFRONT_TOKEN;

/**
 * Call Shopify Storefront GraphQL API
 * Safe to use client-side or server-side
 * @param {string} query - GraphQL query string
 * @param {object} variables - GraphQL variables
 * @returns {Promise<object>} - Response data
 */
export async function storefrontGraphQL(query, variables = {}) {
  if (!STOREFRONT_TOKEN) {
    throw new Error('STOREFRONT_TOKEN not configured');
  }

  if (!SHOP_DOMAIN) {
    throw new Error('SHOP_DOMAIN not configured');
  }

  try {
    const response = await fetch(
      `https://${SHOP_DOMAIN}/api/2024-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
      }
    );

    const json = await response.json();

    if (json.errors) {
      console.error('Storefront GraphQL errors:', JSON.stringify(json.errors, null, 2));
      throw new Error(json.errors[0]?.message || 'GraphQL query failed');
    }

    return json.data;
  } catch (error) {
    console.error('Storefront API error:', error);
    throw error;
  }
}

/**
 * Call Shopify Admin REST API
 * ⚠️ MUST run server-side only - requires ADMIN_API_TOKEN
 * @param {string} path - API path (e.g., '/products.json')
 * @param {string} method - HTTP method
 * @param {object} body - Request body
 * @returns {Promise<object>} - Response JSON
 */
export async function adminFetch(path, method = 'GET', body = null) {
  if (!process.env.ADMIN_API_TOKEN) {
    throw new Error('ADMIN_API_TOKEN not configured');
  }

  if (!process.env.SHOP_DOMAIN) {
    throw new Error('SHOP_DOMAIN not configured');
  }

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.ADMIN_API_TOKEN,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(
      `https://${process.env.SHOP_DOMAIN}/admin/api/2024-10${path}`,
      options
    );

    const json = await response.json();

    if (!response.ok) {
      console.error('Admin API error:', json);
      throw new Error(json.errors || `Admin API request failed: ${response.status}`);
    }

    return json;
  } catch (error) {
    console.error('Admin API error:', error);
    throw error;
  }
}
