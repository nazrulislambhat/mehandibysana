<?php
/**
 * Bridal & Studio Booking Inquiries (`mbs_booking` CPT + AJAX Handler + Email Notification)
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register Custom Post Type for Bridal & Custom Studio Bookings
 */
add_action( 'init', function () {
	register_post_type(
		'mbs_booking',
		array(
			'labels' => array(
				'name'               => __( 'Bridal Bookings', 'mehandibysana' ),
				'singular_name'      => __( 'Studio Booking', 'mehandibysana' ),
				'menu_name'          => __( 'Bridal Bookings', 'mehandibysana' ),
				'all_items'          => __( 'All Bookings & Inquiries', 'mehandibysana' ),
				'edit_item'          => __( 'Booking Details', 'mehandibysana' ),
				'view_item'          => __( 'View Booking', 'mehandibysana' ),
				'search_items'       => __( 'Search Bookings', 'mehandibysana' ),
				'not_found'          => __( 'No bookings recorded yet.', 'mehandibysana' ),
			),
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => 'mehandibysana-studio',
			'capability_type'     => 'post',
			'supports'            => array( 'title' ),
			'menu_icon'           => 'dashicons-calendar-alt',
		)
	);
} );

/**
 * Admin List Columns for Bridal Bookings
 */
add_filter( 'manage_mbs_booking_posts_columns', function ( $cols ) {
	return array(
		'cb'           => $cols['cb'],
		'mbs_ref'      => __( 'Reference', 'mehandibysana' ),
		'title'        => __( 'Client', 'mehandibysana' ),
		'mbs_service'  => __( 'Inquiry Type', 'mehandibysana' ),
		'mbs_date'     => __( 'Event Date & Venue', 'mehandibysana' ),
		'mbs_contact'  => __( 'Contact', 'mehandibysana' ),
		'mbs_status'   => __( 'Status', 'mehandibysana' ),
		'date'         => __( 'Received', 'mehandibysana' ),
	);
} );

add_action( 'manage_mbs_booking_posts_custom_column', function ( $column, $post_id ) {
	switch ( $column ) {
		case 'mbs_ref':
			echo '<code>' . esc_html( get_post_meta( $post_id, '_mbs_booking_ref', true ) ?: 'INQ-' . $post_id ) . '</code>';
			break;
		case 'mbs_service':
			$map = array(
				'bridal'        => 'Bridal Mehndi',
				'events'        => 'Events & Celebrations',
				'botanical'     => 'Bulk Orders / Workshop',
				'order-support' => 'Store Order Question',
			);
			$srv = get_post_meta( $post_id, '_mbs_service', true );
			echo esc_html( $map[ $srv ] ?? ucfirst( $srv ) );
			break;
		case 'mbs_date':
			$dt  = get_post_meta( $post_id, '_mbs_event_date', true );
			$loc = get_post_meta( $post_id, '_mbs_location', true );
			echo esc_html( trim( ( $dt ?: '—' ) . ( $loc ? ' · ' . $loc : '' ) ) );
			break;
		case 'mbs_contact':
			$em = get_post_meta( $post_id, '_mbs_email', true );
			$ph = get_post_meta( $post_id, '_mbs_phone', true );
			echo esc_html( $em );
			if ( $ph ) {
				echo '<br /><span class="description">' . esc_html( $ph ) . '</span>';
			}
			break;
		case 'mbs_status':
			$st = get_post_meta( $post_id, '_mbs_status', true ) ?: 'new';
			echo '<strong style="text-transform:uppercase;">' . esc_html( $st ) . '</strong>';
			break;
	}
}, 10, 2 );

/**
 * Metabox on Single Booking Screen
 */
add_action( 'add_meta_boxes', function () {
	add_meta_box(
		'mbs_booking_details',
		__( 'Studio Booking & Client Inquiry Details', 'mehandibysana' ),
		'mbs_render_booking_metabox',
		'mbs_booking',
		'normal',
		'high'
	);
} );

function mbs_render_booking_metabox( $post ) {
	wp_nonce_field( 'mbs_save_booking_meta', 'mbs_booking_meta_nonce' );
	$ref      = get_post_meta( $post->ID, '_mbs_booking_ref', true ) ?: 'INQ-' . $post->ID;
	$email    = get_post_meta( $post->ID, '_mbs_email', true );
	$phone    = get_post_meta( $post->ID, '_mbs_phone', true );
	$service  = get_post_meta( $post->ID, '_mbs_service', true );
	$ev_date  = get_post_meta( $post->ID, '_mbs_event_date', true );
	$location = get_post_meta( $post->ID, '_mbs_location', true );
	$message  = get_post_meta( $post->ID, '_mbs_message', true );
	$status   = get_post_meta( $post->ID, '_mbs_status', true ) ?: 'new';
	?>
	<table class="form-table">
		<tr><th><?php esc_html_e( 'Reference ID', 'mehandibysana' ); ?></th><td><code><?php echo esc_html( $ref ); ?></code></td></tr>
		<tr><th><?php esc_html_e( 'Client Email', 'mehandibysana' ); ?></th><td><a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a></td></tr>
		<tr><th><?php esc_html_e( 'Phone / WhatsApp', 'mehandibysana' ); ?></th><td><?php echo esc_html( $phone ?: '—' ); ?></td></tr>
		<tr><th><?php esc_html_e( 'Inquiry Type', 'mehandibysana' ); ?></th><td><?php echo esc_html( $service ); ?></td></tr>
		<tr><th><?php esc_html_e( 'Preferred Date', 'mehandibysana' ); ?></th><td><?php echo esc_html( $ev_date ?: '—' ); ?></td></tr>
		<tr><th><?php esc_html_e( 'City / Venue', 'mehandibysana' ); ?></th><td><?php echo esc_html( $location ?: '—' ); ?></td></tr>
		<tr><th><?php esc_html_e( 'Client Message', 'mehandibysana' ); ?></th><td><div style="white-space:pre-wrap;background:#f9f9f9;padding:12px;border:1px solid #ddd;"><?php echo esc_html( $message ); ?></div></td></tr>
		<tr>
			<th><label for="mbs_booking_status"><?php esc_html_e( 'Booking Status', 'mehandibysana' ); ?></label></th>
			<td>
				<select id="mbs_booking_status" name="mbs_booking_status">
					<?php
					foreach ( array( 'new' => 'New', 'contacted' => 'Contacted', 'confirmed' => 'Confirmed', 'completed' => 'Completed', 'archived' => 'Archived' ) as $k => $lbl ) {
						printf( '<option value="%s" %s>%s</option>', esc_attr( $k ), selected( $status, $k, false ), esc_html( $lbl ) );
					}
					?>
				</select>
			</td>
		</tr>
	</table>
	<?php
}

