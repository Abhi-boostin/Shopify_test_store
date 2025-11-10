import { NextResponse } from 'next/server';
import { storefrontGraphQL } from '@/lib/shopify';

// GraphQL mutation to create a checkout
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
        { error: 'Invalid request: lines array required' },
        { status: 400 }
      );
    }

    // Transform lines to Shopify format
    const lineItems = lines.map(line => ({
      variantId: line.variantId,
      quantity: line.quantity,
    }));

    // Create checkout via Storefront API
    const data = await storefrontGraphQL(CREATE_CHECKOUT_MUTATION, {
      input: { lineItems },
    });

    if (data.checkoutCreate.checkoutUserErrors.length > 0) {
      const errors = data.checkoutCreate.checkoutUserErrors;
      console.error('Checkout creation errors:', errors);
      return NextResponse.json(
        { error: errors[0].message },
        { status: 400 }
      );
    }

    const checkout = data.checkoutCreate.checkout;

    return NextResponse.json({
      checkoutUrl: checkout.webUrl,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
