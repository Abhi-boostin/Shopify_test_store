import crypto from 'crypto';

export function verifyWebhookHmac(rawBody, hmacHeader, secret) {
  if (!hmacHeader || !secret) {
    return false;
  }

  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(hmacHeader)
    );
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

export async function parseAndVerifyWebhook(request) {
  try {
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    const rawBody = await request.text();

    if (!process.env.WEBHOOK_SECRET) {
      return {
        valid: false,
        data: null,
        error: 'WEBHOOK_SECRET not configured',
      };
    }

    const isValid = verifyWebhookHmac(rawBody, hmacHeader, process.env.WEBHOOK_SECRET);

    if (!isValid) {
      return {
        valid: false,
        data: null,
        error: 'Invalid HMAC signature',
      };
    }

    const data = JSON.parse(rawBody);

    return {
      valid: true,
      data,
      error: null,
    };
  } catch (error) {
    return {
      valid: false,
      data: null,
      error: error.message,
    };
  }
}
