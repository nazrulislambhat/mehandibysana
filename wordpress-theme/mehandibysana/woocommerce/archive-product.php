<?php
/**
 * WooCommerce Shop & Category Archive Override — Editorial Atelier Grid & Filter Pills
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

$current_cat_slug = '';
$current_cat_name = __( 'All Botanicals & Tools', 'mehandibysana' );

if ( is_product_category() ) {
	$term = get_queried_object();
	if ( $term instanceof WP_Term ) {
		$current_cat_slug = $term->slug;
		$current_cat_name = $term->name;
	}
} elseif ( ! empty( $_GET['category'] ) ) {
	$current_cat_slug = sanitize_title( wp_unslash( $_GET['category'] ) );
	$term             = get_term_by( 'slug', $current_cat_slug, 'product_cat' );
	if ( $term instanceof WP_Term ) {
		$current_cat_name = $term->name;
	}
}

$search_query = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';

$product_cats = get_terms(
	array(
		'taxonomy'   => 'product_cat',
		'hide_empty' => true,
		'exclude'    => array_filter( array( get_option( 'default_product_cat' ) ) ),
	)
);
if ( is_wp_error( $product_cats ) ) {
	$product_cats = array();
}
?>

<header class="mbs-masthead">
	<div class="editorial-container">
		<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:1.5rem;">
			<div>
				<span class="eyebrow"><?php esc_html_e( 'Small-Batch Botanical Apothecary', 'mehandibysana' ); ?></span>
				<h1 style="font-size:clamp(2.35rem,4.4vw,3.35rem);margin-top:0.5rem;">
					<?php echo $search_query ? sprintf( esc_html__( 'Search: “%s”', 'mehandibysana' ), esc_html( $search_query ) ) : esc_html( $current_cat_name ); ?>
				</h1>
			</div>

			<!-- Quick Search Form -->
			<form method="get" action="<?php echo esc_url( mbs_get_shop_url() ); ?>" style="display:flex;gap:0.5rem;align-items:center;">
				<input
					type="search"
					name="s"
					value="<?php echo esc_attr( $search_query ); ?>"
					placeholder="<?php esc_attr_e( 'Search cones, oils, henna…', 'mehandibysana' ); ?>"
					class="mbs-pin-input"
					style="font-family:var(--font-sans);letter-spacing:0;min-width:210px;"
				/>
				<button type="submit" class="mbs-btn mbs-btn-ink mbs-btn-sm"><?php esc_html_e( 'Find', 'mehandibysana' ); ?></button>
			</form>
		</div>

		<!-- Category Filter Pills -->
		<nav class="mbs-filter-pills" aria-label="<?php esc_attr_e( 'Product Categories', 'mehandibysana' ); ?>">
			<a
				href="<?php echo esc_url( mbs_get_shop_url() ); ?>"
				class="mbs-filter-pill <?php echo '' === $current_cat_slug && '' === $search_query ? 'is-active' : ''; ?>"
			>
				<?php esc_html_e( 'All Botanicals', 'mehandibysana' ); ?>
			</a>
			<?php foreach ( $product_cats as $cat ) :
				if ( 'uncategorized' === $cat->slug ) {
					continue;
				}
				$cat_href = add_query_arg( 'category', $cat->slug, mbs_get_shop_url() );
				$is_cur   = ( $current_cat_slug === $cat->slug );
				?>
				<a
					href="<?php echo esc_url( $cat_href ); ?>"
					class="mbs-filter-pill <?php echo $is_cur ? 'is-active' : ''; ?>"
				>
					<?php echo esc_html( html_entity_decode( $cat->name, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ); ?>
				</a>
			<?php endforeach; ?>
		</nav>
	</div>
</header>

<section class="section-pad surface-bg">
	<div class="editorial-container">
		<?php if ( woocommerce_product_loop() ) : ?>
			<div class="mbs-shop-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					global $product;
					if ( ! $product instanceof WC_Product ) {
						$product = wc_get_product( get_the_ID() );
					}
					if ( $product instanceof WC_Product ) {
						get_template_part( 'template-parts/product-card', null, array( 'product' => $product ) );
					}
				endwhile;
				?>
			</div>

			<div style="margin-top:3rem;">
				<?php
				the_posts_pagination(
					array(
						'prev_text' => '&larr; ' . __( 'Previous', 'mehandibysana' ),
						'next_text' => __( 'Next', 'mehandibysana' ) . ' &rarr;',
					)
				);
				?>
			</div>
		<?php else : ?>
			<div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:3rem 1.5rem;text-align:center;">
				<div style="display:flex;justify-content:center;margin-bottom:1rem;"><?php echo mbs_svg_botanical_sprig(); ?></div>
				<h2 style="font-size:2rem;"><?php esc_html_e( 'No Botanical Formulations Found Here', 'mehandibysana' ); ?></h2>
				<p style="margin:0.75rem auto 1.5rem;max-width:30rem;color:var(--color-text-muted);">
					<?php esc_html_e( 'Try clearing your filter or browsing our complete freshly rolled Srinagar apothecary collection.', 'mehandibysana' ); ?>
				</p>
				<a href="<?php echo esc_url( mbs_get_shop_url() ); ?>" class="mbs-btn mbs-btn-ink">
					<?php esc_html_e( 'View All Studio Items', 'mehandibysana' ); ?>
				</a>
			</div>
		<?php endif; ?>
	</div>
</section>

<?php get_footer(); ?>

