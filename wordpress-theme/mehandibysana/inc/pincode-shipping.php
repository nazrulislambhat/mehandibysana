<?php
/**
 * Indian Wildcard PIN Code Shipping & COD Engine
 * Seeded with Mehandi by Sana Srinagar zone tiers, integrated into WooCommerce Shipping,
 * Checkout COD gateway eligibility, Bag Drawer / PDP AJAX Checker, and WP Admin Settings.
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MBS_PINCODE_RULES_OPTION', 'mbs_pincode_rules' );

/**
 * Default seeded PIN code rules mirroring studio-data/pincode-rules.json
 */
function mbs_get_default_pincode_rules() {
	return array(
		array(
			'id'                => 'rule-jk-19',
			'pattern'           => '19*',
			'label'             => 'Kashmir Valley & Ladakh (19*)',
			'zone'              => 'Zone A — Local Dispatch',
			'charge'            => 60,
			'estimatedDays'     => '1–2 business days',
			'codAvailable'      => true,
			'freeShippingAbove' => null,
			'active'            => true,
		),
		array(
			'id'                => 'rule-jk-18',
			'pattern'           => '18*',
			'label'             => 'Jammu Region (18*)',
			'zone'              => 'Zone A — Regional Dispatch',
			'charge'            => 60,
			'estimatedDays'     => '2–3 business days',
			'codAvailable'      => true,
			'freeShippingAbove' => null,
			'active'            => true,
		),
		array(
			'id'                => 'rule-delhi-11',
			'pattern'           => '11*',
			'label'             => 'New Delhi NCR (11*)',
			'zone'              => 'Zone B — North India Metro',
			'charge'            => 120,
			'estimatedDays'     => '3–4 business days',
			'codAvailable'      => true,
			'freeShippingAbove' => null,
			'active'            => true,
		),
		array(
			'id'                => 'rule-haryana-12',
			'pattern'           => '12*',
			'label'             => 'Haryana & Gurugram NCR (12*)',
			'zone'              => 'Zone B — North India Metro',
			'charge'            => 120,
			'estimatedDays'     => '3–4 business days',
			'codAvailable'      => true,
			'freeShippingAbove' => null,
			'active'            => true,
		),
		array(
			'id'                => 'rule-punjab-14',
			'pattern'           => '14*',
			'label'             => 'Punjab & Chandigarh (14*)',
			'zone'              => 'Zone B — North India Metro',
			'charge'            => 120,
			'estimatedDays'     => '3–4 business days',
			'codAvailable'      => true,
			'freeShippingAbove' => null,
			'active'            => true,
		),
		array(
			'id'                => 'rule-up-20',
			'pattern'           => '20*',
			'label'             => 'Noida & Western UP (20*)',
			'zone'              => 'Zone B — North India Metro',
			'charge'            => 120,
			'estimatedDays'     => '3–4 business days',
			'codAvailable'      => true,
			'freeShippingAbove' => null,
			'active'            => true,
		),
		array(
			'id'                => 'rule-all-india',
			'pattern'           => '*',
			'label'             => 'Rest of India (All Other Pincodes)',
			'zone'              => 'Zone C — Pan-India Express',
			'charge'            => 150,
			'estimatedDays'     => '4–6 business days',
			'codAvailable'      => true,
			'freeShippingAbove' => null,
			'active'            => true,
		),
	);
}

/**
 * Retrieve stored rules or seed defaults automatically
 */
function mbs_get_pincode_rules() {
	$rules = get_option( MBS_PINCODE_RULES_OPTION, null );
	if ( ! is_array( $rules ) || empty( $rules ) ) {
		$rules = mbs_get_default_pincode_rules();
		update_option( MBS_PINCODE_RULES_OPTION, $rules, false );
	}
	return $rules;
}

/**
 * Compute wildcard specificity score (longest literal prefix wins; exact 6-digit wins first)
 */
