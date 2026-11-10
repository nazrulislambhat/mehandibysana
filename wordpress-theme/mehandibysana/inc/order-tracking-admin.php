<?php
/**
 * WooCommerce HPOS-Compatible Studio Dispatch Metabox, Offline Payment Completion,
 * Courier Tracking Management, Customer Email Dispatch Notice & /track-order API
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Available courier presets (local rider + national carriers)
 */
function mbs_get_courier_presets() {
	return array(
		'Srinagar Local Rider / Hand Delivery',
		'Delhivery Surface',
		'Delhivery Express Air',
		'DTDC Air Express',
		'India Post Speed Post',
		'Blue Dart',
		'Tirupati Courier',
		'Trackon Courier',
		'Self Pickup (Baghat Barzullah Studio)',
	);
}

/**
 * Add HPOS + Classic CPT Metabox on WooCommerce Edit Order screen
 */
add_action( 'add_meta_boxes', function () {
	$screens = array( 'shop_order' );
	if ( function_exists( 'wc_get_page_screen_id' ) ) {
		$hpos_screen = wc_get_page_screen_id( 'shop-order' );
		if ( $hpos_screen && ! in_array( $hpos_screen, $screens, true ) ) {
			$screens[] = $hpos_screen;
		}
	}

	add_meta_box(
		'mbs_studio_order_dispatch',
		__( 'Mehandi by Sana — Studio Dispatch, Courier & Offline Payment', 'mehandibysana' ),
		'mbs_render_order_dispatch_metabox',
		$screens,
		'side',
		'high'
	);
} );

