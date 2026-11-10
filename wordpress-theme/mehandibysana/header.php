<?php
/**
 * Mehandi by Sana — Global Header, Desktop Pill Nav, Shop Mega Menu & Mobile Navigation
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$nav_items   = mbs_get_nav_items();
$collections = mbs_get_shop_collections();
$active_key  = mbs_get_active_nav_key();
$bag_data    = function_exists( 'mbs_get_normalized_bag' ) ? mbs_get_normalized_bag() : array( 'itemsCount' => 0 );
$bag_count   = (int) ( $bag_data['itemsCount'] ?? 0 );
$first_nav   = $nav_items[0];
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a href="#main-content" class="skip-to-content"><?php esc_html_e( 'Skip to main content', 'mehandibysana' ); ?></a>

<!-- Route Transition Top Progress Bar -->
<div id="mbs-route-bar" aria-hidden="true"></div>

<header class="site-header" role="banner">
	<div class="editorial-container site-header-bar">
		<!-- Brand Wordmark -->
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="header-brand" aria-label="<?php esc_attr_e( 'Mehandi by Sana Home', 'mehandibysana' ); ?>">
			<?php if ( has_custom_logo() ) : ?>
				<?php the_custom_logo(); ?>
			<?php else : ?>
				<span class="header-brand-title">MEHANDI BY SANA</span>
				<span class="header-brand-sub">Srinagar &middot; Botanicals</span>
			<?php endif; ?>
		</a>

		<!-- Desktop Pill Navigation -->
		<nav class="desktop-nav-wrap" aria-label="<?php esc_attr_e( 'Primary Navigation', 'mehandibysana' ); ?>">
			<div class="desktop-nav-pill" data-mbs-desktop-nav>
				<span class="nav-hover-indicator" aria-hidden="true"></span>
				<?php foreach ( $nav_items as $item ) :
					$is_active = ( $active_key === $item['key'] );
					?>
					<div class="desktop-nav-item">
						<a
							href="<?php echo esc_url( $item['href'] ); ?>"
							class="desktop-nav-link <?php echo $is_active ? 'is-active' : ''; ?>"
							<?php echo $is_active ? 'aria-current="page"' : ''; ?>
						>
							<?php echo esc_html( $item['label'] ); ?>
						</a>
						<?php if ( 'shop' === $item['key'] ) : ?>
							<button
								type="button"
								class="desktop-shop-chevron"
								data-mbs-shop-toggle
								aria-expanded="false"
								aria-controls="mbs-shop-mega"
								aria-label="<?php esc_attr_e( 'Toggle Shop Categories', 'mehandibysana' ); ?>"
							>
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
									<path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</button>
						<?php endif; ?>
					</div>
				<?php endforeach; ?>
			</div>
		</nav>

		<!-- Right Utility Actions -->
		<div class="header-actions">
			<a href="<?php echo esc_url( mbs_get_track_order_url() ); ?>" class="header-track-link">
				<?php esc_html_e( 'Track Order', 'mehandibysana' ); ?>
			</a>

			<button
				type="button"
				class="cart-trigger-btn"
				data-mbs-open-bag
				aria-label="<?php esc_attr_e( 'Open shopping bag', 'mehandibysana' ); ?>"
			>
				<span><?php esc_html_e( 'Bag', 'mehandibysana' ); ?></span>
				<span
					class="cart-badge-pill <?php echo 0 === $bag_count ? 'is-empty' : ''; ?>"
					data-mbs-bag-badge
				><?php echo (int) $bag_count; ?></span>
			</button>

			<button
				type="button"
				class="mobile-menu-btn"
				data-mbs-menu-open
				aria-expanded="false"
				aria-controls="mbs-studio-menu"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M4 8h16M4 16h16" stroke-linecap="round" />
				</svg>
				<span><?php esc_html_e( 'Menu', 'mehandibysana' ); ?></span>
			</button>
		</div>
	</div>

	<!-- Dual-tone signature lower border (#111111 + #d9541e) -->
	<div class="header-dualtone-bar" aria-hidden="true">
		<span></span><span></span>
	</div>
</header>

<!-- Desktop Shop Apothecary Mega Panel -->
<div id="mbs-shop-mega" class="shop-mega-panel" aria-hidden="true">
	<div class="editorial-container shop-mega-grid">
		<div class="shop-mega-lead">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Small-Batch Botanical Apothecary', 'mehandibysana' ); ?></span>
				<h2 style="font-size:2.1rem;margin-top:0.5rem;"><?php esc_html_e( 'Small-Batch Botanicals', 'mehandibysana' ); ?></h2>
				<p style="margin-top:0.75rem;color:var(--color-text-muted);font-size:0.9375rem;line-height:1.65;">
					<?php esc_html_e( 'Hand-rolled daily with triple-sifted Sojat henna leaf, pure steam-distilled eucalyptus, and clove oil. Delivered across India with PIN zone shipping.', 'mehandibysana' ); ?>
				</p>
			</div>
			<div style="margin-top:1.5rem;display:flex;gap:0.75rem;align-items:center;">
				<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-primary mbs-btn-sm">
					<?php esc_html_e( 'Shop Full Collection →', 'mehandibysana' ); ?>
				</a>
				<a href="<?php echo esc_url( mbs_get_track_order_url() ); ?>" class="mbs-btn mbs-btn-secondary mbs-btn-sm">
					<?php esc_html_e( 'Track Parcel', 'mehandibysana' ); ?>
				</a>
			</div>
		</div>

		<div class="shop-mega-links">
			<?php foreach ( $collections as $col ) : ?>
				<a href="<?php echo esc_url( $col['href'] ); ?>" class="shop-mega-row">
					<div style="display:flex;align-items:baseline;gap:0.85rem;">
						<span class="eyebrow eyebrow-muted" style="font-size:0.68rem;"><?php echo esc_html( $col['index'] ); ?></span>
						<div>
							<div style="font-family:var(--font-serif);font-size:1.25rem;font-weight:600;color:var(--color-ink);">
								<?php echo esc_html( $col['title'] ); ?>
							</div>
							<div style="font-size:0.8rem;color:var(--color-text-muted);"><?php echo esc_html( $col['subtitle'] ); ?></div>
						</div>
					</div>
					<div style="display:flex;align-items:center;gap:0.65rem;">
						<?php if ( ! empty( $col['badge'] ) ) : ?>
							<span style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;padding:3px 9px;border-radius:999px;background:var(--color-surface);border:1px solid var(--color-border);">
								<?php echo esc_html( $col['badge'] ); ?>
							</span>
						<?php endif; ?>
						<span class="shop-mega-arrow" aria-hidden="true">&rarr;</span>
					</div>
				</a>
			<?php endforeach; ?>
		</div>
	</div>
</div>

<!-- Fullscreen Dark Mobile Navigation Overlay -->
<div id="mbs-studio-menu" aria-hidden="true" role="dialog" aria-label="<?php esc_attr_e( 'Mobile Navigation Menu', 'mehandibysana' ); ?>">
	<div class="editorial-container">
		<div class="studio-menu-header">
			<span class="header-brand-title">MEHANDI BY SANA</span>
			<button type="button" class="studio-menu-close" data-mbs-menu-close>
				<?php esc_html_e( 'Close ✕', 'mehandibysana' ); ?>
			</button>
		</div>

		<div class="studio-menu-list">
			<?php foreach ( $nav_items as $item ) :
				$is_active = ( $active_key === $item['key'] );
				?>
				<a
					href="<?php echo esc_url( $item['href'] ); ?>"
					class="studio-menu-link <?php echo $is_active ? 'is-active' : ''; ?>"
					data-eyebrow="<?php echo esc_attr( $item['eyebrow'] ); ?>"
					data-desc="<?php echo esc_attr( $item['description'] ); ?>"
				>
					<div style="display:flex;align-items:baseline;gap:1rem;">
						<span class="eyebrow" style="color:var(--color-accent);"><?php echo esc_html( $item['index'] ); ?></span>
						<span style="font-family:var(--font-serif);font-size:2.15rem;"><?php echo esc_html( $item['label'] ); ?></span>
					</div>
					<span style="font-size:0.8125rem;opacity:0.68;">&rarr;</span>
				</a>
			<?php endforeach; ?>
			<a href="<?php echo esc_url( mbs_get_track_order_url() ); ?>" class="studio-menu-link">
				<div style="display:flex;align-items:baseline;gap:1rem;">
					<span class="eyebrow" style="color:var(--color-accent);">06</span>
					<span style="font-family:var(--font-serif);font-size:1.75rem;"><?php esc_html_e( 'Track Your Order', 'mehandibysana' ); ?></span>
				</div>
				<span style="font-size:0.8125rem;opacity:0.68;">&rarr;</span>
			</a>
		</div>

		<div style="padding:1.25rem;border:1px solid rgba(252,238,227,0.14);border-radius:var(--radius-lg);background:rgba(255,255,255,0.03);margin-bottom:1.5rem;">
			<div class="eyebrow" data-mbs-preview-eyebrow><?php echo esc_html( $first_nav['eyebrow'] ); ?></div>
			<p data-mbs-preview-desc style="margin-top:0.45rem;font-size:0.875rem;color:rgba(252,238,227,0.75);line-height:1.55;">
				<?php echo esc_html( $first_nav['description'] ); ?>
			</p>
		</div>
	</div>

	<div class="editorial-container studio-menu-footer">
		<div style="display:flex;gap:0.65rem;flex-wrap:wrap;">
			<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-primary mbs-btn-sm"><?php esc_html_e( 'Shop Apothecary', 'mehandibysana' ); ?></a>
			<a href="<?php echo esc_url( mbs_get_page_url_by_slug( 'contact', '/contact/' ) ); ?>" class="mbs-btn mbs-btn-inverse-outline mbs-btn-sm"><?php esc_html_e( 'Book Bridal Date', 'mehandibysana' ); ?></a>
		</div>
		<a href="tel:<?php echo esc_attr( preg_replace( '/\s+/', '', mbs_get_studio_phone() ) ); ?>" style="font-size:0.8125rem;color:rgba(252,238,227,0.72);">
			<?php echo esc_html( mbs_get_studio_phone() ); ?>
		</a>
	</div>
</div>

<main id="main-content">

