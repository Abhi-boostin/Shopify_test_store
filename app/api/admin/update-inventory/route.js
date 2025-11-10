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
    const { inventoryItemId, locationId, available } = body;

    if (!inventoryItemId || !locationId || available === undefined) {
      return NextResponse.json(
        { error: 'Invalid request: inventoryItemId, locationId, and available are required' },
        { status: 400 }
      );
    }

    // Update inventory via Admin API
    const result = await adminFetch('/inventory_levels/set.json', 'POST', {
      inventory_item_id: inventoryItemId,
      location_id: locationId,
      available: available,
    });

    console.log('Inventory updated:', result);

    return NextResponse.json({
      success: true,
      inventoryLevel: result.inventory_level,
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update inventory' },
      { status: 500 }
    );
  }
}