function mbs_pincode_pattern_matches( $pattern, $pin ) {
	$pattern = trim( (string) $pattern );
	if ( '' === $pattern ) {
		return -1;
	}
	if ( '*' === $pattern ) {
		return 0;
	}

	// Exact digits match
	if ( ctype_digit( $pattern ) ) {
		return $pattern === $pin ? 1000 + strlen( $pattern ) : -1;
	}

	// Prefix pattern e.g. 19*, 1900*
	if ( str_ends_with( $pattern, '*' ) && substr_count( $pattern, '*' ) === 1 ) {
		$prefix = substr( $pattern, 0, -1 );
		if ( '' !== $prefix && str_starts_with( $pin, $prefix ) ) {
			return 100 + strlen( $prefix );
		}
		return -1;
	}

	// General glob wildcard e.g. 19?001 or 19*01
	$escaped = preg_quote( $pattern, '/' );
	$regex   = '/^' . str_replace( array( '\*', '\?' ), array( '.*', '.' ), $escaped ) . '$/';
	if ( preg_match( $regex, $pin ) ) {
		$non_wild = strlen( str_replace( array( '*', '?' ), '', $pattern ) );
		return 50 + $non_wild;
	}

	return -1;
}

/**
 * Evaluate a 6-digit Indian PIN code against rules + optional cart subtotal
 */
function mbs_evaluate_pincode( $raw_pin, $subtotal = 0 ) {
	$pin = preg_replace( '/\D/', '', (string) $raw_pin );
	if ( 6 !== strlen( $pin ) ) {
		return array(
			'serviceable'    => false,
			'pincode'        => $pin,
			'label'          => '',
			'zone'           => '',
			'deliveryCharge' => 0,
			'estimatedDays'  => '',
			'codAvailable'   => false,
			'matchedRule'    => null,
			'message'        => __( 'Please enter a valid 6-digit Indian PIN code.', 'mehandibysana' ),
		);
	}

	$rules      = mbs_get_pincode_rules();
	$best_rule  = null;
	$best_score = -1;

	foreach ( $rules as $rule ) {
		if ( empty( $rule['active'] ) ) {
			continue;
		}
		$score = mbs_pincode_pattern_matches( $rule['pattern'] ?? '', $pin );
		if ( $score > $best_score ) {
			$best_score = $score;
			$best_rule  = $rule;
		}
	}

	if ( ! $best_rule ) {
		return array(
			'serviceable'    => false,
			'pincode'        => $pin,
			'label'          => '',
			'zone'           => '',
			'deliveryCharge' => 0,
			'estimatedDays'  => '',
			'codAvailable'   => false,
			'matchedRule'    => null,
			'message'        => sprintf( __( 'Delivery to PIN %s is currently unavailable. Please contact our Srinagar desk.', 'mehandibysana' ), $pin ),
		);
	}

	$charge = (float) ( $best_rule['charge'] ?? 0 );
	$free_above = isset( $best_rule['freeShippingAbove'] ) && '' !== $best_rule['freeShippingAbove'] && null !== $best_rule['freeShippingAbove']
		? (float) $best_rule['freeShippingAbove']
		: null;

	if ( null !== $free_above && $subtotal >= $free_above ) {
		$charge = 0;
	}

	return array(
		'serviceable'    => true,
		'pincode'        => $pin,
		'label'          => (string) ( $best_rule['label'] ?? 'Standard Delivery' ),
		'zone'           => (string) ( $best_rule['zone'] ?? '' ),
		'deliveryCharge' => $charge,
		'estimatedDays'  => (string) ( $best_rule['estimatedDays'] ?? '3–5 business days' ),
		'codAvailable'   => ! empty( $best_rule['codAvailable'] ),
		'matchedRule'    => $best_rule,
		'message'        => '',
	);
}

/**
 * Retrieve persisted customer PIN (from WC session, customer profile, or checkout post)
 */
function mbs_get_active_customer_pincode() {
	if ( function_exists( 'WC' ) && WC()->session ) {
		$sess_pin = WC()->session->get( 'mbs_checked_pincode' );
		if ( $sess_pin && 6 === strlen( preg_replace( '/\D/', '', (string) $sess_pin ) ) ) {
			return preg_replace( '/\D/', '', (string) $sess_pin );
		}
	}
	if ( function_exists( 'WC' ) && WC()->customer ) {
		$ship_pin = preg_replace( '/\D/', '', (string) WC()->customer->get_shipping_postcode() );
		if ( 6 === strlen( $ship_pin ) ) {
			return $ship_pin;
		}
		$bill_pin = preg_replace( '/\D/', '', (string) WC()->customer->get_billing_postcode() );
		if ( 6 === strlen( $bill_pin ) ) {
			return $bill_pin;
		}
	}
	return '';
}

