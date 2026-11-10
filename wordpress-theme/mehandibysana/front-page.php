<?php
/**
 * Mehandi by Sana Atelier — Homepage Template (9-Section Editorial Experience)
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$orders_completed = mbs_get_orders_completed_display();
$hero_img_override = get_theme_mod( 'mbs_hero_image_override', '' );
$founder_img_override = get_theme_mod( 'mbs_founder_image_override', '' );
$gallery_plates = mbs_get_gallery_plates( 'home' );
$row1_plates = array_slice( $gallery_plates, 0, 3 );
$row2_plates = array_slice( $gallery_plates, 3, 3 );
?>

<!-- 1. HERO SECTION -->
<section class="mbs-hero-section">
	<div class="editorial-container mbs-hero-grid">
		<div>
			<span class="eyebrow">
				<?php esc_html_e( 'Fresh Batch Daily · Baghat Barzullah, Srinagar', 'mehandibysana' ); ?>
			</span>
			<h1 class="mbs-hero-title">
				<span class="reveal-line"><span class="reveal-line-inner"><?php esc_html_e( 'Organic Henna.', 'mehandibysana' ); ?></span></span>
				<span class="reveal-line"><span class="reveal-line-inner" style="color:var(--color-accent);"><?php esc_html_e( 'Crafted in Kashmir.', 'mehandibysana' ); ?></span></span>
			</h1>
			<p class="mbs-hero-lede reveal-fade-block">
				<?php esc_html_e( '100% chemical-free botanical henna cones hand-rolled with triple-sifted Sojat leaf powder, steam-distilled eucalyptus, and pure clove essential oil. Zero PPD, deep mahogany natural oxidation.', 'mehandibysana' ); ?>
			</p>

			<div class="mbs-hero-actions reveal-fade-block">
				<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-primary mbs-btn-lg">
					<?php esc_html_e( 'Browse Atelier Shop →', 'mehandibysana' ); ?>
				</a>
				<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'services', '/services/' ) ); ?>" class="mbs-btn mbs-btn-secondary mbs-btn-lg">
					<?php esc_html_e( 'Book Bridal Dates', 'mehandibysana' ); ?>
				</a>
			</div>

			<dl class="mbs-hero-metrics reveal-fade-block">
				<div>
					<dd><?php echo esc_html( $orders_completed ); ?></dd>
					<dt><?php esc_html_e( 'Parcels Delivered', 'mehandibysana' ); ?></dt>
				</div>
				<div>
					<dd>100%</dd>
					<dt><?php esc_html_e( 'Chemical & PPD Free', 'mehandibysana' ); ?></dt>
				</div>
				<div>
					<dd>2018</dd>
					<dt><?php esc_html_e( 'Founded in Srinagar', 'mehandibysana' ); ?></dt>
				</div>
			</dl>
		</div>

		<!-- Arched Mughal Architectural Frame -->
		<div class="mbs-arch-wrap reveal-fade-block">
			<div class="mbs-arch-frame">
				<?php if ( $hero_img_override ) : ?>
					<img src="<?php echo esc_url( $hero_img_override ); ?>" alt="<?php esc_attr_e( 'Mehandi by Sana organic botanical henna craftsmanship', 'mehandibysana' ); ?>" />
				<?php else : ?>
					<?php echo mbs_svg_hero_composition(); ?>
				<?php endif; ?>
			</div>
			<span class="mbs-plate-stamp">ATELIER PLATE N&deg; 01</span>
			<div class="mbs-arch-badge">0.38MM FINE BRIDAL TIP</div>
		</div>
	</div>
</section>

<!-- 2. FEATURED PRODUCTS BENTO SHOWCASE (3 TABS) -->
<?php get_template_part( 'template-parts/featured-shelf' ); ?>

<!-- 3. BOTANICAL DIVIDER -->
<div class="surface-bg" style="padding:1.25rem 0;">
	<?php echo mbs_svg_botanical_divider(); ?>
</div>

<!-- 4. STICKY SERVICES PREVIEW -->
<section class="section-pad surface-bg">
	<div class="editorial-container mbs-sticky-grid">
		<div class="mbs-sticky-col reveal-fade-block">
			<span class="eyebrow"><?php esc_html_e( 'Commissions & Artistry', 'mehandibysana' ); ?></span>
			<h2 class="mbs-section-title"><?php esc_html_e( 'Intricate Ceremonial Mehndi', 'mehandibysana' ); ?></h2>
			<p style="margin-top:1rem;color:var(--color-text-muted);line-height:1.68;">
				<?php esc_html_e( 'From full-arm Kashmiri bridal mandalas woven with Chinar silhouettes and Mughal arches to intimate sangeet gatherings prepared with freshly thawed organic cones.', 'mehandibysana' ); ?>
			</p>
			<div style="margin-top:1.75rem;display:flex;flex-wrap:wrap;gap:0.75rem;">
				<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'services', '/services/' ) ); ?>" class="mbs-btn mbs-btn-ink">
					<?php esc_html_e( 'Explore Service Tiers →', 'mehandibysana' ); ?>
				</a>
			</div>
		</div>

		<div class="mbs-service-cards">
			<?php
			$services_preview = array(
				array(
					'num'   => '01',
					'motif' => 'bridal',
					'title' => __( 'Bridal Mehndi Commissions', 'mehandibysana' ),
					'price' => __( 'Custom Quote · Srinagar & Destination', 'mehandibysana' ),
					'desc'  => __( 'Signature full-arm, palm, and feet compositions crafted by Sumaiya Rashid Magray using 0.38mm ultra-fine organic bridal cones.', 'mehandibysana' ),
					'items' => array(
						__( 'Personalized bride & groom initials', 'mehandibysana' ),
						__( 'Pre-ceremony skin test & consultation', 'mehandibysana' ),
						__( 'Complimentary Stain-Sealing Balm', 'mehandibysana' ),
						__( 'Full 48-hour aftercare ritual card', 'mehandibysana' ),
					),
				),
				array(
					'num'   => '02',
					'motif' => 'events',
					'title' => __( 'Engagement, Eid & Sangeet Gatherings', 'mehandibysana' ),
					'price' => __( 'Group Bookings · Hourly or Per-Hand', 'mehandibysana' ),
					'desc'  => __( 'Dedicated studio team applying modern botanical trails, mandala palms, and hathphool cuffs for family ceremonies and festive celebrations.', 'mehandibysana' ),
					'items' => array(
						__( 'Fresh batch cones included per guest', 'mehandibysana' ),
						__( '2–4 trained studio artists available', 'mehandibysana' ),
						__( 'Swift contemporary motifs', 'mehandibysana' ),
						__( 'Chemical-free & safe for children', 'mehandibysana' ),
					),
				),
				array(
					'num'   => '03',
					'motif' => 'botanical',
					'title' => __( 'Private Formulations & Artist Workshops', 'mehandibysana' ),
					'price' => __( 'Studio Atelier · Small Batches', 'mehandibysana' ),
					'desc'  => __( 'Hands-on training in paste rheology, cellophane rolling, and custom bulk bridal cone dispatches for independent mehndi artists.', 'mehandibysana' ),
					'items' => array(
						__( 'Sojat leaf sifting & EO ratios', 'mehandibysana' ),
						__( '0.35mm–0.45mm cellophane pinning', 'mehandibysana' ),
						__( 'Wholesale salon cold-chain dispatch', 'mehandibysana' ),
						__( 'Certificate & studio formulation guide', 'mehandibysana' ),
					),
				),
			);
			foreach ( $services_preview as $srv ) :
				?>
				<article class="mbs-service-card reveal-fade-block">
					<div class="mbs-service-top">
						<div>
							<span class="eyebrow"><?php echo esc_html( $srv['num'] ); ?></span>
							<h3 style="font-size:1.75rem;margin-top:4px;color:var(--color-ink);"><?php echo esc_html( $srv['title'] ); ?></h3>
							<div style="font-size:0.8125rem;color:var(--color-accent);font-weight:500;margin-top:3px;"><?php echo esc_html( $srv['price'] ); ?></div>
						</div>
						<div style="flex-shrink:0;"><?php echo mbs_svg_service_motif( $srv['motif'] ); ?></div>
					</div>
					<p style="font-size:0.9375rem;color:var(--color-text-muted);line-height:1.65;"><?php echo esc_html( $srv['desc'] ); ?></p>
					<ul class="mbs-service-list">
						<?php foreach ( $srv['items'] as $li ) : ?>
							<li><?php echo esc_html( $li ); ?></li>
						<?php endforeach; ?>
					</ul>
					<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'contact', '/contact/' ) ); ?>" class="mbs-btn mbs-btn-secondary mbs-btn-sm">
						<?php esc_html_e( 'Inquire for Date →', 'mehandibysana' ); ?>
					</a>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<!-- 5. INTERACTIVE 48-HOUR STAIN OXIDATION GUIDE -->
<?php get_template_part( 'template-parts/stain-guide', null, array( 'linen' => true ) ); ?>

<!-- 6. ABOUT CRAFT & FOUNDER STORY -->
<section class="section-pad surface-linen hairline-rule">
	<div class="editorial-container mbs-about-grid">
		<div class="reveal-fade-block">
			<span class="eyebrow"><?php esc_html_e( 'The Founder & Craft · Srinagar', 'mehandibysana' ); ?></span>
			<h2 class="mbs-section-title"><?php esc_html_e( 'Pure Lawsone Leaf. Zero Compromise.', 'mehandibysana' ); ?></h2>
			<p style="margin-top:1rem;color:var(--color-text-muted);line-height:1.68;">
				<?php esc_html_e( 'Founded in 2018 by Sumaiya Rashid Magray (popularly known as Sana), Mehandi by Sana began in Srinagar with one uncompromising conviction: brides deserve deeply dark mahogany stains without exposing skin to synthetic dyes, kerosene, or chemical accelerators.', 'mehandibysana' ); ?>
			</p>

			<blockquote class="mbs-pullquote">
				<?php esc_html_e( '“Fresh henna breathes—when triple-sifted Sojat leaf meets pure eucalyptus and patient 12-hour dye release, skin rewards you with velvet mahogany.”', 'mehandibysana' ); ?>
			</blockquote>

			<div class="mbs-craft-inset">
				<?php echo mbs_svg_botanical_craft(); ?>
			</div>

			<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'about', '/about/' ) ); ?>" class="mbs-btn mbs-btn-ink">
				<?php esc_html_e( 'Read Our Craft Philosophy →', 'mehandibysana' ); ?>
			</a>
		</div>

		<div class="mbs-arch-wrap reveal-fade-block">
			<div class="mbs-arch-frame" style="background:var(--color-bg);">
				<?php if ( $founder_img_override ) : ?>
					<img src="<?php echo esc_url( $founder_img_override ); ?>" alt="<?php esc_attr_e( 'Sumaiya Rashid Magray — Mehandi by Sana Atelier Founder', 'mehandibysana' ); ?>" />
				<?php else : ?>
					<?php echo mbs_svg_sana_portrait(); ?>
				<?php endif; ?>
			</div>
			<div class="mbs-arch-badge"><?php esc_html_e( 'Sumaiya Rashid Magray (Sana)', 'mehandibysana' ); ?></div>
		</div>
	</div>
</section>

<!-- 7. GALLERY EXHIBITION PREVIEW (6 ASYMMETRIC PLATES) -->
<section class="section-pad surface-bg hairline-rule">
	<div class="editorial-container">
		<div class="mbs-section-header reveal-fade-block">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Exhibition Plates · 2018–2026', 'mehandibysana' ); ?></span>
				<h2 class="mbs-section-title"><?php esc_html_e( 'Curated Stain & Bridal Archive', 'mehandibysana' ); ?></h2>
			</div>
			<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'gallery', '/gallery/' ) ); ?>" class="mbs-btn mbs-btn-secondary">
				<?php esc_html_e( 'Open Full Archive →', 'mehandibysana' ); ?>
			</a>
		</div>

		<!-- Row 1: 6 + 3 + 3 -->
		<div class="mbs-gallery-grid" style="margin-bottom:2.25rem;">
			<?php foreach ( $row1_plates as $plate ) : ?>
				<figure class="mbs-plate-card <?php echo esc_attr( $plate['home_span'] ); ?> reveal-fade-block" style="margin:0;">
					<div class="mbs-plate-frame <?php echo esc_attr( $plate['home_aspect'] ); ?>">
						<?php echo mbs_svg_plate_artwork( $plate['plate_id'], 'mbs-plate-fallback' ); ?>
						<?php if ( ! empty( $plate['src'] ) ) : ?>
							<img
								src="<?php echo esc_url( $plate['src'] ); ?>"
								alt="<?php echo esc_attr( $plate['alt'] ); ?>"
								class="mbs-plate-photo"
								loading="lazy"
								onerror="this.style.display='none';"
							/>
						<?php endif; ?>
					</div>
					<figcaption>
						<div class="mbs-plate-meta">
							<span><?php echo esc_html( $plate['number'] ); ?></span>
							<span style="color:var(--color-accent);"><?php echo esc_html( $plate['tag'] ); ?></span>
						</div>
						<h3 style="font-size:1.35rem;margin-top:4px;color:var(--color-ink);"><?php echo esc_html( $plate['title'] ); ?></h3>
						<p style="font-size:0.84rem;color:var(--color-text-muted);margin-top:3px;"><?php echo esc_html( $plate['caption_home'] ); ?></p>
					</figcaption>
				</figure>
			<?php endforeach; ?>
		</div>

		<!-- Row 2: 4 + 4 + 4 -->
		<div class="mbs-gallery-grid">
			<?php foreach ( $row2_plates as $plate ) : ?>
				<figure class="mbs-plate-card <?php echo esc_attr( $plate['home_span'] ); ?> reveal-fade-block" style="margin:0;">
					<div class="mbs-plate-frame <?php echo esc_attr( $plate['home_aspect'] ); ?>">
						<?php echo mbs_svg_plate_artwork( $plate['plate_id'], 'mbs-plate-fallback' ); ?>
						<?php if ( ! empty( $plate['src'] ) ) : ?>
							<img
								src="<?php echo esc_url( $plate['src'] ); ?>"
								alt="<?php echo esc_attr( $plate['alt'] ); ?>"
								class="mbs-plate-photo"
								loading="lazy"
								onerror="this.style.display='none';"
							/>
						<?php endif; ?>
					</div>
					<figcaption>
						<div class="mbs-plate-meta">
							<span><?php echo esc_html( $plate['number'] ); ?></span>
							<span style="color:var(--color-accent);"><?php echo esc_html( $plate['tag'] ); ?></span>
						</div>
						<h3 style="font-size:1.35rem;margin-top:4px;color:var(--color-ink);"><?php echo esc_html( $plate['title'] ); ?></h3>
						<p style="font-size:0.84rem;color:var(--color-text-muted);margin-top:3px;"><?php echo esc_html( $plate['caption_home'] ); ?></p>
					</figcaption>
				</figure>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<!-- 8. TESTIMONIALS & EDITORIAL ACCLAIM -->
<section class="section-pad surface-linen hairline-rule">
	<div class="editorial-container">
		<div class="mbs-section-header reveal-fade-block">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Client Notes & Reviews', 'mehandibysana' ); ?></span>
				<h2 class="mbs-section-title"><?php esc_html_e( 'Trusted by Brides & Artists Across India', 'mehandibysana' ); ?></h2>
			</div>
		</div>

		<div class="mbs-testimonials-grid">
			<div class="mbs-quote-ink reveal-fade-block">
				<div>
					<span class="eyebrow" style="color:var(--color-accent);"><?php esc_html_e( 'Featured Bridal Review · Srinagar', 'mehandibysana' ); ?></span>
					<p style="font-family:var(--font-serif);font-size:1.75rem;line-height:1.3;margin-top:1rem;">
						<?php esc_html_e( '“By Hour 40 my stain had turned the deepest espresso burgundy I have ever seen, with zero itching or flaking—just pure soothing eucalyptus aroma during my Nikah morning.”', 'mehandibysana' ); ?>
					</p>
				</div>
				<div style="margin-top:2rem;padding-top:1.25rem;border-top:1px solid rgba(252,238,227,0.16);display:flex;justify-content:space-between;align-items:center;">
					<div>
						<div style="font-weight:600;">Zoya Mufti</div>
						<div style="font-size:0.8rem;opacity:0.7;">Autumn Bride &middot; Rajbagh, Srinagar</div>
					</div>
					<span style="color:var(--color-accent);font-weight:600;">★★★★★</span>
				</div>
			</div>

			<div class="mbs-quotes-stack">
				<article class="mbs-quote-paper reveal-fade-block">
					<p style="font-size:1.02rem;line-height:1.65;color:var(--color-ink);">
						<?php esc_html_e( '“As a working mehndi artist in New Delhi, switching to Mehandi by Sana’s 0.38mm pre-rolled batch elevated my hairline work immediately. Consistent paste viscosity every single box.”', 'mehandibysana' ); ?>
					</p>
					<div style="margin-top:1rem;font-size:0.825rem;color:var(--color-text-muted);">
						<strong style="color:var(--color-ink);">Meenakshi Sharma</strong> &middot; Bridal Artist, South Delhi
					</div>
				</article>
				<article class="mbs-quote-paper reveal-fade-block">
					<p style="font-size:1.02rem;line-height:1.65;color:var(--color-ink);">
						<?php esc_html_e( '“Ordered the Bridal Care Kit alongside triple-sifted hair henna powder. Cold-packed arrival in Mumbai within 4 days with the PIN estimator spot-on.”', 'mehandibysana' ); ?>
					</p>
					<div style="margin-top:1rem;font-size:0.825rem;color:var(--color-text-muted);">
						<strong style="color:var(--color-ink);">Farah Naqvi</strong> &middot; Bandra West, Mumbai
					</div>
				</article>
			</div>
		</div>
	</div>
</section>

<!-- 9. EDITORIAL INVITATION BANNER -->
<section class="mbs-cta-banner">
	<div class="editorial-container" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:2rem;">
		<div style="max-width:36rem;">
			<span class="eyebrow"><?php esc_html_e( 'Small-Batch Daily Preparation', 'mehandibysana' ); ?></span>
			<h2 style="font-size:clamp(2rem,3.8vw,3rem);margin-top:0.5rem;">
				<?php esc_html_e( 'Experience Pure Botanical Stain Chemistry', 'mehandibysana' ); ?>
			</h2>
			<p style="margin-top:0.85rem;color:rgba(252,238,227,0.74);font-size:0.975rem;line-height:1.65;">
				<?php esc_html_e( 'Order fresh organic cones rolled this morning or reserve your bridal ceremony dates with our Srinagar studio.', 'mehandibysana' ); ?>
			</p>
		</div>
		<div style="display:flex;flex-wrap:wrap;gap:0.85rem;">
			<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-primary mbs-btn-lg">
				<?php esc_html_e( 'Visit Atelier Shop →', 'mehandibysana' ); ?>
			</a>
			<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'contact', '/contact/' ) ); ?>" class="mbs-btn mbs-btn-inverse-outline mbs-btn-lg">
				<?php esc_html_e( 'Inquire for Bridal Dates', 'mehandibysana' ); ?>
			</a>
		</div>
	</div>
</section>

<?php get_footer(); ?>

