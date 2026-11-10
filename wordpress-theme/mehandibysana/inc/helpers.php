<?php
/**
 * Theme Helpers — Data, Permalink Resolvers, Price Formatting & Product Normalization
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Primary navigation definitions matching nav-data.ts
 */
function mbs_get_nav_items() {
	$shop_url = mbs_get_shop_url();

	return array(
		array(
			'index'       => '01',
			'key'         => 'shop',
			'label'       => __( 'Shop', 'mehandibysana' ),
			'href'        => $shop_url,
			'eyebrow'     => __( 'Small-Batch Botanicals & Tools', 'mehandibysana' ),
			'description' => __( 'Freshly hand-rolled organic henna cones, triple-sifted Rajasthani hair henna, essential aftercare oils, and precision artist tools.', 'mehandibysana' ),
			'cta_label'   => __( 'Browse Full Apothecary', 'mehandibysana' ),
			'motif'       => 'botanical',
		),
		array(
			'index'       => '02',
			'key'         => 'services',
			'label'       => __( 'Services', 'mehandibysana' ),
			'href'        => mbs_get_page_url_by_slug( 'services', '/services/' ),
			'eyebrow'     => __( 'Bridal & Festive Commissions', 'mehandibysana' ),
			'description' => __( 'Bespoke Kashmiri bridal mehandi, intimate engagement gatherings, and custom botanical stain consultations by Sumaiya Rashid Magray.', 'mehandibysana' ),
			'cta_label'   => __( 'Explore Booking Tiers', 'mehandibysana' ),
			'motif'       => 'bridal',
		),
		array(
			'index'       => '03',
			'key'         => 'gallery',
			'label'       => __( 'Gallery', 'mehandibysana' ),
			'href'        => mbs_get_page_url_by_slug( 'gallery', '/gallery/' ),
			'eyebrow'     => __( 'Stain Progression & Portfolio', 'mehandibysana' ),
			'description' => __( 'An editorial archive of 48-hour mahogany stain maturity, intricate bridal compositions, and natural palm flora studies.', 'mehandibysana' ),
			'cta_label'   => __( 'View Bridal Archive', 'mehandibysana' ),
			'motif'       => 'events',
		),
		array(
			'index'       => '04',
			'key'         => 'about',
			'label'       => __( 'About', 'mehandibysana' ),
			'href'        => mbs_get_page_url_by_slug( 'about', '/about/' ),
			'eyebrow'     => __( 'Srinagar & Bangalore · Est. 2019', 'mehandibysana' ),
			'description' => __( 'Rooted in zero-chemical botanical craft—how Sana blends Sojat henna harvests with pure eucalyptus and clove essential oils.', 'mehandibysana' ),
			'cta_label'   => __( 'Read Artist Story', 'mehandibysana' ),
			'motif'       => 'botanical',
		),
		array(
			'index'       => '05',
			'key'         => 'contact',
			'label'       => __( 'Contact', 'mehandibysana' ),
			'href'        => mbs_get_page_url_by_slug( 'contact', '/contact/' ),
			'eyebrow'     => __( 'Inquiries & Date Reservations', 'mehandibysana' ),
			'description' => __( 'Reserve your bridal dates in Srinagar, Bangalore, or destination venues, request wholesale cone batches, or consult directly with Sana.', 'mehandibysana' ),
			'cta_label'   => __( 'Start a Conversation', 'mehandibysana' ),
			'motif'       => 'bridal',
		),
	);
}

/**
 * Curated collections for mega menu & mobile drawer
 */
