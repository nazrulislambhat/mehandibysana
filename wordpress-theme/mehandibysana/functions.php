<?php
/**
 * Mehandi by Sana Atelier — Theme Bootstrap & WooCommerce Integration
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MBS_THEME_VERSION', '1.0.0' );
define( 'MBS_THEME_DIR', get_template_directory() );
define( 'MBS_THEME_URI', get_template_directory_uri() );

/**
 * Load modular theme features
 */
require_once MBS_THEME_DIR . '/inc/helpers.php';
require_once MBS_THEME_DIR . '/inc/svg-illustrations.php';
require_once MBS_THEME_DIR . '/inc/pincode-shipping.php';
require_once MBS_THEME_DIR . '/inc/ajax-cart.php';
require_once MBS_THEME_DIR . '/inc/bookings.php';
require_once MBS_THEME_DIR . '/inc/order-tracking-admin.php';
require_once MBS_THEME_DIR . '/inc/admin-studio.php';
require_once MBS_THEME_DIR . '/inc/customizer.php';

/**
 * Declare HPOS compatibility with WooCommerce
 */
add_action( 'before_woocommerce_init', function () {
	if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true );
	}
} );

/**
 * Theme Setup
 */
add_action( 'after_setup_theme', function () {
	load_theme_textdomain( 'mehandibysana', MBS_THEME_DIR . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
	);
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 120,
			'width'       => 320,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	// Full WooCommerce support
	add_theme_support(
		'woocommerce',
		array(
			'thumbnail_image_width' => 640,
			'single_image_width'    => 960,
			'product_grid'          => array(
				'default_rows'    => 4,
				'min_rows'        => 1,
				'default_columns' => 3,
				'min_columns'     => 1,
				'max_columns'     => 4,
			),
		)
	);
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Studio Header Menu', 'mehandibysana' ),
			'footer'  => __( 'Footer Atelier Navigation', 'mehandibysana' ),
		)
	);
} );

/**
 * Seed PIN rules + Create Studio pages automatically upon theme activation
 */
add_action( 'after_switch_theme', function () {
	mbs_get_pincode_rules();
	mbs_setup_studio_pages( false );
	if ( false === get_option( 'mbs_auto_pincode_shipping' ) ) {
		update_option( 'mbs_auto_pincode_shipping', 'yes', false );
	}
	if ( false === get_option( 'mbs_historical_orders_offset' ) ) {
		update_option( 'mbs_historical_orders_offset', 3499, false );
	}
	flush_rewrite_rules();
} );

/**
 * Ensure WordPress also creates Studio pages on first load if skipped during zip preview/activation
 */
add_action( 'init', function () {
	if ( is_admin() && ! get_option( 'mbs_initial_setup_done' ) ) {
		mbs_get_pincode_rules();
		mbs_setup_studio_pages( false );
		update_option( 'mbs_initial_setup_done', '1', false );
	}
}, 25 );

/**
 * Enqueue Editorial Google Fonts, Tokens, Stylesheets & Vanilla JS
 */
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style(
		'mbs-google-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap',
		array(),
		null
	);

	wp_enqueue_style(
		'mbs-tokens',
		MBS_THEME_URI . '/assets/css/tokens.css',
		array( 'mbs-google-fonts' ),
		MBS_THEME_VERSION
	);

	wp_enqueue_style(
		'mbs-theme-style',
		MBS_THEME_URI . '/assets/css/theme.css',
		array( 'mbs-tokens' ),
		MBS_THEME_VERSION
	);

	wp_enqueue_script(
		'mbs-theme-script',
		MBS_THEME_URI . '/assets/js/theme.js',
		array(),
		MBS_THEME_VERSION,
		true
	);

	// Guarantee WC cart is initialized for localization on page render if WC active
	if ( function_exists( 'WC' ) && null !== WC()->cart ) {
		$initial_bag = mbs_get_normalized_bag();
	} else {
		$initial_bag = array(
			'items'          => array(),
			'itemsCount'     => 0,
			'subtotal'       => 0,
			'total'          => 0,
			'shippingTotal'  => 0,
			'currencySymbol' => mbs_get_currency_symbol(),
			'cartUrl'        => mbs_get_cart_url(),
			'checkoutUrl'    => mbs_get_checkout_url(),
			'shopUrl'        => mbs_get_shop_url(),
			'pincode'        => mbs_get_active_customer_pincode(),
			'pincodeResult'  => null,
		);
	}

	wp_localize_script(
		'mbs-theme-script',
		'MBS_THEME',
		array(
			'ajaxUrl'        => admin_url( 'admin-ajax.php' ),
			'nonce'          => wp_create_nonce( 'mbs_theme_nonce' ),
			'shopUrl'        => mbs_get_shop_url(),
			'cartUrl'        => mbs_get_cart_url(),
			'checkoutUrl'    => mbs_get_checkout_url(),
			'trackOrderUrl'  => mbs_get_track_order_url(),
			'servicesUrl'    => mbs_get_page_url_by_slug( 'services', '/services/' ),
			'contactUrl'     => mbs_get_page_url_by_slug( 'contact', '/contact/' ),
			'currencySymbol' => mbs_get_currency_symbol(),
			'wcActive'       => class_exists( 'WooCommerce' ),
			'isCart'         => function_exists( 'is_cart' ) && is_cart(),
			'isCheckout'     => function_exists( 'is_checkout' ) && is_checkout(),
			'bag'            => $initial_bag,
		)
	);
}, 20 );

/**
 * Clean up default WooCommerce wrappers & chrome where Atelier templates handle framing
 */
add_action( 'init', function () {
	remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
	remove_action( 'woocommerce_sidebar', 'woocommerce_get_sidebar', 10 );
} );

/**
 * Support ?category=<slug> filter parameter cleanly on WooCommerce Shop / Archive queries
 */
add_action( 'woocommerce_product_query', function ( $q ) {
	if ( is_admin() ) {
		return;
	}
	if ( ! empty( $_GET['category'] ) ) {
		$cat_slug = sanitize_title( wp_unslash( $_GET['category'] ) );
		if ( $cat_slug && 'all' !== $cat_slug ) {
			$tax_query   = (array) $q->get( 'tax_query' );
			$tax_query[] = array(
				'taxonomy' => 'product_cat',
				'field'    => 'slug',
				'terms'    => array( $cat_slug ),
			);
			$q->set( 'tax_query', $tax_query );
		}
	}
} );

/**
 * Add subtle body classes cleanly matching atelier routes
 */
add_filter( 'body_class', function ( $classes ) {
	$classes[] = 'mbs-atelier-body';
	if ( function_exists( 'is_checkout' ) && is_checkout() ) {
		$classes[] = 'mbs-checkout-route';
	}
	if ( function_exists( 'is_cart' ) && is_cart() ) {
		$classes[] = 'mbs-cart-route';
	}
	return $classes;
} );
