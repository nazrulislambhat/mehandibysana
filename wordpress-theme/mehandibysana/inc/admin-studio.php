<?php
/**
 * Mehandi by Sana — WordPress Admin Studio Hub, Setup Wizard & HPOS Orders Dispatch Column
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Default Studio Contact Metadata helpers
 */
function mbs_get_studio_email() {
	return get_option( 'mbs_studio_email', 'sana@mehandibysana.com' );
}

function mbs_get_studio_phone() {
	return get_option( 'mbs_studio_phone', '+91-9149648717' );
}

function mbs_get_studio_whatsapp_digits() {
	$raw = preg_replace( '/\D/', '', mbs_get_studio_phone() );
	if ( strlen( $raw ) === 10 ) {
		return '91' . $raw;
	}
	return $raw ?: '919149648717';
}

function mbs_get_studio_address() {
	return get_option( 'mbs_studio_address', 'Baghat Barzullah, Srinagar 190005, J&K' );
}

/**
 * Studio page definitions created on theme activation or manual repair
 */
function mbs_get_studio_page_definitions() {
	return array(
		'services'         => array(
			'title'    => __( 'Bridal & Studio Services', 'mehandibysana' ),
			'template' => 'page-templates/template-services.php',
		),
		'gallery'          => array(
			'title'    => __( 'Bridal Gallery & Stain Archive', 'mehandibysana' ),
			'template' => 'page-templates/template-gallery.php',
		),
		'about'            => array(
			'title'    => __( 'Our Craft & Studio Story', 'mehandibysana' ),
			'template' => 'page-templates/template-about.php',
		),
		'contact'          => array(
			'title'    => __( 'Contact & Bridal Bookings', 'mehandibysana' ),
			'template' => 'page-templates/template-contact.php',
		),
		'track-order'      => array(
			'title'    => __( 'Track Your Order', 'mehandibysana' ),
			'template' => 'page-templates/template-track-order.php',
		),
		'terms-conditions' => array(
			'title'    => __( 'Terms & Conditions', 'mehandibysana' ),
			'template' => 'page-templates/template-terms.php',
		),
		'privacy-policy'   => array(
			'title'    => __( 'Privacy Policy', 'mehandibysana' ),
			'template' => 'page-templates/template-privacy.php',
		),
	);
}

/**
 * Create missing Studio pages & assign templates automatically
 */
function mbs_setup_studio_pages( $assign_existing_templates = false ) {
	$created = 0;
	foreach ( mbs_get_studio_page_definitions() as $slug => $cfg ) {
		$existing = get_page_by_path( $slug );
		if ( $existing instanceof WP_Post ) {
			if ( $assign_existing_templates || ! get_post_meta( $existing->ID, '_wp_page_template', true ) || 'default' === get_post_meta( $existing->ID, '_wp_page_template', true ) ) {
				update_post_meta( $existing->ID, '_wp_page_template', $cfg['template'] );
			}
			if ( 'publish' !== $existing->post_status ) {
				wp_update_post(
					array(
						'ID'          => $existing->ID,
						'post_status' => 'publish',
					)
				);
			}
			continue;
		}

		$page_id = wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $cfg['title'],
				'post_name'    => $slug,
				'post_content' => '',
			),
			true
		);

		if ( ! is_wp_error( $page_id ) && $page_id ) {
			update_post_meta( $page_id, '_wp_page_template', $cfg['template'] );
			++$created;
		}
	}

	return $created;
}

/**
 * Register Top-Level "Mehandi Studio" Admin Menu
 */
add_action( 'admin_menu', function () {
	add_menu_page(
		__( 'Mehandi by Sana Studio', 'mehandibysana' ),
		__( 'Mehandi Studio', 'mehandibysana' ),
		'manage_options',
		'mehandibysana-studio',
		'mbs_render_studio_dashboard_page',
		'dashicons-palmtree',
		55
	);

	add_submenu_page(
		'mehandibysana-studio',
		__( 'Studio Dashboard & Setup', 'mehandibysana' ),
		__( 'Studio Dashboard', 'mehandibysana' ),
		'manage_options',
		'mehandibysana-studio',
		'mbs_render_studio_dashboard_page'
	);

	add_submenu_page(
		'mehandibysana-studio',
		__( 'Wildcard PIN Shipping & COD', 'mehandibysana' ),
		__( 'PIN Shipping Rules', 'mehandibysana' ),
		'manage_options',
		'mbs-pincode-rules',
		'mbs_render_pincode_admin_page'
	);
}, 9 );

