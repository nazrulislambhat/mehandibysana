<?php
/**
 * WooCommerce Single Product Page — 6/6 Gallery + Interactive Variant Selector + PIN Checker + Companion Botanicals
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();
	global $product;
	if ( ! $product instanceof WC_Product ) {
		$product = wc_get_product( get_the_ID() );
	}
	$norm = mbs_normalize_wc_product( $product );
	if ( ! $norm ) {
		continue;
	}

	$images     = $norm['images'];
	$first_img  = ! empty( $images[0] ) ? $images[0] : null;
	$companions = mbs_pick_companion_products( $product, 3 );
	$care_note  = mbs_get_product_care_note( $product );

	$default_var_id = 0;
	if ( ! empty( $norm['variations'] ) ) {
		foreach ( $norm['variations'] as $v ) {
			if ( ! empty( $v['inStock'] ) ) {
				$default_var_id = (int) $v['id'];
				break;
			}
		}
		if ( ! $default_var_id ) {
			$default_var_id = (int) $norm['variations'][0]['id'];
		}
	}
	?>

	<section class="section-pad surface-bg" style="padding-top:2.5rem;">
		<div class="editorial-container">
			<!-- Clean Breadcrumb -->
			<nav aria-label="<?php esc_attr_e( 'Breadcrumb', 'mehandibysana' ); ?>" style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:1.75rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'mehandibysana' ); ?></a>
				<span>/</span>
				<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>"><?php esc_html_e( 'Shop', 'mehandibysana' ); ?></a>
				<?php if ( ! empty( $norm['categories'][0] ) ) : ?>
					<span>/</span>
					<a href="<?php echo esc_url( add_query_arg( 'category', $norm['categories'][0]['slug'], mbs_get_shop_url() ) ); ?>">
						<?php echo esc_html( $norm['categories'][0]['name'] ); ?>
					</a>
				<?php endif; ?>
				<span>/</span>
				<span style="color:var(--color-ink);font-weight:500;"><?php echo esc_html( $norm['name'] ); ?></span>
			</nav>

			<div class="mbs-pdp-grid">
				<!-- Left Column: Product Gallery -->
				<div data-mbs-pdp-gallery>
					<div class="mbs-pdp-main-frame">
						<?php if ( $first_img ) : ?>
							<img id="mbs-pdp-main-img" src="<?php echo esc_url( $first_img['src'] ); ?>" alt="<?php echo esc_attr( $first_img['alt'] ?: $norm['name'] ); ?>" />
						<?php else : ?>
							<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:2rem;">
								<?php echo mbs_svg_plate_artwork( 'bridal-mandala', 'mbs-plate-fallback' ); ?>
							</div>
						<?php endif; ?>
					</div>

					<?php if ( count( $images ) > 1 ) : ?>
						<div class="mbs-pdp-thumbs">
							<?php foreach ( $images as $idx => $im ) : ?>
								<button
									type="button"
									class="mbs-pdp-thumb <?php echo 0 === $idx ? 'is-active' : ''; ?>"
									data-src="<?php echo esc_url( $im['src'] ); ?>"
									data-alt="<?php echo esc_attr( $im['alt'] ); ?>"
									aria-label="<?php printf( esc_attr__( 'View image %d', 'mehandibysana' ), $idx + 1 ); ?>"
								>
									<img src="<?php echo esc_url( $im['src'] ); ?>" alt="" />
								</button>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
				</div>

				<!-- Right Column: Variant Buybox, PIN Checker & Details -->
				<div
					data-mbs-pdp-buybox
					data-variations="<?php echo ! empty( $norm['variations'] ) ? esc_attr( wp_json_encode( $norm['variations'] ) ) : ''; ?>"
				>
					<?php if ( ! empty( $norm['categories'][0]['name'] ) ) : ?>
						<span class="eyebrow"><?php echo esc_html( $norm['categories'][0]['name'] ); ?></span>
					<?php endif; ?>

					<h1 style="font-size:clamp(2.15rem,4vw,3rem);margin-top:0.5rem;color:var(--color-ink);">
						<?php echo esc_html( $norm['name'] ); ?>
					</h1>

					<!-- Price & Stock Bar -->
					<div style="display:flex;align-items:baseline;gap:12px;margin-top:0.9rem;flex-wrap:wrap;">
						<span id="mbs-pdp-price" style="font-size:1.6rem;font-weight:700;color:var(--color-ink);">
							<?php echo esc_html( $norm['priceDisplay'] ); ?>
						</span>
						<span
							id="mbs-pdp-reg-price"
							style="font-size:1rem;color:var(--color-text-muted);text-decoration:line-through;<?php echo ( ! empty( $norm['regularPrice'] ) && $norm['regularPrice'] > $norm['price'] ) ? '' : 'display:none;'; ?>"
						>
							<?php echo ! empty( $norm['regularPrice'] ) ? esc_html( mbs_format_inr( $norm['regularPrice'], $norm['currencySymbol'] ) ) : ''; ?>
						</span>
						<span
							id="mbs-pdp-stock-pill"
							style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:<?php echo $norm['inStock'] ? 'var(--color-accent)' : 'var(--color-error)'; ?>;"
						>
							<?php echo $norm['inStock'] ? esc_html__( 'In Stock · Fresh Batch', 'mehandibysana' ) : esc_html__( 'Out of Stock', 'mehandibysana' ); ?>
						</span>
					</div>

					<?php if ( $norm['sku'] ) : ?>
						<div id="mbs-pdp-sku" style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;font-family:var(--font-mono);">
							SKU: <?php echo esc_html( $norm['sku'] ); ?>
						</div>
					<?php else : ?>
						<div id="mbs-pdp-sku" style="font-size:0.75rem;color:var(--color-text-muted);margin-top:4px;font-family:var(--font-mono);"></div>
					<?php endif; ?>

					<p style="margin-top:1.15rem;color:var(--color-text-muted);font-size:0.975rem;line-height:1.68;">
						<?php echo esc_html( $norm['shortDescription'] ?: $norm['cleanNote'] ); ?>
					</p>

					<!-- Dynamic Variable Attributes Picker -->
					<?php if ( ! empty( $norm['attributes'] ) ) : ?>
						<?php foreach ( $norm['attributes'] as $attr ) : ?>
							<div class="mbs-variant-group" data-mbs-attr-key="<?php echo esc_attr( $attr['key'] ); ?>">
								<div class="eyebrow eyebrow-muted" style="font-size:0.7rem;"><?php echo esc_html( $attr['name'] ); ?></div>
								<div class="mbs-variant-options">
									<?php foreach ( $attr['options'] as $o_idx => $opt_label ) : ?>
										<button
											type="button"
											class="mbs-variant-pill <?php echo 0 === $o_idx ? 'is-selected' : ''; ?>"
											data-mbs-attr-val="<?php echo esc_attr( $opt_label ); ?>"
										>
											<?php echo esc_html( $opt_label ); ?>
										</button>
									<?php endforeach; ?>
								</div>
							</div>
						<?php endforeach; ?>
					<?php endif; ?>

					<!-- Quantity & Add to Bag -->
					<div style="display:flex;gap:0.85rem;margin-top:1.75rem;flex-wrap:wrap;align-items:center;">
						<div class="mbs-qty-stepper">
							<button type="button" data-mbs-qty-step="-1" aria-label="<?php esc_attr_e( 'Decrease quantity', 'mehandibysana' ); ?>">&minus;</button>
							<span id="mbs-pdp-qty-val">1</span>
							<button type="button" data-mbs-qty-step="1" aria-label="<?php esc_attr_e( 'Increase quantity', 'mehandibysana' ); ?>">+</button>
						</div>

						<button
							type="button"
							id="mbs-pdp-add-btn"
							class="mbs-btn mbs-btn-primary mbs-btn-lg"
							style="flex:1;min-width:210px;"
							data-mbs-add-to-bag
							data-product-id="<?php echo (int) $norm['id']; ?>"
							data-variation-id="<?php echo (int) $default_var_id; ?>"
							data-quantity="1"
							<?php disabled( empty( $norm['inStock'] ) ); ?>
						>
							<?php
							if ( empty( $norm['inStock'] ) ) {
								esc_html_e( 'Currently Out of Stock', 'mehandibysana' );
							} else {
								printf( esc_html__( 'Add to Bag — %s', 'mehandibysana' ), esc_html( mbs_format_inr( $norm['price'], $norm['currencySymbol'] ) ) );
							}
							?>
						</button>
					</div>

					<!-- Inline PIN Code Estimator -->
					<div style="margin-top:1.5rem;">
						<?php get_template_part( 'template-parts/pincode-checker', null, array( 'compact' => false ) ); ?>
					</div>

					<!-- Product Dossier Accordions -->
					<div class="mbs-pdp-accordion">
						<details open>
							<summary>
								<span><?php esc_html_e( 'Botanical Details & Description', 'mehandibysana' ); ?></span>
								<span aria-hidden="true">+</span>
							</summary>
							<div style="padding-top:0.75rem;font-size:0.9rem;color:var(--color-text-muted);line-height:1.68;">
								<?php
								$full_desc = apply_filters( 'the_content', $product->get_description() );
								echo $full_desc ? wp_kses_post( $full_desc ) : '<p>' . esc_html( $norm['cleanNote'] ) . '</p>';
								?>
							</div>
						</details>

						<details>
							<summary>
								<span><?php esc_html_e( 'Freshness Storage & Handling Ritual', 'mehandibysana' ); ?></span>
								<span aria-hidden="true">+</span>
							</summary>
							<div style="padding-top:0.75rem;font-size:0.9rem;color:var(--color-text-muted);line-height:1.68;">
								<p><?php echo esc_html( $care_note ); ?></p>
							</div>
						</details>

						<details>
							<summary>
								<span><?php esc_html_e( 'Srinagar Dispatch & Cold-Safe Packing', 'mehandibysana' ); ?></span>
								<span aria-hidden="true">+</span>
							</summary>
							<div style="padding-top:0.75rem;font-size:0.9rem;color:var(--color-text-muted);line-height:1.68;">
								<p><?php esc_html_e( 'Prepared daily in Baghat Barzullah, Srinagar. Delivered in 1–2 business days across Kashmir Valley & Ladakh (PIN 19*), 3–4 days to North metros (PIN 11*, 12*, 14*, 20*), and 4–6 days Pan-India.', 'mehandibysana' ); ?></p>
							</div>
						</details>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Companion Botanicals -->
	<?php if ( ! empty( $companions ) ) : ?>
		<section class="section-pad surface-linen hairline-rule">
			<div class="editorial-container">
				<div class="mbs-section-header">
					<div>
						<span class="eyebrow"><?php esc_html_e( 'Pair With Your Ritual', 'mehandibysana' ); ?></span>
						<h2 class="mbs-section-title"><?php esc_html_e( 'Companion Botanicals', 'mehandibysana' ); ?></h2>
					</div>
					<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-secondary mbs-btn-sm"><?php esc_html_e( 'Browse All →', 'mehandibysana' ); ?></a>
				</div>
				<div class="mbs-shop-grid">
					<?php foreach ( $companions as $comp ) :
						get_template_part( 'template-parts/product-card', null, array( 'product' => $comp ) );
					endforeach; ?>
				</div>
			</div>
		</section>
	<?php endif; ?>

	<?php
endwhile;

get_footer();

