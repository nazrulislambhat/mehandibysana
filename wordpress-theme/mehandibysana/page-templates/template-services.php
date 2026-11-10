<?php
/**
 * Template Name: Mehandi Studio — Services & Commissions
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<header class="mbs-masthead">
	<div class="editorial-container">
		<span class="eyebrow"><?php esc_html_e( 'Bespoke Srinagar & Destination Artistry', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.35rem,4.4vw,3.35rem);margin-top:0.5rem;">
			<?php esc_html_e( 'Bridal & Ceremonial Mehndi Commissions', 'mehandibysana' ); ?>
		</h1>
		<p style="margin-top:0.85rem;max-width:40rem;color:var(--color-text-muted);font-size:1.02rem;line-height:1.68;">
			<?php esc_html_e( 'Every appointment uses fresh, hand-rolled 0.38mm organic cones blended 24 hours prior in our Baghat Barzullah studio—guaranteeing serene aroma and deep 48-hour mahogany stains.', 'mehandibysana' ); ?>
		</p>
	</div>
</header>

<section class="section-pad surface-bg">
	<div class="editorial-container">
		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
			<?php
			$tiers = array(
				array(
					'num'   => '01',
					'motif' => 'bridal',
					'title' => __( 'Royal Kashmiri Bridal', 'mehandibysana' ),
					'tag'   => __( 'Full Elbows & Feet', 'mehandibysana' ),
					'desc'  => __( 'Applied personally by Sumaiya Rashid Magray. Custom Chinar motifs, Mughal archways, peacocks, and subtle family initials tailored to your trousseau.', 'mehandibysana' ),
					'specs' => array(
						__( '5–7 hours unhurried session', 'mehandibysana' ),
						__( '12–16 organic 0.38mm cones mixed fresh', 'mehandibysana' ),
						__( 'Complimentary Sealant Spray & Aftercare Balm', 'mehandibysana' ),
						__( 'Srinagar & outstation destination travel', 'mehandibysana' ),
					),
				),
				array(
					'num'   => '02',
					'motif' => 'events',
					'title' => __( 'Bridal Sisters, Sangeet & Eid', 'mehandibysana' ),
					'tag'   => __( 'Hourly / Per-Hand', 'mehandibysana' ),
					'desc'  => __( 'Studio team of trained organic artists rendering contemporary vines, finger caps, hathphool cuffs, and sun medallions cleanly across guests.', 'mehandibysana' ),
					'specs' => array(
						__( '2–5 dedicated artists on venue', 'mehandibysana' ),
						__( '100% skin-safe for children & elders', 'mehandibysana' ),
						__( 'Zero stain transfer after flaking', 'mehandibysana' ),
						__( 'Flexible evening or morning slots', 'mehandibysana' ),
					),
				),
				array(
					'num'   => '03',
					'motif' => 'botanical',
					'title' => __( 'Bulk Cones & Artist Masterclasses', 'mehandibysana' ),
					'tag'   => __( 'Workshops & Salons', 'mehandibysana' ),
					'desc'  => __( 'One-on-one formulation training in dye-release chemistry, paste rheology, and bulk salon orders shipped temperature-safe across India.', 'mehandibysana' ),
					'specs' => array(
						__( 'Triple-sifted Sojat henna formulation', 'mehandibysana' ),
						__( 'Precision 0.35mm–0.45mm cone rolling', 'mehandibysana' ),
						__( 'Salon wholesale pricing tiers', 'mehandibysana' ),
						__( 'Studio reference handbook included', 'mehandibysana' ),
					),
				),
			);
			foreach ( $tiers as $t ) :
				?>
				<article class="mbs-service-card" style="display:flex;flex-direction:column;justify-content:space-between;">
					<div>
						<div class="mbs-service-top">
							<div>
								<span class="eyebrow"><?php echo esc_html( $t['num'] . ' · ' . $t['tag'] ); ?></span>
								<h2 style="font-size:1.75rem;margin-top:6px;"><?php echo esc_html( $t['title'] ); ?></h2>
							</div>
							<?php echo mbs_svg_service_motif( $t['motif'] ); ?>
						</div>
						<p style="font-size:0.9375rem;color:var(--color-text-muted);line-height:1.65;">
							<?php echo esc_html( $t['desc'] ); ?>
						</p>
						<ul class="mbs-service-list" style="grid-template-columns:1fr;">
							<?php foreach ( $t['specs'] as $s ) : ?>
								<li><?php echo esc_html( $s ); ?></li>
							<?php endforeach; ?>
						</ul>
					</div>
					<a href="#book-session" class="mbs-btn mbs-btn-ink mbs-btn-sm" style="align-self:flex-start;">
						<?php esc_html_e( 'Request Availability →', 'mehandibysana' ); ?>
					</a>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<!-- Interactive Stain Science Preview -->
<?php get_template_part( 'template-parts/stain-guide', null, array( 'linen' => true ) ); ?>

<!-- Direct Booking Section -->
<section id="book-session" class="section-pad surface-bg hairline-rule">
	<div class="editorial-container mbs-sticky-grid">
		<div>
			<span class="eyebrow"><?php esc_html_e( 'Reserve Calendar Dates', 'mehandibysana' ); ?></span>
			<h2 class="mbs-section-title"><?php esc_html_e( 'Inquire for Your Ceremony', 'mehandibysana' ); ?></h2>
			<p style="margin-top:0.85rem;color:var(--color-text-muted);line-height:1.68;">
				<?php esc_html_e( 'Share your ceremony date, venue city, and design preference. Bridal calendar bookings for peak spring and autumn seasons are best secured 6–12 weeks ahead.', 'mehandibysana' ); ?>
			</p>
		</div>
		<div>
			<?php get_template_part( 'template-parts/booking-form', null, array( 'service' => 'bridal' ) ); ?>
		</div>
	</div>
</section>

<?php get_footer(); ?>

