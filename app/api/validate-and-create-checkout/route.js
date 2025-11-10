import { NextResponse } from 'next/server';
import { storefrontGraphQL } from '@/lib/shopify';

// GraphQL query to get variant inventory info
const GET_VARIANTS_QUERY = `
  query GetVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        availableForSale
        quantityAvailable
        product {
          title
        }
      }
    }
  }
`;

// GraphQL mutation to create checkout
const CREATE_CHECKOUT_MUTATION = `
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { lines } = body;

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request: lines array required' },
        { status: 400 }
      );
    }

    // Step 1: Validate inventory availability
    const variantIds = lines.map(line => line.variantId);
    
    try {
      const variantsData = await storefrontGraphQL(GET_VARIANTS_QUERY, { ids: variantIds });
      
      // Check each variant's availability
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const variant = variantsData.nodes[i];
        
        if (!variant) {
          return NextResponse.json({
            ok: false,
            error: `Product variant not found`,
          }, { status: 400 });
        }

        if (!variant.availableForSale) {
          return NextResponse.json({
            ok: false,
            error: `${variant.product.title} - ${variant.title} is not available for sale`,
          }, { status: 400 });
        }

        // Check if requested quantity is available
        if (variant.quantityAvailable !== null && line.quantity > variant.quantityAvailable) {
          return NextResponse.json({
            ok: false,
            error: `Only ${variant.quantityAvailable} available for ${variant.product.title} - ${variant.title}`,
            available: variant.quantityAvailable,
          }, { status: 400 });
        }
      }
    } catch (err) {
      console.error('Inventory validation error:', err);
      // Continue to checkout even if validation fails (Shopify will handle it)
    }

    // Step 2: Create checkout
    const lineItems = lines.map(line => ({
      variantId: line.variantId,
      quantity: line.quantity,
    }));

    const checkoutData = await storefrontGraphQL(CREATE_CHECKOUT_MUTATION, {
      input: { lineItems },
    });

    if (checkoutData.checkoutCreate.checkoutUserErrors.length > 0) {
      const errors = checkoutData.checkoutCreate.checkoutUserErrors;
      console.error('Checkout creation errors:', errors);
      return NextResponse.json({
        ok: false,
        error: errors[0].message || 'Failed to create checkout',
      }, { status: 400 });
    }

    const checkout = checkoutData.checkoutCreate.checkout;

    return NextResponse.json({
      ok: true,
      checkoutUrl: checkout.webUrl,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to create checkout',
    }, { status: 500 });
  }
}
