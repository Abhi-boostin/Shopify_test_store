# Next.js Shopify Storefront Demo

Next.js storefront demo wired to Shopify (Storefront + Admin + webhooks).

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

## Environment Variables

### Local Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Shopify credentials in `.env.local`:
   - `NEXT_PUBLIC_SHOP_DOMAIN` - Your store domain (e.g., `your-store.myshopify.com`)
   - `NEXT_PUBLIC_STOREFRONT_TOKEN` - Storefront API access token (safe for client-side)
   - `SHOP_DOMAIN` - Same as above (for server-side use)
   - `STOREFRONT_TOKEN` - Same storefront token (for server-side use)
   - `ADMIN_API_TOKEN` - Admin API access token (NEVER expose to client)
   - `WEBHOOK_SECRET` - Secret for webhook HMAC verification
   - `DEMO_ADMIN_SECRET` - Password for demo admin endpoints

**IMPORTANT:** Never commit `.env.local` to Git. It contains sensitive credentials.

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Go to **Project Settings → Environment Variables**
4. Add all variables from `.env.example` with your actual values
5. Set `ADMIN_API_TOKEN` and `WEBHOOK_SECRET` to **Production** and **Preview** only (not Development)
6. Deploy

### Webhook Configuration

After deploying to Vercel:

1. Copy your Vercel preview/production URL (e.g., `https://your-app.vercel.app`)
2. In Shopify Admin, go to **Settings → Notifications → Webhooks**
3. Create webhook:
   - Event: `Order creation`
   - URL: `https://your-app.vercel.app/api/webhooks/orders`
   - Format: JSON
4. Use your `WEBHOOK_SECRET` value for verification

## Demo Checklist

- [ ] Products seeded (use seed script or create via `/api/admin/create-product`)
- [ ] Products display on homepage
- [ ] Product detail pages load correctly
- [ ] Add to cart functionality works
- [ ] Checkout flow redirects to Shopify checkout
- [ ] Webhook verification working (check logs after test order)
- [ ] Admin endpoints protected with `DEMO_ADMIN_SECRET`

## 2-Minute Demo Flow

1. **Seed products**: Run `node scripts/seed-demo.js` or manually create via admin endpoint
2. **View frontend**: Navigate to homepage, see products listed
3. **Add to cart**: Click product → Add to cart → View cart
4. **Checkout**: Click checkout button → Redirects to Shopify checkout
5. **Complete order**: Complete test order in Shopify
6. **Verify webhook**: Check server logs for webhook received message
7. **Check Shopify Admin**: View order in Shopify dashboard

## API Endpoints

### Public Endpoints
- `GET /` - Homepage with product listing
- `GET /product/[handle]` - Product detail page
- `GET /cart` - Shopping cart page
- `POST /api/create-checkout` - Create Shopify checkout

### Protected Admin Endpoints (require `x-demo-admin-secret` header)
- `POST /api/admin/create-product` - Create product via Admin API
- `POST /api/admin/update-inventory` - Update inventory levels

### Webhook Endpoints
- `POST /api/webhooks/orders` - Order creation webhook (HMAC verified)

## Security Reminders

⚠️ **NEVER commit these to Git:**
- `ADMIN_API_TOKEN`
- `WEBHOOK_SECRET`
- `.env.local` file

✅ **Safe for client-side:**
- `NEXT_PUBLIC_SHOP_DOMAIN`
- `NEXT_PUBLIC_STOREFRONT_TOKEN` (Storefront API token only)

## Project Structure

```
├── app/
│   ├── page.js                          # Homepage (product listing)
│   ├── product/[handle]/page.js         # Product detail page
│   ├── cart/page.js                     # Shopping cart
│   └── api/
│       ├── create-checkout/route.js     # Checkout creation
│       ├── admin/
│       │   ├── create-product/route.js  # Admin: create product
│       │   └── update-inventory/route.js # Admin: update inventory
│       └── webhooks/
│           └── orders/route.js          # Order webhook handler
├── lib/
│   └── shopify.js                       # Shopify API helpers
├── utils/
│   └── webhook.js                       # Webhook verification helper
├── scripts/
│   └── seed-demo.js                     # Product seeding script
└── data/
    └── shopify_demo_products.csv        # Sample product data
```

## Troubleshooting

- **Products not loading**: Check `NEXT_PUBLIC_STOREFRONT_TOKEN` is set correctly
- **Checkout fails**: Verify `STOREFRONT_TOKEN` has checkout permissions
- **Admin endpoints fail**: Ensure `x-demo-admin-secret` header matches `DEMO_ADMIN_SECRET`
- **Webhook verification fails**: Double-check `WEBHOOK_SECRET` matches Shopify webhook config
