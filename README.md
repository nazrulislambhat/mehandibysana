# Mehandi By Sana — Headless E-Commerce Platform

Minimal, editorial, high-performance headless commerce platform for **mehandibysana.com** built with **Next.js 16 (App Router, TypeScript, Tailwind CSS v4)** and **Zustand**, backed by **MedusaJS v2** on **Railway** with **PostgreSQL**, **Cloudflare R2**, and **Razorpay**.

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Client["Shoppers & Search Engines"]
        Customer["Customer (Mobile / Desktop)"]
        GoogleBot["Google Search & Shopping (Rank #1)"]
    end

    subgraph Frontend["Frontend — Next.js 16 (Vercel)"]
        Catalog["Catalog & Product Pages (ISR <80ms)"]
        Zustand["Shopping Bag State (Zustand)"]
        Checkout["Native Checkout Engine (CheckoutHandoffClient)"]
        JSONLD["Rich Structured Data (Schema.org / JSON-LD)"]
    end

    subgraph Backend["Backend — MedusaJS v2 (Railway)"]
        Medusa["Medusa Core (/store/* APIs)"]
        Admin["Medusa Admin (/app)"]
        RulesEngine["Pincode Shipping & Specificity Engine"]
        Dispatch["Studio Dispatch & Courier Tracking Widget"]
        PDFGen["PDF Invoice Generator"]
    end

    subgraph Data["Database & Storage"]
        Postgres[(PostgreSQL Database)]
        StudioData["Persistent Volume (/studio-data)"]
        R2["Cloudflare R2 Object Storage"]
    end

    subgraph Integrations["Third-Party Integrations"]
        Razorpay["Razorpay (Prepaid UPI / Cards / NetBanking)"]
        Email["Transactional Email (Brevo / Resend / SMTP)"]
        Telegram["Telegram Studio Dispatch Channel"]
    end

    Customer -->|Browses Catalog| Catalog
    Customer -->|Adds to Bag| Zustand
    Customer -->|Completes Order| Checkout
    GoogleBot -->|Crawls Product Schemas & Sitemap| JSONLD

    Catalog --> Medusa
    Checkout --> Medusa
    Medusa <--> Postgres
    Medusa <--> StudioData
    Medusa <--> R2
    Medusa <--> Razorpay

    Medusa -->|Order Confirmation + PDF Invoice| Email
    Medusa -->|Instant Order Alert| Telegram
    Admin -->|Updates Dispatch & Tracking| Dispatch
    Dispatch -->|Customer Shipping Alert| Email
    Dispatch -->|Live Dispatch Update| Telegram
```

---

## 2. Key Platform Features

### 🛍️ Headless Native Storefront (Next.js 16)
- **ISR (<80ms TTFB)**: Product and category pages are statically pre-rendered with on-demand revalidation (`revalidate = 3600`).
- **Google Shopping #1 Rank Optimization**:
  - Exact URL match: `https://mehandibysana.com/product/organic-henna-cones`
  - Valid `Schema.org/Product` JSON-LD with live price (`INR`), availability (`InStock`), and brand (`Mehandi By Sana`).
  - **Google Shopping XML RSS 2.0 Feed**: Live endpoint at `/feed/google-shopping` (and `/api/feed/google-shopping`) formatted for Google Merchant Center with automatic product taxonomy, Cloudflare R2 image links, and shipping specs.
  - Dynamic `sitemap.xml` generated automatically from the Medusa catalog.
- **Persistent Shopping Bag**: Instant, optimistic UI updates powered by Zustand client storage.

### 🚚 Smart Logistics & Pincode Shipping Engine
- **Pattern Specificity Matching**: Evaluates exact PINs (`190001`), prefix wildcards (`190*`, `560*`), and pan-India fallbacks (`*`).
- **Studio Self-Pickup Toggles**:
  - **Srinagar Studio**: Available exclusively to Kashmir division PIN codes (`19xxxx`). Jammu PIN codes (`18xxxx`) are strictly excluded from pickup and receive doorstep delivery.
  - **Bengaluru Studio**: Available to Bengaluru metro PIN codes (`56xxxx`).
  - Toggled live per studio in the Medusa Admin without redeploying code.
