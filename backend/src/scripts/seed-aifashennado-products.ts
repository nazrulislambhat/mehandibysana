import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from '@medusajs/medusa/core-flows';
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from '@medusajs/framework/utils';
import type { ExecArgs } from '@medusajs/framework/types';

/**
 * Pricing helper: 50% percentage increase (1.5x) rounded to the nearest number ending in 9.
 * e.g., 50 -> 75 -> 79, 67 -> 100.5 -> 99 / 67 -> 69, 299 -> 449, etc.
 */
export function calculateStudioPrice(originalPrice: number): number {
  const increased = originalPrice * 1.5;
  return Math.max(9, Math.round((increased - 9) / 10) * 10 + 9);
}

const TOOL_IMAGE_BASE_URL = 'https://mehandibysana.vercel.app/images/tools';

export default async function seedAifashennadoProducts({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info('=====================================================');
  logger.info('  IMPORTING AIFASHENNADO HENNA TOOLS & SUPPLIES     ');
  logger.info('=====================================================');

  const { data: salesChannels } = await query.graph({
    entity: 'sales_channel',
    fields: ['id', 'name'],
  });
  const salesChannel = salesChannels[0];

  const { data: shippingProfiles } = await query.graph({
    entity: 'shipping_profile',
    fields: ['id'],
  });
  const shippingProfile = shippingProfiles[0];

  // Ensure "Mehandi Tools & Supplies" category exists
  const categoryName = 'Mehandi Tools & Supplies';
  const categoryHandle = 'mehandi-tools-supplies';

  const { data: existingCategories } = await query.graph({
    entity: 'product_category',
    fields: ['id', 'name', 'handle'],
  });

  let toolsCategory: any = existingCategories.find(
    (c: any) => c.handle === categoryHandle || c.name === categoryName,
  );

  if (!toolsCategory) {
    const { result: created } = await createProductCategoriesWorkflow(
      container,
    ).run({
      input: {
        product_categories: [
          {
            name: categoryName,
            handle: categoryHandle,
            description:
              'Precision cellophane cone sheets, armrest cushions, cone stands, artist practice books, and professional supplies for henna artists.',
            is_active: true,
            is_internal: false,
          },
        ],
      },
    });
    toolsCategory = created[0];
    logger.info(`✓ Created category "${categoryName}" (${toolsCategory.id})`);
  }

  const newProducts = [
    {
      title: 'Professional Henna Armrest Cushion Pillow',
      handle: 'professional-henna-armrest-pillow',
      subtitle:
        'Ergonomic cushioned armrest with washable zip cover for client comfort during long bridal sessions',
      description:
        'Designed specifically for bridal mehandi artists, this ergonomic armrest cushion elevates and supports your client\'s arm at the ideal height and angle during intricate multi-hour henna sessions. Features high-density memory foam resilience that eliminates wrist strain for the artist, and an ultra-soft zippered cover that slips off easily for hygienic washing between appointments.',
      weight: 350,
      options: [
        {
          title: 'Size',
          values: ['Single Hand (Standard)', 'Double Hand (Extended Studio)'],
        },
      ],
      variants: [
        {
          title: 'Single Hand (Standard)',
          sku: 'MBS-ARMREST-SINGLE',
          options: { Size: 'Single Hand (Standard)' },
          prices: [
            { amount: calculateStudioPrice(299), currency_code: 'inr' }, // 449
            { amount: 9, currency_code: 'usd' },
          ],
        },
        {
          title: 'Double Hand (Extended Studio)',
          sku: 'MBS-ARMREST-DOUBLE',
          options: { Size: 'Double Hand (Extended Studio)' },
          prices: [
            { amount: calculateStudioPrice(369), currency_code: 'inr' }, // 549
            { amount: 11, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Ergonomic cushioned armrest with washable zip cover for client comfort during long bridal sessions.',
        tool_group: 'Artist Ergonomics',
        source: 'aifashennado',
      },
    },
    {
      title: 'Stainless Steel Henna Cone Holder Stand',
      handle: 'steel-henna-cone-holder-stand',
      subtitle:
        'Heavyweight non-tip steel stand to hold active henna cones upright without tip clogging or leaks',
      description:
        'Eliminate messy table spills and crushed cone tips with this heavy-base stainless steel cone stand. Holds your active cones upright between strokes, preventing henna paste from drying out at the orifice or leaking onto client hands. Mirror-polished rustproof finish is easy to sanitize with alcohol wipes.',
      weight: 220,
      options: [
        {
          title: 'Capacity',
          values: ['Single Cone', 'Triple Cone Studio Stand', '6-Cone Artist Tier'],
        },
      ],
      variants: [
        {
          title: 'Single Cone',
          sku: 'MBS-CONESTAND-1',
          options: { Capacity: 'Single Cone' },
          prices: [
            { amount: calculateStudioPrice(249), currency_code: 'inr' }, // 369
            { amount: 8, currency_code: 'usd' },
          ],
        },
        {
          title: 'Triple Cone Studio Stand',
          sku: 'MBS-CONESTAND-3',
          options: { Capacity: 'Triple Cone Studio Stand' },
          prices: [
            { amount: calculateStudioPrice(289), currency_code: 'inr' }, // 429
            { amount: 9, currency_code: 'usd' },
          ],
        },
        {
          title: '6-Cone Artist Tier',
          sku: 'MBS-CONESTAND-6',
          options: { Capacity: '6-Cone Artist Tier' },
          prices: [
            { amount: calculateStudioPrice(449), currency_code: 'inr' }, // 669
            { amount: 14, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Heavyweight non-tip steel stand to hold active henna cones upright without tip clogging or leaks.',
        tool_group: 'Artist Accessories',
        source: 'aifashennado',
      },
    },
    {
      title: 'Professional Henna Shading & Detailing Brush Set',
      handle: 'professional-mehandi-shading-brushes',
      subtitle:
        'Ultra-fine synthetic filbert & liner brushes for soft henna shading, gradient filling, and crisp line work',
      description:
        'Engineered for modern Arabic, Indo-Western, and portrait mehandi techniques, these high-resilience synthetic artist brushes enable seamless paste shading, soft gradients, and precise motif touch-ups. Soft bristles blend wet henna smoothly without disturbing baseline geometry or pulling delicate skin.',
      weight: 45,
      options: [
        {
          title: 'Tip Style',
          values: [
            'Fine Shading Brush #000',
            'Dual Brush Studio Pack (#000 & Filbert)',
          ],
        },
      ],
      variants: [
        {
          title: 'Fine Shading Brush #000',
          sku: 'MBS-BRUSH-000',
          options: { 'Tip Style': 'Fine Shading Brush #000' },
          prices: [
            { amount: calculateStudioPrice(35), currency_code: 'inr' }, // 49
            { amount: 2, currency_code: 'usd' },
          ],
        },
        {
          title: 'Dual Brush Studio Pack (#000 & Filbert)',
          sku: 'MBS-BRUSH-DUO',
          options: { 'Tip Style': 'Dual Brush Studio Pack (#000 & Filbert)' },
          prices: [
            { amount: calculateStudioPrice(79), currency_code: 'inr' }, // 119
            { amount: 3, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Ultra-fine synthetic filbert & liner brushes for soft henna shading, gradient filling, and crisp line work.',
        tool_group: 'Detailing & Shading',
        source: 'aifashennado',
      },
    },
    {
      title: 'Medical-Grade Breathable Henna Fixation Tape',
      handle: 'breathable-henna-fixation-tape',
      subtitle:
        'Microporous hypoallergenic adhesive tape to seal bridal mehandi overnight for maximum dark stain',
      description:
        'Replace messy cling wrap with flexible, medical-grade breathable henna tape. Allows skin perspiration while locking essential lemon-sugar moisture against the skin for 8-12 hours, guaranteeing maximum lawsone penetration and rich, deep mahogany stain development without smudging intricate lines.',
      weight: 80,
      options: [
        {
          title: 'Length',
          values: ['1 Roll (5cm x 5m)', 'Pack of 10 Studio Rolls'],
        },
      ],
      variants: [
        {
          title: '1 Roll (5cm x 5m)',
          sku: 'MBS-TAPE-1ROLL',
          options: { Length: '1 Roll (5cm x 5m)' },
          prices: [
            { amount: calculateStudioPrice(49), currency_code: 'inr' }, // 69
            { amount: 2, currency_code: 'usd' },
          ],
        },
        {
          title: 'Pack of 10 Studio Rolls',
          sku: 'MBS-TAPE-10PACK',
          options: { Length: 'Pack of 10 Studio Rolls' },
          prices: [
            { amount: calculateStudioPrice(399), currency_code: 'inr' }, // 599
            { amount: 12, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Microporous hypoallergenic adhesive tape to seal bridal mehandi overnight for maximum dark stain.',
        tool_group: 'Aftercare & Fixation',
        source: 'aifashennado',
      },
    },
    {
      title: 'Reusable A3 Mehandi Practice & Grid Guide Book',
      handle: 'reusable-a3-mehandi-practice-guide-book',
      subtitle:
        'Laminated wipe-clean bridal layout templates, mandalas, checks, and finger grids for daily cone control practice',
      description:
        'Master consistent cone pressure, line thickness, and bridal motifs with this heavy-gauge laminated A3 practice book. Includes progressive design templates—from basic humps and teardrops to complex bridal mandalas, wrist cuffs, and checks. Wipe clean with a dry or damp microfiber cloth for infinite practice sessions.',
      weight: 420,
      options: [
        {
          title: 'Edition',
          values: ['A3 Master Edition (Spiral Bound)'],
        },
      ],
      variants: [
        {
          title: 'A3 Master Edition (Spiral Bound)',
          sku: 'MBS-PRACTICE-A3',
          options: { Edition: 'A3 Master Edition (Spiral Bound)' },
          prices: [
            { amount: calculateStudioPrice(379), currency_code: 'inr' }, // 569
            { amount: 12, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Laminated wipe-clean bridal layout templates, mandalas, checks, and finger grids for daily cone control practice.',
        tool_group: 'Practice & Learning',
        source: 'aifashennado',
      },
    },
    {
      title: 'Precision Cellophane Cone Sheet Trimmer & Cutter',
      handle: 'precision-cellophane-cone-sheet-cutter',
      subtitle:
        'Guillotine sliding blade trimmer for clean, burr-free cuts on cellophane and florist film rolls',
      description:
        'Get razor-sharp, perfectly square cellophane sheets every time. Features an integrated measuring grid and self-sharpening rotary cutter that glides cleanly through multiple layers of cellophane, BOPP film, and florist rolls without fraying edges or static clinging.',
      weight: 290,
      options: [
        {
          title: 'Size',
          values: ['A5 Precision Trimmer', 'A4 Studio Trimmer'],
        },
      ],
      variants: [
        {
          title: 'A5 Precision Trimmer',
          sku: 'MBS-CUTTER-A5',
          options: { Size: 'A5 Precision Trimmer' },
          prices: [
            { amount: calculateStudioPrice(189), currency_code: 'inr' }, // 279
            { amount: 6, currency_code: 'usd' },
          ],
        },
        {
          title: 'A4 Studio Trimmer',
          sku: 'MBS-CUTTER-A4',
          options: { Size: 'A4 Studio Trimmer' },
          prices: [
            { amount: calculateStudioPrice(199), currency_code: 'inr' }, // 289
            { amount: 7, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Guillotine sliding blade trimmer for clean, burr-free cuts on cellophane and florist film rolls.',
        tool_group: 'Cone Rolling Tools',
        source: 'aifashennado',
      },
    },
    {
      title: 'Pure High-Terpene Cajeput Essential Oil',
      handle: 'pure-organic-cajeput-essential-oil',
      subtitle:
        'Steam-distilled 100% pure Melaleuca cajuputi oil for deep, dark henna stain oxidation',
      description:
        'Unadulterated, steam-distilled Cajeput essential oil naturally rich in cineol terpenes. Acts as a powerful natural solvent that releases and oxidizes the lawsone dye molecule in fresh henna powder, delivering intense dark burgundy-to-black stain results. Laboratory-tested pure with zero synthetics, mineral oil, or alcohol.',
      weight: 110,
      options: [
        {
          title: 'Volume',
          values: [
            '15ml Glass Dropper',
            '30ml Studio Bottle',
            '100ml Bulk Refill',
          ],
        },
      ],
      variants: [
        {
          title: '15ml Glass Dropper',
          sku: 'MBS-OIL-CAJEPUT-15',
          options: { Volume: '15ml Glass Dropper' },
          prices: [
            { amount: calculateStudioPrice(119), currency_code: 'inr' }, // 179
            { amount: 4, currency_code: 'usd' },
          ],
        },
        {
          title: '30ml Studio Bottle',
          sku: 'MBS-OIL-CAJEPUT-30',
          options: { Volume: '30ml Studio Bottle' },
          prices: [
            { amount: calculateStudioPrice(319), currency_code: 'inr' }, // 479
            { amount: 10, currency_code: 'usd' },
          ],
        },
        {
          title: '100ml Bulk Refill',
          sku: 'MBS-OIL-CAJEPUT-100',
          options: { Volume: '100ml Bulk Refill' },
          prices: [
            { amount: calculateStudioPrice(779), currency_code: 'inr' }, // 1169
            { amount: 24, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Steam-distilled 100% pure Melaleuca cajuputi oil for deep, dark henna stain oxidation.',
        tool_group: 'Essential Oils',
        source: 'aifashennado',
      },
    },
    {
      title: 'Natural Pure White Beeswax Pellets for Henna Sealant',
      handle: 'natural-organic-white-beeswax-pellets',
      subtitle:
        'Triple-filtered 100% natural cosmetic-grade beeswax pellets for handcrafted henna balms and post-removal care',
      description:
        'Premium cosmetic-grade triple-filtered natural beeswax pastilles with a mild honey aroma. Melts smoothly with coconut or sweet almond oil to create protective waterproof henna aftercare balms that preserve paste stains before client hand washing.',
      weight: 150,
      options: [
        {
          title: 'Weight',
          values: ['100g Pouch', '250g Studio Pouch', '500g Bulk Pack'],
        },
      ],
      variants: [
        {
          title: '100g Pouch',
          sku: 'MBS-BEESWAX-100',
          options: { Weight: '100g Pouch' },
          prices: [
            { amount: calculateStudioPrice(35), currency_code: 'inr' }, // 49
            { amount: 2, currency_code: 'usd' },
          ],
        },
        {
          title: '250g Studio Pouch',
          sku: 'MBS-BEESWAX-250',
          options: { Weight: '250g Studio Pouch' },
          prices: [
            { amount: calculateStudioPrice(59), currency_code: 'inr' }, // 89
            { amount: 3, currency_code: 'usd' },
          ],
        },
        {
          title: '500g Bulk Pack',
          sku: 'MBS-BEESWAX-500',
          options: { Weight: '500g Bulk Pack' },
          prices: [
            { amount: calculateStudioPrice(299), currency_code: 'inr' }, // 449
            { amount: 9, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Triple-filtered 100% natural cosmetic-grade beeswax pellets for handcrafted henna balms and post-removal care.',
        tool_group: 'Balm & Aftercare Ingredients',
        source: 'aifashennado',
      },
    },
  ];

  let createdCount = 0;
  for (const item of newProducts) {
    const productImageUrl = `${TOOL_IMAGE_BASE_URL}/${item.handle}.jpg`;
    const { data: existing } = await query.graph({
      entity: 'product',
      fields: ['id', 'handle'],
      filters: { handle: item.handle },
    });

    if (existing && existing.length > 0) {
      logger.info(`Product "${item.title}" (${item.handle}) already exists, skipping.`);
      continue;
    }

    try {
      await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: item.title,
              handle: item.handle,
              subtitle: item.subtitle,
              description: item.description,
              weight: item.weight,
              status: ProductStatus.PUBLISHED,
              shipping_profile_id: shippingProfile.id,
              sales_channels: [{ id: salesChannel.id }],
              category_ids: [toolsCategory.id],
              thumbnail: productImageUrl,
              images: [{ url: productImageUrl }],
              options: item.options,
              variants: item.variants.map((v) => ({
                ...v,
                manage_inventory: false,
              })),
              metadata: item.metadata,
            },
          ],
        },
      });
      createdCount++;
      logger.info(`✓ Added Aifashennado product: "${item.title}" (${item.variants.length} variants)`);
    } catch (err: any) {
      logger.error(`✗ Failed to add "${item.title}": ${err.message}`);
    }
  }

  logger.info('=====================================================');
  logger.info(`  COMPLETED: ${createdCount} AIFASHENNADO PRODUCTS IMPORTED`);
  logger.info('=====================================================');
}
