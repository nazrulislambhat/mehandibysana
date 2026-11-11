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
 * Seeds related henna preparation & artist tools into MedusaJS v2
 * using curated product imagery hosted in frontend/public/images/tools/.
 */
const TOOL_IMAGE_BASE_URL = 'https://mehandibysana.vercel.app/images/tools';

export default async function seedRelatedHennaProducts({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info('=====================================================');
  logger.info('  SEEDING RELATED HENNA TOOLS & ARTIST SUPPLIES      ');
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
              'Precision cellophane cone sheets, micro weighing scales, stainless measuring spoons, piping bags, sifting cloths, and artist prep tools for henna artists.',
            is_active: true,
            is_internal: false,
          },
        ],
      },
    });
    toolsCategory = created[0];
    logger.info(`✓ Created category "${categoryName}" (${toolsCategory.id})`);
  }

  const relatedProducts = [
    {
      title: 'Pre-Cut Cellophane Henna Cone Sheets',
      handle: 'pre-cut-cellophane-henna-cone-sheets',
      subtitle:
        'Crystal-clear 30-micron BOPP square sheets for effortless cone rolling',
      description:
        'High-clarity, crisp 30-micron cellophane sheets pre-cut into uniform 6" × 6" squares so you can roll smooth, leak-free henna cones with ultra-fine tips in seconds. Non-reactive food-grade film keeps essential oils potent without softening.',
      weight: 90,
      options: [
        {
          title: 'Pack Size',
          values: ['100 Sheets (6×6 in)', '250 Sheets (6×6 in)'],
        },
      ],
      variants: [
        {
          title: '100 Sheets (6×6 in)',
          sku: 'MBS-CELLO-100',
          options: { 'Pack Size': '100 Sheets (6×6 in)' },
          prices: [
            { amount: 120, currency_code: 'inr' },
            { amount: 3, currency_code: 'usd' },
          ],
        },
        {
          title: '250 Sheets (6×6 in)',
          sku: 'MBS-CELLO-250',
          options: { 'Pack Size': '250 Sheets (6×6 in)' },
          prices: [
            { amount: 260, currency_code: 'inr' },
            { amount: 6, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Crystal-clear 30-micron BOPP square sheets for effortless cone rolling.',
        tool_group: 'Cone Rolling',
        image_pending: false,
      },
    },
    {
      title: 'Stainless Steel Henna Measuring Spoons Set',
      handle: 'stainless-steel-henna-measuring-spoons',
      subtitle:
        '6-piece heavy-gauge steel spoons for exact essential oil & sugar ratios',
      description:
        'Precision-calibrated 304 stainless steel measuring spoons (1/8 tsp, 1/4 tsp, 1/2 tsp, 1 tsp, 1/2 tbsp, 1 tbsp) engineered for repeatable henna paste batches. Resists essential oil staining and cleans effortlessly between mixes.',
      weight: 140,
      options: [{ title: 'Set', values: ['6-Piece Precision Set'] }],
      variants: [
        {
          title: '6-Piece Precision Set',
          sku: 'MBS-SPOONS-6PC',
          options: { Set: '6-Piece Precision Set' },
          prices: [
            { amount: 180, currency_code: 'inr' },
            { amount: 4, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          '6-piece heavy-gauge steel spoons for exact essential oil & sugar ratios.',
        tool_group: 'Mixing & Measurement',
        image_pending: false,
      },
    },
    {
      title: 'Digital Precision Micro Weighing Scale',
      handle: 'digital-precision-micro-weighing-scale',
      subtitle:
        '0.01g high-accuracy backlit digital scale for henna powder & essential oils',
      description:
        'Precision artist-grade digital pocket scale with 0.01g readability, instant tare function, stainless steel weighing platform, and protective flip cover. Essential for weighing henna powder, sugar, and eucalyptus essential oil to the exact gram.',
      weight: 190,
      options: [
        {
          title: 'Capacity',
          values: ['0.01g – 500g Micro Scale', '0.1g – 3000g Pro Scale'],
        },
      ],
      variants: [
        {
          title: '0.01g – 500g Micro Scale',
          sku: 'MBS-SCALE-500G',
          options: { Capacity: '0.01g – 500g Micro Scale' },
          prices: [
            { amount: 450, currency_code: 'inr' },
            { amount: 9, currency_code: 'usd' },
          ],
        },
        {
          title: '0.1g – 3000g Pro Scale',
          sku: 'MBS-SCALE-3KG',
          options: { Capacity: '0.1g – 3000g Pro Scale' },
          prices: [
            { amount: 680, currency_code: 'inr' },
            { amount: 13, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          '0.01g high-accuracy backlit digital scale for henna powder & essential oils.',
        tool_group: 'Mixing & Measurement',
        image_pending: false,
      },
    },
    {
      title: 'Cone Filling Piping Bags (Carrot Bags)',
      handle: 'cone-filling-piping-bags',
      subtitle:
        'Burst-resistant 12-inch seamless piping bags for mess-free cone filling',
      description:
        'Thick, textured grip 12-inch disposable piping bags designed for transferring rested henna paste into individual cones without air bubbles or wrist strain. Simply snip the tip to match your cone opening.',
      weight: 110,
      options: [
        { title: 'Pack Size', values: ['Pack of 50 Bags', 'Pack of 100 Bags'] },
      ],
      variants: [
        {
          title: 'Pack of 50 Bags',
          sku: 'MBS-PIPING-50',
          options: { 'Pack Size': 'Pack of 50 Bags' },
          prices: [
            { amount: 140, currency_code: 'inr' },
            { amount: 3, currency_code: 'usd' },
          ],
        },
        {
          title: 'Pack of 100 Bags',
          sku: 'MBS-PIPING-100',
          options: { 'Pack Size': 'Pack of 100 Bags' },
          prices: [
            { amount: 240, currency_code: 'inr' },
            { amount: 5, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Burst-resistant 12-inch seamless piping bags for mess-free cone filling.',
        tool_group: 'Cone Rolling',
        image_pending: false,
      },
    },
    {
      title: 'Cone Sealing Tape & Stainless Tip Pins Set',
      handle: 'cone-sealing-tape-tip-pins-set',
      subtitle:
        '2 rolls of high-tack matte tape + 20 rust-proof 0.38mm pearl-head pins',
      description:
        'Complete cone finishing bundle pairing low-residue high-tack cellophane sealing tape with 20 fine 0.38mm stainless steel pins. Keeps cone tips airtight in freezer storage and prevents paste drying between bridal sessions.',
      weight: 75,
      options: [{ title: 'Bundle', values: ['2 Tape Rolls + 20 Pins'] }],
      variants: [
        {
          title: '2 Tape Rolls + 20 Pins',
          sku: 'MBS-TAPE-PINS',
          options: { Bundle: '2 Tape Rolls + 20 Pins' },
          prices: [
            { amount: 110, currency_code: 'inr' },
            { amount: 3, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          '2 rolls of high-tack matte tape + 20 rust-proof 0.38mm pearl-head pins.',
        tool_group: 'Cone Rolling',
        image_pending: false,
      },
    },
    {
      title: 'Triple-Sifting Fine Mesh Henna Filter Cloth',
      handle: 'triple-sifting-fine-mesh-filter-cloth',
      subtitle:
        'Ultra-fine 120-mesh straining cloth for silky, clog-free bridal paste',
      description:
        'Elasticated 120-mesh micro-filter straining cloths engineered to remove every microscopic leaf fiber from henna paste. Guarantees silky, uninterrupted stringy consistency through 0.35mm–0.38mm precision cone tips.',
      weight: 45,
      options: [{ title: 'Pack', values: ['Pair (2 Filter Cloths)'] }],
      variants: [
        {
          title: 'Pair (2 Filter Cloths)',
          sku: 'MBS-FILTER-120',
          options: { Pack: 'Pair (2 Filter Cloths)' },
          prices: [
            { amount: 120, currency_code: 'inr' },
            { amount: 4, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Ultra-fine 120-mesh straining cloth for silky, clog-free bridal paste.',
        tool_group: 'Paste Preparation',
        image_pending: false,
      },
    },
    {
      title: 'Reusable Acrylic Mehandi Practice Hand Board',
      handle: 'reusable-acrylic-mehandi-practice-hand',
      subtitle:
        'Life-size matte-finish washable acrylic hand template for motif practice',
      description:
        'Durable life-size acrylic practice hand with a lightly frosted skin-grip surface so henna lines hold crisp edges without beading. Wipes clean with water after practice—ideal for bridal motif rehearsals and workshops.',
      weight: 220,
      options: [
        {
          title: 'Orientation',
          values: ['Right Hand Template', 'Left & Right Pair'],
        },
      ],
      variants: [
        {
          title: 'Right Hand Template',
          sku: 'MBS-PRACTICE-RIGHT',
          options: { Orientation: 'Right Hand Template' },
          prices: [
            { amount: 260, currency_code: 'inr' },
            { amount: 6, currency_code: 'usd' },
          ],
        },
        {
          title: 'Left & Right Pair',
          sku: 'MBS-PRACTICE-PAIR',
          options: { Orientation: 'Left & Right Pair' },
          prices: [
            { amount: 460, currency_code: 'inr' },
            { amount: 10, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Life-size matte-finish washable acrylic hand template for motif practice.',
        tool_group: 'Practice & Tools',
        image_pending: false,
      },
    },
    {
      title: 'Glass Mixing Bowl & Silicone Spatula Prep Set',
      handle: 'glass-mixing-bowl-silicone-spatula-set',
      subtitle:
        'Non-reactive borosilicate mixing bowl with airtight lid & flexible spatula',
      description:
        'Thick borosilicate glass dye-release bowl with a tight-sealing lid to trap essential oil terpenes during 8–12 hour dye release, paired with a seamless silicone spatula that scrapes every gram of paste cleanly into piping bags.',
      weight: 380,
      options: [{ title: 'Size', values: ['500ml Mixing Bowl + Spatula'] }],
      variants: [
        {
          title: '500ml Mixing Bowl + Spatula',
          sku: 'MBS-BOWL-SPATULA',
          options: { Size: '500ml Mixing Bowl + Spatula' },
          prices: [
            { amount: 220, currency_code: 'inr' },
            { amount: 5, currency_code: 'usd' },
          ],
        },
      ],
      metadata: {
        short_description:
          'Non-reactive borosilicate mixing bowl with airtight lid & flexible spatula.',
        tool_group: 'Paste Preparation',
        image_pending: false,
      },
    },
  ];

  let createdCount = 0;
  for (const item of relatedProducts) {
    const productImageUrl = `${TOOL_IMAGE_BASE_URL}/${item.handle}.jpg`;
    const { data: existing } = await query.graph({
      entity: 'product',
      fields: ['id', 'handle'],
      filters: { handle: item.handle },
    });

    if (existing && existing.length > 0) {
      logger.info(`Product "${item.title}" already exists, skipping.`);
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
      logger.info(`✓ Added related henna product: "${item.title}"`);
    } catch (err: any) {
      logger.error(`✗ Failed to add "${item.title}": ${err.message}`);
    }
  }

  logger.info('=====================================================');
  logger.info(`  COMPLETED: ${createdCount} RELATED HENNA PRODUCTS ADDED`);
  logger.info('=====================================================');
}