- **Selective Cash on Delivery (COD)**:
  - Enabled for Srinagar metro (`190*`).
  - Disabled for Bengaluru (`560*`) and Pan-India (`*`).
  - Automatically hides the COD option for non-serviceable PINs and presents a polite logistics limitation heads-up notice.

### 💳 Payments & Order Processing
- **Prepaid Online**: Seamless Razorpay integration supporting UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and NetBanking.
- **Cash on Delivery (COD)**: Managed safely with backend validation verifying PIN eligibility before order creation.
- **Zero-Fee Studio Pickup**: Orders selected for pickup automatically zero out shipping fees at checkout.

### 📦 Studio Dispatch & Multi-Channel Notifications
- **Automated Customer Emails**: Instant transactional email with an attached print-ready PDF invoice (`MBS-INV-XXXXXX.pdf`).
- **Telegram Dispatch Alerts**: Instant notification pushed to the studio channel with order itemization, customer phone, payment status, and preferred dates.
- **Admin Dispatch Widget**: Located inside the order view at `/app/orders/:id`, allowing studio staff to select origin studio, assign couriers (Local Rider, DTDC, Bluedart, Delhivery, Speed Post), add tracking numbers, and email tracking alerts to customers with one click.

### 🖼️ Cloudflare R2 Media Pipeline
- High-resolution product images, tools, and brand marks served with zero egress fees via Cloudflare R2.
- Automated media sync script and one-click admin sync endpoint.

---

## 3. Local Development Setup

### Prerequisites
- Node.js `>= 20`
- npm `>= 10`
- PostgreSQL `>= 15` (running locally or via Railway proxy)

### 1. Installation

```bash
# Clone the repository and install dependencies
git clone https://github.com/nazrulislambhat/mehandibysana.git
cd mehandibysana
npm install
```

### 2. Environment Configuration

```bash
# Frontend environment
cp frontend/.env.example frontend/.env.local

# Backend environment
cp backend/.env.template backend/.env
```

**Frontend (`frontend/.env.local`)**:
```env
MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_PUBLISHABLE_KEY=pk_your_medusa_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=replace_with_a_long_random_secret
```

**Backend (`backend/.env`)**:
```env
PORT=9000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/medusa_mehandibysana
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000,http://localhost:5173
AUTH_CORS=http://localhost:3000,http://localhost:9000
```

### 3. Start Development Servers

```bash
# Option A: Start both frontend & backend concurrently
npm run dev

# Option B: Run in separate terminals
npm run dev:backend   # Medusa on http://localhost:9000 (Admin: /app)
npm run dev:frontend  # Next.js on http://localhost:3000
```

---

## 4. Database Migration & Delta Sync (MySQL to PostgreSQL)

The platform includes a zero-data-loss, idempotent migration pipeline that parses MySQL database dumps and synchronizes them directly into Medusa PostgreSQL.

### Idempotency Guarantee:
- **Products**: If a product already exists in Medusa (`handle` matches), **it is preserved and skipped (do nothing)**. Only new products are created.
- **Customers**: If a customer already exists (`email` matches), **it is skipped**. Only new customers are inserted.
- **Orders**: If an order already exists (`woo_order_id` matches), **it is skipped**. Only new orders are imported.

### Commands:

#### 1. One-Step Delta Sync (Local)
Parse a MySQL dump and immediately sync new products, customers, and orders into your local Medusa database:
```bash
npm run migrate:latest -- /path/to/latest-mysql-backup.sql
```
*(Alternative alias: `npm run import:prod-sql -- /path/to/backup.sql`)*

#### 2. One-Step Delta Sync (Production Railway)
To parse and push updates directly into your production Railway PostgreSQL database:
```bash
# 1. Parse and validate the MySQL backup
npm run migrate:sql -- /path/to/latest-mysql-backup.sql

# 2. Push delta updates into Railway PostgreSQL
cd backend
DATABASE_URL="postgresql://postgres:<PASSWORD>@<HOST>.proxy.rlwy.net:<PORT>/railway" \
  npx medusa exec ./src/scripts/sync-migrated-data.ts

DATABASE_URL="postgresql://postgres:<PASSWORD>@<HOST>.proxy.rlwy.net:<PORT>/railway" \
  npx medusa exec ./src/scripts/import-all-orders.ts
```

