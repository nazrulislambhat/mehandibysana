<?php
/**
 * Homepage Featured Products Bento Grid with 3 Curated Tabs
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$all_products = array();
if ( function_exists( 'wc_get_products' ) ) {
	$all_products = wc_get_products(
		array(
			'status'  => 'publish',
			'limit'   => 30,
			'orderby' => 'menu_order date',
			'order'   => 'ASC',
		)
	);
}

// Organize products cleanly into 3 tabs
$normalized = array();
foreach ( $all_products as $wc_p ) {
	$n = mbs_normalize_wc_product( $wc_p );
	if ( $n ) {
		$normalized[] = $n;
	}
}

$tab_signature = array_slice( $normalized, 0, 5 );

$tab_ready = array_values(
	array_filter(
		$normalized,
		function ( $p ) {
			return ! empty( $p['inStock'] );
		}
	)
);
$tab_ready = array_slice( $tab_ready, 0, 5 );

$tab_kits = array_values(
	array_filter(
		$normalized,
		function ( $p ) {
			$txt = strtolower( $p['slug'] . ' ' . $p['name'] );
			return str_contains( $txt, 'kit' ) || str_contains( $txt, 'oil' ) || str_contains( $txt, 'balm' ) || str_contains( $txt, 'sealant' );
		}
	)
);
if ( empty( $tab_kits ) ) {
	$tab_kits = array_slice( $normalized, 0, 5 );
} else {
	$tab_kits = array_slice( $tab_kits, 0, 5 );
}

$tabs = array(
	'signature' => array(
		'label' => __( 'Signature Batch', 'mehandibysana' ),
		'items' => $tab_signature,
	),
	'ready'     => array(
		'label' => __( 'Ready to Ship', 'mehandibysana' ),
		'items' => $tab_ready,
	),
	'kits'      => array(
		'label' => __( 'Bridal Kits & Oils', 'mehandibysana' ),
		'items' => $tab_kits,
	),
);
?>
<section class="section-pad hairline-rule surface-linen" data-mbs-featured-tabs>
	<div class="editorial-container">
		<div class="mbs-section-header reveal-fade-block">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Small-Batch Apothecary', 'mehandibysana' ); ?></span>
				<h2 class="mbs-section-title"><?php esc_html_e( 'Hand-Rolled Daily in Srinagar', 'mehandibysana' ); ?></h2>
			</div>

			<div class="mbs-tab-bar" role="tablist" aria-label="<?php esc_attr_e( 'Curated Collections', 'mehandibysana' ); ?>">
				<?php $idx = 0; foreach ( $tabs as $tkey => $tdata ) : ?>
					<button
						type="button"
						role="tab"
						aria-selected="<?php echo 0 === $idx ? 'true' : 'false'; ?>"
						class="mbs-tab-btn <?php echo 0 === $idx ? 'is-active' : ''; ?>"
						data-mbs-tab-target="<?php echo esc_attr( $tkey ); ?>"
					>
						<?php echo esc_html( $tdata['label'] ); ?>
					</button>
				<?php ++$idx; endforeach; ?>
			</div>
		</div>

		<?php if ( empty( $normalized ) ) : ?>
			<!-- Graceful Empty Catalog Prompt before admin adds WooCommerce products -->
			<div style="background:var(--color-bg);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:2.75rem;text-align:center;">
				<span class="eyebrow"><?php esc_html_e( 'Apothecary Shelves Ready', 'mehandibysana' ); ?></span>
				<h3 style="font-size:2rem;margin-top:0.5rem;"><?php esc_html_e( 'Add Products in WooCommerce to Populate', 'mehandibysana' ); ?></h3>
				<p style="margin:0.75rem auto 1.5rem;max-width:34rem;color:var(--color-text-muted);">
					<?php esc_html_e( 'Once WooCommerce is active and products are published, this Bento Showcase automatically renders your Signature Batch flagship, Ready-to-Ship items, and Bridal Kits.', 'mehandibysana' ); ?>
				</p>
				<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-ink"><?php esc_html_e( 'Visit Shop Archive →', 'mehandibysana' ); ?></a>
			</div>
		<?php else : ?>
			<?php $idx = 0; foreach ( $tabs as $tkey => $tdata ) :
				$items    = $tdata['items'];
				$flagship = ! empty( $items[0] ) ? $items[0] : null;
				$rest     = array_slice( $items, 1, 4 );
				?>
				<div class="mbs-bento-panel <?php echo 0 === $idx ? 'is-active' : ''; ?>" data-mbs-tab-panel="<?php echo esc_attr( $tkey ); ?>">
					<div class="mbs-bento-grid">
						<!-- Left Flagship Card (Ink Black #111111) -->
						<?php if ( $flagship ) :
							$f_img = ! empty( $flagship['images'][0] ) ? $flagship['images'][0] : null;
							?>
							<article class="mbs-flagship-card">
								<div>
									<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.1rem;">
										<span class="eyebrow" style="color:var(--color-accent);"><?php esc_html_e( 'Flagship Batch', 'mehandibysana' ); ?></span>
										<span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.14em;color:rgba(252,238,227,0.65);">
											<?php echo esc_html( $flagship['categories'][0]['name'] ?? 'Botanical' ); ?>
										</span>
									</div>

									<a href="<?php echo esc_url( $flagship['permalink'] ); ?>" class="mbs-flagship-media" style="display:block;">
										<?php if ( $f_img ) : ?>
											<img src="<?php echo esc_url( $f_img['src'] ); ?>" alt="<?php echo esc_attr( $f_img['alt'] ?: $flagship['name'] ); ?>" loading="lazy" />
										<?php else : ?>
											<?php echo mbs_svg_plate_artwork( 'bridal-mandala' ); ?>
										<?php endif; ?>
									</a>

									<h3 style="font-size:2rem;color:var(--color-text-inverse);">
										<a href="<?php echo esc_url( $flagship['permalink'] ); ?>"><?php echo esc_html( $flagship['name'] ); ?></a>
									</h3>
									<p style="margin-top:0.65rem;font-size:0.9375rem;color:rgba(252,238,227,0.74);line-height:1.6;">
										<?php echo esc_html( $flagship['cleanNote'] ); ?>
									</p>
								</div>

								<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:1.75rem;padding-top:1.25rem;border-top:1px solid rgba(252,238,227,0.16);">
									<div>
										<div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.14em;color:rgba(252,238,227,0.55);"><?php esc_html_e( 'Studio Price', 'mehandibysana' ); ?></div>
										<div style="font-size:1.35rem;font-weight:600;color:var(--color-text-inverse);"><?php echo esc_html( $flagship['priceDisplay'] ); ?></div>
									</div>
									<a href="<?php echo esc_url( $flagship['permalink'] ); ?>" class="mbs-btn mbs-btn-primary mbs-btn-sm">
										<?php esc_html_e( 'Inspect & Select →', 'mehandibysana' ); ?>
									</a>
								</div>
							</article>
						<?php endif; ?>

						<!-- Right 2x2 Grid -->
						<div class="mbs-bento-subgrid">
							<?php foreach ( $rest as $sub_item ) :
								get_template_part( 'template-parts/product-card', null, array( 'product' => $sub_item ) );
							endforeach; ?>
						</div>
					</div>
				</div>
			<?php ++$idx; endforeach; ?>
		<?php endif; ?>

		<div style="margin-top:2.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
			<p style="font-size:0.875rem;color:var(--color-text-muted);">
				<?php esc_html_e( 'Every cone is prepared with triple-sifted Sojat henna, zero PPD, and dispatched fresh from Srinagar.', 'mehandibysana' ); ?>
			</p>
			<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-secondary">
				<?php esc_html_e( 'Browse All Studio Items →', 'mehandibysana' ); ?>
			</a>
		</div>
	</div>
</section>

