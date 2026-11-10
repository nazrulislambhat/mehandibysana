<?php
/**
 * Template Name: Mehandi by Sana — Contact & Bookings Concierge
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$studio_email   = function_exists( 'mbs_get_studio_email' ) ? mbs_get_studio_email() : 'sana@mehandibysana.com';
$studio_phone   = function_exists( 'mbs_get_studio_phone' ) ? mbs_get_studio_phone() : '+91-9149648717';
$studio_address = function_exists( 'mbs_get_studio_address' ) ? mbs_get_studio_address() : 'Baghat Barzullah, Srinagar 190005, J&K';
$wa_digits      = function_exists( 'mbs_get_studio_whatsapp_digits' ) ? mbs_get_studio_whatsapp_digits() : '919149648717';
?>
<header class="mbs-masthead">
	<div class="editorial-container">
		<span class="eyebrow"><?php esc_html_e( 'Direct Artist Desk', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.35rem,4.4vw,3.35rem);margin-top:0.5rem;">
			<?php esc_html_e( 'Bridal Inquiries & Date Reservations', 'mehandibysana' ); ?>
		</h1>
		<p style="margin-top:0.85rem;max-width:40rem;color:var(--color-text-muted);font-size:1.02rem;line-height:1.68;">
			<?php esc_html_e( 'Reach Sana directly for bridal availability, wholesale cone inquiries, workshop registrations, or assistance with an active parcel.', 'mehandibysana' ); ?>
		</p>
	</div>
</header>

<section class="section-pad surface-linen">
	<div class="editorial-container mbs-ledger-grid">
		<!-- Left Column: Ink-Black Artist Concierge Dossier -->
		<aside class="mbs-dossier-ink">
			<span class="eyebrow" style="color:var(--color-accent);"><?php esc_html_e( 'Direct Artist Coordinates', 'mehandibysana' ); ?></span>
			<h2 style="font-size:2rem;margin-top:0.5rem;"><?php esc_html_e( 'Mehandi by Sana', 'mehandibysana' ); ?></h2>

			<dl style="margin:1.75rem 0 0;display:flex;flex-direction:column;gap:1.15rem;">
				<div>
					<dt style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.65;"><?php esc_html_e( 'Home Dispatch Base (No Walk-In Storefront)', 'mehandibysana' ); ?></dt>
					<dd style="margin:4px 0 0;font-size:0.95rem;"><?php echo esc_html( $studio_address ); ?></dd>
				</div>
				<div>
					<dt style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.65;"><?php esc_html_e( 'WhatsApp & Concierge Line', 'mehandibysana' ); ?></dt>
					<dd style="margin:4px 0 0;font-size:0.95rem;">
						<a href="tel:<?php echo esc_attr( preg_replace( '/\s+/', '', $studio_phone ) ); ?>" style="text-decoration:underline;text-underline-offset:4px;">
							<?php echo esc_html( $studio_phone ); ?>
						</a>
					</dd>
				</div>
				<div>
					<dt style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.65;"><?php esc_html_e( 'Electronic Mail', 'mehandibysana' ); ?></dt>
					<dd style="margin:4px 0 0;font-size:0.95rem;">
						<a href="mailto:<?php echo esc_attr( $studio_email ); ?>" style="text-decoration:underline;text-underline-offset:4px;">
							<?php echo esc_html( $studio_email ); ?>
						</a>
					</dd>
				</div>
				<div>
					<dt style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;opacity:0.65;"><?php esc_html_e( 'Dispatch & Response Hours', 'mehandibysana' ); ?></dt>
					<dd style="margin:4px 0 0;font-size:0.95rem;"><?php esc_html_e( 'Monday – Saturday · 10:00 AM to 6:30 PM IST', 'mehandibysana' ); ?></dd>
				</div>
			</dl>

			<div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid rgba(252,238,227,0.16);display:flex;flex-direction:column;gap:0.75rem;">
				<a href="https://wa.me/<?php echo esc_attr( $wa_digits ); ?>" target="_blank" rel="noopener noreferrer" class="mbs-btn mbs-btn-primary">
					<?php esc_html_e( 'Chat on WhatsApp →', 'mehandibysana' ); ?>
				</a>
				<a href="<?php echo esc_url( mbs_get_track_order_url() ); ?>" class="mbs-btn mbs-btn-inverse-outline">
					<?php esc_html_e( 'Track an Online Order', 'mehandibysana' ); ?>
				</a>
			</div>
		</aside>

		<!-- Right Column: Booking Form -->
		<div>
			<?php get_template_part( 'template-parts/booking-form', null, array( 'service' => 'bridal' ) ); ?>
		</div>
	</div>
</section>

<?php get_footer(); ?>