/**
 * Render Studio Dashboard & Settings Page
 */
function mbs_render_studio_dashboard_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$notice = '';

	if ( isset( $_POST['mbs_studio_action'] ) && check_admin_referer( 'mbs_studio_dashboard', 'mbs_studio_nonce' ) ) {
		$act = sanitize_text_field( wp_unslash( $_POST['mbs_studio_action'] ) );

		if ( 'repair_pages' === $act ) {
			$count = mbs_setup_studio_pages( true );
			flush_rewrite_rules();
			$notice = sprintf(
				__( 'Studio pages synced and rewrite rules refreshed (%d new pages created).', 'mehandibysana' ),
				$count
			);
		} elseif ( 'save_settings' === $act ) {
			$email  = sanitize_email( wp_unslash( $_POST['mbs_studio_email'] ?? '' ) );
			$phone  = sanitize_text_field( wp_unslash( $_POST['mbs_studio_phone'] ?? '' ) );
			$addr   = sanitize_text_field( wp_unslash( $_POST['mbs_studio_address'] ?? '' ) );
			$offset = max( 1, absint( $_POST['mbs_historical_orders_offset'] ?? 3499 ) );
			$auto_pin = ! empty( $_POST['mbs_auto_pincode_shipping'] ) ? 'yes' : 'no';

			if ( is_email( $email ) ) {
				update_option( 'mbs_studio_email', $email );
			}
			if ( '' !== $phone ) {
				update_option( 'mbs_studio_phone', $phone );
			}
			if ( '' !== $addr ) {
				update_option( 'mbs_studio_address', $addr );
			}
			update_option( 'mbs_historical_orders_offset', $offset );
			update_option( 'mbs_auto_pincode_shipping', $auto_pin );

			$notice = __( 'Studio settings saved.', 'mehandibysana' );
		}
	}

	$wc_active     = class_exists( 'WooCommerce' );
	$product_count = mbs_get_catalog_total_count();
	$pin_rules     = mbs_get_pincode_rules();
	$page_defs     = mbs_get_studio_page_definitions();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Mehandi by Sana Atelier — WordPress Studio Hub', 'mehandibysana' ); ?></h1>
		<p class="description">
			<?php esc_html_e( 'Turnkey Srinagar Atelier dashboard: verify WooCommerce status, repair Studio pages, manage Wildcard PIN Shipping & Offline Order Dispatch.', 'mehandibysana' ); ?>
		</p>

		<?php if ( $notice ) : ?>
			<div class="notice notice-success is-dismissible"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>

		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin:20px 0;">
			<div style="background:#fff;border:1px solid #dcdcde;border-top:3px solid #d9541e;padding:16px;border-radius:6px;">
				<h3 style="margin-top:0;"><?php esc_html_e( 'WooCommerce Store', 'mehandibysana' ); ?></h3>
				<p>
					<strong><?php echo $wc_active ? '✓ Active' : '✕ Not Activated'; ?></strong><br />
					<?php
					if ( $wc_active ) {
						printf( esc_html__( '%d published botanical products ready.', 'mehandibysana' ), (int) $product_count );
					} else {
						esc_html_e( 'Install & activate WooCommerce to enable products, bag & checkout.', 'mehandibysana' );
					}
					?>
				</p>
				<?php if ( $wc_active ) : ?>
					<a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>"><?php esc_html_e( 'Manage Products', 'mehandibysana' ); ?></a>
					<a class="button" href="<?php echo esc_url( admin_url( 'admin.php?page=wc-orders' ) ); ?>"><?php esc_html_e( 'Orders & Dispatch', 'mehandibysana' ); ?></a>
				<?php endif; ?>
			</div>

			<div style="background:#fff;border:1px solid #dcdcde;border-top:3px solid #111111;padding:16px;border-radius:6px;">
				<h3 style="margin-top:0;"><?php esc_html_e( 'Wildcard PIN Rules', 'mehandibysana' ); ?></h3>
				<p>
					<?php printf( esc_html__( '%d active Indian PIN shipping rules (19* ₹60 Kashmir, 11* ₹120 Delhi, * ₹150 Pan-India).', 'mehandibysana' ), count( $pin_rules ) ); ?>
				</p>
				<a class="button button-primary" href="<?php echo esc_url( admin_url( 'admin.php?page=mbs-pincode-rules' ) ); ?>"><?php esc_html_e( 'Edit PIN Shipping Rules', 'mehandibysana' ); ?></a>
			</div>

			<div style="background:#fff;border:1px solid #dcdcde;border-top:3px solid #111111;padding:16px;border-radius:6px;">
				<h3 style="margin-top:0;"><?php esc_html_e( 'Bridal & Bulk Bookings', 'mehandibysana' ); ?></h3>
				<p><?php esc_html_e( 'Inquiries submitted from /services & /contact appear here with status tracking.', 'mehandibysana' ); ?></p>
				<a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=mbs_booking' ) ); ?>"><?php esc_html_e( 'View Inquiries', 'mehandibysana' ); ?></a>
			</div>
		</div>

		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;margin-top:20px;">
			<div style="background:#fff;border:1px solid #dcdcde;padding:20px;border-radius:6px;">
				<h2 style="margin-top:0;"><?php esc_html_e( 'Studio Pages & Templates', 'mehandibysana' ); ?></h2>
				<table class="widefat striped" style="margin-bottom:16px;">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Slug', 'mehandibysana' ); ?></th>
							<th><?php esc_html_e( 'Status', 'mehandibysana' ); ?></th>
							<th><?php esc_html_e( 'Action', 'mehandibysana' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $page_defs as $slug => $cfg ) :
							$p = get_page_by_path( $slug );
							?>
							<tr>
								<td><code>/<?php echo esc_html( $slug ); ?>/</code></td>
								<td>
									<?php
									if ( $p instanceof WP_Post && 'publish' === $p->post_status ) {
										echo '<span style="color:#166534;font-weight:600;">Published</span>';
									} else {
										echo '<span style="color:#b91c1c;">Missing / Draft</span>';
									}
									?>
								</td>
								<td>
									<?php if ( $p instanceof WP_Post ) : ?>
										<a href="<?php echo esc_url( get_permalink( $p->ID ) ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'View', 'mehandibysana' ); ?></a>
									<?php else : ?>
										<span>—</span>
									<?php endif; ?>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
				<form method="post">
					<?php wp_nonce_field( 'mbs_studio_dashboard', 'mbs_studio_nonce' ); ?>
					<input type="hidden" name="mbs_studio_action" value="repair_pages" />
					<button type="submit" class="button button-secondary"><?php esc_html_e( 'Create / Repair All Studio Pages', 'mehandibysana' ); ?></button>
				</form>
			</div>

			<div style="background:#fff;border:1px solid #dcdcde;padding:20px;border-radius:6px;">
				<h2 style="margin-top:0;"><?php esc_html_e( 'Atelier Settings & Operations', 'mehandibysana' ); ?></h2>
				<form method="post">
					<?php wp_nonce_field( 'mbs_studio_dashboard', 'mbs_studio_nonce' ); ?>
					<input type="hidden" name="mbs_studio_action" value="save_settings" />
					<table class="form-table">
						<tr>
							<th><label for="mbs_studio_email"><?php esc_html_e( 'Studio Contact Email', 'mehandibysana' ); ?></label></th>
							<td><input id="mbs_studio_email" name="mbs_studio_email" type="email" value="<?php echo esc_attr( mbs_get_studio_email() ); ?>" class="regular-text" /></td>
						</tr>
						<tr>
							<th><label for="mbs_studio_phone"><?php esc_html_e( 'WhatsApp / Phone', 'mehandibysana' ); ?></label></th>
							<td><input id="mbs_studio_phone" name="mbs_studio_phone" type="text" value="<?php echo esc_attr( mbs_get_studio_phone() ); ?>" class="regular-text" /></td>
						</tr>
						<tr>
							<th><label for="mbs_studio_address"><?php esc_html_e( 'Atelier Address', 'mehandibysana' ); ?></label></th>
							<td><input id="mbs_studio_address" name="mbs_studio_address" type="text" value="<?php echo esc_attr( mbs_get_studio_address() ); ?>" class="regular-text" /></td>
						</tr>
						<tr>
							<th><label for="mbs_historical_orders_offset"><?php esc_html_e( 'Historical Orders Counter Floor', 'mehandibysana' ); ?></label></th>
							<td>
								<input id="mbs_historical_orders_offset" name="mbs_historical_orders_offset" type="number" min="1" value="<?php echo esc_attr( (string) get_option( 'mbs_historical_orders_offset', 3499 ) ); ?>" style="width:120px;" />
								<p class="description"><?php esc_html_e( 'Hero metric adds live WooCommerce completed orders onto this studio historical baseline.', 'mehandibysana' ); ?></p>
							</td>
						</tr>
						<tr>
							<th><?php esc_html_e( 'Auto PIN Shipping Fallback', 'mehandibysana' ); ?></th>
							<td>
								<label>
									<input type="checkbox" name="mbs_auto_pincode_shipping" value="1" <?php checked( 'yes' === get_option( 'mbs_auto_pincode_shipping', 'yes' ) ); ?> />
									<?php esc_html_e( 'Automatically apply Mehandi Studio Wildcard PIN rates at checkout even without manual WooCommerce Shipping Zones.', 'mehandibysana' ); ?>
								</label>
							</td>
						</tr>
					</table>
					<p><button type="submit" class="button button-primary"><?php esc_html_e( 'Save Studio Settings', 'mehandibysana' ); ?></button></p>
				</form>
			</div>
		</div>
	</div>
	<?php
}

