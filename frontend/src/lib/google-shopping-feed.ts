import { getSiteUrl } from '@/lib/env';
import { cleanSeoText, DEFAULT_OG_IMAGE_PATH, SITE_NAME, toAbsoluteUrl } from '@/lib/seo';
import { fetchCatalogProducts } from '@/lib/catalog';
import type { StorefrontProduct } from '@/types/storefront';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveGoogleProductCategory(product: StorefrontProduct): string {
  const name = product.name.toLowerCase();
  const slug = product.slug.toLowerCase();
  const categoryNames = product.categories.map((c) => c.name.toLowerCase()).join(' ');
  const combined = `${name} ${slug} ${categoryNames}`;

  if (combined.includes('tool') || combined.includes('sheet') || combined.includes('tape') || combined.includes('stand') || combined.includes('brush') || combined.includes('bowl') || combined.includes('scale') || combined.includes('spoon') || combined.includes('pillow') || combined.includes('cutter') || combined.includes('guide') || combined.includes('practice hand')) {
    return 'Arts & Entertainment > Hobbies & Creative Arts > Crafts & Hobbies';
  }

  if (combined.includes('oil') || combined.includes('eucalyptus') || combined.includes('cajeput')) {
    return 'Health & Beauty > Personal Care > Aromatherapy > Essential Oils';
  }

  if (combined.includes('balm') || combined.includes('aftercare') || combined.includes('sealant')) {
    return 'Health & Beauty > Personal Care > Cosmetics > Skin Care';
  }

  if (combined.includes('hair') || combined.includes('powder')) {
    return 'Health & Beauty > Personal Care > Hair Care > Hair Color';
  }

  // Default for organic henna cones, kits, nails
  return 'Health & Beauty > Personal Care > Cosmetics > Henna';
}

/**
 * Builds a Google Merchant Center RSS 2.0 XML product feed.
 */
export async function generateGoogleShoppingFeedXml(): Promise<string> {
  const siteUrl = getSiteUrl();
  const catalog = await fetchCatalogProducts({ perPage: 100 });
  const products = catalog.products || [];

  const itemsXml: string[] = [];

  for (const product of products) {
    const productUrl = toAbsoluteUrl(`/product/${encodeURIComponent(product.slug)}`);
    const cleanDescription = cleanSeoText(
      product.description || product.shortDescription || product.name,
      4900
    );

    const primaryImage = product.images.length > 0
      ? toAbsoluteUrl(product.images[0].src)
      : toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH);

    const secondaryImages = product.images.slice(1, 10).map((img) => toAbsoluteUrl(img.src));

    const googleCategory = resolveGoogleProductCategory(product);
    const productType = product.categories.length > 0
      ? product.categories.map((c) => c.name).join(' > ')
      : 'Organic Henna & Mehandi';

    // If product has distinct variations, export each as a variant item linked by item_group_id
    if (product.variations && product.variations.length > 1) {
      for (const variant of product.variations) {
        const variantTitle = variant.attributes.length > 0
          ? `${product.name} - ${variant.attributes.map((a) => a.value).join(' ')}`
          : product.name;

        const variantPrice = (variant.price > 0 ? variant.price : product.price).toFixed(2);
        const variantAvailability = variant.inStock ? 'in_stock' : 'out_of_stock';
        const variantId = `${product.slug}-${variant.id}`;

        itemsXml.push(`    <item>
      <g:id>${escapeXml(variantId)}</g:id>
      <g:item_group_id>${escapeXml(product.slug)}</g:item_group_id>
      <g:title>${escapeXml(variantTitle)}</g:title>
      <g:description><![CDATA[${cleanDescription}]]></g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>
${secondaryImages.map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n')}
      <g:condition>new</g:condition>
      <g:availability>${variantAvailability}</g:availability>
      <g:price>${variantPrice} INR</g:price>
      <g:brand>${escapeXml(SITE_NAME)}</g:brand>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Express Delivery</g:service>
        <g:price>60.00 INR</g:price>
      </g:shipping>
    </item>`);
      }
    } else {
      // Single product
      const price = product.price.toFixed(2);
      const availability = product.inStock ? 'in_stock' : 'out_of_stock';

      itemsXml.push(`    <item>
      <g:id>${escapeXml(product.slug)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description><![CDATA[${cleanDescription}]]></g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(primaryImage)}</g:image_link>
${secondaryImages.map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join('\n')}
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price} INR</g:price>
      <g:brand>${escapeXml(SITE_NAME)}</g:brand>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Express Delivery</g:service>
        <g:price>60.00 INR</g:price>
      </g:shipping>
    </item>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} | Official Organic Henna Catalog</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Handcrafted 100% Organic Henna Cones, Triple-Sifted Powder, Essential Oils &amp; Bridal Artistry Supplies by Sana.</description>
${itemsXml.join('\n')}
  </channel>
</rss>`;
}
