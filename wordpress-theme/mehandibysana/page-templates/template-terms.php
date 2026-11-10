<?php
/**
 * Template Name: Mehandi Studio — Terms & Conditions
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
		<span class="eyebrow"><?php esc_html_e( 'Studio Policy & Client Dossier', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.25rem,4vw,3.15rem);margin-top:0.5rem;"><?php esc_html_e( 'Terms & Conditions', 'mehandibysana' ); ?></h1>
	</div>
</header>

<section class="section-pad surface-bg">
	<div class="editorial-container" style="max-width:48rem;display:flex;flex-direction:column;gap:2rem;line-height:1.72;color:var(--color-text-muted);">
		<article>
			<h2 style="font-size:1.7rem;color:var(--color-ink);margin-bottom:0.5rem;">1. Fresh Botanical Perishability</h2>
			<p>All organic henna cones from Mehandi by Sana are hand-mixed fresh with triple-sifted Sojat henna powder, essential oils, and zero synthetic preservatives or PPD dyes. Immediately upon parcel receipt, unused cones must be stored inside a sealed zip pouch in your freezer (-18&deg;C).</p>
		</article>
		<article>
			<h2 style="font-size:1.7rem;color:var(--color-ink);margin-bottom:0.5rem;">2. Indian PIN Code Dispatch & Shipping</h2>
			<p>Shipping rates and Cash on Delivery eligibility are matched transparently at checkout via your 6-digit Indian PIN code. Kashmir Valley &amp; Ladakh parcels typically reach within 1–2 business days; North India metros 3–4 days; Pan-India 4–6 days.</p>
		</article>
		<article>
			<h2 style="font-size:1.7rem;color:var(--color-ink);margin-bottom:0.5rem;">3. Bridal Commissions & Rescheduling</h2>
			<p>Bridal ceremony dates reserved through our Srinagar studio desk require advance confirmation. Rescheduling requests are accommodated generously based on availability when communicated at least 14 days before the ceremony.</p>
		</article>
		<article>
			<h2 style="font-size:1.7rem;color:var(--color-ink);margin-bottom:0.5rem;">4. Damages & Parcel Assistance</h2>
			<p>Should a cold-chain box arrive damaged during courier transit, capture clear unboxing photographs within 24 hours and contact <?php echo esc_html( mbs_get_studio_email() ); ?> or <?php echo esc_html( mbs_get_studio_phone() ); ?> for prompt studio resolution.</p>
		</article>

		<div style="padding-top:1.25rem;border-top:1px solid var(--color-border);">
			<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'privacy-policy', '/privacy-policy/' ) ); ?>" class="mbs-btn mbs-btn-secondary mbs-btn-sm">
				<?php esc_html_e( 'Read Privacy Policy →', 'mehandibysana' ); ?>
			</a>
		</div>
	</div>
</section>

<?php get_footer(); ?>

