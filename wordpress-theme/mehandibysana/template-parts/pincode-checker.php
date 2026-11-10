<?php
/**
 * Reusable Indian PIN Code Delivery Estimator Widget
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$compact = ! empty( $args['compact'] );
$active_pin = function_exists( 'mbs_get_active_customer_pincode' ) ? mbs_get_active_customer_pincode() : '';
?>
<div class="mbs-pin-box" data-mbs-pin-checker style="<?php echo $compact ? 'padding:0.85rem 1rem;' : ''; ?>">
	<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
		<span class="eyebrow" style="font-size:0.68rem;">
			<?php esc_html_e( 'Check PIN Delivery & COD', 'mehandibysana' ); ?>
		</span>
		<span style="font-size:0.72rem;color:var(--color-text-muted);">
			<?php esc_html_e( 'Pan-India Dispatch', 'mehandibysana' ); ?>
		</span>
	</div>

	<form class="mbs-pin-form">
		<label class="sr-only" for="mbs-pin-field-<?php echo esc_attr( wp_unique_id() ); ?>"><?php esc_html_e( '6-digit Indian PIN code', 'mehandibysana' ); ?></label>
		<input
			type="text"
			name="pincode"
			inputmode="numeric"
			maxlength="6"
			value="<?php echo esc_attr( $active_pin ); ?>"
			placeholder="<?php esc_attr_e( 'Enter 6-digit PIN (e.g. 190001)', 'mehandibysana' ); ?>"
			class="mbs-pin-input"
		/>
		<button type="submit" class="mbs-btn mbs-btn-ink mbs-btn-sm">
			<?php esc_html_e( 'Check', 'mehandibysana' ); ?>
		</button>
	</form>

	<?php if ( ! $compact ) : ?>
		<div class="mbs-pin-samples">
			<span style="font-size:0.7rem;color:var(--color-text-muted);"><?php esc_html_e( 'Sample:', 'mehandibysana' ); ?></span>
			<button type="button" class="mbs-pin-sample-btn" data-mbs-pin-sample="190001">190001 · Srinagar</button>
			<button type="button" class="mbs-pin-sample-btn" data-mbs-pin-sample="110001">110001 · Delhi</button>
			<button type="button" class="mbs-pin-sample-btn" data-mbs-pin-sample="400001">400001 · Mumbai</button>
		</div>
	<?php endif; ?>

	<div class="mbs-pin-result" data-mbs-pin-output style="display:none;"></div>
</div>