function mbs_render_order_dispatch_metabox( $post_or_order_object ) {
	if ( ! function_exists( 'wc_get_order' ) ) {
		return;
	}
	$order = ( $post_or_order_object instanceof WP_Post )
		? wc_get_order( $post_or_order_object->ID )
		: $post_or_order_object;

	if ( ! $order instanceof WC_Order ) {
		return;
	}

	wp_nonce_field( 'mbs_order_dispatch_save', 'mbs_order_dispatch_nonce' );

	$stage       = $order->get_meta( '_mbs_fulfillment_stage' ) ?: mbs_infer_stage_from_wc_status( $order );
	$courier     = $order->get_meta( '_mbs_courier_name' ) ?: 'India Post / Delhivery Courier';
	$awb         = $order->get_meta( '_mbs_tracking_number' );
	$track_url   = $order->get_meta( '_mbs_tracking_url' );
	$note        = $order->get_meta( '_mbs_dispatch_note' );
	$is_paid     = $order->is_paid() || 'paid' === strtolower( (string) $order->get_meta( '_mbs_payment_status' ) );
	$presets     = mbs_get_courier_presets();
	?>
	<div style="display:flex;flex-direction:column;gap:10px;">
		<p>
			<label for="mbs_fulfillment_stage" style="display:block;font-weight:600;margin-bottom:4px;"><?php esc_html_e( 'Fulfillment Stage', 'mehandibysana' ); ?></label>
			<select id="mbs_fulfillment_stage" name="mbs_fulfillment_stage" style="width:100%;">
				<option value="received" <?php selected( $stage, 'received' ); ?>>01 · <?php esc_html_e( 'Order Received (Queue)', 'mehandibysana' ); ?></option>
				<option value="preparing" <?php selected( $stage, 'preparing' ); ?>>02 · <?php esc_html_e( 'Small-Batch Prep', 'mehandibysana' ); ?></option>
				<option value="dispatched" <?php selected( $stage, 'dispatched' ); ?>>03 · <?php esc_html_e( 'Dispatched via Courier', 'mehandibysana' ); ?></option>
				<option value="delivered" <?php selected( $stage, 'delivered' ); ?>>04 · <?php esc_html_e( 'Delivered & Completed', 'mehandibysana' ); ?></option>
				<option value="cancelled" <?php selected( $stage, 'cancelled' ); ?>><?php esc_html_e( 'Cancelled', 'mehandibysana' ); ?></option>
			</select>
		</p>

		<p>
			<label for="mbs_courier_preset" style="display:block;font-weight:600;margin-bottom:4px;"><?php esc_html_e( 'Courier Preset', 'mehandibysana' ); ?></label>
			<select id="mbs_courier_preset" style="width:100%;" onchange="if(this.value){document.getElementById('mbs_courier_name').value=this.value;}">
				<option value=""><?php esc_html_e( '— Select Local or National Courier —', 'mehandibysana' ); ?></option>
				<?php foreach ( $presets as $p ) : ?>
					<option value="<?php echo esc_attr( $p ); ?>" <?php selected( $courier, $p ); ?>><?php echo esc_html( $p ); ?></option>
				<?php endforeach; ?>
			</select>
		</p>

		<p>
			<label for="mbs_courier_name" style="display:block;font-weight:600;margin-bottom:4px;"><?php esc_html_e( 'Courier / Rider Name', 'mehandibysana' ); ?></label>
			<input id="mbs_courier_name" name="mbs_courier_name" type="text" value="<?php echo esc_attr( $courier ); ?>" placeholder="<?php esc_attr_e( 'e.g. Local Courier / Delhivery', 'mehandibysana' ); ?>" style="width:100%;" />
		</p>

		<p>
			<label for="mbs_tracking_number" style="display:block;font-weight:600;margin-bottom:4px;"><?php esc_html_e( 'Tracking / AWB / Consignment ID', 'mehandibysana' ); ?></label>
			<input id="mbs_tracking_number" name="mbs_tracking_number" type="text" value="<?php echo esc_attr( $awb ); ?>" placeholder="<?php esc_attr_e( 'Optional for local courier', 'mehandibysana' ); ?>" style="width:100%;font-family:monospace;" />
		</p>

		<p>
			<label for="mbs_tracking_url" style="display:block;font-weight:600;margin-bottom:4px;"><?php esc_html_e( 'Live Courier Tracking Link (URL)', 'mehandibysana' ); ?></label>
			<input id="mbs_tracking_url" name="mbs_tracking_url" type="url" value="<?php echo esc_attr( $track_url ); ?>" placeholder="https://..." style="width:100%;" />
		</p>

		<p>
			<label for="mbs_dispatch_note" style="display:block;font-weight:600;margin-bottom:4px;"><?php esc_html_e( 'Studio Dispatch Note (Shown to Customer)', 'mehandibysana' ); ?></label>
			<textarea id="mbs_dispatch_note" name="mbs_dispatch_note" rows="3" style="width:100%;" placeholder="<?php esc_attr_e( 'e.g. Freshly rolled and dispatched via local courier rider today.', 'mehandibysana' ); ?>"><?php echo esc_textarea( $note ); ?></textarea>
		</p>

		<hr style="margin:4px 0;" />

		<p style="margin:0;">
			<label style="display:flex;align-items:flex-start;gap:6px;">
				<input type="checkbox" name="mbs_mark_offline_paid" value="1" <?php checked( $is_paid ); ?> />
				<span>
					<strong><?php esc_html_e( 'Payment Received Offline / Cash Collected', 'mehandibysana' ); ?></strong><br />
					<span class="description"><?php esc_html_e( 'Marks order paid and displays PAID on parcel tracker.', 'mehandibysana' ); ?></span>
				</span>
			</label>
		</p>

		<p style="margin:0;">
			<label style="display:flex;align-items:flex-start;gap:6px;">
				<input type="checkbox" name="mbs_complete_wc_order" value="1" <?php checked( 'completed' === $order->get_status() ); ?> />
				<span>
					<strong><?php esc_html_e( 'Mark WooCommerce Order Completed', 'mehandibysana' ); ?></strong>
				</span>
			</label>
		</p>

		<p style="margin:0;">
			<label style="display:flex;align-items:flex-start;gap:6px;">
				<input type="checkbox" name="mbs_send_dispatch_email" value="1" />
				<span>
					<strong><?php esc_html_e( 'Send Shipping / Dispatch Email to Customer', 'mehandibysana' ); ?></strong>
				</span>
			</label>
		</p>

		<p class="description" style="margin-top:4px;">
			<?php
			$track_link = add_query_arg(
				array(
					'order' => $order->get_order_number(),
					'email' => $order->get_billing_email(),
				),
				mbs_get_track_order_url()
			);
			printf(
				'<a href="%s" target="_blank" rel="noopener noreferrer">%s &rarr;</a>',
				esc_url( $track_link ),
				esc_html__( 'Preview Customer Tracking Link', 'mehandibysana' )
			);
			?>
		</p>
	</div>
	<?php
}

