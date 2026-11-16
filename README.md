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

    subgraph Data["Database, Queue & Storage"]
        Postgres[(PostgreSQL Database)]
        Redis[(Redis Event Bus & Locks)]
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
    Medusa <--> Redis
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

## 2. What Exactly Is Redis Doing & Why Was It Added?

In an enterprise MedusaJS v2 headless setup, **Redis acts as the backbone for asynchronous operations, distributed concurrency, and cache acceleration**.

Without Redis, Medusa operates in an in-memory fallback mode, which outputs the following startup warnings:
```text
info:    redisUrl not found. A fake redis instance will be used.
warn:    Local Event Bus installed. This is not recommended for production.
info:    Locking module: Using "in-memory" as default.
```

### 1. Persistent Asynchronous Event Bus (Message Queuing)
* **What happens without Redis**: When a customer completes checkout or a shipment is marked as dispatched, Medusa triggers background events (`order.placed`, `shipment.created`, `delivery.created`). In the default in-memory event bus, these tasks live inside the Node.js process memory. If the backend restarts, redeploys, or crashes under load while jobs are queued, **pending emails, invoices, and Telegram alerts are permanently lost**.
* **What Redis does**: Redis acts as a durable message queue using Pub/Sub and streams. Events are safely persisted in Redis. If the backend process restarts during high traffic, it immediately resumes processing all queued background jobs without losing a single customer email or admin notification.

### 2. Distributed Locking & Race Condition Prevention
* **What happens without Redis**: In-memory locking only works inside a single isolated thread. If two shoppers buy the last organic henna cone at the exact same millisecond, or if Razorpay sends two duplicate payment webhook pings simultaneously, both threads could read inventory as available, causing **overselling** or **duplicate order records**.
* **What Redis does**: Redis provides atomic, distributed locks (`ioredis` distributed redlock keys). When an order is placed or inventory is decremented, Redis acquires an exclusive key in microseconds (`SET lock:order:id ... NX PX 5000`). Only one process executes the database mutation, while the duplicate is safely blocked or queued.

### 3. High-Speed Cache Layer
* Repetitive calculations (such as region tax rules, store settings, and catalog summaries) can be cached in Redis with sub-millisecond read times, taking significant query load off PostgreSQL.

### 4. Zero-Downtime Horizontal Scaling
* If traffic surges (e.g. during Eid or peak bridal wedding season) and multiple backend containers are deployed on Railway, Redis synchronizes the event bus and locks across all container instances seamlessly.

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
| `REDIS_URL` | Server-only | Recommended | Redis service connection string (e.g. `redis://default:...@...:6379`). Powers durable event queues and distributed locks. |
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
3. **Database**: Managed **PostgreSQL** on Railway. Studio configurations (`studio_pickup_settings`, `studio_pincode_rules`, `studio_bridal_bookings`, `studio_newsletter_subscribers`) are permanently stored in PostgreSQL tables.
4. **Queue & Lock Coordinator**: Managed **Redis** on Railway providing atomic distributed locks and durable event bus messaging.
5. **Media & Invoices**: **Cloudflare R2** bucket (`mehandibysana-media`) serving product photography and generated invoice PDFs via CDN (`https://media.mehandibysana.com`).
6. **Volume Storage**: `/studio-data` volume mounted on Railway as a secondary local cache.

