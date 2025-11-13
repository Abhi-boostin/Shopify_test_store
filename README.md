# Next.js Shopify Storefront

A Next.js storefront connected to Shopify with product browsing, cart, and checkout.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Add your Shopify credentials to `.env.local`:
   - `NEXT_PUBLIC_SHOP_DOMAIN` - Your store domain
   - `NEXT_PUBLIC_STOREFRONT_TOKEN` - Storefront API token
   - `ADMIN_API_TOKEN` - Admin API token (keep secret)
   - `DEMO_ADMIN_SECRET` - Password for admin pages

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.example`
4. Deploy

## Security Note

Never commit `.env.local` or expose `ADMIN_API_TOKEN` to the client.
