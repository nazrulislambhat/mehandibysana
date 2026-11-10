<?php
/**
 * Template Name: Mehandi by Sana — Privacy Policy
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
		<span class="eyebrow"><?php esc_html_e( 'Data & Privacy Protection', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.25rem,4vw,3.15rem);margin-top:0.5rem;"><?php esc_html_e( 'Privacy Policy', 'mehandibysana' ); ?></h1>
	</div>
</header>

<section class="section-pad surface-bg">
	<div class="editorial-container" style="max-width:48rem;display:flex;flex-direction:column;gap:2rem;line-height:1.72;color:var(--color-text-muted);">
		<article>
			<h2 style="font-size:1.7rem;color:var(--color-ink);margin-bottom:0.5rem;">1. Information We Collect</h2>
			<p>When you place an order, check PIN delivery rates, or request bridal availability with Mehandi by Sana, we collect only your name, delivery address, phone number, email address, and ceremony notes required to fulfill your order or inquiry.</p>
		</article>
		<article>
			<h2 style="font-size:1.7rem;color:var(--color-ink);margin-bottom:0.5rem;">2. Payment Processing</h2>
			<p>Card, UPI, and Netbanking payments are processed directly over encrypted checkout gateways (such as Razorpay) or Cash on Delivery / Offline settlement. Mehandi by Sana never stores raw payment card credentials.</p>
		</article>
		<article>
			<h2 style="font-size:1.7rem;color:var(--color-ink);margin-bottom:0.5rem;">3. Courier & Dispatch Updates</h2>
			<p>Delivery coordinates and consignment IDs are shared strictly with our appointed local riders and national courier partners solely for doorstep delivery and parcel tracking lookup.</p>
		</article>
		<article>
			<h2 style="font-size:1.7rem;color:var(--color-ink);margin-bottom:0.5rem;">4. Data Deletion or Questions</h2>
			<p>For privacy inquiries or data deletion requests, reach us at <a href="mailto:<?php echo esc_attr( mbs_get_studio_email() ); ?>" style="text-decoration:underline;color:var(--color-ink);"><?php echo esc_html( mbs_get_studio_email() ); ?></a>.</p>
		</article>
	</div>
</section>

<?php get_footer(); ?>

