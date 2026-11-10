# Mehandi by Sana — Production Deployment & Zero-Data-Loss Cutover Guide

> **Full Step-by-Step Option A (Managed PaaS) Guide Available:** See [PRODUCTION_LAUNCH_GUIDE.md](./PRODUCTION_LAUNCH_GUIDE.md) for the complete Local-to-Production runbook covering **Cloudflare R2 -> Railway -> Vercel**, importing the latest WooCommerce `.sql` dump, Razorpay live + webhooks, Resend/Brevo/SMTP email integration, and exporting/running campaigns from your **2,065+ customer email list**.

## 1. Architecture Overview

- **Frontend Storefront (`frontend/`)**: Next.js 16 App Router (`https://mehandibysana.com`)
- **Backend Commerce & Admin (`backend/`)**: MedusaJS v2 (`https://api.mehandibysana.com`, Admin UI at `/app`)
- **Database**: PostgreSQL (`medusa_mehandibysana`) + persistent `/studio-data` volume (`pincode-rules.json`, `bridal-bookings.json`, `notifications.log`)
- **Media Storage**: Cloudflare R2 / AWS S3 (`@medusajs/medusa/file-s3`) or local static storage (`@medusajs/medusa/file-local`)
- **Payments**: Razorpay Checkout (UPI, Cards, NetBanking) + Cash on Delivery (COD)

---

## 2. Backend Environment Variables (`backend/.env`)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/medusa_mehandibysana
JWT_SECRET=<strong-64-char-random-secret>
COOKIE_SECRET=<strong-64-char-random-secret>

# CORS
STORE_CORS=https://mehandibysana.com,https://www.mehandibysana.com
ADMIN_CORS=https://api.mehandibysana.com
AUTH_CORS=https://mehandibysana.com,https://www.mehandibysana.com,https://api.mehandibysana.com

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxx

# Optional Media Uploads (Cloudflare R2 / AWS S3)
S3_FILE_URL=https://media.mehandibysana.com
S3_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxx
S3_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxx
S3_REGION=auto
S3_BUCKET=mehandibysana-media
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# Optional Order & Booking Notifications (Resend + WhatsApp Webhook)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx
STUDIO_FROM_EMAIL="Mehandi by Sana <orders@mehandibysana.com>"
WHATSAPP_WEBHOOK_URL=https://your-automation-webhook.example.com/notify
```

### Deploying MedusaJS Backend
```bash
cd backend
npm ci
npm run build
npx medusa user -e admin@mehandibysana.com -p '<STRONG_ADMIN_PASSWORD>'
cd .medusa/server
npx medusa db:migrate
npx medusa start
```
1. Sign in at `https://api.mehandibysana.com/app`.
2. Copy your **Publishable API Key** (`Settings -> Publishable API Keys`).
3. Configure wildcard PIN rates in **Pincode Shipping** (`/app/pincode-shipping`).
4. Review bridal inquiries in **Bridal Bookings** (`/app/bridal-bookings`).
5. Upload real product photos for your 8 henna tools & supplies directly in **Products** (`/app/products`).

---

## 3. Frontend Environment Variables (`frontend/.env.local` / Vercel)

```bash
NEXT_PUBLIC_SITE_URL=https://mehandibysana.com
MEDUSA_BACKEND_URL=https://api.mehandibysana.com
MEDUSA_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxx
S3_FILE_URL=https://media.mehandibysana.com
REVALIDATE_SECRET=<strong-random-secret>
```

---

## 4. Zero-Data-Loss Cutover Checklist

1. **Delta Sync Before DNS Switch**:
   From the repository root (single command for `.sql` dump):
   ```bash
   npm run import:prod-sql -- /path/to/latest-wc-dump.sql
   ```
   Or step-by-step via REST API / manual commands:
   ```bash
   cd migration
   npm run extract          # or: npm run extract:sql -- /path/to/latest-wc-dump.sql
   npm run transform
   npm run validate

   cd ../backend
   DATABASE_URL="postgresql://..." npx medusa exec ./src/scripts/sync-migrated-data.ts
   DATABASE_URL="postgresql://..." npx medusa exec ./src/scripts/import-all-orders.ts
   DATABASE_URL="postgresql://..." npx medusa exec ./src/scripts/seed-related-henna-products.ts
   ```
2. **Switch DNS**:
   - `@` (`mehandibysana.com`) -> Vercel (`76.76.21.21`)
   - `www` -> `cname.vercel-dns.com`
   - `api` -> MedusaJS backend host
3. **Configure Razorpay Webhook**:
   - In Razorpay Dashboard -> Webhooks, point `https://api.mehandibysana.com/webhooks/razorpay` to `payment.captured` and `order.paid` using `RAZORPAY_WEBHOOK_SECRET`.

