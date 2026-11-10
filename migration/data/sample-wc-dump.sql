-- Sample WordPress + WooCommerce SQL Dump Fixture for Zero-Data-Loss Verification
INSERT INTO `wp_terms` (`term_id`, `name`, `slug`, `term_group`) VALUES
(10, 'Organic Henna', 'organic-henna', 0),
(11, 'Cones &amp; Accessories', 'cones-accessories', 0),
(12, 'Bridal', 'bridal', 0),
(13, '100gm', '100gm', 0),
(14, '250gm', '250gm', 0);

INSERT INTO `wp_term_taxonomy` (`term_taxonomy_id`, `term_id`, `taxonomy`, `description`, `parent`, `count`) VALUES
(100, 10, 'product_cat', 'Fresh triple-sifted organic henna', 0, 1),
(101, 11, 'product_cat', 'Cones and artist supplies', 0, 1),
(102, 12, 'product_tag', '', 0, 1),
(103, 13, 'pa_net-weight', '', 0, 1),
(104, 14, 'pa_net-weight', '', 0, 1);

INSERT INTO `wp_term_relationships` (`object_id`, `term_taxonomy_id`, `term_order`) VALUES
(501, 100, 0),
(501, 102, 0),
(501, 103, 0),
(501, 104, 0);

INSERT INTO `wp_posts` (`ID`, `post_author`, `post_date`, `post_date_gmt`, `post_content`, `post_title`, `post_excerpt`, `post_status`, `comment_status`, `ping_status`, `post_password`, `post_name`, `to_ping`, `pinged`, `post_modified`, `post_modified_gmt`, `post_content_filtered`, `post_parent`, `guid`, `menu_order`, `post_type`, `post_mime_type`, `comment_count`) VALUES
(501, 1, '2026-01-10 10:00:00', '2026-01-10 04:30:00', '<p>Triple-sifted Rajasthani bridal henna powder.</p>', 'Bridal Body Art Henna Powder', 'Ultra-fine stain release powder', 'publish', 'open', 'closed', '', 'bridal-body-art-henna-powder', '', '', '2026-01-10 10:00:00', '2026-01-10 04:30:00', '', 0, 'https://mehandibysana.com/?post_type=product&p=501', 1, 'product', '', 0),
(502, 1, '2026-01-10 10:01:00', '2026-01-10 04:31:00', '', 'Bridal Body Art Henna Powder - 100gm', '100gm pouch', 'publish', 'closed', 'closed', '', 'bridal-body-art-henna-powder-100gm', '', '', '2026-01-10 10:01:00', '2026-01-10 04:31:00', '', 501, 'https://mehandibysana.com/?post_type=product_variation&p=502', 1, 'product_variation', '', 0),
(503, 1, '2026-01-10 10:02:00', '2026-01-10 04:32:00', '', 'Bridal Body Art Henna Powder - 250gm', '250gm pouch', 'publish', 'closed', 'closed', '', 'bridal-body-art-henna-powder-250gm', '', '', '2026-01-10 10:02:00', '2026-01-10 04:32:00', '', 501, 'https://mehandibysana.com/?post_type=product_variation&p=503', 2, 'product_variation', '', 0),
(601, 1, '2026-01-10 09:50:00', '2026-01-10 04:20:00', '', 'Bridal Henna Main', '', 'inherit', 'open', 'closed', '', 'bridal-henna-main', '', '', '2026-01-10 09:50:00', '2026-01-10 04:20:00', '', 501, 'https://mehandibysana.com/wp-content/uploads/2026/01/bridal-henna-main.png', 0, 'attachment', 'image/png', 0),
(602, 1, '2026-01-10 09:51:00', '2026-01-10 04:21:00', '', 'Bridal Henna Gallery', '', 'inherit', 'open', 'closed', '', 'bridal-henna-gallery', '', '', '2026-01-10 09:51:00', '2026-01-10 04:21:00', '', 501, 'https://mehandibysana.com/wp-content/uploads/2026/01/bridal-henna-gallery.png', 0, 'attachment', 'image/png', 0),
(701, 1, '2026-01-15 14:20:00', '2026-01-15 08:50:00', '', 'Order &ndash; January 15, 2026', '', 'wc-completed', 'closed', 'closed', '', 'order-jan-15', '', '', '2026-01-15 14:20:00', '2026-01-15 08:50:00', '', 0, 'https://mehandibysana.com/?post_type=shop_order&p=701', 0, 'shop_order', '', 0);

INSERT INTO `wp_postmeta` (`meta_id`, `post_id`, `meta_key`, `meta_value`) VALUES
(1, 501, '_sku', 'MBS-BRIDAL-POWDER'),
(2, 501, '_price', '160'),
(3, 501, '_regular_price', '160'),
(4, 501, '_weight', '100'),
(5, 501, '_thumbnail_id', '601'),
(6, 501, '_product_image_gallery', '602'),
(7, 501, '_product_attributes', 'a:1:{s:13:"pa_net-weight";a:6:{s:4:"name";s:13:"pa_net-weight";s:5:"value";s:0:"";s:8:"position";i:0;s:10:"is_visible";i:1;s:12:"is_variation";i:1;s:11:"is_taxonomy";i:1;}}'),
(8, 502, '_sku', 'MBS-BRIDAL-100G'),
(9, 502, '_price', '160'),
(10, 502, '_regular_price', '160'),
(11, 502, '_manage_stock', 'yes'),
(12, 502, '_stock', '45'),
(13, 502, 'attribute_pa_net-weight', '100gm'),
(14, 503, '_sku', 'MBS-BRIDAL-250G'),
(15, 503, '_price', '350'),
(16, 503, '_regular_price', '380'),
(17, 503, '_sale_price', '350'),
(18, 503, '_manage_stock', 'yes'),
(19, 503, '_stock', '28'),
(20, 503, 'attribute_pa_net-weight', '250gm'),
(21, 701, '_order_currency', 'INR'),
(22, 701, '_order_total', '410'),
(23, 701, '_order_shipping', '60'),
(24, 701, '_billing_first_name', 'Zoya'),
(25, 701, '_billing_last_name', 'Khan'),
(26, 701, '_billing_email', 'zoya@example.com'),
(27, 701, '_billing_postcode', '190001'),
(28, 701, '_billing_city', 'Srinagar'),
(29, 701, '_payment_method', 'cod'),
(30, 701, '_payment_method_title', 'Cash on Delivery');

INSERT INTO `wp_woocommerce_order_items` (`order_item_id`, `order_item_name`, `order_item_type`, `order_id`) VALUES
(901, 'Bridal Body Art Henna Powder - 250gm', 'line_item', 701);

INSERT INTO `wp_woocommerce_order_itemmeta` (`meta_id`, `order_item_id`, `meta_key`, `meta_value`) VALUES
(1001, 901, '_product_id', '501'),
(1002, 901, '_variation_id', '503'),
(1003, 901, '_qty', '1'),
(1004, 901, '_line_subtotal', '350'),
(1005, 901, '_line_total', '350');

