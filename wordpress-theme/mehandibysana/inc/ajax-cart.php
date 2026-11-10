<?php
/**
 * Native WooCommerce Session AJAX Shopping Bag Endpoints
 * Keeps slide-over Bag Drawer, Header Badge, PDP Variant Selector & Checkout 100% synced.
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Guarantee WC session + cart loaded during wp_ajax requests
 */
function mbs_ensure_wc_cart_loaded() {
	if ( ! function_exists( 'WC' ) ) {
		return false;
	}
	if ( null === WC()->session ) {
		WC()->initialize_session();
	}
	if ( WC()->session && ! WC()->session->has_session() ) {
		WC()->session->set_customer_session_cookie( true );
	}
	if ( null === WC()->cart ) {
		if ( function_exists( 'wc_load_cart' ) ) {
			wc_load_cart();
		} else {
			WC()->initialize_cart();
		}
	}
	return (bool) WC()->cart;
}

/**
 * Normalize live WC()->cart into clean JSON for JS UI & initial localization
 */
function mbs_get_normalized_bag() {
	$currency = mbs_get_currency_symbol();
	$empty    = array(
		'items'          => array(),
		'itemsCount'     => 0,
		'subtotal'       => 0,
		'total'          => 0,
		'shippingTotal'  => 0,
		'currencySymbol' => $currency,
		'cartUrl'        => mbs_get_cart_url(),
		'checkoutUrl'    => mbs_get_checkout_url(),
		'shopUrl'        => mbs_get_shop_url(),
		'pincode'        => mbs_get_active_customer_pincode(),
	);

	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return $empty;
	}

	WC()->cart->calculate_totals();
	$items = array();

	foreach ( WC()->cart->get_cart() as $cart_key => $cart_item ) {
		$product = $cart_item['data'] ?? null;
		if ( ! $product instanceof WC_Product ) {
			continue;
		}
		$parent_id   = ! empty( $cart_item['product_id'] ) ? (int) $cart_item['product_id'] : $product->get_id();
		$parent_prod = wc_get_product( $parent_id ) ?: $product;

		$qty        = (int) ( $cart_item['quantity'] ?? 1 );
		$line_total = (float) ( $cart_item['line_subtotal'] ?? ( (float) $product->get_price() * $qty ) );
		$unit_price = $qty > 0 ? round( $line_total / $qty, 2 ) : (float) $product->get_price();

		// Build human-readable variation pill label
		$var_parts = array();
		if ( ! empty( $cart_item['variation'] ) && is_array( $cart_item['variation'] ) ) {
			foreach ( $cart_item['variation'] as $attr_key => $attr_val ) {
				if ( '' === $attr_val ) {
					continue;
				}
				$tax = str_replace( 'attribute_', '', $attr_key );
				if ( taxonomy_exists( $tax ) ) {
					$term = get_term_by( 'slug', $attr_val, $tax );
					$var_parts[] = $term ? $term->name : $attr_val;
				} else {
					$var_parts[] = $attr_val;
				}
			}
		}

		$img_id  = $product->get_image_id() ?: $parent_prod->get_image_id();
		$img_src = $img_id ? wp_get_attachment_image_url( $img_id, 'medium' ) : '';

		$items[] = array(
			'key'            => $cart_key,
			'productId'      => $parent_id,
			'variationId'    => ! empty( $cart_item['variation_id'] ) ? (int) $cart_item['variation_id'] : 0,
			'name'           => html_entity_decode( $parent_prod->get_name(), ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
			'slug'           => $parent_prod->get_slug(),
			'permalink'      => get_permalink( $parent_id ),
			'variationLabel' => implode( ' / ', $var_parts ),
			'quantity'       => $qty,
			'unitPrice'      => $unit_price,
			'lineTotal'      => $line_total,
			'currencySymbol' => $currency,
			'image'          => $img_src ? array(
				'src' => $img_src,
				'alt' => $parent_prod->get_name(),
			) : null,
		);
	}

	$subtotal = (float) WC()->cart->get_subtotal();
	$pin      = mbs_get_active_customer_pincode();
	$pin_eval = 6 === strlen( $pin ) ? mbs_evaluate_pincode( $pin, $subtotal ) : null;

	return array(
		'items'          => $items,
		'itemsCount'     => (int) WC()->cart->get_cart_contents_count(),
		'subtotal'       => $subtotal,
		'total'          => (float) WC()->cart->get_total( 'edit' ),
		'shippingTotal'  => (float) WC()->cart->get_shipping_total(),
		'currencySymbol' => $currency,
		'cartUrl'        => mbs_get_cart_url(),
		'checkoutUrl'    => mbs_get_checkout_url(),
		'shopUrl'        => mbs_get_shop_url(),
		'pincode'        => $pin,
		'pincodeResult'  => $pin_eval,
	);
}

/**
 * AJAX: Return normalized shopping bag
 */
function mbs_ajax_get_bag() {
	check_ajax_referer( 'mbs_theme_nonce', 'nonce' );
	if ( ! mbs_ensure_wc_cart_loaded() ) {
		wp_send_json_error( array( 'message' => __( 'WooCommerce cart unavailable.', 'mehandibysana' ) ), 400 );
	}
	wp_send_json_success( mbs_get_normalized_bag() );
}
add_action( 'wp_ajax_mbs_get_bag', 'mbs_ajax_get_bag' );
add_action( 'wp_ajax_nopriv_mbs_get_bag', 'mbs_ajax_get_bag' );