/**
 * AJAX: Check Indian PIN code & sync with WooCommerce shipping postcode session
 */
function mbs_ajax_check_pincode() {
	check_ajax_referer( 'mbs_theme_nonce', 'nonce' );

	$raw_pin  = isset( $_POST['pincode'] ) ? sanitize_text_field( wp_unslash( $_POST['pincode'] ) ) : '';
	$subtotal = isset( $_POST['subtotal'] ) ? (float) $_POST['subtotal'] : 0;

	if ( function_exists( 'WC' ) && WC()->cart && $subtotal <= 0 ) {
		$subtotal = (float) WC()->cart->get_subtotal();
	}

	$result = mbs_evaluate_pincode( $raw_pin, $subtotal );

	if ( $result['serviceable'] && function_exists( 'WC' ) ) {
		if ( WC()->session ) {
			WC()->session->set_customer_session_cookie( true );
			WC()->session->set( 'mbs_checked_pincode', $result['pincode'] );
		}
		if ( WC()->customer ) {
			WC()->customer->set_shipping_postcode( $result['pincode'] );
			WC()->customer->set_shipping_country( 'IN' );
			if ( ! WC()->customer->get_billing_postcode() ) {
				WC()->customer->set_billing_postcode( $result['pincode'] );
				WC()->customer->set_billing_country( 'IN' );
			}
			WC()->customer->save();
		}
		if ( WC()->cart ) {
			if ( WC()->session ) {
				foreach ( array_keys( WC()->cart->get_shipping_packages() ) as $package_key ) {
					WC()->session->set( 'shipping_for_package_' . $package_key, false );
				}
			}
			WC()->cart->calculate_shipping();
			WC()->cart->calculate_totals();
		}
	}

	wp_send_json_success( $result );
}
add_action( 'wp_ajax_mbs_check_pincode', 'mbs_ajax_check_pincode' );
add_action( 'wp_ajax_nopriv_mbs_check_pincode', 'mbs_ajax_check_pincode' );

/**
 * Register custom WooCommerce Shipping Method
 */
add_action( 'woocommerce_shipping_init', function () {
	if ( ! class_exists( 'WC_Shipping_Method' ) || class_exists( 'MBS_Pincode_Shipping_Method' ) ) {
		return;
	}

	class MBS_Pincode_Shipping_Method extends WC_Shipping_Method {
		public function __construct( $instance_id = 0 ) {
			$this->id                 = 'mbs_pincode_shipping';
			$this->instance_id        = absint( $instance_id );
			$this->method_title       = __( 'Mehandi Studio Wildcard PIN Shipping', 'mehandibysana' );
			$this->method_description = __( 'Calculates Indian courier rate automatically using Mehandi by Sana 6-digit PIN prefix rules.', 'mehandibysana' );
			$this->supports           = array( 'shipping-zones', 'instance-settings' );
			$this->init();
		}

		public function init() {
			$this->init_form_fields();
			$this->init_settings();
			$this->title = $this->get_option( 'title', __( 'Studio Dispatch (PIN Code Delivery)', 'mehandibysana' ) );
			add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );
		}

		public function calculate_shipping( $package = array() ) {
			$pin = '';
			if ( ! empty( $package['destination']['postcode'] ) ) {
				$pin = preg_replace( '/\D/', '', (string) $package['destination']['postcode'] );
			}
			if ( 6 !== strlen( $pin ) ) {
				$pin = mbs_get_active_customer_pincode();
			}
			$subtotal = isset( $package['contents_cost'] ) ? (float) $package['contents_cost'] : 0;

			if ( 6 === strlen( $pin ) ) {
				$eval = mbs_evaluate_pincode( $pin, $subtotal );
				if ( ! $eval['serviceable'] ) {
					return;
				}
				$label = sprintf(
					__( 'Studio Courier (PIN %1$s · %2$s)', 'mehandibysana' ),
					$eval['pincode'],
					$eval['estimatedDays']
				);
				$cost = (float) $eval['deliveryCharge'];
			} else {
				// Default Kashmir/India base preview before PIN entered
				$label = __( 'Studio Dispatch (Enter 6-digit PIN for exact rate)', 'mehandibysana' );
				$cost  = 60;
			}

			$this->add_rate(
				array(
					'id'    => $this->get_rate_id(),
					'label' => $label,
					'cost'  => $cost,
				)
			);
		}
	}
} );

