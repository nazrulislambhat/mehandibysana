# WordPress Checkout Theme & Session Handoff Notes

This guide documents the exact design tokens, typography, component styles, and server-side session bridge required to make the **WordPress / WooCommerce Checkout** match the headless Next.js storefront (`frontend/src/styles/tokens.css`).

---

## 1. Design Tokens (`tokens.css`)

Copy `frontend/src/styles/tokens.css` verbatim into your WordPress child theme (e.g., `wp-content/themes/<your-child-theme>/assets/css/tokens.css`) and enqueue it before your checkout stylesheet:

```css
:root {
  /* ==========================================================================
     COLORS (WCAG 2.1 AA Verified Contrast)
     ========================================================================== */
  --color-bg: #FAF8F5;             /* Warm off-white editorial canvas */
  --color-surface: #F3EFE8;        /* Soft linen surface */
  --color-card: #FFFFFF;           /* Crisp card surface */

  --color-text: #2C1E18;           /* Deep henna-brown primary ink (14.3:1 on --color-bg) */
  --color-text-muted: #5F4E46;     /* Warm umber secondary text (7.2:1 on --color-bg) */
  --color-text-inverse: #FAF8F5;   /* Text on dark/accent surfaces */

  --color-accent: #9E4323;         /* Restrained terracotta accent (5.8:1 with white text) */
  --color-accent-hover: #7F341A;   /* Deepened terracotta for hover/active */
  --color-accent-soft: #F4E6E0;    /* Gentle terracotta wash */

  --color-border: #E5DDD2;         /* Hairline warm border */
  --color-border-strong: #8E7F74;  /* Accessible UI/input divider (3.66:1 on --color-bg) */
  --color-focus: #2C1E18;          /* High-visibility keyboard focus outline */

  --color-success: #2F5D3A;        /* Botanical sage green (7.3:1 on white) */
  --color-warning: #8A5A12;        /* Ochre amber */
  --color-error: #9B2C2C;          /* Muted crimson */

  /* ==========================================================================
     TYPOGRAPHY
     ========================================================================== */
  --font-serif: var(--font-heading, "Cormorant Garamond"), Georgia, serif;
  --font-sans: var(--font-body, "Plus Jakarta Sans"), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.375rem;    /* 38px */
  --text-5xl: 3.125rem;    /* 50px */

  --leading-tight: 1.15;
  --leading-snug: 1.3;
  --leading-normal: 1.6;
  --leading-relaxed: 1.75;

  /* ==========================================================================
     SPACING & LAYOUT
     ========================================================================== */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  --container-max: 72rem;       /* 1152px */
  --container-padding: 1.25rem; /* 20px mobile gutter */

  /* ==========================================================================
     RADII
     ========================================================================== */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* ==========================================================================
     SHADOWS & MOTION
     ========================================================================== */
  --shadow-sm: 0 1px 2px rgba(44, 30, 24, 0.05);
  --shadow-md: 0 8px 24px rgba(44, 30, 24, 0.07);

  --transition-fast: 150ms ease;
  --transition-base: 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## 2. Fonts Enqueue Snippet (`functions.php`)

Enqueue **Cormorant Garamond** (headings) and **Plus Jakarta Sans** (body) on checkout and order-received pages so typography matches the React storefront:

```php
<?php
add_action( 'wp_enqueue_scripts', function () {
    if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
        return;
    }

    wp_enqueue_style(
        'mbs-google-fonts',
        'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap',
        array(),
        null
    );

    wp_enqueue_style(
        'mbs-design-tokens',
        get_stylesheet_directory_uri() . '/assets/css/tokens.css',
        array( 'mbs-google-fonts' ),
        '1.0.0'
    );

    wp_enqueue_style(
        'mbs-checkout-theme',
        get_stylesheet_directory_uri() . '/assets/css/checkout.css',
        array( 'mbs-design-tokens' ),
        '1.0.0'
    );
}, 20 );
```

---

## 3. Checkout Component Styles (`assets/css/checkout.css`)

```css
body.woocommerce-checkout {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
}

.woocommerce-checkout .entry-content,
.woocommerce-checkout .woocommerce {
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--container-padding);
}

.woocommerce-checkout h1,
.woocommerce-checkout h2,
.woocommerce-checkout h3 {
  font-family: var(--font-serif);
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: -0.015em;
  line-height: var(--leading-tight);
}

