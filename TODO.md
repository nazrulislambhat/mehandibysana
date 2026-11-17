# Mehandi By Sana — Technical Roadmap & Engineering TODOs

> **High-Impact Engineering Additions & Feature Backlog**  
> Prioritized roadmap of architectural, operational, and customer-facing enhancements to scale mehandibysana.com.

---

## 📋 Priority 1: High-Impact Operational & Growth Integrations

### 1. 🚚 Logistics & Shipping Automation
- [ ] **Shiprocket API or Delhivery One API Integration**
  - **Objective**: Automate courier assignment, AWB generation, and doorstep pickup.
  - **Current State**: Studio dispatch staff manually enters courier name and tracking numbers via the Medusa Admin Studio Dispatch widget.
  - **Planned Solution**:
    - [ ] Create Medusa fulfillment provider (`backend/src/modules/fulfillment-shiprocket` or webhook integration).
    - [ ] Auto-generate shipping labels and print-ready thermal packing slips with 1 click in Medusa Admin.
    - [ ] Auto-schedule courier pickup from **Srinagar Studio** or **Bengaluru Studio** based on selected fulfillment origin.
    - [ ] Ingest live courier webhook updates (`out_for_delivery`, `delivered`) and push updates to customer emails and Telegram.

---

### 2. 💬 WhatsApp Commerce & Automated Notifications
- [ ] **WhatsApp Business Cloud API Integration (Interakt / Gupshup / Aisensy)**
  - **Objective**: Reach Indian shoppers on the channel with 95%+ open rates.
  - **Planned Features**:
    - [ ] **Order Confirmation & Dispatch Alerts**: Send instant WhatsApp messages when cones are rolled/shipped with live AWB tracking links.
    - [ ] **Automated Cart Abandonment Recovery**: Follow up with shoppers who enter phone numbers at checkout but drop off after 2 hours (include 1-click checkout recovery link).
    - [ ] **Eid & Wedding Season Re-Order Prompts**: Automated opt-in alerts for fresh Sojat paste batches.
    - [ ] **Bridal Consultation Handshake**: Automated initial confirmation message when a bridal inquiry is submitted.

---

### 3. 🔍 Instant Typo-Tolerant Product Search
- [ ] **Sub-50ms Search Engine (Meilisearch or PostgreSQL `pg_trgm`)**
  - **Objective**: Instant client-side search drawer with typo tolerance across cones, supplies, tools, and aftercare.
  - **Planned Solution**:
    - [ ] Option A: Spin up a lightweight Meilisearch instance on Railway with automated product index synchronization on Medusa product updates.
    - [ ] Option B: Implement PostgreSQL native Trigram search (`pg_trgm`) via Medusa custom endpoint `/store/search?q=...` (zero extra hosting cost).
    - [ ] Build modal search overlay in Next.js storefront (`Cmd+K` / search icon) showing live thumbnails, prices, and stock badges.

---

### 4. 🚨 Production Observability & Error Monitoring
- [ ] **Sentry Error Tracking (`@sentry/nextjs` & `@sentry/node`)**
  - **Objective**: Instant notification when a customer's payment, checkout, or API call fails.
  - **Planned Solution**:
    - [ ] Install `@sentry/nextjs` in `frontend` for client-side crash and checkout step error capturing.
    - [ ] Install `@sentry/node` in `backend` for Medusa API errors, Razorpay webhook exceptions, and background job failures.
    - [ ] Route critical errors to Telegram Admin bot (`@MehandiBySanaBot`) with stack traces and user context.
- [ ] **External Uptime Healthchecks (BetterStack / UptimeRobot)**
  - [ ] Add ping monitor for Storefront: `https://mehandibysana.com/api/health`
  - [ ] Add ping monitor for Medusa Backend: `https://api.mehandibysana.com/store/health`

---

### 5. 📸 Customer Photo Reviews & Stain Progression Showcase
- [ ] **User-Generated Content (UGC) Review Engine**
  - **Objective**: Allow verified buyers to upload photos of their stain progression (24h/48h dark stain) to maximize conversion trust.
  - **Planned Solution**:
    - [ ] Create `studio_product_reviews` PostgreSQL table with columns: `product_id`, `order_id`, `rating`, `stain_photo_urls`, `verified_buyer`, `approved`.
    - [ ] Upload customer stain review photos directly to Cloudflare R2 bucket (`reviews/<id>.webp`).
    - [ ] Build customer review submission form with photo upload dropzone.
    - [ ] Add Admin approval toggle in Medusa dashboard to prevent spam before reviews go live.

---

## 🛠️ Priority 2: Infrastructure as Code (IaC) & DevOps

### 6. 🌐 Terraform Infrastructure Configuration
- [ ] **Cloudflare & Railway Infrastructure as Code (`terraform/`)**
  - **Objective**: Manage DNS, R2 storage buckets, security firewall rules, and cloud environments through Git code instead of manual dashboard clicks.
  - **Planned Configuration**:
    - [ ] `cloudflare_record`: Declare all DNS records (`@`, `api`, `media`).
    - [ ] `cloudflare_r2_bucket`: Manage `mehandibysana-media` bucket lifecycle rules and CORS policies.
    - [ ] `cloudflare_ruleset`: Configure WAF rate limiting and anti-bot challenge rules.
    - [ ] Optional: Replicate staging environment with `terraform apply -var-file=staging.tfvars`.