add_filter( 'woocommerce_shipping_methods', function ( $methods ) {
	$methods['mbs_pincode_shipping'] = 'MBS_Pincode_Shipping_Method';
	return $methods;
} );

/**
 * Turnkey Guarantee: Ensure Studio PIN Shipping automatically calculates in WooCommerce Cart & Checkout
 * even if the store admin has not manually set up Shipping Zones yet.
 */
add_filter( 'woocommerce_package_rates', function ( $rates, $package ) {
	$auto_mode = get_option( 'mbs_auto_pincode_shipping', 'yes' );
	if ( 'yes' !== $auto_mode ) {
		return $rates;
	}

	// If MBS_Pincode_Shipping_Method already populated a rate in this zone, keep it as primary
	foreach ( $rates as $rate_id => $rate ) {
		if ( str_starts_with( $rate_id, 'mbs_pincode_shipping' ) ) {
			return $rates;
		}
	}

	// Only inject automatically if no other shipping rate exists (or country is IN / unset)
	$country = isset( $package['destination']['country'] ) ? strtoupper( (string) $package['destination']['country'] ) : 'IN';
	if ( ! empty( $rates ) && 'IN' !== $country && '' !== $country ) {
		return $rates;
	}

	if ( ! class_exists( 'WC_Shipping_Rate' ) ) {
		return $rates;
	}

	$pin = ! empty( $package['destination']['postcode'] )
		? preg_replace( '/\D/', '', (string) $package['destination']['postcode'] )
		: '';
	if ( 6 !== strlen( $pin ) ) {
		$pin = mbs_get_active_customer_pincode();
	}

	$subtotal = isset( $package['contents_cost'] ) ? (float) $package['contents_cost'] : 0;

	if ( 6 === strlen( $pin ) ) {
		$eval = mbs_evaluate_pincode( $pin, $subtotal );
		if ( ! $eval['serviceable'] ) {
			return $rates;
		}
		$label = sprintf(
			__( 'Studio Courier · %1$s (%2$s)', 'mehandibysana' ),
			$eval['label'],
			$eval['estimatedDays']
		);
		$cost = (float) $eval['deliveryCharge'];
	} elseif ( empty( $rates ) ) {
		$label = __( 'Studio Courier · Enter 6-digit PIN (₹60–₹150)', 'mehandibysana' );
		$cost  = 60;
	} else {
		return $rates;
	}

	$rates['mbs_pincode_auto'] = new WC_Shipping_Rate(
		'mbs_pincode_auto',
		$label,
		$cost,
		array(),
		'mbs_pincode_auto'
	);

	return $rates;
}, 20, 2 );

/**
 * Filter Cash on Delivery (COD) availability by matched PIN rule
 */
add_filter( 'woocommerce_available_payment_gateways', function ( $gateways ) {
	if ( is_admin() || ! isset( $gateways['cod'] ) ) {
		return $gateways;
	}
	$pin = mbs_get_active_customer_pincode();
	if ( isset( $_POST['s_postcode'] ) && '' !== $_POST['s_postcode'] ) {
		$pin = preg_replace( '/\D/', '', sanitize_text_field( wp_unslash( $_POST['s_postcode'] ) ) );
	} elseif ( isset( $_POST['postcode'] ) && '' !== $_POST['postcode'] ) {
		$pin = preg_replace( '/\D/', '', sanitize_text_field( wp_unslash( $_POST['postcode'] ) ) );
	}

	if ( 6 === strlen( $pin ) ) {
		$subtotal = function_exists( 'WC' ) && WC()->cart ? (float) WC()->cart->get_subtotal() : 0;
		$eval     = mbs_evaluate_pincode( $pin, $subtotal );
		if ( $eval['serviceable'] && empty( $eval['codAvailable'] ) ) {
			unset( $gateways['cod'] );
		}
	}
	return $gateways;
} );

/**
 * Prefill Checkout billing/shipping PIN & Country from active PIN check session
 */
