import crypto from 'crypto';

/**
 * Verify Shopify webhook HMAC signature
 * @param {string} rawBody - Raw request body as string
 * @param {string} hmacHeader - HMAC header from request
 * @param {string} secret - Webhook secret
 * @returns {boolean} - True if signature is valid
 */
export function verifyWebhookHmac(rawBody, hmacHeader, secret) {
  if (!hmacHeader || !secret) {
    return false;
  }

  try {
    // Generate HMAC using webhook secret
    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    // Compare with header value (constant-time comparison)
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(hmacHeader)
    );
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Parse webhook request and verify signature
 * @param {Request} request - Next.js request object
 * @returns {Promise<{valid: boolean, data: object|null, error: string|null}>}
 */
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

    // Parse JSON body
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
