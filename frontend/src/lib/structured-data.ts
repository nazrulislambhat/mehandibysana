import { getSiteUrl } from '@/lib/env';
import {
  cleanSeoText,
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  STUDIO_EMAIL,
  STUDIO_PHONE,
  toAbsoluteUrl,
} from '@/lib/seo';
import type { StorefrontProduct } from '@/types/storefront';

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildSiteGraphJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;
  const artistId = `${siteUrl}/#artist`;
  const websiteId = `${siteUrl}/#website`;
  const logoUrl = toAbsoluteUrl('/brand/mehandi-by-sana-crest-light-4k.png');
  const brandBannerUrl = toAbsoluteUrl('/brand/mehandi-by-sana-social-banner-4k.png');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE_NAME,
        url: siteUrl,
        foundingDate: '2019',
        description:
          'Independent freelance organic mehandi practice and small-batch botanical apothecary founded in 2019 by Sana, serving clients across Srinagar and Bengaluru.',
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
          width: 3840,
          height: 3840,
        },
        image: brandBannerUrl,
        founder: { '@id': artistId },
        email: STUDIO_EMAIL,
        telephone: STUDIO_PHONE,
        areaServed: [
          { '@type': 'City', name: 'Srinagar' },
          { '@type': 'State', name: 'Jammu and Kashmir' },
          { '@type': 'City', name: 'Bengaluru' },
          { '@type': 'State', name: 'Karnataka' },
          { '@type': 'Country', name: 'India' },
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: STUDIO_PHONE,
            email: STUDIO_EMAIL,
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi', 'Urdu', 'Kashmiri'],
          },
        ],
      },
      {
        '@type': 'Person',
        '@id': artistId,
        name: 'Sumaiya Rashid Magray',
        alternateName: 'Sana',
        jobTitle: 'Founder & Freelance Organic Mehandi Artist',
        url: `${siteUrl}/about`,
        worksFor: { '@id': orgId },
        homeLocation: {
          '@type': 'Place',
          name: 'Srinagar & Bengaluru, India',
        },
      },
      {
        '@type': 'Service',
        '@id': `${siteUrl}/#freelance-artistry`,
        name: `${SITE_NAME} — Freelance Bridal & Botanical Mehandi Services`,
        serviceType: 'Freelance Bridal & Celebration Organic Mehandi Artistry',
        url: `${siteUrl}/services`,
        image: brandBannerUrl,
        provider: { '@id': orgId },
        areaServed: ['Srinagar', 'Jammu and Kashmir', 'Bengaluru', 'Karnataka', 'India'],
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `${siteUrl}/contact`,
          servicePhone: STUDIO_PHONE,
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteUrl,
        name: SITE_NAME,
        description:
          'Freelance organic mehandi artist & botanical apothecary working across Srinagar & Bengaluru since 2019 — small-batch fresh henna cones, triple-sifted hair henna powder, botanical oils, and bridal mehandi services.',
        publisher: { '@id': orgId },
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildProductJsonLd(
  product: StorefrontProduct
): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;
  const productUrl = `${siteUrl}/product/${encodeURIComponent(product.slug)}`;
  const images =
    product.images.length > 0
      ? product.images.map((img) => toAbsoluteUrl(img.src))
      : [toAbsoluteUrl(DEFAULT_OG_IMAGE_PATH)];

  const defaultVariation =
    product.variations.find((v) => v.inStock) ?? product.variations[0] ?? null;

  const offerPrices = product.variations
    .map((v) => v.price)
    .filter((p) => Number.isFinite(p) && p > 0);
  const lowPrice = offerPrices.length > 0 ? Math.min(...offerPrices) : product.price;
  const highPrice = offerPrices.length > 0 ? Math.max(...offerPrices) : product.price;

  const offers =
    product.variations.length > 1
      ? {
          '@type': 'AggregateOffer',
          url: productUrl,
          priceCurrency: 'INR',
          lowPrice: lowPrice.toFixed(2),
          highPrice: highPrice.toFixed(2),
          offerCount: product.variations.length,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          offers: product.variations.map((v) => ({
            '@type': 'Offer',
            url: productUrl,
            ...(v.attributes.length > 0
              ? { name: v.attributes.map((a) => a.value).join(' · ') }
              : {}),
            priceCurrency: 'INR',
            price: v.price.toFixed(2),
            availability: v.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': orgId },
            ...(v.sku ? { sku: v.sku } : {}),
          })),
        }
      : {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: (defaultVariation?.price ?? product.price).toFixed(2),
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': orgId },
          ...(defaultVariation?.sku ? { sku: defaultVariation.sku } : {}),
        };

  const categoryText =
    product.categories.length > 0
      ? product.categories.map((c) => c.name).join(' > ')
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description: cleanSeoText(
      product.shortDescription || product.description || product.name,
      360
    ),
    url: productUrl,
    image: images,
    ...(defaultVariation?.sku ? { sku: defaultVariation.sku } : {}),
    ...(categoryText ? { category: categoryText } : {}),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    manufacturer: { '@id': orgId },
    offers,
  };
}