/* Form Labels & Inputs (WCAG 2.1 AA 44px touch target + 3.66:1 divider) */
.woocommerce-checkout form .form-row label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.woocommerce-checkout form .form-row input.input-text,
.woocommerce-checkout form .form-row textarea,
.woocommerce-checkout form .form-row select,
.woocommerce-checkout .select2-container--default .select2-selection--single {
  min-height: 44px;
  width: 100%;
  background-color: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: 0.625rem 0.875rem;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  transition: border-color var(--transition-fast);
}

.woocommerce-checkout form .form-row input.input-text:focus,
.woocommerce-checkout form .form-row textarea:focus,
.woocommerce-checkout form .form-row select:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-color: var(--color-text);
}

/* Order Review Card */
.woocommerce-checkout #order_review {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
}

.woocommerce-checkout table.woocommerce-checkout-review-order-table {
  width: 100%;
  border-collapse: collapse;
}

.woocommerce-checkout table.woocommerce-checkout-review-order-table th,
.woocommerce-checkout table.woocommerce-checkout-review-order-table td {
  padding-block: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text);
}

/* Primary Place Order Button */
.woocommerce-checkout #place_order,
.woocommerce-checkout .button.alt {
  min-height: 48px;
  width: 100%;
  background-color: var(--color-text);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-text);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 500;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.woocommerce-checkout #place_order:hover,
.woocommerce-checkout .button.alt:hover {
  opacity: 0.9;
}

/* Notices & Validation Alerts */
.woocommerce-checkout .woocommerce-info,
.woocommerce-checkout .woocommerce-message {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
}

.woocommerce-checkout .woocommerce-error {
  background-color: var(--color-card);
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
}
```

---

## 4. Cart-Token Checkout Handoff Bridge (`mu-plugin`)

### How the Handoff Works
1. The Next.js storefront manages guest carts via the **WooCommerce Store API** (`/wp-json/wc/store/v1/cart/*`), persisting the `Cart-Token` JWT in `localStorage` (`mbs_wc_cart_session`).
2. When the shopper selects **Proceed to Checkout**, Next.js navigates to `/checkout`, calls `GET /api/checkout-handoff?cart_token=<token>`, and redirects the browser to `${WP_BASE_URL}/checkout/?cart_token=<token>`.
3. Because standard WordPress `/checkout/` reads the `wp_woocommerce_session_<hash>` cookie rather than the Store API JWT, add the following lightweight `mu-plugin` (`wp-content/mu-plugins/mbs-cart-token-handoff.php`) to bridge the JWT customer/session ID into WooCommerce's native PHP session cookie and strip `cart_token` from the URL:

```php
<?php
/**
 * Plugin Name: Mehandi by Sana — Store API Cart-Token Checkout Handoff
 * Description: Bridges incoming ?cart_token= JWT from the headless Next.js storefront into WC()->session on /checkout/.
 */

add_action( 'template_redirect', function () {
    if ( is_admin() || wp_doing_ajax() ) {
        return;
    }

    if ( empty( $_GET['cart_token'] ) || ! function_exists( 'WC' ) ) {
        return;
    }

    $raw_token = sanitize_text_field( wp_unslash( $_GET['cart_token'] ) );
    $parts     = explode( '.', $raw_token );

    if ( count( $parts ) !== 3 ) {
        return;
    }

    // Validate JWT signature using WooCommerce's Store API CartTokenUtils when available
    if ( class_exists( '\Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils' ) ) {
        if ( ! \Automattic\WooCommerce\StoreApi\Utilities\CartTokenUtils::validate_cart_token( $raw_token ) ) {
            return;
        }
    }

    $payload_json = base64_decode( strtr( $parts[1], '-_', '+/' ), true );
    if ( ! $payload_json ) {
        return;
    }

    $payload = json_decode( $payload_json, true );
    if ( ! is_array( $payload ) || empty( $payload['user_id'] ) ) {
        return;
    }

    $customer_id = sanitize_text_field( (string) $payload['user_id'] );

    if ( WC()->session && method_exists( WC()->session, 'get_session' ) ) {
        $session_data = WC()->session->get_session( $customer_id );
        if ( ! empty( $session_data ) ) {
            foreach ( $session_data as $key => $value ) {
                WC()->session->set( $key, maybe_unserialize( $value ) );
            }
            WC()->session->set_customer_session_cookie( true );
        }
    }

    // Redirect cleanly to /checkout/ without exposing cart_token in browser history
    wp_safe_redirect( remove_query_arg( 'cart_token' ) );
    exit;
}, 5 );
```

