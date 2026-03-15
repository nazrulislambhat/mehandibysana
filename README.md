# Mehendi by Sana — mehandibysana.com

> Minimal portfolio + e-commerce site for a mehendi artist.
> Portfolio built in **React JS** · Shop powered by **WordPress + WooCommerce** on **Hostinger**.

---

## Architecture overview

```
mehandibysana.com/          → React JS (portfolio)
mehandibysana.com/shop/     → WordPress + WooCommerce (products, cart, checkout)
```

The two parts are independent deployments that share the same domain. The React app handles the brand, portfolio, testimonials, and contact form. WordPress takes over at `/shop/` for full e-commerce functionality.

---

## Tech stack

| Layer | Technology |
|---|---|
| Portfolio frontend | React JS (Vite) |
| Shop backend | WordPress 6.x + WooCommerce |
| WordPress theme | Mehendi by Sana (custom, `mehandibysana-theme`) |
| Hosting | Hostinger (hPanel) |
| Cache | LiteSpeed Cache plugin |
| Fonts | Cormorant Garamond + DM Sans (Google Fonts) |
| Styling | CSS custom properties, light/dark mode via `data-theme` attribute |

---

## Repository structure

```
mehandibysana/
├── portfolio/                  # React JS app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Nav.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── Footer.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── wordpress-theme/            # Custom WP theme (upload to Hostinger)
│   ├── style.css
│   ├── functions.php
│   ├── front-page.php
│   ├── header.php
│   ├── footer.php
│   ├── woocommerce.php
│   ├── inc/
│   │   ├── settings-page.php   # Admin settings panel (5 tabs)
│   │   └── testimonial-cpt.php # Testimonials custom post type
│   └── assets/
│       └── js/main.js
│
└── README.md
```

---

## React portfolio — local development

**Requirements:** Node.js 18+, npm 9+

```bash
# Clone and install
cd portfolio
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The build output goes to `portfolio/dist/`. Deploy this to Hostinger's `public_html/` root (everything except the `/shop/` subdirectory).

### Environment variables

Create a `.env` file in `portfolio/`:

```env
VITE_CONTACT_ENDPOINT=https://mehandibysana.com/wp-admin/admin-ajax.php
VITE_WC_SHOP_URL=https://mehandibysana.com/shop/
```

The React contact form posts to the WordPress AJAX endpoint so all enquiries land in one inbox.

---

## WordPress shop — setup on Hostinger

### 1. Install WordPress

In Hostinger hPanel → Websites → Add website, or install via the 1-click WordPress installer into a `/shop` subdirectory.

### 2. Install required plugins

| Plugin | Purpose |
|---|---|
| WooCommerce | Core e-commerce engine |
| LiteSpeed Cache | Performance + cache management |
| Wordfence (optional) | Security |

### 3. Upload the theme

Go to **Appearance → Themes → Add New → Upload Theme**, upload `mehandibysana-theme.zip`, then activate.

### 4. Configure the theme

Navigate to **Theme Settings** in the WordPress sidebar:

| Tab | Key settings |
|---|---|
| General & Hero | Accent colours, dark/light default |
| About | Bio text, stats |
| Contact | Receiving email, phone, booking types |
| Shop | Products per page, grid columns |
| Social & Footer | Instagram, WhatsApp, Facebook URLs |

### 5. Add your photo

Create a WordPress page named **About** and set its **Featured Image** — it automatically appears in the About section.

### 6. Add testimonials

Go to **Testimonials → Add New** in the WP sidebar. Fill in the review text, reviewer name, city/type, and star rating. Placeholder testimonials disappear once you add real ones.

---

## Deployment

### React app → Hostinger

```bash
# Build
cd portfolio && npm run build

# Upload dist/ contents to public_html/ via hPanel File Manager or FTP
# Do NOT overwrite the /shop/ subfolder
```

For continuous deployment, connect your GitHub repo to Hostinger's **Git deployment** feature in hPanel.

### WordPress → already live on Hostinger

WordPress lives at `public_html/shop/` (or as configured). Updates happen directly through the WP dashboard or via SSH:

```bash
# SSH into Hostinger (enable in hPanel → Advanced → SSH)
ssh u123456789@mehandibysana.com

