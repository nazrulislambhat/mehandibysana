<?php
/**
 * Template Name: Mehandi Studio — Bridal & Stain Gallery Archive
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$plates = mbs_get_gallery_plates( 'page' );
$rows   = array_chunk( $plates, 2 );
?>
<header class="mbs-masthead">
	<div class="editorial-container">
		<span class="eyebrow"><?php esc_html_e( 'Exhibition Plates · Natural Stain Oxidation', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.35rem,4.4vw,3.35rem);margin-top:0.5rem;">
			<?php esc_html_e( 'Studio Gallery & Stain Archive', 'mehandibysana' ); ?>
		</h1>
		<p style="margin-top:0.85rem;max-width:40rem;color:var(--color-text-muted);font-size:1.02rem;line-height:1.68;">
			<?php esc_html_e( 'Unretouched natural daylight stains from Hour 36–48 oxidation—created exclusively with freshly sifted Sojat leaf and steam-distilled eucalyptus oil.', 'mehandibysana' ); ?>
		</p>
	</div>
</header>

<section class="section-pad surface-bg">
	<div class="editorial-container" style="display:flex;flex-direction:column;gap:3.25rem;">
		<?php foreach ( $rows as $row ) : ?>
			<div class="mbs-gallery-grid">
				<?php foreach ( $row as $plate ) : ?>
					<figure class="mbs-plate-card <?php echo esc_attr( $plate['page_span'] ); ?> reveal-fade-block" style="margin:0;">
						<div class="mbs-plate-frame <?php echo esc_attr( $plate['page_aspect'] ); ?>">
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
								<span style="color:var(--color-accent);"><?php echo esc_html( $plate['category'] ); ?></span>
							</div>
							<h2 style="font-size:1.6rem;margin-top:4px;color:var(--color-ink);"><?php echo esc_html( $plate['title'] ); ?></h2>
							<p style="font-size:0.9rem;color:var(--color-text-muted);margin-top:4px;line-height:1.6;">
								<?php echo esc_html( $plate['caption_full'] ); ?>
							</p>
						</figcaption>
					</figure>
				<?php endforeach; ?>
			</div>
		<?php endforeach; ?>
	</div>
</section>

<?php get_template_part( 'template-parts/stain-guide', null, array( 'linen' => true ) ); ?>

<section class="mbs-cta-banner">
	<div class="editorial-container" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.5rem;">
		<div>
			<span class="eyebrow"><?php esc_html_e( 'Recreate This Stain at Home', 'mehandibysana' ); ?></span>
			<h2 style="font-size:2.2rem;margin-top:0.4rem;"><?php esc_html_e( 'Crafted with Our 0.38mm Bridal Batch', 'mehandibysana' ); ?></h2>
		</div>
		<div style="display:flex;gap:0.85rem;flex-wrap:wrap;">
			<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-primary"><?php esc_html_e( 'Shop Cones & Oils →', 'mehandibysana' ); ?></a>
			<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'contact', '/contact/' ) ); ?>" class="mbs-btn mbs-btn-inverse-outline"><?php esc_html_e( 'Book Artist', 'mehandibysana' ); ?></a>
		</div>
	</div>
</section>

<?php get_footer(); ?>

