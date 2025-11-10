import { NextResponse } from 'next/server';
import { adminFetch } from '@/lib/shopify';

export async function GET(request) {
  try {
    // Verify demo admin secret
    const secret = request.headers.get('x-demo-admin-secret');
    if (secret !== process.env.DEMO_ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin secret' },
        { status: 401 }
      );
    }

    // Fetch recent orders from Shopify Admin API
    const result = await adminFetch('/orders.json?limit=50&status=any');

    return NextResponse.json({
      success: true,
      orders: result.orders || [],
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
