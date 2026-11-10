<?php
/**
 * 404 Not Found — Editorial Recovery Page
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>
<section class="section-pad surface-bg">
	<div class="editorial-container" style="max-width:44rem;text-align:center;">
		<div style="display:flex;justify-content:center;margin-bottom:1.5rem;">
			<?php echo mbs_svg_botanical_sprig(); ?>
		</div>
		<span class="eyebrow"><?php esc_html_e( '404 · Page Not Found', 'mehandibysana' ); ?></span>
		<h1 style="font-size:clamp(2.5rem,5vw,3.75rem);margin-top:0.75rem;">
			<?php esc_html_e( 'This Page Could Not Be Found', 'mehandibysana' ); ?>
		</h1>
		<p style="margin:1rem auto 2rem;color:var(--color-text-muted);max-width:30rem;line-height:1.68;">
			<?php esc_html_e( 'The page you followed may have moved or is no longer active. Return to our freshly rolled organic henna shop or Bridal commissions.', 'mehandibysana' ); ?>
		</p>
		<div style="display:flex;flex-wrap:wrap;gap:0.85rem;justify-content:center;">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="mbs-btn mbs-btn-ink"><?php esc_html_e( 'Return Home', 'mehandibysana' ); ?></a>
			<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-primary"><?php esc_html_e( 'Browse Shop →', 'mehandibysana' ); ?></a>
			<a href="<?php echo esc_url( mbs_get_track_order_url() ); ?>" class="mbs-btn mbs-btn-secondary"><?php esc_html_e( 'Track Order', 'mehandibysana' ); ?></a>
		</div>
	</div>
</section>
<?php get_footer(); ?>