function mbs_get_shop_collections() {
	$shop_url      = mbs_get_shop_url();
	$total_count   = mbs_get_catalog_total_count();
	$badge_all     = $total_count > 0 ? sprintf( 'All %d', $total_count ) : 'All Items';
	$cat_links     = array(
		array(
			'index'    => '01',
			'title'    => __( 'All Botanicals & Tools', 'mehandibysana' ),
			'subtitle' => __( 'Complete catalog & fresh small batches', 'mehandibysana' ),
			'href'     => $shop_url,
			'badge'    => $badge_all,
		),
		array(
			'index'    => '02',
			'title'    => __( 'Organic Henna Cones & Powder', 'mehandibysana' ),
			'subtitle' => __( 'Bridal stain cones, herbal hair henna & triple-sifted leaf', 'mehandibysana' ),
			'href'     => add_query_arg( 'category', 'organic-henna', $shop_url ),
			'badge'    => __( 'Fresh Batch', 'mehandibysana' ),
		),
		array(
			'index'    => '03',
			'title'    => __( 'Bridal & Self-Care Kits', 'mehandibysana' ),
			'subtitle' => __( 'Complete stain rituals & curated gift sets', 'mehandibysana' ),
			'href'     => add_query_arg( 'category', 'henna-kits-combos', $shop_url ),
			'badge'    => '',
		),
		array(
			'index'    => '04',
			'title'    => __( 'Essential Oils & Aftercare', 'mehandibysana' ),
			'subtitle' => __( 'Pure eucalyptus, clove oil & stain-sealing balms', 'mehandibysana' ),
			'href'     => add_query_arg( 'category', 'henna-care-essential-oils', $shop_url ),
			'badge'    => '',
		),
		array(
			'index'    => '05',
			'title'    => __( 'Artist Tools & Supplies', 'mehandibysana' ),
			'subtitle' => __( 'Pre-cut cellophane sheets, micro scales & measuring spoons', 'mehandibysana' ),
			'href'     => add_query_arg( 'category', 'mehandi-tools-supplies', $shop_url ),
			'badge'    => __( 'New', 'mehandibysana' ),
		),
	);

	// If shop has custom categories that don't match default slugs, map dynamically if needed
	return $cat_links;
}

/**
 * Determine active nav key for current page
 */
function mbs_get_active_nav_key() {
	if ( function_exists( 'is_woocommerce' ) && ( is_woocommerce() || is_shop() || is_product() || is_product_category() || is_product_tag() ) ) {
		return 'shop';
	}
	if ( is_page( 'services' ) || is_page_template( 'page-templates/template-services.php' ) ) {
		return 'services';
	}
	if ( is_page( 'gallery' ) || is_page_template( 'page-templates/template-gallery.php' ) ) {
		return 'gallery';
	}
	if ( is_page( 'about' ) || is_page_template( 'page-templates/template-about.php' ) ) {
		return 'about';
	}
	if ( is_page( 'contact' ) || is_page_template( 'page-templates/template-contact.php' ) ) {
		return 'contact';
	}
	return '';
}

/**
 * URL helpers safe with or without WooCommerce active
 */
function mbs_get_shop_url() {
	if ( function_exists( 'wc_get_page_permalink' ) ) {
		$id = wc_get_page_id( 'shop' );
		if ( $id && $id > 0 && 'publish' === get_post_status( $id ) ) {
			return get_permalink( $id );
		}
	}
	return home_url( '/shop/' );
}

function mbs_get_cart_url() {
	if ( function_exists( 'wc_get_cart_url' ) ) {
		return wc_get_cart_url();
	}
	return home_url( '/cart/' );
}

function mbs_get_checkout_url() {
	if ( function_exists( 'wc_get_checkout_url' ) ) {
		return wc_get_checkout_url();
	}
	return home_url( '/checkout/' );
}

function mbs_get_page_url_by_slug( $slug, $fallback_path = '' ) {
	$page = get_page_by_path( $slug );
	if ( $page instanceof WP_Post && 'publish' === $page->post_status ) {
		return get_permalink( $page->ID );
	}
	return home_url( $fallback_path ?: '/' . trim( $slug, '/' ) . '/' );
}

function mbs_get_track_order_url() {
	return mbs_get_page_url_by_slug( 'track-order', '/track-order/' );
}

/**
 * Currency & Indian Number Formatting
 */
