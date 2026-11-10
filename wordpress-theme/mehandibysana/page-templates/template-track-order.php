<?php
/**
 * Template Name: Mehandi by Sana — Parcel Order Tracker
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$prefill_order = isset( $_GET['order'] ) ? sanitize_text_field( wp_unslash( $_GET['order'] ) ) : '';
$prefill_email = isset( $_GET['email'] ) ? sanitize_email( wp_unslash( $_GET['email'] ) ) : '';
$ssr_result    = ( '' !== $prefill_order && '' !== $prefill_email )
	? mbs_lookup_tracked_order( $prefill_order, $prefill_email )
	: null;
?>
<header class="mbs-masthead">
	<div class="editorial-container">
		<span class="eyebrow"><?php esc_html_e( 'Srinagar Dispatch & Live Courier Tracking', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.35rem,4.4vw,3.35rem);margin-top:0.5rem;">
			<?php esc_html_e( 'Track Your Parcel', 'mehandibysana' ); ?>
		</h1>
		<p style="margin-top:0.85rem;max-width:40rem;color:var(--color-text-muted);font-size:1.02rem;line-height:1.68;">
			<?php esc_html_e( 'Enter your order number (for example #1042 or 1042) along with the billing email address used at checkout to check real-time preparation, local courier or AWB tracking, and payment status.', 'mehandibysana' ); ?>
		</p>
	</div>
</header>

<section class="section-pad surface-linen">
	<div class="editorial-container" style="max-width:56rem;">
		<form id="mbs-track-order-form" style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:2rem;">
			<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;">
				<div class="mbs-form-field">
					<label for="mbs_track_order_num" class="mbs-form-label"><?php esc_html_e( 'Order Reference Number *', 'mehandibysana' ); ?></label>
					<input
						id="mbs_track_order_num"
						name="orderNumber"
						type="text"
						required
						value="<?php echo esc_attr( $prefill_order ); ?>"
						placeholder="e.g. #1042"
						class="mbs-input"
					/>
				</div>
				<div class="mbs-form-field">
					<label for="mbs_track_order_email" class="mbs-form-label"><?php esc_html_e( 'Checkout Email Address *', 'mehandibysana' ); ?></label>
					<input
						id="mbs_track_order_email"
						name="email"
						type="email"
						required
						value="<?php echo esc_attr( $prefill_email ); ?>"
						placeholder="you@example.com"
						class="mbs-input"
					/>
				</div>
			</div>

			<div id="mbs-track-order-error" style="<?php echo ( $ssr_result && empty( $ssr_result['found'] ) ) ? 'display:block;' : 'display:none;'; ?>color:var(--color-error);background:#fef2f2;border:1px solid #fecaca;padding:10px 14px;border-radius:var(--radius-md);margin-bottom:1rem;font-size:0.875rem;">
				<?php echo ( $ssr_result && ! empty( $ssr_result['message'] ) ) ? esc_html( $ssr_result['message'] ) : ''; ?>
			</div>

			<button type="submit" class="mbs-btn mbs-btn-ink mbs-btn-lg">
				<?php esc_html_e( 'Locate My Order', 'mehandibysana' ); ?>
			</button>
		</form>

		<div id="mbs-track-order-result" style="<?php echo ( $ssr_result && ! empty( $ssr_result['found'] ) ) ? 'display:block;' : 'display:none;'; ?>">
			<?php
			if ( $ssr_result && ! empty( $ssr_result['found'] ) && ! empty( $ssr_result['order'] ) ) :
				$o     = $ssr_result['order'];
				$rank  = array( 'received' => 0, 'preparing' => 1, 'dispatched' => 2, 'delivered' => 3, 'cancelled' => -1 );
				$cur   = $rank[ $o['fulfillmentStage'] ] ?? 0;
				$steps = array(
					array( '01', 'Order Received', 'Logged in queue' ),
					array( '02', 'Small-Batch Prep', 'Hand-rolled & packed' ),
					array( '03', 'Dispatched', $o['courierName'] ?: 'Courier handed over' ),
					array( '04', 'Delivered', 'Completed at door' ),
				);
				?>
				<div style="border:1px solid var(--color-border);border-radius:var(--radius-xl);overflow:hidden;background:#ffffff;margin-top:2rem;">
					<div style="background:#111111;color:#fceee3;padding:1.75rem 2rem;border-top:3px solid #d9541e;display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem;align-items:center;">
						<div>
							<div class="eyebrow"><?php esc_html_e( 'Parcel Dossier', 'mehandibysana' ); ?> &middot; <?php echo esc_html( $o['createdDisplay'] ); ?></div>
							<h2 style="font-size:2rem;margin-top:6px;"><?php echo esc_html( 'Order ' . $o['orderNumber'] ); ?></h2>
						</div>
						<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
							<span style="padding:5px 12px;border-radius:999px;background:<?php echo 'paid' === $o['paymentStatus'] ? '#d9541e' : '#737373'; ?>;color:#ffffff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
								<?php echo esc_html( 'paid' === $o['paymentStatus'] ? 'Paid' : 'Pending Payment' ); ?>
							</span>
							<span style="padding:5px 12px;border-radius:999px;border:1px solid rgba(252,238,227,0.3);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">
								<?php echo esc_html( $o['paymentMethod'] ); ?>
							</span>
						</div>
					</div>

					<div style="padding:1.75rem 2rem;">
						<div class="mbs-timeline-grid">
							<?php foreach ( $steps as $i => $st ) :
								$cls = 'mbs-timeline-step';
								if ( $i < $cur ) {
									$cls .= ' is-done';
								} elseif ( $i === $cur ) {
									$cls .= ' is-current';
								}
								?>
								<div class="<?php echo esc_attr( $cls ); ?>">
									<div class="eyebrow" style="margin-bottom:4px;"><?php echo esc_html( $st[0] ); ?></div>
									<div style="font-family:var(--font-serif);font-size:1.25rem;font-weight:600;"><?php echo esc_html( $st[1] ); ?></div>
									<div style="font-size:0.78rem;margin-top:4px;opacity:0.8;"><?php echo esc_html( $st[2] ); ?></div>
								</div>
							<?php endforeach; ?>
						</div>

						<?php if ( ! empty( $o['dispatchNote'] ) ) : ?>
							<div style="background:var(--color-surface);border-left:3px solid var(--color-accent);padding:12px 16px;border-radius:6px;margin-bottom:1.5rem;">
								<strong><?php esc_html_e( 'Dispatch Note:', 'mehandibysana' ); ?></strong> <?php echo esc_html( $o['dispatchNote'] ); ?>
							</div>
						<?php endif; ?>

						<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;margin-top:1rem;">
							<div style="background:var(--color-surface);padding:1.25rem;border-radius:var(--radius-lg);border:1px solid var(--color-border);">
								<div class="eyebrow eyebrow-muted"><?php esc_html_e( 'Courier & Tracking', 'mehandibysana' ); ?></div>
								<p style="margin-top:8px;font-weight:600;"><?php echo esc_html( $o['courierName'] ); ?></p>
								<?php if ( ! empty( $o['trackingNumber'] ) ) : ?>
									<p style="margin-top:4px;font-family:var(--font-mono);font-size:0.875rem;">AWB: <?php echo esc_html( $o['trackingNumber'] ); ?></p>
								<?php endif; ?>
								<?php if ( ! empty( $o['trackingUrl'] ) ) : ?>
									<p style="margin-top:10px;">
										<a href="<?php echo esc_url( $o['trackingUrl'] ); ?>" target="_blank" rel="noopener noreferrer" class="mbs-btn mbs-btn-secondary mbs-btn-sm"><?php esc_html_e( 'Track via Courier →', 'mehandibysana' ); ?></a>
									</p>
								<?php endif; ?>
							</div>
							<div style="background:var(--color-surface);padding:1.25rem;border-radius:var(--radius-lg);border:1px solid var(--color-border);">
								<div class="eyebrow eyebrow-muted"><?php esc_html_e( 'Shipping Destination', 'mehandibysana' ); ?></div>
								<p style="margin-top:8px;font-weight:600;"><?php echo esc_html( trim( $o['shippingAddress']['firstName'] . ' ' . $o['shippingAddress']['lastName'] ) ); ?></p>
								<p style="font-size:0.875rem;color:#525252;margin-top:2px;">
									<?php echo esc_html( implode( ', ', array_filter( array( $o['shippingAddress']['city'], $o['shippingAddress']['province'], $o['shippingAddress']['postalCode'] ) ) ) ); ?>
								</p>
								<p style="font-size:0.78rem;color:#525252;margin-top:6px;">Zone: <?php echo esc_html( $o['pincodeRule'] ); ?></p>
							</div>
						</div>

						<div style="margin-top:1.75rem;">
							<div class="eyebrow eyebrow-muted" style="margin-bottom:8px;"><?php esc_html_e( 'Packed Items', 'mehandibysana' ); ?></div>
							<?php foreach ( $o['items'] as $it ) : ?>
								<div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-border);">
									<div>
										<div style="font-weight:600;"><?php echo esc_html( $it['title'] ); ?> &times; <?php echo (int) $it['quantity']; ?></div>
										<?php if ( ! empty( $it['variantTitle'] ) ) : ?>
											<div style="font-size:12px;color:#525252;"><?php echo esc_html( $it['variantTitle'] ); ?></div>
										<?php endif; ?>
									</div>
									<div style="font-weight:600;"><?php echo esc_html( mbs_format_inr( $it['unitPrice'] * $it['quantity'] ) ); ?></div>
								</div>
							<?php endforeach; ?>
							<div style="display:flex;justify-content:space-between;padding-top:12px;font-size:0.9rem;color:#525252;"><span><?php esc_html_e( 'Subtotal', 'mehandibysana' ); ?></span><span><?php echo esc_html( mbs_format_inr( $o['subtotal'] ) ); ?></span></div>
							<div style="display:flex;justify-content:space-between;padding-top:6px;font-size:0.9rem;color:#525252;"><span><?php esc_html_e( 'Dispatch Fee', 'mehandibysana' ); ?></span><span><?php echo esc_html( mbs_format_inr( $o['shippingFee'] ) ); ?></span></div>
							<div style="display:flex;justify-content:space-between;padding-top:10px;margin-top:10px;border-top:1px solid var(--color-ink);font-weight:700;font-size:1.1rem;"><span><?php esc_html_e( 'Total Paid / Payable', 'mehandibysana' ); ?></span><span><?php echo esc_html( mbs_format_inr( $o['total'] ) ); ?></span></div>
						</div>
					</div>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>

<?php get_footer(); ?>

