<?php
/**
 * Mehandi by Sana Atelier — Global Footer + Slide-Over Bag Drawer + wp_footer
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$studio_email   = function_exists( 'mbs_get_studio_email' ) ? mbs_get_studio_email() : 'sana@mehandibysana.com';
$studio_phone   = function_exists( 'mbs_get_studio_phone' ) ? mbs_get_studio_phone() : '+91-9149648717';
$studio_address = function_exists( 'mbs_get_studio_address' ) ? mbs_get_studio_address() : 'Baghat Barzullah, Srinagar 190005, J&K';
?>
</main>

<footer class="site-footer" role="contentinfo">
	<div class="editorial-container">
		<div class="footer-grid">
			<!-- Col 1: Atelier Identity -->
			<div>
				<span class="header-brand-title" style="display:block;"><?php esc_html_e( 'MEHANDI BY SANA', 'mehandibysana' ); ?></span>
				<p style="margin-top:0.85rem;font-size:0.9rem;color:rgba(252,238,227,0.72);line-height:1.68;max-width:24rem;">
					<?php esc_html_e( 'Botanical organic henna cones, artisanal Sojat hair leaf powder, and serene bridal artistry crafted fresh in Srinagar since 2018.', 'mehandibysana' ); ?>
				</p>
				<p style="margin-top:1rem;font-size:0.825rem;color:rgba(252,238,227,0.6);">
					<?php echo esc_html( $studio_address ); ?>
				</p>
				<div style="margin-top:1rem;display:flex;gap:1rem;flex-wrap:wrap;font-size:0.825rem;">
					<a href="https://instagram.com/mehandibysana" target="_blank" rel="noopener noreferrer" style="color:var(--color-text-inverse);text-decoration:underline;text-underline-offset:4px;">Instagram</a>
					<a href="mailto:<?php echo esc_attr( $studio_email ); ?>" style="color:var(--color-text-inverse);text-decoration:underline;text-underline-offset:4px;"><?php echo esc_html( $studio_email ); ?></a>
				</div>
			</div>

			<!-- Col 2: Apothecary -->
			<div>
				<div class="footer-heading"><?php esc_html_e( 'Apothecary', 'mehandibysana' ); ?></div>
				<ul class="footer-links">
					<li><a href="<?php echo esc_url( mbs_get_shop_url() ); ?>"><?php esc_html_e( 'All Botanicals', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( add_query_arg( 'category', 'organic-henna', mbs_get_shop_url() ) ); ?>"><?php esc_html_e( 'Organic Henna Cones', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( add_query_arg( 'category', 'henna-kits-combos', mbs_get_shop_url() ) ); ?>"><?php esc_html_e( 'Bridal & Self-Care Kits', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( add_query_arg( 'category', 'henna-care-essential-oils', mbs_get_shop_url() ) ); ?>"><?php esc_html_e( 'Essential Oils & Care', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( add_query_arg( 'category', 'mehandi-tools-supplies', mbs_get_shop_url() ) ); ?>"><?php esc_html_e( 'Artist Supplies', 'mehandibysana' ); ?></a></li>
				</ul>
			</div>

			<!-- Col 3: Atelier -->
			<div>
				<div class="footer-heading"><?php esc_html_e( 'Studio', 'mehandibysana' ); ?></div>
				<ul class="footer-links">
					<li><a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'services', '/services/' ) ); ?>"><?php esc_html_e( 'Bridal Services', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'gallery', '/gallery/' ) ); ?>"><?php esc_html_e( 'Stain Gallery', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'about', '/about/' ) ); ?>"><?php esc_html_e( 'Our Craft Story', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'contact', '/contact/' ) ); ?>"><?php esc_html_e( 'Book a Date', 'mehandibysana' ); ?></a></li>
				</ul>
			</div>

			<!-- Col 4: Concierge & Support -->
			<div>
				<div class="footer-heading"><?php esc_html_e( 'Orders & Concierge', 'mehandibysana' ); ?></div>
				<ul class="footer-links">
					<li><a href="<?php echo esc_url( mbs_get_track_order_url() ); ?>"><?php esc_html_e( 'Track Your Order', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( mbs_get_cart_url() ); ?>"><?php esc_html_e( 'Atelier Bag', 'mehandibysana' ); ?></a></li>
					<li><a href="tel:<?php echo esc_attr( preg_replace( '/\s+/', '', $studio_phone ) ); ?>"><?php echo esc_html( $studio_phone ); ?></a></li>
					<li><a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'terms-conditions', '/terms-conditions/' ) ); ?>"><?php esc_html_e( 'Terms & Conditions', 'mehandibysana' ); ?></a></li>
					<li><a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'privacy-policy', '/privacy-policy/' ) ); ?>"><?php esc_html_e( 'Privacy Policy', 'mehandibysana' ); ?></a></li>
				</ul>
			</div>
		</div>

		<div class="footer-bottom">
			<div>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php esc_html_e( 'Mehandi by Sana Atelier · Handcrafted in Kashmir.', 'mehandibysana' ); ?></div>
			<div><?php esc_html_e( '100% Chemical-Free · Zero PPD · Small-Batch Fresh', 'mehandibysana' ); ?></div>
		</div>
	</div>
</footer>

<?php get_template_part( 'template-parts/bag-drawer' ); ?>

<?php wp_footer(); ?>
</body>
</html>

