<?php
/**
 * WooCommerce Cart Override — 2-Column Bag Ledger & Ink Black Summary Dossier
 *
 * @package MehandiBySana
 */

defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_before_cart' );

if ( WC()->cart->is_empty() ) :
	?>
	<div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:3.5rem 1.5rem;text-align:center;max-width:40rem;margin:0 auto;">
		<div style="display:flex;justify-content:center;margin-bottom:1.25rem;"><?php echo mbs_svg_empty_cart(); ?></div>
		<h2 style="font-size:2rem;"><?php esc_html_e( 'Your Shopping Bag Is Currently Empty', 'mehandibysana' ); ?></h2>
		<p style="margin:0.75rem auto 1.75rem;color:var(--color-text-muted);max-width:28rem;">
			<?php esc_html_e( 'Explore our daily batches of freshly hand-rolled Sojat organic cones, hair henna powder, and essential aftercare oils.', 'mehandibysana' ); ?>
		</p>
		<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-primary">
			<?php esc_html_e( 'Explore Apothecary Shop →', 'mehandibysana' ); ?>
		</a>
	</div>
	<?php
	do_action( 'woocommerce_after_cart' );
	return;
endif;
?>

<div class="mbs-ledger-grid">
	<!-- Left Column: WooCommerce Cart Items Form -->
	<form class="woocommerce-cart-form" action="<?php echo esc_url( wc_get_cart_url() ); ?>" method="post">
		<?php do_action( 'woocommerce_before_cart_table' ); ?>

		<div style="border:1px solid var(--color-border);border-radius:var(--radius-xl);overflow:hidden;background:var(--color-bg);">
			<?php do_action( 'woocommerce_before_cart_contents' ); ?>

			<?php
			foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) :
				$_product   = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
				$product_id = apply_filters( 'woocommerce_cart_item_product_id', $cart_item['product_id'], $cart_item, $cart_item_key );

				if ( $_product && $_product->exists() && $cart_item['quantity'] > 0 && apply_filters( 'woocommerce_cart_item_visible', true, $cart_item, $cart_item_key ) ) :
					$product_permalink = apply_filters( 'woocommerce_cart_item_permalink', $_product->is_visible() ? $_product->get_permalink( $cart_item ) : '', $cart_item, $cart_item_key );
					$thumb_id          = $_product->get_image_id();
					$thumb_url         = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'medium' ) : '';
					?>
					<div class="woocommerce-cart-form__cart-item" style="display:flex;flex-wrap:wrap;gap:1.15rem;align-items:center;padding:1.25rem;border-bottom:1px solid var(--color-border);">
						<a href="<?php echo esc_url( $product_permalink ); ?>" class="mbs-bag-thumb" style="width:84px;height:84px;">
							<?php if ( $thumb_url ) : ?>
								<img src="<?php echo esc_url( $thumb_url ); ?>" alt="<?php echo esc_attr( $_product->get_name() ); ?>" />
							<?php else : ?>
								<?php echo mbs_svg_plate_artwork( 'bridal-mandala', 'mbs-plate-fallback' ); ?>
							<?php endif; ?>
						</a>

						<div style="flex:1;min-width:180px;">
							<h3 style="font-size:1.25rem;">
								<a href="<?php echo esc_url( $product_permalink ); ?>"><?php echo wp_kses_post( $_product->get_name() ); ?></a>
							</h3>
							<div style="font-size:0.82rem;color:var(--color-text-muted);margin-top:3px;">
								<?php echo wc_get_formatted_cart_item_data( $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
							</div>
							<div style="font-size:0.875rem;color:var(--color-ink);margin-top:4px;font-weight:500;">
								<?php echo wp_kses_post( WC()->cart->get_product_price( $_product ) ); ?> <?php esc_html_e( 'each', 'mehandibysana' ); ?>
							</div>
						</div>

						<div style="display:flex;align-items:center;gap:1rem;">
							<div style="width:72px;">
								<?php
								if ( $_product->is_sold_individually() ) {
									$product_quantity = sprintf( '1 <input type="hidden" name="cart[%s][qty]" value="1" />', $cart_item_key );
								} else {
									$product_quantity = woocommerce_quantity_input(
										array(
											'input_name'   => "cart[{$cart_item_key}][qty]",
											'input_value'  => $cart_item['quantity'],
											'max_value'    => $_product->get_max_purchase_quantity(),
											'min_value'    => '0',
											'product_name' => $_product->get_name(),
										),
										$_product,
										false
									);
								}
								echo apply_filters( 'woocommerce_cart_item_quantity', $product_quantity, $cart_item_key, $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								?>
							</div>

							<div style="min-width:85px;text-align:right;font-weight:700;">
								<?php echo wp_kses_post( apply_filters( 'woocommerce_cart_item_subtotal', WC()->cart->get_product_subtotal( $_product, $cart_item['quantity'] ), $cart_item, $cart_item_key ) ); ?>
							</div>

							<a
								href="<?php echo esc_url( wc_get_cart_remove_url( $cart_item_key ) ); ?>"
								aria-label="<?php esc_attr_e( 'Remove item', 'mehandibysana' ); ?>"
								style="color:var(--color-text-muted);font-size:0.82rem;text-decoration:underline;"
							>
								<?php esc_html_e( 'Remove', 'mehandibysana' ); ?>
							</a>
						</div>
					</div>
				<?php endif;
			endforeach;
			?>

			<?php do_action( 'woocommerce_cart_contents' ); ?>

			<div style="padding:1.25rem;display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:center;background:var(--color-surface);">
				<?php if ( wc_coupons_enabled() ) : ?>
					<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
						<input type="text" name="coupon_code" class="mbs-pin-input" id="coupon_code" value="" placeholder="<?php esc_attr_e( 'Coupon code', 'mehandibysana' ); ?>" style="font-family:var(--font-sans);letter-spacing:0;" />
						<button type="submit" class="mbs-btn mbs-btn-secondary mbs-btn-sm" name="apply_coupon" value="<?php esc_attr_e( 'Apply coupon', 'mehandibysana' ); ?>"><?php esc_html_e( 'Apply Coupon', 'mehandibysana' ); ?></button>
					</div>
				<?php endif; ?>

				<button type="submit" class="mbs-btn mbs-btn-ink mbs-btn-sm" name="update_cart" value="<?php esc_attr_e( 'Update cart', 'mehandibysana' ); ?>">
					<?php esc_html_e( 'Update Bag', 'mehandibysana' ); ?>
				</button>

				<?php do_action( 'woocommerce_cart_actions' ); ?>
				<?php wp_nonce_field( 'woocommerce-cart', 'woocommerce-cart-nonce' ); ?>
			</div>

			<?php do_action( 'woocommerce_after_cart_contents' ); ?>
		</div>

		<?php do_action( 'woocommerce_after_cart_table' ); ?>
	</form>

	<!-- Right Column: PIN Checker & Ink Black Receipt Dossier -->
	<aside style="display:flex;flex-direction:column;gap:1.25rem;">
		<?php get_template_part( 'template-parts/pincode-checker', null, array( 'compact' => false ) ); ?>

		<div class="mbs-dossier-ink">
			<span class="eyebrow" style="color:var(--color-accent);"><?php esc_html_e( 'Order Receipt Summary', 'mehandibysana' ); ?></span>
			<h2 style="font-size:1.85rem;margin-top:0.35rem;margin-bottom:1.25rem;"><?php esc_html_e( 'Bag Totals', 'mehandibysana' ); ?></h2>

			<div style="display:flex;justify-content:space-between;padding:0.65rem 0;border-bottom:1px solid rgba(252,238,227,0.14);font-size:0.9rem;">
				<span style="opacity:0.78;"><?php esc_html_e( 'Subtotal', 'mehandibysana' ); ?></span>
				<span><?php wc_cart_totals_subtotal_html(); ?></span>
			</div>

			<?php foreach ( WC()->cart->get_coupons() as $code => $coupon ) : ?>
				<div style="display:flex;justify-content:space-between;padding:0.65rem 0;border-bottom:1px solid rgba(252,238,227,0.14);font-size:0.9rem;">
					<span><?php wc_cart_totals_coupon_label( $coupon ); ?></span>
					<span><?php wc_cart_totals_coupon_html( $coupon ); ?></span>
				</div>
			<?php endforeach; ?>

			<div style="display:flex;justify-content:space-between;padding:0.65rem 0;border-bottom:1px solid rgba(252,238,227,0.14);font-size:0.9rem;">
				<span style="opacity:0.78;"><?php esc_html_e( 'PIN Delivery Charge', 'mehandibysana' ); ?></span>
				<span><?php echo wp_kses_post( WC()->cart->get_cart_shipping_total() ); ?></span>
			</div>

			<div style="display:flex;justify-content:space-between;align-items:baseline;padding:1.15rem 0;font-size:1.25rem;font-weight:700;">
				<span style="font-family:var(--font-serif);font-size:1.45rem;font-weight:500;"><?php esc_html_e( 'Total', 'mehandibysana' ); ?></span>
				<span><?php wc_cart_totals_order_total_html(); ?></span>
			</div>

			<a href="<?php echo esc_url( wc_get_checkout_url() ); ?>" class="mbs-btn mbs-btn-primary mbs-btn-lg" style="width:100%;">
				<?php esc_html_e( 'Proceed to Checkout →', 'mehandibysana' ); ?>
			</a>
			<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-inverse-outline mbs-btn-sm" style="width:100%;margin-top:0.65rem;">
				<?php esc_html_e( 'Continue Shopping', 'mehandibysana' ); ?>
			</a>
		</div>
	</aside>
</div>

<?php do_action( 'woocommerce_after_cart' ); ?>