export function buildCollectionPageJsonLd(options: {
  title: string;
  description: string;
  path: string;
  products: StorefrontProduct[];
}): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const pageUrl = toAbsoluteUrl(options.path);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: options.title,
    description: options.description,
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: options.products.length,
      itemListElement: options.products.map((product, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${siteUrl}/product/${encodeURIComponent(product.slug)}`,
        name: product.name,
        ...(product.images[0]?.src
          ? { image: toAbsoluteUrl(product.images[0].src) }
          : {}),
      })),
    },
  };
}

export function buildAboutPageJsonLd(
  awards: Array<{ title: string; description: string; links?: Array<{ href: string }> }>
): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/about`;
  const pressUrls = awards.flatMap((a) => (a.links ? a.links.map((l) => l.href) : []));

  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: 'About Mehandi by Sana',
    description:
      'Story of Sana, Electronics & Communication Engineering graduate turned Kashmir pioneer in 100% chemical-free organic henna artistry and apothecary care.',
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: {
      '@type': 'Person',
      name: 'Sumaiya Rashid Magray',
      alternateName: 'Sana',
      jobTitle: 'Founder & Organic Henna Artist',
      worksFor: { '@id': `${siteUrl}/#organization` },
      homeLocation: {
        '@type': 'Place',
        name: 'Srinagar & Bengaluru, India',
      },
      award: awards.map((a) => `${a.title}: ${a.description}`),
      ...(pressUrls.length > 0 ? { subjectOf: pressUrls } : {}),
    },
  };
}

export function buildServicesJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;
  const pageUrl = `${siteUrl}/services`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: 'Bridal Mehandi Services, Celebrations & Masterclasses | Mehandi by Sana',
    description:
      'Bespoke bridal mehandi appointments, celebration henna gatherings across Srinagar, Bengaluru & destination venues, custom bulk cones, and 15-day Mehandi Masterclasses.',
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: {
      '@type': 'OfferCatalog',
      name: 'Mehandi by Sana Services & Workshops',
      itemListElement: [
        {
          '@type': 'Service',
          name: 'Bridal Mehandi',
          description:
            'Full-arm and feet bridal coverage with Kashmiri, Mughal archway, peacock, and botanical motifs applied with 0.38mm hand-rolled organic henna cones.',
          provider: { '@id': orgId },
          areaServed: ['Srinagar', 'Jammu and Kashmir', 'Bengaluru', 'India'],
        },
        {
          '@type': 'Service',
          name: 'Events & Celebrations Henna',
          description:
            'Engagement ceremonies, Eid festivities, and bridal celebration bookings with Sana (plus independent guest artists arranged on request) at home or venue.',
          provider: { '@id': orgId },
          areaServed: ['Srinagar', 'Jammu and Kashmir', 'Bengaluru', 'India'],
        },
        {
          '@type': 'Course',
          name: '15-Day Mehandi Masterclass',
          description:
            '15-day structured curriculum covering organic paste chemistry, cellophane cone rolling, and fine bridal linework.',
          provider: { '@id': orgId },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: '3500.00',
            url: `${siteUrl}/contact?service=botanical`,
          },
        },
      ],
    },
  };
}

