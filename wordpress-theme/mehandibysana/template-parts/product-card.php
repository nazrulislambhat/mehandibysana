<?php
/**
 * Reusable Botanical Atelier Product Card
 * Accepts `$args['product']` (WC_Product or already normalized array).
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$raw = $args['product'] ?? null;
if ( $raw instanceof WC_Product ) {
	$item = mbs_normalize_wc_product( $raw );
} elseif ( is_array( $raw ) ) {
	$item = $raw;
} else {
	return;
}

if ( ! $item ) {
	return;
}

$first_img = ! empty( $item['images'][0] ) ? $item['images'][0] : null;
$badge     = '';
$badge_cls = '';
if ( empty( $item['inStock'] ) ) {
	$badge     = __( 'Out of Stock', 'mehandibysana' );
	$badge_cls = 'is-muted';
} elseif ( ! empty( $item['onSale'] ) ) {
	$badge     = __( 'Sale', 'mehandibysana' );
	$badge_cls = 'is-accent';
} elseif ( ! empty( $item['categories'][0]['name'] ) ) {
	$badge = $item['categories'][0]['name'];
}

$default_var_id = 0;
if ( ! empty( $item['variations'] ) ) {
	foreach ( $item['variations'] as $v ) {
		if ( ! empty( $v['inStock'] ) ) {
			$default_var_id = (int) $v['id'];
			break;
		}
	}
}
?>
<article class="mbs-product-card">
	<a href="<?php echo esc_url( $item['permalink'] ); ?>" class="mbs-product-media" aria-label="<?php echo esc_attr( $item['name'] ); ?>">
		<?php if ( $badge ) : ?>
			<span class="mbs-card-badge <?php echo esc_attr( $badge_cls ); ?>"><?php echo esc_html( $badge ); ?></span>
		<?php endif; ?>

		<?php if ( $first_img ) : ?>
			<img src="<?php echo esc_url( $first_img['src'] ); ?>" alt="<?php echo esc_attr( $first_img['alt'] ?: $item['name'] ); ?>" loading="lazy" />
		<?php else : ?>
			<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:var(--color-surface);">
				<?php echo mbs_svg_plate_artwork( 'bridal-mandala', 'mbs-plate-fallback' ); ?>
			</div>
		<?php endif; ?>
	</a>

	<div class="mbs-product-body">
		<h3 class="mbs-product-title">
			<a href="<?php echo esc_url( $item['permalink'] ); ?>"><?php echo esc_html( $item['name'] ); ?></a>
		</h3>
		<p class="mbs-product-note"><?php echo esc_html( $item['cleanNote'] ); ?></p>

		<div class="mbs-product-footer">
			<div>
				<?php if ( ! empty( $item['regularPrice'] ) && $item['regularPrice'] > $item['price'] ) : ?>
					<span style="font-size:0.78rem;color:var(--color-text-muted);text-decoration:line-through;margin-right:6px;">
						<?php echo esc_html( mbs_format_inr( $item['regularPrice'], $item['currencySymbol'] ) ); ?>
					</span>
				<?php endif; ?>
				<span class="mbs-price-val"><?php echo esc_html( $item['priceDisplay'] ); ?></span>
			</div>

			<?php if ( empty( $item['inStock'] ) ) : ?>
				<a href="<?php echo esc_url( $item['permalink'] ); ?>" class="mbs-btn mbs-btn-secondary mbs-btn-sm">
					<?php esc_html_e( 'Details', 'mehandibysana' ); ?>
				</a>
			<?php elseif ( 'variable' === $item['type'] && count( $item['variations'] ) > 1 ) : ?>
				<a href="<?php echo esc_url( $item['permalink'] ); ?>" class="mbs-btn mbs-btn-ink mbs-btn-sm">
					<?php esc_html_e( 'Select Option', 'mehandibysana' ); ?>
				</a>
			<?php else : ?>
				<button
					type="button"
					class="mbs-btn mbs-btn-primary mbs-btn-sm"
					data-mbs-add-to-bag
					data-product-id="<?php echo (int) $item['id']; ?>"
					data-variation-id="<?php echo (int) $default_var_id; ?>"
					data-quantity="1"
				>
					<?php esc_html_e( '+ Add', 'mehandibysana' ); ?>
				</button>
			<?php endif; ?>
		</div>
	</div>
</article>

