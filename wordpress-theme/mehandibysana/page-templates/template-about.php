<?php
/**
 * Template Name: Mehandi by Sana — About & Botanical Craft
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
$founder_img_override = get_theme_mod( 'mbs_founder_image_override', '' );
?>
<header class="mbs-masthead">
	<div class="editorial-container">
		<span class="eyebrow"><?php esc_html_e( 'Founded 2019 · Baghat Barzullah, Srinagar', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.35rem,4.4vw,3.35rem);margin-top:0.5rem;">
			<?php esc_html_e( 'Botanical Henna Purity Without Shortcuts', 'mehandibysana' ); ?>
		</h1>
		<p style="margin-top:0.85rem;max-width:42rem;color:var(--color-text-muted);font-size:1.02rem;line-height:1.68;">
			<?php esc_html_e( 'Guided independently by Sumaiya Rashid Magray (Sana) without a walk-in storefront studio today (with hopes of opening a dedicated space someday), Mehandi by Sana pairs centuries-old botanical dye-release intuition with repeatable small-batch precision.', 'mehandibysana' ); ?>
		</p>
	</div>
</header>

<section class="section-pad surface-bg">
	<div class="editorial-container mbs-about-grid">
		<div>
			<span class="eyebrow"><?php esc_html_e( 'Our Story & Conviction', 'mehandibysana' ); ?></span>
			<h2 class="mbs-section-title"><?php esc_html_e( 'Why We Roll Every Cone by Hand', 'mehandibysana' ); ?></h2>
			<p style="margin-top:1rem;color:var(--color-text-muted);line-height:1.72;">
				<?php esc_html_e( 'Commercial shelf henna tubes depend on synthetic PPD dyes, preservatives, and chemical solvents to stay liquid for months at ambient room temperature—often causing blistering and unnatural ink-black tones.', 'mehandibysana' ); ?>
			</p>
			<p style="margin-top:1rem;color:var(--color-text-muted);line-height:1.72;">
				<?php esc_html_e( 'At Mehandi by Sana, we take the opposite approach: triple-sifted Sojat henna harvests blended slowly with filtered water, natural sugars, pure steam-distilled eucalyptus, and clover oil—rolled daily into 0.38mm fine-tip cones and stored cold until dispatch.', 'mehandibysana' ); ?>
			</p>

			<blockquote class="mbs-pullquote">
				<?php esc_html_e( '“Every bride carries a sacred memory on her palms. That stain must be gentle on skin, calm on senses, and undeniably authentic.”', 'mehandibysana' ); ?>
			</blockquote>

			<div class="mbs-craft-inset">
				<?php echo mbs_svg_botanical_craft(); ?>
			</div>
		</div>

		<div class="mbs-arch-wrap">
			<div class="mbs-arch-frame">
				<?php if ( $founder_img_override ) : ?>
					<img src="<?php echo esc_url( $founder_img_override ); ?>" alt="<?php esc_attr_e( 'Sumaiya Rashid Magray — Independent Organic Mehandi Artist', 'mehandibysana' ); ?>" />
				<?php else : ?>
					<?php echo mbs_svg_sana_portrait(); ?>
				<?php endif; ?>
			</div>
			<div class="mbs-arch-badge"><?php esc_html_e( 'Sumaiya Rashid Magray · Founder', 'mehandibysana' ); ?></div>
		</div>
	</div>
</section>

<section class="section-pad surface-linen hairline-rule">
	<div class="editorial-container">
		<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;">
			<div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:1.75rem;">
				<span class="eyebrow">01 &middot; Harvest</span>
				<h3 style="font-size:1.55rem;margin-top:0.5rem;"><?php esc_html_e( 'Single-Season Sojat Leaf', 'mehandibysana' ); ?></h3>
				<p style="margin-top:0.65rem;font-size:0.9rem;color:var(--color-text-muted);line-height:1.65;">
					<?php esc_html_e( 'Harvested for maximum natural lawsone content and triple-cloth sifted so 0.38mm fine bridal tips never snag mid-line.', 'mehandibysana' ); ?>
				</p>
			</div>
			<div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:1.75rem;">
				<span class="eyebrow">02 &middot; Terpenes</span>
				<h3 style="font-size:1.55rem;margin-top:0.5rem;"><?php esc_html_e( 'Pure Steam-Distilled Oils', 'mehandibysana' ); ?></h3>
				<p style="margin-top:0.65rem;font-size:0.9rem;color:var(--color-text-muted);line-height:1.65;">
					<?php esc_html_e( 'Monoterpene-rich eucalyptus and lavender oil release botanical dye cleanly across 12 hours without irritating sensitive skin.', 'mehandibysana' ); ?>
				</p>
			</div>
			<div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:1.75rem;">
				<span class="eyebrow">03 &middot; Proven</span>
				<h3 style="font-size:1.55rem;margin-top:0.5rem;"><?php echo esc_html( mbs_get_orders_completed_display() ); ?> <?php esc_html_e( 'Dispatches', 'mehandibysana' ); ?></h3>
				<p style="margin-top:0.65rem;font-size:0.9rem;color:var(--color-text-muted);line-height:1.65;">
					<?php esc_html_e( 'Packed fresh from Srinagar with insulated protection and clear 48-hour storage instructions.', 'mehandibysana' ); ?>
				</p>
			</div>
		</div>
	</div>
</section>

<?php get_footer(); ?>