# Update plugins via WP-CLI
wp plugin update --all --allow-root --path=public_html/shop/

# Flush cache
wp cache flush --allow-root --path=public_html/shop/
```

---

## Cache management (important — read this)

The shop page was showing **no products at 11:15 AM daily** due to LiteSpeed Cache serving a stale page.

**Permanent fix applied:** `/shop/` is excluded from LiteSpeed Cache entirely.

To verify: **LiteSpeed Cache → Cache → Excludes** → confirm `/shop/` is in the URI exclusions list.

**Backup fix (cron job):** A cron job runs at 11:10 AM every day to flush cache before the issue could hit.

```bash
# hPanel → Advanced → Cron Jobs
10 11 * * * cd /home/your-user/public_html/shop && wp cache flush --allow-root
```

**Emergency manual flush:** Log in to WordPress → LiteSpeed Cache → Toolbox → Purge All.

---

## Cross-site navigation

The React nav links to `/shop/` for the shop CTA. The WordPress theme header links back to `mehandibysana.com` (the React app) for all portfolio sections. Both sites use the same fonts, colour variables, and visual language to feel seamless.

---

## Colour system

Both the React app and WordPress theme use the same CSS custom property names:

```css
/* Light mode */
--bg:           #FAF8F5;
--bg2:          #F2EFE9;
--text:         #1A1510;
--text2:        #6B5E4E;
--accent:       #8B4513;    /* henna terracotta */
--accent-light: #C1693A;

/* Dark mode — applied via data-theme="dark" on <html> */
--bg:           #110E0A;
--accent:       #C1693A;
--accent-light: #D4845A;
```

Accent colours are also configurable per-site from **Theme Settings → General** in WordPress.

---

## Fonts

Both sites load from Google Fonts:

```
Cormorant Garamond — display headings (300, 400, 500, italic variants)
DM Sans            — body text (300, 400, 500)
```

---

## Contact form flow

```
Visitor fills form (React)
        ↓
POST to /wp-admin/admin-ajax.php (WordPress AJAX)
        ↓
WordPress validates + sends email via wp_mail()
        ↓
Email arrives at address set in Theme Settings → Contact
```

The receiving email defaults to your WordPress admin email. Change it under **Theme Settings → Contact → Email**.

---

## Known issues & notes

- **Cart icon** is only shown in the WordPress header (WooCommerce dependency). The React portfolio links directly to `/shop/` for purchases.
- **Dark mode preference** is stored in `localStorage` (`mbs_theme`). If a visitor switches mode on the React site, it will not automatically carry over to the WordPress site (different origins) — they can toggle independently.
- WooCommerce's default `/shop/` slug must match the subdirectory WordPress is installed in. If WordPress is installed at the root, update the React `.env` `VITE_WC_SHOP_URL` accordingly.

---

## Checklist before going live

- [ ] Upload React build to `public_html/`
- [ ] WordPress installed and WooCommerce configured at `/shop/`
- [ ] Custom theme uploaded and activated
- [ ] Theme Settings filled in (colours, bio, contact email, social links)
- [ ] About page created with Featured Image (your photo)
- [ ] Real testimonials added (removes placeholders)
- [ ] Products added in WooCommerce with photos and prices
- [ ] `/shop/` excluded from LiteSpeed Cache
- [ ] 11:10 AM cron job added as backup cache flush
- [ ] SSL certificate active (hPanel → SSL → Let's Encrypt)
- [ ] Test contact form → confirm email arrives
- [ ] Test dark mode toggle on both sites
- [ ] Test checkout flow end to end

---

## Support & maintenance

| Task | Where |
|---|---|
| Edit hero text, bio, stats | Theme Settings → General / About |
| Add/edit products | WordPress → Products |
| Add testimonials | WordPress → Testimonials |
| View orders | WordPress → WooCommerce → Orders |
| Flush cache manually | LiteSpeed Cache → Toolbox → Purge All |
| Update React content | Edit `src/` files and redeploy |

---

*Built with love for Mehendi by Sana · Srinagar, J&K || Bengaluru, Karnataka*
