<?php
/**
 * Standard WordPress Page Template + Styled WooCommerce Cart / Checkout / Account Wrapper
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$is_wc_cart     = function_exists( 'is_cart' ) && is_cart();
$is_wc_checkout = function_exists( 'is_checkout' ) && is_checkout();
$is_thankyou    = function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'order-received' );
$step_num       = $is_thankyou ? 3 : ( $is_wc_checkout ? 2 : ( $is_wc_cart ? 1 : 0 ) );

while ( have_posts() ) :
	the_post();
	?>
	<header class="mbs-masthead">
		<div class="editorial-container">
			<span class="eyebrow">
				<?php
				if ( $is_wc_cart ) {
					esc_html_e( 'Order Dispatch Ledger', 'mehandibysana' );
				} elseif ( $is_thankyou ) {
					esc_html_e( 'Order Confirmation · Mehandi by Sana', 'mehandibysana' );
				} elseif ( $is_wc_checkout ) {
					esc_html_e( 'Secure Indian Checkout · PIN Shipping & Razorpay / COD', 'mehandibysana' );
				} else {
					esc_html_e( 'Mehandi by Sana', 'mehandibysana' );
				}
				?>
			</span>
			<h1 style="font-size:clamp(2.25rem,4vw,3.15rem);margin-top:0.5rem;">
				<?php
				if ( $is_thankyou ) {
					esc_html_e( 'Order Confirmed', 'mehandibysana' );
				} else {
					the_title();
				}
				?>
			</h1>

			<?php if ( $step_num > 0 ) : ?>
				<div class="mbs-step-bar" aria-label="<?php esc_attr_e( 'Checkout Progress', 'mehandibysana' ); ?>">
					<a href="<?php echo esc_url( mbs_get_cart_url() ); ?>" class="mbs-step-pill <?php echo 1 === $step_num ? 'is-active' : ''; ?>">
						01 &middot; <?php esc_html_e( 'Bag Ledger', 'mehandibysana' ); ?>
					</a>
					<span class="mbs-step-pill <?php echo 2 === $step_num ? 'is-active' : ''; ?>">
						02 &middot; <?php esc_html_e( 'Delivery & Payment', 'mehandibysana' ); ?>
					</span>
					<span class="mbs-step-pill <?php echo 3 === $step_num ? 'is-active' : ''; ?>">
						03 &middot; <?php esc_html_e( 'Order Confirmed', 'mehandibysana' ); ?>
					</span>
				</div>
			<?php endif; ?>
		</div>
	</header>

	<div class="section-pad surface-bg">
		<div class="editorial-container">
			<?php if ( $is_wc_checkout && ! $is_thankyou ) : ?>
				<div style="margin-bottom:2rem;max-width:520px;">
					<?php get_template_part( 'template-parts/pincode-checker', null, array( 'compact' => true ) ); ?>
				</div>
			<?php endif; ?>

			<div class="mbs-entry-content">
				<?php the_content(); ?>
			</div>
		</div>
	</div>
	<?php
endwhile;

get_footer();