/**
 * Save Dispatch Metabox cleanly (supports both Classic CPT `save_post_shop_order` & HPOS `woocommerce_process_shop_order_meta`)
 */
function mbs_save_order_dispatch_meta( $order_id, $order = null ) {
	if ( ! isset( $_POST['mbs_order_dispatch_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['mbs_order_dispatch_nonce'] ) ), 'mbs_order_dispatch_save' ) ) {
		return;
	}
	if ( ! current_user_can( 'edit_shop_orders' ) ) {
		return;
	}
	if ( ! $order instanceof WC_Order ) {
		$order = wc_get_order( $order_id );
	}
	if ( ! $order instanceof WC_Order ) {
		return;
	}

	// Prevent recursive save loops
	static $saving = false;
	if ( $saving ) {
		return;
	}
	$saving = true;

	$stage     = isset( $_POST['mbs_fulfillment_stage'] ) ? sanitize_key( wp_unslash( $_POST['mbs_fulfillment_stage'] ) ) : 'received';
	$courier   = isset( $_POST['mbs_courier_name'] ) ? sanitize_text_field( wp_unslash( $_POST['mbs_courier_name'] ) ) : '';
	$awb       = isset( $_POST['mbs_tracking_number'] ) ? sanitize_text_field( wp_unslash( $_POST['mbs_tracking_number'] ) ) : '';
	$track_url = isset( $_POST['mbs_tracking_url'] ) ? esc_url_raw( wp_unslash( $_POST['mbs_tracking_url'] ) ) : '';
	$note      = isset( $_POST['mbs_dispatch_note'] ) ? sanitize_textarea_field( wp_unslash( $_POST['mbs_dispatch_note'] ) ) : '';

	$order->update_meta_data( '_mbs_fulfillment_stage', $stage );
	if ( '' !== $courier ) {
		$order->update_meta_data( '_mbs_courier_name', $courier );
	}
	$order->update_meta_data( '_mbs_tracking_number', $awb );
	$order->update_meta_data( '_mbs_tracking_url', $track_url );
	$order->update_meta_data( '_mbs_dispatch_note', $note );

	// Offline payment received toggle
	if ( ! empty( $_POST['mbs_mark_offline_paid'] ) ) {
		$was_paid = $order->is_paid() || 'paid' === strtolower( (string) $order->get_meta( '_mbs_payment_status' ) );
		$order->update_meta_data( '_mbs_payment_status', 'paid' );
		if ( ! $was_paid ) {
			if ( ! $order->get_date_paid() ) {
				$order->set_date_paid( time() );
			}
			$order->add_order_note( __( 'Offline payment marked received by Studio Admin.', 'mehandibysana' ) );
		}
	} elseif ( ! $order->is_paid() ) {
		$order->update_meta_data( '_mbs_payment_status', 'pending' );
	}

	// Automatically complete WC order if requested or stage is delivered
	if ( ! empty( $_POST['mbs_complete_wc_order'] ) || 'delivered' === $stage ) {
		if ( 'completed' !== $order->get_status() ) {
			$order->set_status( 'completed', __( 'Completed via Mehandi Studio Dispatch.', 'mehandibysana' ) );
		}
	} elseif ( 'cancelled' === $stage && 'cancelled' !== $order->get_status() ) {
		$order->set_status( 'cancelled', __( 'Cancelled via Mehandi Studio Dispatch.', 'mehandibysana' ) );
	}

	$order->save();

	// Email notification with dispatch / courier details if checked
	if ( ! empty( $_POST['mbs_send_dispatch_email'] ) ) {
		mbs_send_customer_dispatch_email( $order );
	}

	$saving = false;
}
add_action( 'woocommerce_process_shop_order_meta', 'mbs_save_order_dispatch_meta', 45, 2 );

/**
 * Send styled Dispatch / Shipping Update email to customer
 */
function mbs_send_customer_dispatch_email( $order ) {
	if ( ! $order instanceof WC_Order ) {
		return false;
	}
	$to = $order->get_billing_email();
	if ( ! is_email( $to ) ) {
		return false;
	}

	$stage     = $order->get_meta( '_mbs_fulfillment_stage' ) ?: 'dispatched';
	$courier   = $order->get_meta( '_mbs_courier_name' ) ?: 'Studio Courier';
	$awb       = $order->get_meta( '_mbs_tracking_number' );
	$track_url = $order->get_meta( '_mbs_tracking_url' );
	$note      = $order->get_meta( '_mbs_dispatch_note' );
	$order_num = $order->get_order_number();
	$tracker   = add_query_arg(
		array(
			'order' => $order_num,
			'email' => $to,
		),
		mbs_get_track_order_url()
	);

	$stage_labels = array(
		'received'   => __( 'Order Received in Queue', 'mehandibysana' ),
		'preparing'  => __( 'Fresh Small-Batch Preparation Started', 'mehandibysana' ),
		'dispatched' => __( 'Order Dispatched via Courier', 'mehandibysana' ),
		'delivered'  => __( 'Order Delivered', 'mehandibysana' ),
		'cancelled'  => __( 'Order Cancelled', 'mehandibysana' ),
	);
	$stage_label = $stage_labels[ $stage ] ?? ucfirst( $stage );

	$subject = sprintf( '[Mehandi by Sana] Order #%s — %s', $order_num, $stage_label );
	ob_start();
	?>
	<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;color:#111111;">
		<div style="background:#111111;color:#fceee3;padding:24px 28px;border-top:4px solid #d9541e;">
			<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#d9541e;font-weight:bold;">Mehandi by Sana &middot; Srinagar Atelier</p>
			<h1 style="margin:0;font-size:24px;font-family:Georgia,serif;font-weight:normal;">Order #<?php echo esc_html( $order_num ); ?> Update</h1>
		</div>
		<div style="padding:24px 28px;background:#ffffff;line-height:1.6;">
			<p>Assalamu Alaikum <?php echo esc_html( $order->get_billing_first_name() ?: 'Guest' ); ?>,</p>
			<p><strong><?php echo esc_html( $stage_label ); ?></strong></p>
			<table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f7f7f7;border-radius:8px;">
				<tr><td style="padding:10px 14px;color:#525252;">Courier / Carrier</td><td style="padding:10px 14px;font-weight:bold;"><?php echo esc_html( $courier ); ?></td></tr>
				<?php if ( $awb ) : ?>
					<tr><td style="padding:10px 14px;color:#525252;">Tracking / AWB</td><td style="padding:10px 14px;font-family:monospace;font-weight:bold;"><?php echo esc_html( $awb ); ?></td></tr>
				<?php endif; ?>
				<?php if ( $note ) : ?>
					<tr><td style="padding:10px 14px;color:#525252;">Dispatch Note</td><td style="padding:10px 14px;"><?php echo esc_html( $note ); ?></td></tr>
				<?php endif; ?>
			</table>
			<p style="margin:22px 0;">
				<a href="<?php echo esc_url( $tracker ); ?>" style="display:inline-block;background:#d9541e;color:#fceee3;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold;">Track Order Online &rarr;</a>
				<?php if ( $track_url ) : ?>
					&nbsp;<a href="<?php echo esc_url( $track_url ); ?>" style="display:inline-block;border:1px solid #111111;color:#111111;text-decoration:none;padding:11px 20px;border-radius:999px;">Courier Link &rarr;</a>
				<?php endif; ?>
			</p>
			<p style="font-size:12px;color:#525252;">Baghat Barzullah, Srinagar &middot; sana@mehandibysana.com &middot; +91-9149648717</p>
		</div>
	</div>
	<?php
	$html    = ob_get_clean();
	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	$sent    = wp_mail( $to, $subject, $html, $headers );
	if ( $sent ) {
		$order->add_order_note( sprintf( __( 'Dispatch update emailed to %s.', 'mehandibysana' ), $to ) );
	}
	return $sent;
}

/**
 * Infer 4-stage fulfillment stage from WooCommerce order status when custom stage not explicitly overridden
 */
function mbs_infer_stage_from_wc_status( $order ) {
	$stage = $order->get_meta( '_mbs_fulfillment_stage' );
	if ( in_array( $stage, array( 'received', 'preparing', 'dispatched', 'delivered', 'cancelled' ), true ) ) {
		return $stage;
	}
	$status = $order->get_status();
	if ( 'completed' === $status ) {
		return 'delivered';
	}
	if ( 'cancelled' === $status || 'refunded' === $status || 'failed' === $status ) {
		return 'cancelled';
	}
	if ( $order->get_meta( '_mbs_tracking_number' ) ) {
		return 'dispatched';
	}
	if ( 'processing' === $status ) {
		return 'preparing';
	}
	return 'received';
}

/**
 * Build TrackedOrder JSON structure matching OrderTrackerClient.tsx
 */
function mbs_lookup_tracked_order( $raw_ref, $raw_email ) {
	if ( ! function_exists( 'wc_get_order' ) ) {
		return array(
			'found'   => false,
			'message' => __( 'WooCommerce is not active on this site yet.', 'mehandibysana' ),
		);
	}

	$clean_ref   = ltrim( trim( (string) $raw_ref ), '#' );
	$clean_email = strtolower( trim( (string) $raw_email ) );

	if ( '' === $clean_ref || '' === $clean_email ) {
		return array(
			'found'   => false,
			'message' => __( 'Enter both your Order Reference and Email Address.', 'mehandibysana' ),
		);
	}

	// Accept `#1234`, `1234`, `MBS-1234`, `WC-1234`
	$numeric_id = preg_replace( '/^(?:MBS|WC)[-_]?/i', '', $clean_ref );
	$order      = ctype_digit( $numeric_id ) ? wc_get_order( (int) $numeric_id ) : false;

	if ( ! $order instanceof WC_Order ) {
		// Search by order number / custom meta
		$matches = wc_get_orders(
			array(
				'limit'         => 1,
				'billing_email' => $clean_email,
				'meta_query'    => array(
					'relation' => 'OR',
					array(
						'key'   => '_order_number',
						'value' => $clean_ref,
					),
					array(
						'key'   => '_mbs_order_reference',
						'value' => $clean_ref,
					),
				),
			)
		);
		$order = ! empty( $matches[0] ) ? $matches[0] : null;
	}

	if ( ! $order instanceof WC_Order ) {
		return array(
			'found'   => false,
			'message' => __( 'No matching order found. Check your Order Reference and Email Address.', 'mehandibysana' ),
		);
	}

	// Verify email owns this order
	if ( strtolower( (string) $order->get_billing_email() ) !== $clean_email ) {
		return array(
			'found'   => false,
			'message' => __( 'Order reference and email address do not match our records.', 'mehandibysana' ),
		);
	}

	$stage     = mbs_infer_stage_from_wc_status( $order );
	$is_paid   = $order->is_paid() || 'paid' === strtolower( (string) $order->get_meta( '_mbs_payment_status' ) );
	$pay_title = $order->get_payment_method_title() ?: __( 'Studio Checkout', 'mehandibysana' );

	$items = array();
	foreach ( $order->get_items() as $item_id => $item ) {
		if ( ! $item instanceof WC_Order_Item_Product ) {
			continue;
		}
		$qty  = max( 1, (int) $item->get_quantity() );
		$sub  = (float) $item->get_subtotal();
		$unit = round( $sub / $qty, 2 );

		$variant_bits = array();
		foreach ( $item->get_formatted_meta_data( '_', true ) as $meta ) {
			$variant_bits[] = wp_strip_all_tags( $meta->display_key . ': ' . $meta->display_value );
		}

		$items[] = array(
			'id'           => (string) $item_id,
			'title'        => $item->get_name(),
			'variantTitle' => implode( ' · ', $variant_bits ),
			'quantity'     => $qty,
			'unitPrice'    => $unit,
		);
	}

	return array(
		'found' => true,
		'order' => array(
			'id'               => (string) $order->get_id(),
			'orderNumber'      => '#' . $order->get_order_number(),
			'createdAt'        => $order->get_date_created() ? $order->get_date_created()->date( 'c' ) : gmdate( 'c' ),
			'createdDisplay'   => $order->get_date_created() ? $order->get_date_created()->date_i18n( 'j F Y' ) : '',
			'status'           => $order->get_status(),
			'fulfillmentStage' => $stage,
			'paymentMethod'    => $pay_title,
			'paymentStatus'    => $is_paid ? 'paid' : 'pending',
			'paymentId'        => (string) $order->get_transaction_id(),
			'trackingNumber'   => (string) $order->get_meta( '_mbs_tracking_number' ),
			'trackingUrl'      => (string) $order->get_meta( '_mbs_tracking_url' ),
			'courierName'      => (string) ( $order->get_meta( '_mbs_courier_name' ) ?: __( 'India Post / Studio Courier', 'mehandibysana' ) ),
			'dispatchNote'     => (string) $order->get_meta( '_mbs_dispatch_note' ),
			'pincodeRule'      => (string) ( $order->get_meta( '_mbs_pincode_rule' ) ?: ( $order->get_shipping_method() ?: __( 'Standard Dispatch', 'mehandibysana' ) ) ),
			'subtotal'         => (float) $order->get_subtotal(),
			'shippingFee'      => (float) $order->get_shipping_total(),
			'total'            => (float) $order->get_total(),
			'shippingAddress'  => array(
				'firstName'  => $order->get_shipping_first_name() ?: $order->get_billing_first_name(),
				'lastName'   => $order->get_shipping_last_name() ?: $order->get_billing_last_name(),
				'city'       => $order->get_shipping_city() ?: $order->get_billing_city(),
				'province'   => $order->get_shipping_state() ?: $order->get_billing_state(),
				'postalCode' => $order->get_shipping_postcode() ?: $order->get_billing_postcode(),
			),
			'items'            => $items,
		),
	);
}

/**
 * AJAX endpoint: Track Order
 */
function mbs_ajax_track_order() {
	check_ajax_referer( 'mbs_theme_nonce', 'nonce' );
	$ref   = isset( $_REQUEST['orderNumber'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['orderNumber'] ) ) : '';
	$email = isset( $_REQUEST['email'] ) ? sanitize_email( wp_unslash( $_REQUEST['email'] ) ) : '';
	$res   = mbs_lookup_tracked_order( $ref, $email );
	if ( empty( $res['found'] ) ) {
		wp_send_json_error( $res, 404 );
	}
	wp_send_json_success( $res );
}
add_action( 'wp_ajax_mbs_track_order', 'mbs_ajax_track_order' );
add_action( 'wp_ajax_nopriv_mbs_track_order', 'mbs_ajax_track_order' );

