<?php
/**
 * WordPress Customizer Settings — Gallery Plate Image Overrides & Optional Hero/Founder Photos
 *
 * @package MehandiBySana
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'customize_register', function ( $wp_customize ) {
	$wp_customize->add_section(
		'mbs_atelier_media',
		array(
			'title'       => __( 'Mehandi by Sana — Brand Artwork & Gallery Plates', 'mehandibysana' ),
			'priority'    => 35,
			'description' => __( 'Optionally upload real photography to override the built-in botanical SVG illustrations or the 6 bridal exhibition gallery plates.', 'mehandibysana' ),
		)
	);

	// Optional Hero Image override (defaults to custom botanical mandala SVG)
	$wp_customize->add_setting(
		'mbs_hero_image_override',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'mbs_hero_image_override',
			array(
				'label'   => __( 'Hero Arch Image Override (Optional)', 'mehandibysana' ),
				'section' => 'mbs_atelier_media',
			)
		)
	);

	// Optional Founder Portrait override (defaults to custom Sana burqa illustration SVG)
	$wp_customize->add_setting(
		'mbs_founder_image_override',
		array(
			'default'           => '',
			'sanitize_callback' => 'esc_url_raw',
		)
	);
	$wp_customize->add_control(
		new WP_Customize_Image_Control(
			$wp_customize,
			'mbs_founder_image_override',
			array(
				'label'   => __( 'Founder Portrait Image Override (Optional)', 'mehandibysana' ),
				'section' => 'mbs_atelier_media',
			)
		)
	);

	// 6 Exhibition Plates
	$defaults = array(
		1 => 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-23.webp',
		2 => 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-22.webp',
		3 => 'https://mehandibysana.com/wp-content/uploads/2023/08/176480.jpg',
		4 => 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-21.webp',
		5 => 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-19.jpg',
		6 => 'https://mehandibysana.com/wp-content/uploads/2022/07/Mehandi-By-Sana-Square-New-20.jpg',
	);

	foreach ( $defaults as $idx => $def_url ) {
		$key = 'mbs_gallery_plate_' . $idx;
		$wp_customize->add_setting(
			$key,
			array(
				'default'           => $def_url,
				'sanitize_callback' => 'esc_url_raw',
			)
		);
		$wp_customize->add_control(
			new WP_Customize_Image_Control(
				$wp_customize,
				$key,
				array(
					'label'   => sprintf( __( 'Exhibition Plate 0%d Photo', 'mehandibysana' ), $idx ),
					'section' => 'mbs_atelier_media',
				)
			)
		);
	}
} );

