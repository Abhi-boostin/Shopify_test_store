import { NextResponse } from 'next/server';
import { adminFetch } from '@/lib/shopify';

export async function POST(request) {
  try {
    // Verify demo admin secret
    const secret = request.headers.get('x-demo-admin-secret');
    if (secret !== process.env.DEMO_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin secret' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product } = body;

    if (!product) {
      return NextResponse.json(
        { error: 'Invalid request: product object required' },
        { status: 400 }
      );
    }

    // Create product via Admin API
    const result = await adminFetch('/products.json', 'POST', { product });

    console.log('Product created:', result.product.id);

    return NextResponse.json({
      success: true,
      product: result.product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