add_filter( 'woocommerce_checkout_get_value', function ( $value, $input ) {
	if ( ! empty( $value ) ) {
		return $value;
	}
	if ( 'billing_postcode' === $input || 'shipping_postcode' === $input ) {
		$pin = mbs_get_active_customer_pincode();
		if ( '' !== $pin ) {
			return $pin;
		}
	}
	if ( 'billing_country' === $input || 'shipping_country' === $input ) {
		return 'IN';
	}
	return $value;
}, 10, 2 );

/**
 * Attach PIN shipping rule metadata when a WooCommerce order is created
 */
add_action( 'woocommerce_checkout_create_order', function ( $order, $data ) {
	$pin = preg_replace( '/\D/', '', (string) ( $order->get_shipping_postcode() ?: $order->get_billing_postcode() ) );
	if ( 6 === strlen( $pin ) ) {
		$eval = mbs_evaluate_pincode( $pin, (float) $order->get_subtotal() );
		if ( ! empty( $eval['matchedRule'] ) ) {
			$order->update_meta_data( '_mbs_pincode_rule', sanitize_text_field( $eval['matchedRule']['pattern'] . ' · ' . $eval['matchedRule']['label'] ) );
			$order->update_meta_data( '_mbs_delivery_eta', sanitize_text_field( $eval['estimatedDays'] ) );
		}
	}
	if ( ! $order->get_meta( '_mbs_fulfillment_stage' ) ) {
		$order->update_meta_data( '_mbs_fulfillment_stage', 'received' );
	}
}, 10, 2 );

/**
 * Save PIN rules CRUD handler & Admin screen
 */
