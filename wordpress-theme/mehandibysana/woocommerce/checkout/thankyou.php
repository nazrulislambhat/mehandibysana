<?php
/**
 * WooCommerce Order Confirmed (Thank You) Dossier Card + Instant Parcel Tracker Link
 *
 * @package MehandiBySana
 */

defined( 'ABSPATH' ) || exit;

if ( $order ) :
	do_action( 'woocommerce_before_thankyou', $order->get_id() );

	$track_url = add_query_arg(
		array(
			'order' => $order->get_order_number(),
			'email' => $order->get_billing_email(),
		),
		mbs_get_track_order_url()
	);
	?>

	<?php if ( $order->has_status( 'failed' ) ) : ?>
		<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:var(--radius-xl);padding:2rem;margin-bottom:2rem;">
			<h2 style="font-size:1.85rem;color:var(--color-error);"><?php esc_html_e( 'Payment Could Not Be Completed', 'mehandibysana' ); ?></h2>
			<p style="margin-top:0.5rem;color:var(--color-ink);">
				<?php esc_html_e( 'Your bank declined or interrupted this transaction. You can retry payment or switch to Cash on Delivery.', 'mehandibysana' ); ?>
			</p>
			<p style="margin-top:1rem;">
				<a href="<?php echo esc_url( $order->get_checkout_payment_url() ); ?>" class="mbs-btn mbs-btn-primary">
					<?php esc_html_e( 'Retry Payment →', 'mehandibysana' ); ?>
				</a>
			</p>
		</div>
	<?php else : ?>
		<div class="mbs-dossier-ink" style="margin-bottom:2.25rem;">
			<span class="eyebrow" style="color:var(--color-accent);"><?php esc_html_e( 'Fresh Batch Scheduled · Srinagar', 'mehandibysana' ); ?></span>
			<h2 style="font-size:clamp(2rem,3.6vw,2.75rem);margin-top:0.5rem;">
				<?php
				printf(
					esc_html__( 'Assalamu Alaikum, %s — Order #%s Confirmed', 'mehandibysana' ),
					esc_html( $order->get_billing_first_name() ?: __( 'Guest', 'mehandibysana' ) ),
					esc_html( $order->get_order_number() )
				);
				?>
			</h2>
			<p style="margin-top:0.75rem;color:rgba(252,238,227,0.78);font-size:0.95rem;max-width:42rem;line-height:1.65;">
				<?php esc_html_e( 'A confirmation copy has been sent to your billing email. As soon as your cones are packed and handed to our courier or Srinagar local rider, dispatch details appear live on our Parcel Tracker.', 'mehandibysana' ); ?>
			</p>

			<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:1rem;margin:1.75rem 0;padding:1.25rem;background:rgba(255,255,255,0.06);border:1px solid rgba(252,238,227,0.16);border-radius:var(--radius-lg);">
				<div>
					<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.62;"><?php esc_html_e( 'Order Number', 'mehandibysana' ); ?></div>
					<div style="font-family:var(--font-mono);font-size:1.05rem;font-weight:700;margin-top:4px;">#<?php echo esc_html( $order->get_order_number() ); ?></div>
				</div>
				<div>
					<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.62;"><?php esc_html_e( 'Date', 'mehandibysana' ); ?></div>
					<div style="font-size:0.95rem;margin-top:4px;"><?php echo esc_html( wc_format_datetime( $order->get_date_created() ) ); ?></div>
				</div>
				<div>
					<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.62;"><?php esc_html_e( 'Total', 'mehandibysana' ); ?></div>
					<div style="font-size:1.05rem;font-weight:700;color:var(--color-accent);margin-top:4px;"><?php echo wp_kses_post( $order->get_formatted_order_total() ); ?></div>
				</div>
				<div>
					<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.62;"><?php esc_html_e( 'Payment Method', 'mehandibysana' ); ?></div>
					<div style="font-size:0.95rem;margin-top:4px;"><?php echo esc_html( $order->get_payment_method_title() ); ?></div>
				</div>
			</div>

			<div style="display:flex;flex-wrap:wrap;gap:0.85rem;">
				<a href="<?php echo esc_url( $track_url ); ?>" class="mbs-btn mbs-btn-primary">
					<?php esc_html_e( 'Track This Order Live →', 'mehandibysana' ); ?>
				</a>
				<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-inverse-outline">
					<?php esc_html_e( 'Return to Apothecary', 'mehandibysana' ); ?>
				</a>
			</div>
		</div>
	<?php endif; ?>

	<?php do_action( 'woocommerce_thankyou_' . $order->get_payment_method(), $order->get_id() ); ?>
	<?php do_action( 'woocommerce_thankyou', $order->get_id() ); ?>

<?php else : ?>
	<p class="woocommerce-notice woocommerce-notice--success woocommerce-thankyou-order-received">
		<?php esc_html_e( 'Thank you. Your order has been received.', 'mehandibysana' ); ?>
	</p>
<?php endif; ?>

