<?php
/**
 * Slide-Over Shopping Bag Drawer (Synchronized live with WC()->cart via AJAX)
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div id="mbs-bag-backdrop" aria-hidden="true"></div>

<aside
	id="mbs-bag-drawer"
	aria-hidden="true"
	role="dialog"
	aria-label="<?php esc_attr_e( 'Shopping Bag Drawer', 'mehandibysana' ); ?>"
>
	<!-- Header -->
	<div class="mbs-drawer-head">
		<div>
			<span class="eyebrow"><?php esc_html_e( 'Dispatch Ledger', 'mehandibysana' ); ?></span>
			<div style="display:flex;align-items:baseline;gap:8px;margin-top:2px;">
				<h2 style="font-size:1.55rem;"><?php esc_html_e( 'Your Bag', 'mehandibysana' ); ?></h2>
				<span id="mbs-drawer-count-title" style="font-size:0.8125rem;color:var(--color-text-muted);">0 items</span>
			</div>
		</div>
		<button type="button" data-mbs-close-bag class="mbs-btn mbs-btn-secondary mbs-btn-sm">
			<?php esc_html_e( 'Close ✕', 'mehandibysana' ); ?>
		</button>
	</div>

	<!-- Body -->
	<div class="mbs-drawer-body">
		<!-- Empty state -->
		<div id="mbs-drawer-empty" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;flex:1;padding:2.5rem 1rem;gap:1rem;">
			<?php echo mbs_svg_empty_cart(); ?>
			<h3 style="font-size:1.55rem;"><?php esc_html_e( 'Your shopping bag is quiet', 'mehandibysana' ); ?></h3>
			<p style="font-size:0.875rem;color:var(--color-text-muted);max-width:260px;">
				<?php esc_html_e( 'Add freshly rolled organic henna cones, essential oils, or herbal hair henna from our daily batch.', 'mehandibysana' ); ?>
			</p>
			<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-primary mbs-btn-sm" data-mbs-close-bag>
				<?php esc_html_e( 'Explore Apothecary →', 'mehandibysana' ); ?>
			</a>
		</div>

		<!-- Dynamic Line Items -->
		<div id="mbs-drawer-items" style="display:none;flex-direction:column;gap:1rem;"></div>

		<!-- Compact PIN Code Estimator inside Drawer -->
		<div style="margin-top:auto;padding-top:0.5rem;">
			<?php get_template_part( 'template-parts/pincode-checker', null, array( 'compact' => true ) ); ?>
		</div>
	</div>

	<!-- Ink Black Receipt Dock -->
	<div id="mbs-drawer-dock" class="mbs-drawer-dock" style="display:none;">
		<div style="display:flex;justify-content:space-between;font-size:0.84rem;color:rgba(252,238,227,0.75);margin-bottom:6px;">
			<span><?php esc_html_e( 'Subtotal', 'mehandibysana' ); ?></span>
			<span id="mbs-drawer-subtotal">₹0</span>
		</div>
		<div style="display:flex;justify-content:space-between;font-size:0.84rem;color:rgba(252,238,227,0.75);margin-bottom:10px;">
			<span><?php esc_html_e( 'Dispatch Estimate', 'mehandibysana' ); ?></span>
			<span id="mbs-drawer-shipping"><?php esc_html_e( 'Calculated at checkout', 'mehandibysana' ); ?></span>
		</div>
		<div style="display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;border-top:1px solid rgba(252,238,227,0.16);margin-bottom:14px;">
			<span style="font-family:var(--font-serif);font-size:1.25rem;"><?php esc_html_e( 'Estimated Total', 'mehandibysana' ); ?></span>
			<span id="mbs-drawer-total" style="font-weight:700;font-size:1.125rem;color:var(--color-text-inverse);">₹0</span>
		</div>

		<div style="display:flex;flex-direction:column;gap:8px;">
			<a href="<?php echo esc_url( mbs_get_checkout_url() ); ?>" class="mbs-btn mbs-btn-primary" style="width:100%;">
				<?php esc_html_e( 'Proceed to Checkout →', 'mehandibysana' ); ?>
			</a>
			<a href="<?php echo esc_url( mbs_get_cart_url() ); ?>" class="mbs-btn mbs-btn-inverse-outline mbs-btn-sm" style="width:100%;">
				<?php esc_html_e( 'View Full Bag Ledger', 'mehandibysana' ); ?>
			</a>
		</div>
	</div>
</aside>

