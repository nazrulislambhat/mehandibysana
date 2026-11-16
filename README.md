# Mehandi By Sana — Headless Storefront

Minimal, editorial headless storefront for **mehandibysana.com** built with **Next.js 16 (App Router, TypeScript, Tailwind CSS v4)** and **Zustand**, backed by **MedusaJS v2** on Railway.

---

## 1. Architecture Overview

- **Catalog & ISR (`frontend/src/lib/wc-catalog.ts` & `wc-store-server.ts`)**:
  - Server Components fetch products, variations, categories, and inventory from MedusaJS v2 Store API (`/store/products`).
  - Cached via Next.js ISR (`revalidate = 3600`) with cache tags (`products`, `categories`, `product:<handle>`) invalidated on demand via `POST /api/revalidate`.
- **Shopping Bag (`frontend/src/store/cart-store.ts` + `frontend/src/app/api/cart/*`)**:
  - Client state managed in Zustand with instant local badge updates, persistent cart items, and seamless checkout handoff.
- **Native Checkout & Payments (`frontend/src/app/checkout/page.tsx` & `CheckoutHandoffClient.tsx`)**:
  - Fully headless native checkout integrated with MedusaJS backend order processing (`/api/checkout-order`).
  - **Payment Options**: Online Prepaid via Razorpay (cards, UPI, net banking) and Cash on Delivery (COD) governed authoritatively by Medusa Pincode Rules.
  - **Studio Pickup**: Self-pickup option for Srinagar Studio (Kashmir `19xxxx`) and Bengaluru Studio (`56xxxx`) when enabled in Medusa backend.
- **Portable Design System (`frontend/src/styles/tokens.css`)**:
  - All colors, typography, spacing, radii, and transitions live in `frontend/src/styles/tokens.css`, consumed by Tailwind CSS v4.

---

## 2. Local Setup

### Prerequisites
- Node.js `>= 20`
- npm `>= 10`
- Running MedusaJS v2 backend (local or Railway)

### Installation

```bash
# Install workspace dependencies from repository root
npm install

# Copy environment template
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local` with your Medusa backend URL and publishable API key:

```env
MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_PUBLISHABLE_KEY=pk_your_medusa_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=replace_with_a_long_random_secret
```

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
| `MEDUSA_BACKEND_URL` | Server-only | Yes | Base URL of MedusaJS v2 backend (e.g. `http://localhost:9000` or Railway backend URL). |
| `MEDUSA_PUBLISHABLE_KEY` | Server-only | Yes | Medusa v2 publishable API key (`pk_...`) used to authenticate store API requests. |
| `NEXT_PUBLIC_SITE_URL` | Public | Recommended | Canonical frontend URL used for metadata, OpenGraph tags, `sitemap.xml`, and `robots.txt`. |
| `S3_FILE_URL` | Server-only | Optional | Cloudflare R2 / S3 public media bucket URL for optimized product assets. |
| `REVALIDATE_SECRET` | Server-only | Recommended | Shared secret authenticating webhook calls to `POST /api/revalidate`. |

---

## 4. Deployment Steps

1. **Host the Next.js App** (Vercel, Netlify, or Node.js container):
   - Set **Root Directory** to `frontend` (or run `npm run build --workspace=frontend` and `npm run start --workspace=frontend` from the repo root).
   - Configure all environment variables (`MEDUSA_BACKEND_URL`, `MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`, `S3_FILE_URL`) in your hosting provider's dashboard.
2. **Verify Remote Images**:
   - `frontend/next.config.ts` automatically configures allowed image domains for Medusa media, Cloudflare R2, and `*.mehandibysana.com`.

---

## 5. On-Demand ISR Revalidation Webhook

To purge cached product and category pages immediately whenever catalog changes occur:

Trigger targeted revalidation manually or via webhook using `POST /api/revalidate`:

```bash
curl -X POST "https://<your-frontend-domain>/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: <REVALIDATE_SECRET>" \
  -d '{"tag":"products"}'
```

