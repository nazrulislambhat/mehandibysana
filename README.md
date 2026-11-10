# Mehandi by Sana — Headless Storefront

Minimal, editorial headless storefront for **mehandibysana.com** built with **Next.js 16 (App Router, TypeScript, Tailwind CSS v4)** and **Zustand**, backed by **WordPress + WooCommerce**.

---

## 1. Architecture Overview

- **Catalog & ISR (`frontend/src/lib/wc-catalog.ts`)**:
  - Server Components fetch products, variations, categories, and live product totals (`X-WP-Total`) from WooCommerce REST v3 (when read-only keys are configured) or public WooCommerce Store API v1 (`/wp-json/wc/store/v1/products`).
  - Cached via Next.js ISR (`revalidate = 3600`) with cache tags (`products`, `categories`, `product:<slug>`) invalidated on demand via `POST /api/revalidate`.
- **Shopping Bag (`frontend/src/store/cart-store.ts` + `frontend/src/app/api/cart/*`)**:
  - Client state managed in Zustand (`mbs_wc_cart_session` in `localStorage`) and proxied through `/api/cart`, `/api/cart/add-item`, `/api/cart/update-item`, and `/api/cart/remove-item` to forward WooCommerce `Cart-Token` and `Nonce` headers cleanly with automatic expired-nonce retry.
- **Checkout Handoff (`frontend/src/app/checkout/page.tsx` + `frontend/src/app/api/checkout-handoff/route.ts`)**:
  - Payment is handled exclusively by WordPress WooCommerce. `/checkout` attaches the active `cart_token` and redirects to `${WP_BASE_URL}/checkout/?cart_token=...`. See [`WORDPRESS_THEME_NOTES.md`](./WORDPRESS_THEME_NOTES.md) for the WordPress checkout CSS and `mu-plugin` session bridge.
- **Portable Design System (`frontend/src/styles/tokens.css`)**:
  - All colors, typography, spacing, radii, and transitions live in `frontend/src/styles/tokens.css`, consumed by Tailwind CSS v4 and shared verbatim with WordPress checkout.

---

## 2. Local Setup

### Prerequisites
- Node.js `>= 20`
- npm `>= 10`
- A **staging** WordPress + WooCommerce instance with Store API enabled

### Installation

```bash
# Install workspace dependencies from repository root
npm install

# Copy environment template
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local` with your **staging** WordPress URL and optional read-only WooCommerce REST keys:

```env
WP_BASE_URL=https://staging.example.com
WC_CONSUMER_KEY=ck_your_readonly_staging_consumer_key
WC_CONSUMER_SECRET=cs_your_readonly_staging_consumer_secret
REVALIDATE_SECRET=replace_with_a_long_random_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Safety Rule:** Always point `WP_BASE_URL` and WooCommerce keys to your **staging** WordPress environment during development and testing. Never expose `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, or `REVALIDATE_SECRET` with a `NEXT_PUBLIC_` prefix.

### Development & Verification Commands

```bash
# Start Next.js dev server (http://localhost:3000)
npm run dev --workspace=frontend

# Run ESLint across the storefront
npm run lint --workspace=frontend

# Create production build
npm run build --workspace=frontend
```

---

## 3. Environment Variables

| Variable | Scope | Required | Description |
| :--- | :--- | :--- | :--- |
| `WP_BASE_URL` | Server-only | Yes | Base URL of your staging WordPress site (e.g. `https://staging.example.com`, no trailing slash). |
| `WC_CONSUMER_KEY` | Server-only | Optional | Read-only WooCommerce REST v3 consumer key (`ck_...`). If omitted, catalog falls back to public Store API v1. |
| `WC_CONSUMER_SECRET` | Server-only | Optional | Read-only WooCommerce REST v3 consumer secret (`cs_...`). |
| `REVALIDATE_SECRET` | Server-only | Recommended | Shared secret authenticating WooCommerce webhooks calling `POST /api/revalidate`. |
| `NEXT_PUBLIC_SITE_URL` | Public | Recommended | Canonical frontend URL used for metadata, OpenGraph tags, `sitemap.xml`, and `robots.txt`. |

---

## 4. Deployment Steps

1. **Host the Next.js App** (Vercel, Netlify, or Node.js container):
   - Set **Root Directory** to `frontend` (or run `npm run build --workspace=frontend` and `npm run start --workspace=frontend` from the repo root).
   - Configure all environment variables (`WP_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`) in your hosting provider's dashboard.
2. **Configure WordPress Checkout Theme & Session Bridge**:
   - Follow [`WORDPRESS_THEME_NOTES.md`](./WORDPRESS_THEME_NOTES.md) to enqueue `tokens.css`, Google Fonts, `checkout.css`, and install `mbs-cart-token-handoff.php` in `wp-content/mu-plugins/`.
3. **Verify Remote Images**:
   - `frontend/next.config.ts` automatically allows images from `WP_BASE_URL` and `*.mehandibysana.com`. If media is served from a separate CDN hostname, add its hostname to `images.remotePatterns` in `frontend/next.config.ts`.

---

## 5. On-Demand ISR Revalidation Webhook

To purge cached product and category pages immediately whenever inventory or pricing changes in WooCommerce:

1. In WordPress Admin, navigate to **WooCommerce → Settings → Advanced → Webhooks → Add webhook**.
2. Create webhooks for:
   - **Topic**: `Product created`, `Product updated`, `Product deleted`
   - **Delivery URL**: `https://<your-frontend-domain>/api/revalidate?secret=<REVALIDATE_SECRET>`
   - **Status**: `Active`
3. You can also trigger targeted revalidation manually via `POST /api/revalidate`:

```bash
curl -X POST "https://<your-frontend-domain>/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: <REVALIDATE_SECRET>" \
  -d '{"tag":"products","slug":"organic-henna-cones"}'
```

