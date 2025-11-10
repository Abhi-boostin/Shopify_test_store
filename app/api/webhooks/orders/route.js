import { NextResponse } from 'next/server';
import { parseAndVerifyWebhook } from '@/utils/webhook';

export async function POST(request) {
  try {
    // Parse and verify webhook signature
    const { valid, data, error } = await parseAndVerifyWebhook(request);

    if (!valid) {
      console.error('Webhook verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Webhook is valid - process order
    const order = data;
    
    console.log('✅ Order webhook received and verified');
    console.log('Order ID:', order.id);
    console.log('Order Number:', order.order_number || order.name);
    console.log('Customer:', order.customer?.email || 'Guest');
    console.log('Total:', order.total_price, order.currency);
    console.log('Line Items:', order.line_items?.length || 0);

    // TODO: Add your business logic here
    // Examples:
    // - Forward order to supplier/fulfillment service
    // - Update internal inventory system
    // - Send confirmation email
    // - Trigger analytics event
    // - Call adminFetch() to update product data

    // Example: Log line items
    if (order.line_items) {
      order.line_items.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.name} x${item.quantity} - ${item.price} ${order.currency}`);
      });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