#### 3. Related Henna Tools & Supplies Seeder
```bash
npm run migrate:tools
```

#### 4. Export Customer Email List
Exports your 2,069+ customer email list to a clean, de-duplicated CSV for marketing campaigns:
```bash
npm run export:emails
```

---

## 5. Cloudflare R2 Media Pipeline

Sync all local product photos, botanical assets, and remote image URLs to your Cloudflare R2 bucket:

```bash
cd backend
npm run sync:r2
```

*(You can also trigger sync with one click from the Medusa Admin settings page).*

---

## 6. Build & Verification Commands

```bash
# Frontend production build & TypeScript check
npm run build:frontend

# Backend production build & Medusa compilation
npm run build:backend

# Run storefront linter
npm --prefix frontend run lint
```

---

## 7. Environment Variables Reference

### Frontend (`frontend/.env.local` / Vercel Environment)

| Variable | Scope | Required | Description |
| :--- | :--- | :--- | :--- |
| `MEDUSA_BACKEND_URL` | Server-only | Yes | URL of Medusa v2 backend (`http://localhost:9000` or Railway URL). |
| `MEDUSA_PUBLISHABLE_KEY` | Server-only | Yes | Medusa v2 Publishable API Key (`pk_...`) from Medusa Admin Settings. |
| `NEXT_PUBLIC_SITE_URL` | Public | Yes | Canonical site domain (`https://mehandibysana.com` or `http://localhost:3000`). |
| `S3_FILE_URL` | Server-only | Optional | Public Cloudflare R2 / S3 custom domain for media optimization. |
| `REVALIDATE_SECRET` | Server-only | Recommended | Secret token authorizing `POST /api/revalidate` cache purges. |

### Backend (`backend/.env` / Railway Environment)

| Variable | Scope | Required | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Server-only | Yes | PostgreSQL connection string. |
| `JWT_SECRET` | Server-only | Yes | 64-character random string for authenticating sessions. |
| `COOKIE_SECRET` | Server-only | Yes | 64-character random string for signing admin session cookies. |
| `STORE_CORS` | Server-only | Yes | Allowed frontend origins (e.g. `https://mehandibysana.com`). |
| `ADMIN_CORS` | Server-only | Yes | Allowed admin panel origins. |
| `RAZORPAY_KEY_ID` | Server-only | Optional | Razorpay API key ID for payment processing. |
| `RAZORPAY_KEY_SECRET` | Server-only | Optional | Razorpay API secret key for payment verification. |
| `S3_BUCKET` | Server-only | Optional | Cloudflare R2 / S3 bucket name. |
| `S3_ACCESS_KEY_ID` | Server-only | Optional | Cloudflare R2 S3-compatible API token access key. |
| `S3_SECRET_ACCESS_KEY` | Server-only | Optional | Cloudflare R2 S3-compatible API token secret key. |
| `S3_ENDPOINT` | Server-only | Optional | Cloudflare R2 endpoint URL (`https://<account-id>.r2.cloudflarestorage.com`). |
| `TELEGRAM_BOT_TOKEN` | Server-only | Optional | Telegram bot token for instant studio dispatch alerts. |
| `TELEGRAM_CHAT_ID` | Server-only | Optional | Target chat / channel ID for studio dispatch alerts. |

---

## 8. Deployment Architecture

1. **Frontend**: Deployed to **Vercel** with automatic preview deployments and production branch tracking on `develop` / `main`.
2. **Backend**: Deployed to **Railway** running `npm run build && cd .medusa/server && npx medusa db:migrate && npx medusa start`.
3. **Database**: Managed **PostgreSQL** on Railway.
4. **Volume Storage**: `/studio-data` volume mounted on Railway to preserve `pincode-rules.json`, `pickup-settings.json`, `email-settings.json`, and generated invoices across redeployments.

