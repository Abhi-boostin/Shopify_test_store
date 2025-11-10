import { NextResponse } from 'next/server';
import { storefrontGraphQL } from '@/lib/shopify';

const CREATE_CART_MUTATION = `
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

    const cartLines = lines.map(line => ({
      merchandiseId: line.variantId,
      quantity: line.quantity,
    }));

    const data = await storefrontGraphQL(CREATE_CART_MUTATION, {
      input: { lines: cartLines },
    });

    if (data.cartCreate.userErrors.length > 0) {
      const errors = data.cartCreate.userErrors;
      console.error('Cart creation errors:', errors);
      return NextResponse.json({
        ok: false,
        error: errors[0].message || 'Failed to create cart',
      }, { status: 400 });
    }

    const cart = data.cartCreate.cart;

    return NextResponse.json({
      ok: true,
      checkoutUrl: cart.checkoutUrl,
      cartId: cart.id,
    });
  } catch (error) {
    console.error('Cart creation error:', error);
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to create cart',
    }, { status: 500 });
  }
}