add_action( 'save_post_mbs_booking', function ( $post_id ) {
	if ( ! isset( $_POST['mbs_booking_meta_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['mbs_booking_meta_nonce'] ) ), 'mbs_save_booking_meta' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	if ( isset( $_POST['mbs_booking_status'] ) ) {
		update_post_meta( $post_id, '_mbs_status', sanitize_key( wp_unslash( $_POST['mbs_booking_status'] ) ) );
	}
} );

/**
 * AJAX Handler: Submit Bridal Booking / Custom Studio Inquiry
 */
function mbs_ajax_submit_booking() {
	check_ajax_referer( 'mbs_theme_nonce', 'nonce' );

	// Honeypot bot guard (matches companyWebsite in BookingForm.tsx)
	$honeypot = isset( $_POST['companyWebsite'] ) ? trim( sanitize_text_field( wp_unslash( $_POST['companyWebsite'] ) ) ) : '';
	if ( '' !== $honeypot ) {
		wp_send_json_success( array( 'ok' => true, 'referenceId' => 'INQ-STUDIO' ) );
	}

	$name       = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
	$email      = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$phone      = isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '';
	$service    = isset( $_POST['service'] ) ? sanitize_key( wp_unslash( $_POST['service'] ) ) : 'bridal';
	$event_date = isset( $_POST['eventDate'] ) ? sanitize_text_field( wp_unslash( $_POST['eventDate'] ) ) : '';
	$location   = isset( $_POST['location'] ) ? sanitize_text_field( wp_unslash( $_POST['location'] ) ) : '';
	$message    = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';

	if ( '' === $name ) {
		wp_send_json_error( array( 'message' => __( 'Please enter your full name.', 'mehandibysana' ) ), 400 );
	}
	if ( ! is_email( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'Please enter a valid email address.', 'mehandibysana' ) ), 400 );
	}
	if ( strlen( $message ) < 10 ) {
		wp_send_json_error( array( 'message' => __( 'Please share a short note about your inquiry or event details.', 'mehandibysana' ) ), 400 );
	}

	$ref_id  = 'INQ-' . strtoupper( substr( wp_generate_password( 6, false, false ), 0, 6 ) );
	$post_id = wp_insert_post(
		array(
			'post_type'   => 'mbs_booking',
			'post_status' => 'publish',
			'post_title'  => $name . ' (' . $service . ')',
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		wp_send_json_error( array( 'message' => __( 'Unable to save booking request right now. Please WhatsApp +91-9149648717.', 'mehandibysana' ) ), 500 );
	}

	update_post_meta( $post_id, '_mbs_booking_ref', $ref_id );
	update_post_meta( $post_id, '_mbs_email', $email );
	update_post_meta( $post_id, '_mbs_phone', $phone );
	update_post_meta( $post_id, '_mbs_service', $service );
	update_post_meta( $post_id, '_mbs_event_date', $event_date );
	update_post_meta( $post_id, '_mbs_location', $location );
	update_post_meta( $post_id, '_mbs_message', $message );
	update_post_meta( $post_id, '_mbs_status', 'new' );

	// Email notification to studio admin
	$studio_to = get_option( 'mbs_studio_email', get_option( 'admin_email' ) );
	if ( is_email( $studio_to ) ) {
		$subject = sprintf( '[Mehandi by Sana] New Booking Inquiry (%s) — %s', $ref_id, $name );
		$body    = sprintf(
			"Reference: %s\nName: %s\nEmail: %s\nPhone / WhatsApp: %s\nInquiry Type: %s\nPreferred Date: %s\nVenue / City: %s\n\nMessage:\n%s\n\nManage in WP Admin: %s",
			$ref_id,
			$name,
			$email,
			$phone ?: 'Not provided',
			$service,
			$event_date ?: 'Not specified',
			$location ?: 'Not specified',
			$message,
			admin_url( 'post.php?post=' . $post_id . '&action=edit' )
		);
		$headers = array( 'Reply-To: ' . $name . ' <' . $email . '>' );
		wp_mail( $studio_to, $subject, $body, $headers );
	}

	wp_send_json_success(
		array(
			'ok'          => true,
			'referenceId' => $ref_id,
		)
	);
}
add_action( 'wp_ajax_mbs_submit_booking', 'mbs_ajax_submit_booking' );
add_action( 'wp_ajax_nopriv_mbs_submit_booking', 'mbs_ajax_submit_booking' );