/**
 * Add Studio Dispatch & Offline Payment column to WooCommerce Orders List (Classic + HPOS)
 */
function mbs_add_orders_list_dispatch_column( $columns ) {
	$new_cols = array();
	foreach ( $columns as $key => $label ) {
		$new_cols[ $key ] = $label;
		if ( 'order_status' === $key ) {
			$new_cols['mbs_dispatch'] = __( 'Studio Dispatch', 'mehandibysana' );
		}
	}
	if ( ! isset( $new_cols['mbs_dispatch'] ) ) {
		$new_cols['mbs_dispatch'] = __( 'Studio Dispatch', 'mehandibysana' );
	}
	return $new_cols;
}
add_filter( 'manage_edit-shop_order_columns', 'mbs_add_orders_list_dispatch_column', 20 );
add_filter( 'manage_woocommerce_page_wc-orders_columns', 'mbs_add_orders_list_dispatch_column', 20 );

function mbs_render_orders_list_dispatch_column( $column, $post_or_order ) {
	if ( 'mbs_dispatch' !== $column || ! function_exists( 'wc_get_order' ) ) {
		return;
	}
	$order = ( $post_or_order instanceof WC_Order ) ? $post_or_order : wc_get_order( $post_or_order );
	if ( ! $order instanceof WC_Order ) {
		return;
	}
	$stage   = function_exists( 'mbs_infer_stage_from_wc_status' ) ? mbs_infer_stage_from_wc_status( $order ) : 'received';
	$courier = $order->get_meta( '_mbs_courier_name' );
	$awb     = $order->get_meta( '_mbs_tracking_number' );
	$is_paid = $order->is_paid() || 'paid' === strtolower( (string) $order->get_meta( '_mbs_payment_status' ) );

	printf( '<strong style="text-transform:uppercase;font-size:11px;">%s</strong>', esc_html( $stage ) );
	echo ' &middot; ';
	if ( $is_paid ) {
		echo '<span style="color:#166534;font-weight:600;font-size:11px;">PAID</span>';
	} else {
		echo '<span style="color:#b45309;font-weight:600;font-size:11px;">UNPAID</span>';
	}
	if ( $courier ) {
		echo '<br /><span class="description" style="font-size:11px;">' . esc_html( $courier );
		if ( $awb ) {
			echo ' (' . esc_html( $awb ) . ')';
		}
		echo '</span>';
	}
}
add_action( 'manage_shop_order_posts_custom_column', 'mbs_render_orders_list_dispatch_column', 20, 2 );
add_action( 'manage_woocommerce_page_wc-orders_custom_column', 'mbs_render_orders_list_dispatch_column', 20, 2 );