function mbs_render_pincode_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$notice = '';

	// Handle form actions
	if ( isset( $_POST['mbs_pin_action'] ) && check_admin_referer( 'mbs_pin_rules_admin', 'mbs_pin_nonce' ) ) {
		$action = sanitize_text_field( wp_unslash( $_POST['mbs_pin_action'] ) );
		$rules  = mbs_get_pincode_rules();

		if ( 'restore_defaults' === $action ) {
			$rules = mbs_get_default_pincode_rules();
			update_option( MBS_PINCODE_RULES_OPTION, $rules, false );
			$notice = __( 'Default Indian wildcard PIN shipping rules restored.', 'mehandibysana' );
		} elseif ( 'save_all' === $action && isset( $_POST['rules'] ) && is_array( $_POST['rules'] ) ) {
			$updated = array();
			foreach ( wp_unslash( $_POST['rules'] ) as $row ) {
				$pattern = trim( sanitize_text_field( $row['pattern'] ?? '' ) );
				if ( '' === $pattern ) {
					continue;
				}
				$free_raw = trim( (string) ( $row['freeShippingAbove'] ?? '' ) );
				$updated[] = array(
					'id'                => sanitize_key( $row['id'] ?? ( 'rule-' . wp_generate_password( 6, false ) ) ),
					'pattern'           => $pattern,
					'label'             => sanitize_text_field( $row['label'] ?? '' ),
					'zone'              => sanitize_text_field( $row['zone'] ?? '' ),
					'charge'            => max( 0, (float) ( $row['charge'] ?? 0 ) ),
					'estimatedDays'     => sanitize_text_field( $row['estimatedDays'] ?? '' ),
					'codAvailable'      => ! empty( $row['codAvailable'] ),
					'freeShippingAbove' => '' !== $free_raw ? max( 0, (float) $free_raw ) : null,
					'active'            => ! empty( $row['active'] ),
				);
			}
			update_option( MBS_PINCODE_RULES_OPTION, $updated, false );
			$notice = __( 'PIN code shipping rules updated.', 'mehandibysana' );
		} elseif ( 'add_rule' === $action ) {
			$pattern  = trim( sanitize_text_field( wp_unslash( $_POST['new_pattern'] ?? '' ) ) );
			$label    = sanitize_text_field( wp_unslash( $_POST['new_label'] ?? '' ) );
			$zone     = sanitize_text_field( wp_unslash( $_POST['new_zone'] ?? '' ) );
			$charge   = max( 0, (float) ( $_POST['new_charge'] ?? 0 ) );
			$eta      = sanitize_text_field( wp_unslash( $_POST['new_eta'] ?? '3–5 business days' ) );
			$free_raw = trim( sanitize_text_field( wp_unslash( $_POST['new_free_above'] ?? '' ) ) );
			if ( '' !== $pattern ) {
				$rules[] = array(
					'id'                => 'rule-' . strtolower( wp_generate_password( 6, false, false ) ),
					'pattern'           => $pattern,
					'label'             => $label ?: $pattern,
					'zone'              => $zone ?: 'Custom Zone',
					'charge'            => $charge,
					'estimatedDays'     => $eta,
					'codAvailable'      => ! empty( $_POST['new_cod'] ),
					'freeShippingAbove' => '' !== $free_raw ? max( 0, (float) $free_raw ) : null,
					'active'            => true,
				);
				update_option( MBS_PINCODE_RULES_OPTION, $rules, false );
				$notice = __( 'New PIN code shipping rule added.', 'mehandibysana' );
			}
		} elseif ( 'delete_rule' === $action && ! empty( $_POST['delete_id'] ) ) {
			$del_id = sanitize_text_field( wp_unslash( $_POST['delete_id'] ) );
			$rules  = array_values( array_filter( $rules, function ( $r ) use ( $del_id ) {
				return ( $r['id'] ?? '' ) !== $del_id;
			} ) );
			update_option( MBS_PINCODE_RULES_OPTION, $rules, false );
			$notice = __( 'Rule removed.', 'mehandibysana' );
		}
	}

	$rules = mbs_get_pincode_rules();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Mehandi Studio — Wildcard PIN Shipping & COD Rules', 'mehandibysana' ); ?></h1>
		<p class="description">
			<?php esc_html_e( 'Matches customer 6-digit PIN codes by longest prefix specificity (e.g. 190001 exact beats 19*, which beats * Pan-India fallback). Used automatically by the PDP/Cart PIN Estimator and WooCommerce Checkout.', 'mehandibysana' ); ?>
		</p>

		<?php if ( $notice ) : ?>
			<div class="notice notice-success is-dismissible"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>

		<form method="post" style="margin-top:20px;">
			<?php wp_nonce_field( 'mbs_pin_rules_admin', 'mbs_pin_nonce' ); ?>
			<input type="hidden" name="mbs_pin_action" value="save_all" />

			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Active', 'mehandibysana' ); ?></th>
						<th><?php esc_html_e( 'PIN Pattern', 'mehandibysana' ); ?></th>
						<th><?php esc_html_e( 'Display Label', 'mehandibysana' ); ?></th>
						<th><?php esc_html_e( 'Zone Name', 'mehandibysana' ); ?></th>
						<th><?php esc_html_e( 'Charge (₹)', 'mehandibysana' ); ?></th>
						<th><?php esc_html_e( 'Free Above (₹)', 'mehandibysana' ); ?></th>
						<th><?php esc_html_e( 'ETA', 'mehandibysana' ); ?></th>
						<th><?php esc_html_e( 'COD', 'mehandibysana' ); ?></th>
						<th><?php esc_html_e( 'Remove', 'mehandibysana' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $rules as $i => $rule ) : ?>
						<tr>
							<td>
								<input type="hidden" name="rules[<?php echo (int) $i; ?>][id]" value="<?php echo esc_attr( $rule['id'] ?? '' ); ?>" />
								<input type="checkbox" name="rules[<?php echo (int) $i; ?>][active]" value="1" <?php checked( ! empty( $rule['active'] ) ); ?> />
							</td>
							<td><input type="text" class="regular-text" style="width:90px;font-family:monospace;" name="rules[<?php echo (int) $i; ?>][pattern]" value="<?php echo esc_attr( $rule['pattern'] ?? '' ); ?>" /></td>
							<td><input type="text" class="regular-text" style="width:200px;" name="rules[<?php echo (int) $i; ?>][label]" value="<?php echo esc_attr( $rule['label'] ?? '' ); ?>" /></td>
							<td><input type="text" class="regular-text" style="width:170px;" name="rules[<?php echo (int) $i; ?>][zone]" value="<?php echo esc_attr( $rule['zone'] ?? '' ); ?>" /></td>
							<td><input type="number" step="1" min="0" style="width:80px;" name="rules[<?php echo (int) $i; ?>][charge]" value="<?php echo esc_attr( (string) ( $rule['charge'] ?? 0 ) ); ?>" /></td>
							<td><input type="number" step="1" min="0" placeholder="—" style="width:90px;" name="rules[<?php echo (int) $i; ?>][freeShippingAbove]" value="<?php echo null !== ( $rule['freeShippingAbove'] ?? null ) ? esc_attr( (string) $rule['freeShippingAbove'] ) : ''; ?>" /></td>
							<td><input type="text" style="width:140px;" name="rules[<?php echo (int) $i; ?>][estimatedDays]" value="<?php echo esc_attr( $rule['estimatedDays'] ?? '' ); ?>" /></td>
							<td><input type="checkbox" name="rules[<?php echo (int) $i; ?>][codAvailable]" value="1" <?php checked( ! empty( $rule['codAvailable'] ) ); ?> /></td>
							<td>
								<button type="submit" name="delete_id" value="<?php echo esc_attr( $rule['id'] ?? '' ); ?>" onclick="this.form.mbs_pin_action.value='delete_rule';" class="button button-link-delete">
									<?php esc_html_e( 'Delete', 'mehandibysana' ); ?>
								</button>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>

			<p class="submit" style="display:flex;gap:12px;">
				<button type="submit" class="button button-primary"><?php esc_html_e( 'Save All PIN Rules', 'mehandibysana' ); ?></button>
				<button type="submit" onclick="if(!confirm('Restore the default 7 India shipping zones?')) return false; this.form.mbs_pin_action.value='restore_defaults';" class="button">
					<?php esc_html_e( 'Restore Default Studio Rules', 'mehandibysana' ); ?>
				</button>
			</p>
		</form>

		<hr />
		<h2><?php esc_html_e( 'Add New PIN Code Rule', 'mehandibysana' ); ?></h2>
		<form method="post" style="max-width:720px;background:#fff;padding:16px 20px;border:1px solid #ccd0d4;border-radius:6px;">
			<?php wp_nonce_field( 'mbs_pin_rules_admin', 'mbs_pin_nonce' ); ?>
			<input type="hidden" name="mbs_pin_action" value="add_rule" />
			<table class="form-table">
				<tr>
					<th><label for="new_pattern"><?php esc_html_e( 'PIN Prefix / Pattern', 'mehandibysana' ); ?></label></th>
					<td><input id="new_pattern" name="new_pattern" type="text" required placeholder="e.g. 40* or 190001" class="regular-text" /></td>
				</tr>
				<tr>
					<th><label for="new_label"><?php esc_html_e( 'Label', 'mehandibysana' ); ?></label></th>
					<td><input id="new_label" name="new_label" type="text" placeholder="e.g. Mumbai Metro (40*)" class="regular-text" /></td>
				</tr>
				<tr>
					<th><label for="new_zone"><?php esc_html_e( 'Zone Name', 'mehandibysana' ); ?></label></th>
					<td><input id="new_zone" name="new_zone" type="text" placeholder="e.g. Zone B — West Express" class="regular-text" /></td>
				</tr>
				<tr>
					<th><label for="new_charge"><?php esc_html_e( 'Delivery Fee (₹)', 'mehandibysana' ); ?></label></th>
					<td><input id="new_charge" name="new_charge" type="number" min="0" value="120" style="width:120px;" /></td>
				</tr>
				<tr>
					<th><label for="new_free_above"><?php esc_html_e( 'Free Shipping Above (₹, optional)', 'mehandibysana' ); ?></label></th>
					<td><input id="new_free_above" name="new_free_above" type="number" min="0" placeholder="Leave blank for always charged" style="width:180px;" /></td>
				</tr>
				<tr>
					<th><label for="new_eta"><?php esc_html_e( 'Estimated Delivery', 'mehandibysana' ); ?></label></th>
					<td><input id="new_eta" name="new_eta" type="text" value="3–4 business days" class="regular-text" /></td>
				</tr>
				<tr>
					<th><?php esc_html_e( 'Cash on Delivery (COD)', 'mehandibysana' ); ?></th>
					<td><label><input type="checkbox" name="new_cod" value="1" checked /> <?php esc_html_e( 'Allow Cash on Delivery for this PIN zone', 'mehandibysana' ); ?></label></td>
				</tr>
			</table>
			<p><button type="submit" class="button button-primary"><?php esc_html_e( 'Add PIN Rule', 'mehandibysana' ); ?></button></p>
		</form>
	</div>
	<?php
}