export function buildGalleryJsonLd(
  plates: Array<{ title: string; caption: string; imageSrc: string; imageAlt: string }>
): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const orgId = `${siteUrl}/#organization`;
  const pageUrl = `${siteUrl}/gallery`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    '@id': `${pageUrl}#gallery`,
    url: pageUrl,
    name: 'Bridal Mehandi Portfolio & Botanical Stain Gallery | Mehandi by Sana',
    description:
      'Selected organic bridal mehandi designs, Kashmiri Chinar motifs, Mughal archways, and 48-hour natural mahogany stain studies.',
    isPartOf: { '@id': `${siteUrl}/#website` },
    creator: { '@id': orgId },
    associatedMedia: plates.map((plate) => ({
      '@type': 'ImageObject',
      name: plate.title,
      caption: plate.caption,
      contentUrl: toAbsoluteUrl(plate.imageSrc),
      description: plate.imageAlt,
      creator: { '@id': orgId },
    })),
  };
}

export function buildHennaCareHowToJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/henna-care`;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${pageUrl}#howto`,
    name: 'How to Store Fresh Organic Henna Cones & Achieve a Deep Mahogany Stain',
    description:
      'Step-by-step storage, thawing, clean skin preparation, sealing, and 48-hour oxidation care guide for 100% pure organic Sojat henna.',
    totalTime: 'P2D',
    supply: [
      { '@type': 'HowToSupply', name: '100% Pure Organic Henna Cones (Mehandi by Sana)' },
      { '@type': 'HowToSupply', name: 'Sealant Spray or Lemon-Sugar Cotton Dab' },
      { '@type': 'HowToSupply', name: 'Sana Stain Darkening Aftercare Balm or Sweet Oil' },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Deep Freeze Unused Cones Immediately (-18°C)',
        url: `${pageUrl}#freezer-storage`,
        text: 'Place cones not used within 48 hours of delivery inside a sealed zip-lock pouch in your deep freezer (-18°C or colder) where potency lasts 3 to 4 months.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Thaw Gently at Room Temperature',
        url: `${pageUrl}#thawing-ritual`,
        text: 'Rest needed cones at room temperature for 15–20 minutes before pulling the 0.38mm tip pin. Never microwave or soak in hot water.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Prepare Clean Bare Skin',
        url: `${pageUrl}#skin-prep`,
        text: 'Wash skin with soap and water and pat dry completely. Apply zero lotions, hand creams, or sunscreen prior to mehandi application.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Dry, Seal & Scrape Without Water',
        url: `${pageUrl}#aftercare-seal`,
        text: 'Leave dried paste on skin 4–6+ hours with light sealant mist, then scrape off crumbs using aftercare balm or oil instead of washing with water for the first 12–24 hours.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Accelerate Stain Oxidation with Warmth',
        url: `${pageUrl}#winter-tips`,
        text: 'Keep hands warm after balm application or use gentle clove steam carefully so body warmth deepens the 48-hour mahogany oxidation.',
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Prepare Organic Triple-Sifted Hair Henna Overnight',
        url: `${pageUrl}#hair-henna`,
        text: 'Mix triple-sifted Sojat hair henna powder with brewed black tea or chamomile decoction in a glass bowl, rest 6–8 hours overnight for dye release, and apply to clean hair for 2–3 hours.',
      },
    ],
  };
}

export function buildContactPageJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/contact`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: 'Contact & Bridal Booking Inquiries | Mehandi by Sana',
    description:
      'Request bridal mehandi dates, celebration henna appointments, or product order guidance from Sana across Srinagar & Bengaluru.',
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: { '@id': `${siteUrl}/#organization` },
  };
}