function mbs_get_currency_symbol() {
	if ( function_exists( 'get_woocommerce_currency_symbol' ) ) {
		$sym = html_entity_decode( get_woocommerce_currency_symbol(), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		if ( $sym ) {
			return $sym;
		}
	}
	return '₹';
}

function mbs_format_inr( $amount, $symbol = null ) {
	if ( null === $symbol ) {
		$symbol = mbs_get_currency_symbol();
	}
	$num = (float) $amount;
	$has_decimals = abs( $num - round( $num ) ) >= 0.01;
	return $symbol . mbs_format_indian_number( $num, $has_decimals ? 2 : 0 );
}

function mbs_format_indian_number( $number, $decimals = 0 ) {
	$negative = $number < 0 ? '-' : '';
	$num      = abs( (float) $number );
	$formatted = number_format( $num, $decimals, '.', '' );
	$parts     = explode( '.', $formatted );
	$int_part  = $parts[0];
	$dec_part  = isset( $parts[1] ) && $decimals > 0 ? '.' . $parts[1] : '';

	if ( strlen( $int_part ) > 3 ) {
		$last_three = substr( $int_part, -3 );
		$rest       = substr( $int_part, 0, -3 );
		$rest       = preg_replace( '/\B(?=(\d{2})+(?!\d))/', ',', $rest );
		$int_part   = $rest . ',' . $last_three;
	}

	return $negative . $int_part . $dec_part;
}

/**
 * Published product count
 */
function mbs_get_catalog_total_count() {
	if ( ! post_type_exists( 'product' ) ) {
		return 0;
	}
	$counts = wp_count_posts( 'product' );
	return isset( $counts->publish ) ? (int) $counts->publish : 0;
}

/**
 * Completed orders count display (studio historical floor + live WC orders)
 */
function mbs_get_orders_completed_display() {
	$base = (int) get_option( 'mbs_historical_orders_offset', 3499 );
	if ( $base < 1 ) {
		$base = 3499;
	}
	if ( function_exists( 'wc_orders_count' ) ) {
		$live = (int) wc_orders_count( 'completed' ) + (int) wc_orders_count( 'processing' );
		$total = max( $base, $base + $live );
		return mbs_format_indian_number( $total ) . '+';
	}
	return mbs_format_indian_number( $base ) . '+';
}

/**
 * Fallback clean product summaries mirroring FeaturedProductsSection.tsx
 */
function mbs_get_fallback_description_map() {
	return array(
		'organic-henna-cones'                    => __( 'Hand-rolled 0.38mm fine-tip cones mixed with triple-sifted Sojat leaf powder and pure eucalyptus oil.', 'mehandibysana' ),
		'mbs-henna-kit'                          => __( 'Ten 20g organic cones paired with stain-sealing balm and sealant mist for full bridal sessions.', 'mehandibysana' ),
		'aftercare-henna-balm'                   => __( 'Nourishing botanical balm locking natural lawsone oxidation while soothing skin post-flake.', 'mehandibysana' ),
		'henna-sealant-spray'                    => __( 'Lemongrass hydrosol & sugar mist keeping delicate bridal paste pliable for maximum stain depth.', 'mehandibysana' ),
		'mbs-self-care-kit'                      => __( 'Curated palm ritual bundle with organic cones, herbal nail stain, aftercare balm, and sealant.', 'mehandibysana' ),
		'eucalyptus-blend-essential-oil'         => __( 'Steam-distilled high-terpene eucalyptus & lavender oil blend crafted for darker henna dye release.', 'mehandibysana' ),
		'beginner-henna-kit'                     => __( 'Everything required to mix, sift, and roll your own small-batch organic cones from scratch.', 'mehandibysana' ),
		'chemical-free-organic-hair-henna-powder'=> __( 'Triple-cloth sifted 100% pure Rajasthani henna leaf powder for conditioning botanical color.', 'mehandibysana' ),
	);
}

/**
 * Clean product note matching FeaturedProductsSection.tsx -> getCleanNote()
 */
function mbs_get_product_clean_note( $product ) {
	if ( ! $product instanceof WC_Product ) {
		return '';
	}
	$slug = $product->get_slug();
	$map  = mbs_get_fallback_description_map();
	if ( isset( $map[ $slug ] ) ) {
		return $map[ $slug ];
	}

	$raw = wp_strip_all_tags( html_entity_decode( $product->get_short_description() ?: $product->get_description(), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
	$raw = preg_replace( '/^\s*[•–-]\s*/m', '', $raw );
	$raw = preg_replace( '/\s*[•]\s*/', ' · ', $raw );
	$raw = trim( preg_replace( '/\s+/', ' ', $raw ) );

	if ( $raw && strtolower( $raw ) !== strtolower( $product->get_name() ) && strlen( $raw ) > 8 ) {
		return wp_trim_words( $raw, 22, '…' );
	}

	return __( 'Small-batch botanical formulation crafted at Mehandi by Sana, Srinagar.', 'mehandibysana' );
}

/**
 * Normalize a WC_Product into consistent UI metadata (simple or variable)
 */
function mbs_normalize_wc_product( $product ) {
	if ( ! $product instanceof WC_Product ) {
		return null;
	}

	$currency   = mbs_get_currency_symbol();
	$is_var     = $product->is_type( 'variable' );
	$min_price  = (float) $product->get_price();
	$max_price  = null;
	$reg_price  = (float) $product->get_regular_price();
	$variations = array();
	$attributes = array();
	$in_stock   = $product->is_in_stock();

	if ( $is_var ) {
		$prices    = $product->get_variation_prices( true );
		$price_arr = ! empty( $prices['price'] ) ? array_filter( array_map( 'floatval', $prices['price'] ), function ( $v ) { return $v > 0; } ) : array();
		if ( ! empty( $price_arr ) ) {
			$min_price = min( $price_arr );
			$top_price = max( $price_arr );
			$max_price = $top_price > $min_price ? $top_price : null;
		}

		$var_attributes = $product->get_variation_attributes();
		foreach ( $var_attributes as $attr_tax => $options ) {
			if ( empty( $options ) ) {
				continue;
			}
			$label = wc_attribute_label( $attr_tax, $product );
			$opts_clean = array();
			foreach ( $options as $opt_slug ) {
				if ( taxonomy_exists( $attr_tax ) ) {
					$term = get_term_by( 'slug', $opt_slug, $attr_tax );
					$opts_clean[] = $term ? $term->name : $opt_slug;
				} else {
					$opts_clean[] = $opt_slug;
				}
			}
			$attributes[] = array(
				'key'     => sanitize_title( $attr_tax ),
				'raw_key' => $attr_tax,
				'name'    => $label,
				'options' => $opts_clean,
				'slugs'   => array_values( $options ),
			);
		}

		$children = $product->get_children();
		$any_in_stock = false;
		foreach ( $children as $child_id ) {
			$child = wc_get_product( $child_id );
			if ( ! $child || ! $child->exists() || 'publish' !== $child->get_status() ) {
				continue;
			}
			$c_stock = $child->is_in_stock();
			if ( $c_stock ) {
				$any_in_stock = true;
			}
			$c_attrs = array();
			foreach ( $child->get_attributes() as $k => $v ) {
				$attr_label = wc_attribute_label( $k, $product );
				$val_label  = $v;
				if ( taxonomy_exists( $k ) && $v ) {
					$t = get_term_by( 'slug', $v, $k );
					if ( $t ) {
						$val_label = $t->name;
					}
				}
				$c_attrs[] = array(
					'key'       => sanitize_title( $k ),
					'raw_key'   => $k,
					'attribute' => $attr_label,
					'value'     => $val_label,
					'slug'      => $v,
				);
			}

			$c_img_id  = $child->get_image_id();
			$c_img_url = $c_img_id ? wp_get_attachment_image_url( $c_img_id, 'large' ) : '';

			$variations[] = array(
				'id'           => $child->get_id(),
				'sku'          => $child->get_sku(),
				'price'        => (float) $child->get_price(),
				'regularPrice' => $child->get_regular_price() ? (float) $child->get_regular_price() : null,
				'inStock'      => $c_stock,
				'attributes'   => $c_attrs,
				'image'        => $c_img_url ? array(
					'id'  => $c_img_id,
					'src' => $c_img_url,
					'alt' => get_post_meta( $c_img_id, '_wp_attachment_image_alt', true ) ?: $product->get_name(),
				) : null,
			);
		}
		if ( ! empty( $variations ) ) {
			$in_stock = $any_in_stock;
		}
	}

	// Category extraction
	$cat_terms = get_the_terms( $product->get_id(), 'product_cat' );
	$categories = array();
	if ( is_array( $cat_terms ) ) {
		foreach ( $cat_terms as $term ) {
			if ( 'uncategorized' === $term->slug ) {
				continue;
			}
			$categories[] = array(
				'id'   => $term->term_id,
				'name' => html_entity_decode( $term->name, ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
				'slug' => $term->slug,
			);
		}
	}

	// Images (main + gallery)
	$images   = array();
	$img_ids  = array();
	$thumb_id = $product->get_image_id();
	if ( $thumb_id ) {
		$img_ids[] = (int) $thumb_id;
	}
	foreach ( $product->get_gallery_image_ids() as $gid ) {
		if ( $gid && ! in_array( (int) $gid, $img_ids, true ) ) {
			$img_ids[] = (int) $gid;
		}
	}
	foreach ( $img_ids as $iid ) {
		$src = wp_get_attachment_image_url( $iid, 'large' );
		if ( $src ) {
			$images[] = array(
				'id'  => $iid,
				'src' => $src,
				'alt' => get_post_meta( $iid, '_wp_attachment_image_alt', true ) ?: $product->get_name(),
			);
		}
	}

	$price_str = mbs_format_inr( $min_price, $currency );
	if ( $max_price && $max_price > $min_price ) {
		$price_str .= ' – ' . mbs_format_inr( $max_price, $currency );
	}

	return array(
		'id'               => $product->get_id(),
		'product'          => $product,
		'slug'             => $product->get_slug(),
		'permalink'        => get_permalink( $product->get_id() ),
		'name'             => html_entity_decode( $product->get_name(), ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
		'shortDescription' => wp_strip_all_tags( html_entity_decode( $product->get_short_description(), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) ),
		'cleanNote'        => mbs_get_product_clean_note( $product ),
		'type'             => ( $is_var && count( $variations ) > 1 ) || count( $attributes ) > 0 ? 'variable' : 'simple',
		'price'            => $min_price,
		'maxPrice'         => $max_price,
		'regularPrice'     => $reg_price > $min_price && ! $max_price ? $reg_price : null,
		'priceDisplay'     => $price_str,
		'currencySymbol'   => $currency,
		'onSale'           => $product->is_on_sale(),
		'inStock'          => $in_stock,
		'sku'              => $product->get_sku(),
		'categories'       => $categories,
		'images'           => $images,
		'attributes'       => $attributes,
		'variations'       => $variations,
	);
}

/**
 * Pick 3 curated Companion Botanicals matching wc-catalog.ts logic
 */
function mbs_pick_companion_products( $current_product, $limit = 3 ) {
	if ( ! function_exists( 'wc_get_products' ) || ! $current_product instanceof WC_Product ) {
		return array();
	}

	$candidates = wc_get_products(
		array(
			'status'  => 'publish',
			'limit'   => 24,
			'exclude' => array( $current_product->get_id() ),
		)
	);

	if ( empty( $candidates ) ) {
		return array();
	}

	$current_text = strtolower( $current_product->get_slug() . ' ' . $current_product->get_name() );
	$scored       = array();

	foreach ( $candidates as $cand ) {
		$score = $cand->is_in_stock() ? 20 : -50;
		$text  = strtolower( $cand->get_slug() . ' ' . $cand->get_name() );

		if ( str_contains( $current_text, 'cone' ) || str_contains( $current_text, 'bulk' ) || str_contains( $current_text, 'powder' ) ) {
			if ( str_contains( $text, 'oil' ) || str_contains( $text, 'sealant' ) || str_contains( $text, 'balm' ) || str_contains( $text, 'cellophane' ) || str_contains( $text, 'scale' ) || str_contains( $text, 'spoon' ) ) {
				$score += 15;
			}
		} elseif ( str_contains( $current_text, 'kit' ) ) {
			if ( str_contains( $text, 'cone' ) || str_contains( $text, 'oil' ) || str_contains( $text, 'balm' ) || str_contains( $text, 'sealant' ) ) {
				$score += 15;
			}
		} elseif ( str_contains( $current_text, 'oil' ) || str_contains( $current_text, 'balm' ) || str_contains( $current_text, 'sealant' ) ) {
			if ( str_contains( $text, 'cone' ) || str_contains( $text, 'bulk' ) || str_contains( $text, 'kit' ) ) {
				$score += 15;
			}
		} elseif ( str_contains( $current_text, 'cellophane' ) || str_contains( $current_text, 'spoon' ) || str_contains( $current_text, 'scale' ) || str_contains( $current_text, 'piping' ) ) {
			if ( str_contains( $text, 'bulk' ) || str_contains( $text, 'pre-rolled' ) || str_contains( $text, 'cone' ) || str_contains( $text, 'oil' ) ) {
				$score += 15;
			}
		}

		if ( $cand->get_image_id() ) {
			$score += 5;
		}
		if ( $cand->is_featured() ) {
			$score += 3;
		}

		$scored[] = array(
			'score'   => $score,
			'product' => $cand,
		);
	}

	usort(
		$scored,
		function ( $a, $b ) {
			return $b['score'] <=> $a['score'];
		}
	);

	return array_slice( array_column( $scored, 'product' ), 0, $limit );
}

/**
 * Curated exhibition plates shared by Homepage Gallery Preview & Full Gallery Page
 *
 * @param string $context 'home' | 'page'
 */
function mbs_get_gallery_plates( $context = 'home' ) {
	$plates = array(
		'plate-01' => array(
			'id'           => 'plate-01',
			'plate_id'     => 'bridal-mandala',
			'number'       => __( 'Plate 01', 'mehandibysana' ),
			'tag'          => __( 'Bridal Henna', 'mehandibysana' ),
			'category'     => __( 'Bridal Henna', 'mehandibysana' ),
			'title'        => __( 'Full Bridal Arms & Soles Mandala', 'mehandibysana' ),
			'caption_home' => __( 'Symmetrical bridal mandala with traditional peacock motifs, floral vines, and personalized initials.', 'mehandibysana' ),
			'caption_full' => __( 'Symmetrical bridal henna featuring traditional peacock motifs, floral vines, and personalized bride & groom initials hand-drawn with 0.38mm organic cones.', 'mehandibysana' ),
			'src'          => get_theme_mod( 'mbs_gallery_plate_1', 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-23.webp' ),
			'alt'          => __( 'Full bridal arms and soles mandala henna featuring peacock motifs and floral vines by Mehandi by Sana', 'mehandibysana' ),
			'home_aspect'  => 'aspect-4-5',
			'home_span'    => 'mbs-span-6',
			'page_aspect'  => 'aspect-4-5',
			'page_span'    => 'mbs-span-7',
		),
		'plate-02' => array(
			'id'           => 'plate-02',
			'plate_id'     => 'chinar-silhouette',
			'number'       => __( 'Plate 02', 'mehandibysana' ),
			'tag'          => __( 'Kashmiri Motif', 'mehandibysana' ),
			'category'     => __( 'Festive & Kashmiri Motif', 'mehandibysana' ),
			'title'        => __( 'Chinar Leaf Silhouette Study', 'mehandibysana' ),
			'caption_home' => __( 'Kashmiri Chinar leaf silhouette inspired by Dal Lake in fine 0.38mm cone linework.', 'mehandibysana' ),
			'caption_full' => __( 'Inspired by the Chinar trees along Dal Lake in Srinagar, woven into a balanced floral palm composition.', 'mehandibysana' ),
			'src'          => get_theme_mod( 'mbs_gallery_plate_2', 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-22.webp' ),
			'alt'          => __( 'Kashmiri Chinar leaf silhouette mehandi woven into a modern floral palm design', 'mehandibysana' ),
			'home_aspect'  => 'aspect-square',
			'home_span'    => 'mbs-span-3',
			'page_aspect'  => 'aspect-square',
			'page_span'    => 'mbs-span-5 mbs-offset-top-lg',
		),
		'plate-03' => array(
			'id'           => 'plate-03',
			'plate_id'     => 'sunburst-medallion',
			'number'       => __( 'Plate 03', 'mehandibysana' ),
			'tag'          => __( 'Stain Progression', 'mehandibysana' ),
			'category'     => __( 'Stain Progression', 'mehandibysana' ),
			'title'        => __( 'Eid Sunburst Medallion', 'mehandibysana' ),
			'caption_home' => __( 'Rich 48-hour natural mahogany oxidation from freshly rolled organic Sojat henna paste.', 'mehandibysana' ),
			'caption_full' => __( 'Centerpiece sunburst medallion with crisp finger caps showing rich natural oxidation without chemical dyes.', 'mehandibysana' ),
			'src'          => get_theme_mod( 'mbs_gallery_plate_3', 'https://mehandibysana.com/wp-content/uploads/2023/08/176480.jpg' ),
			'alt'          => __( 'Deep natural mahogany stain oxidation on palm mandala from fresh organic henna paste', 'mehandibysana' ),
			'home_aspect'  => 'aspect-4-5',
			'home_span'    => 'mbs-span-3 mbs-offset-top-md',
			'page_aspect'  => 'aspect-4-5',
			'page_span'    => 'mbs-span-6 mbs-offset-top-md',
		),
		'plate-04' => array(
			'id'           => 'plate-04',
			'plate_id'     => 'lotus-jali',
			'number'       => __( 'Plate 04', 'mehandibysana' ),
			'tag'          => __( 'Engagement Lattice', 'mehandibysana' ),
			'category'     => __( 'Engagement', 'mehandibysana' ),
			'title'        => __( 'Botanical Lotus & Jali Grid', 'mehandibysana' ),
			'caption_home' => __( 'Delicate jali latticework framed by floating lotus blossoms and soft botanical shading.', 'mehandibysana' ),
			'caption_full' => __( 'Fine jali latticework framed by floating lotus blossoms and delicate shading techniques.', 'mehandibysana' ),
			'src'          => get_theme_mod( 'mbs_gallery_plate_4', 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-21.webp' ),
			'alt'          => __( 'Botanical lotus and fine jali grid mehandi work on hands for engagement', 'mehandibysana' ),
			'home_aspect'  => 'aspect-4-5',
			'home_span'    => 'mbs-span-4',
			'page_aspect'  => 'aspect-square',
			'page_span'    => 'mbs-span-5',
		),
		'plate-05' => array(
			'id'           => 'plate-05',
			'plate_id'     => 'mughal-archways',
			'number'       => __( 'Plate 05', 'mehandibysana' ),
			'tag'          => __( 'Mughal Architecture', 'mehandibysana' ),
			'category'     => __( 'Bridal Architecture', 'mehandibysana' ),
			'title'        => __( 'Royal Shalimar Archways', 'mehandibysana' ),
			'caption_home' => __( 'Architectural arches and domes echoing Shalimar Bagh gardens across palms and forearms.', 'mehandibysana' ),
			'caption_full' => __( 'Architectural arches and domes echoing Shalimar Bagh gardens, maturing into a deep 48-hour natural mahogany stain.', 'mehandibysana' ),
			'src'          => get_theme_mod( 'mbs_gallery_plate_5', 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-19.jpg' ),
			'alt'          => __( 'Royal Mughal archways bridal mehandi design on forearms and palms', 'mehandibysana' ),
			'home_aspect'  => 'aspect-4-5',
			'home_span'    => 'mbs-span-4 mbs-offset-top-sm',
			'page_aspect'  => 'aspect-4-5',
			'page_span'    => 'mbs-span-7 mbs-offset-top-md',
		),
		'plate-06' => array(
			'id'           => 'plate-06',
			'plate_id'     => 'hathphool-cuff',
			'number'       => __( 'Plate 06', 'mehandibysana' ),
			'tag'          => __( 'Contemporary Fusion', 'mehandibysana' ),
			'category'     => __( 'Contemporary Fusion', 'mehandibysana' ),
			'title'        => __( 'Minimalist Hathphool Cuff', 'mehandibysana' ),
			'caption_home' => __( 'Jewelry-inspired henna draping from the wrists across the knuckles with airy negative space.', 'mehandibysana' ),
			'caption_full' => __( 'Jewelry-style henna draping from the wrists across the knuckles with airy negative-space detailing.', 'mehandibysana' ),
			'src'          => get_theme_mod( 'mbs_gallery_plate_6', 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-20.jpg' ),
			'alt'          => __( 'Minimalist hathphool cuff contemporary henna design with negative space', 'mehandibysana' ),
			'home_aspect'  => 'aspect-4-5',
			'home_span'    => 'mbs-span-4',
			'page_aspect'  => 'aspect-4-5',
			'page_span'    => 'mbs-span-6',
		),
	);

	if ( 'page' === $context ) {
		// Gallery page rows: [plate-01(7)+plate-02(5)], [lotus(5)+mughal(7)], [hathphool(6)+sunburst(6)]
		$ordered = array(
			$plates['plate-01'],
			$plates['plate-02'],
			array_merge( $plates['plate-04'], array( 'number' => __( 'Plate 03', 'mehandibysana' ) ) ),
			array_merge( $plates['plate-05'], array( 'number' => __( 'Plate 04', 'mehandibysana' ) ) ),
			array_merge( $plates['plate-06'], array( 'number' => __( 'Plate 05', 'mehandibysana' ) ) ),
			array_merge( $plates['plate-03'], array( 'number' => __( 'Plate 06', 'mehandibysana' ) ) ),
		);
		return $ordered;
	}

	return array_values( $plates );
}

/**
 * Product storage & freshness care note (PDP accordion)
 */
function mbs_get_product_care_note( $product ) {
	if ( ! $product instanceof WC_Product ) {
		return '';
	}
	$haystack = strtolower( $product->get_slug() . ' ' . $product->get_name() );
	if ( str_contains( $haystack, 'cone' ) || str_contains( $haystack, 'kit' ) ) {
		return __( 'Freshly mixed organic henna paste is perishable. Store unused cones in a sealed pouch in the freezer at -18°C within 48 hours of delivery (up to 3–4 months). Thaw at room temperature for 15–20 minutes before application, keep the pin tip capped between breaks, and avoid water for 12–24 hours after paste removal for peak mahogany oxidation.', 'mehandibysana' );
	}
	if ( str_contains( $haystack, 'powder' ) || str_contains( $haystack, 'bulk' ) ) {
		return __( 'Keep triple-sifted organic henna leaf powder tightly sealed in its moisture-barrier pouch in a cool, dark cupboard away from humidity and direct sunlight. Use within 12 months of opening for vibrant dye release.', 'mehandibysana' );
	}
	if ( str_contains( $haystack, 'oil' ) || str_contains( $haystack, 'balm' ) || str_contains( $haystack, 'sealant' ) ) {
		return __( 'Store tightly closed in a cool, shaded place away from direct heat or sunlight. Apply aftercare balm before water contact and throughout the 48-hour stain maturation window to protect and deepen the natural mahogany tone.', 'mehandibysana' );
	}
	return __( 'Store in a cool, dry place away from direct sunlight and moisture. Keep containers tightly sealed between uses to preserve botanical potency.', 'mehandibysana' );
}