/**
 * AJAX: Add simple item or variable variation to WC cart
 */
function mbs_ajax_add_to_bag() {
	check_ajax_referer( 'mbs_theme_nonce', 'nonce' );
	if ( ! mbs_ensure_wc_cart_loaded() ) {
		wp_send_json_error( array( 'message' => __( 'Please activate WooCommerce to add items to your bag.', 'mehandibysana' ) ), 400 );
	}

	$product_id   = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
	$variation_id = isset( $_POST['variation_id'] ) ? absint( $_POST['variation_id'] ) : 0;
	$quantity     = isset( $_POST['quantity'] ) ? max( 1, min( 50, absint( $_POST['quantity'] ) ) ) : 1;

	$target = wc_get_product( $variation_id ?: $product_id );
	if ( ! $target ) {
		wp_send_json_error( array( 'message' => __( 'Selected item could not be found.', 'mehandibysana' ) ), 404 );
	}

	if ( $target->is_type( 'variation' ) ) {
		$variation_id = $target->get_id();
		$product_id   = $target->get_parent_id();
	}

	$product = wc_get_product( $product_id );
	if ( ! $product ) {
		wp_send_json_error( array( 'message' => __( 'Product not found.', 'mehandibysana' ) ), 404 );
	}

	$variation_attrs = array();
	if ( $variation_id > 0 ) {
		$var_obj = wc_get_product( $variation_id );
		if ( ! $var_obj || ! $var_obj->is_in_stock() ) {
			wp_send_json_error( array( 'message' => __( 'This selected option is currently out of stock.', 'mehandibysana' ) ), 400 );
		}
		foreach ( $var_obj->get_attributes() as $k => $v ) {
			$variation_attrs[ 'attribute_' . $k ] = $v;
		}
	} elseif ( $product->is_type( 'variable' ) ) {
		// Automatically pick first in-stock variation when added from single-click card
		foreach ( $product->get_children() as $cid ) {
			$c = wc_get_product( $cid );
			if ( $c && $c->is_in_stock() ) {
				$variation_id = $c->get_id();
				foreach ( $c->get_attributes() as $k => $v ) {
					$variation_attrs[ 'attribute_' . $k ] = $v;
				}
				break;
			}
		}
		if ( ! $variation_id ) {
			wp_send_json_error( array( 'message' => __( 'Please choose an available product option.', 'mehandibysana' ) ), 400 );
		}
	} elseif ( ! $product->is_in_stock() ) {
		wp_send_json_error( array( 'message' => __( 'This product is currently out of stock.', 'mehandibysana' ) ), 400 );
	}

	$added = WC()->cart->add_to_cart( $product_id, $quantity, $variation_id, $variation_attrs );
	if ( ! $added ) {
		$notices = wc_get_notices( 'error' );
		wc_clear_notices();
		$msg = ! empty( $notices[0]['notice'] )
			? wp_strip_all_tags( $notices[0]['notice'] )
			: __( 'Could not add item to bag. Check stock availability.', 'mehandibysana' );
		wp_send_json_error( array( 'message' => $msg ), 400 );
	}

	wp_send_json_success( mbs_get_normalized_bag() );
}
add_action( 'wp_ajax_mbs_add_to_bag', 'mbs_ajax_add_to_bag' );
add_action( 'wp_ajax_nopriv_mbs_add_to_bag', 'mbs_ajax_add_to_bag' );

/**
 * AJAX: Update item quantity
 */
function mbs_ajax_update_bag_item() {
	check_ajax_referer( 'mbs_theme_nonce', 'nonce' );
	if ( ! mbs_ensure_wc_cart_loaded() ) {
		wp_send_json_error( array( 'message' => __( 'Cart unavailable.', 'mehandibysana' ) ), 400 );
	}

	$key = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
	$qty = isset( $_POST['quantity'] ) ? (int) $_POST['quantity'] : 1;

	if ( '' === $key ) {
		wp_send_json_error( array( 'message' => __( 'Missing cart line key.', 'mehandibysana' ) ), 400 );
	}

	if ( $qty <= 0 ) {
		WC()->cart->remove_cart_item( $key );
	} else {
		WC()->cart->set_quantity( $key, min( 50, $qty ), true );
	}

	wp_send_json_success( mbs_get_normalized_bag() );
}
add_action( 'wp_ajax_mbs_update_bag_item', 'mbs_ajax_update_bag_item' );
add_action( 'wp_ajax_nopriv_mbs_update_bag_item', 'mbs_ajax_update_bag_item' );

/**
 * AJAX: Remove line item from cart
 */
function mbs_ajax_remove_bag_item() {
	check_ajax_referer( 'mbs_theme_nonce', 'nonce' );
	if ( ! mbs_ensure_wc_cart_loaded() ) {
		wp_send_json_error( array( 'message' => __( 'Cart unavailable.', 'mehandibysana' ) ), 400 );
	}

	$key = isset( $_POST['key'] ) ? sanitize_text_field( wp_unslash( $_POST['key'] ) ) : '';
	if ( '' === $key ) {
		wp_send_json_error( array( 'message' => __( 'Missing cart line key.', 'mehandibysana' ) ), 400 );
	}

	WC()->cart->remove_cart_item( $key );
	wp_send_json_success( mbs_get_normalized_bag() );
}
add_action( 'wp_ajax_mbs_remove_bag_item', 'mbs_ajax_remove_bag_item' );
add_action( 'wp_ajax_nopriv_mbs_remove_bag_item', 'mbs_ajax_remove_bag_item' );

