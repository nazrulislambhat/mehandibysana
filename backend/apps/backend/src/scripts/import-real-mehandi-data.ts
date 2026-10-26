import {
  createCustomersWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  deleteProductsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import type { ExecArgs } from "@medusajs/framework/types";
import * as fs from "fs";
import * as path from "path";

export default async function importRealMehandiData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("=====================================================");
  logger.info("  IMPORTING REAL PRODUCTION DATA INTO MEDUSAJS v2   ");
  logger.info("=====================================================");

  // 1. Delete dummy demo products
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle"],
  });

  const dummyHandles = ["t-shirt", "sweatshirt", "sweatpants", "shorts"];
  const dummyProductsToDelete = existingProducts.filter((p: any) =>
    dummyHandles.includes(p.handle)
  );

  if (dummyProductsToDelete.length > 0) {
    logger.info(`Deleting ${dummyProductsToDelete.length} dummy products...`);
    await deleteProductsWorkflow(container).run({
      input: {
        ids: dummyProductsToDelete.map((p: any) => p.id),
      },
    });
    logger.info("Dummy products deleted successfully.");
  }

  // 2. Resolve Store, Sales Channel, Shipping Profile
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name"],
  });
  const store = stores[0];

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const salesChannel = salesChannels[0];

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfiles[0];

  // 3. Update store to "Mehandi By Sana" and ensure INR is supported & default
  logger.info("Updating store details to 'Mehandi By Sana'...");
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Mehandi By Sana",
        supported_currencies: [
          { currency_code: "inr", is_default: true },
          { currency_code: "usd", is_default: false },
          { currency_code: "eur", is_default: false },
        ],
      },
    },
  });

  // 4. Ensure India region exists
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });

  let indiaRegion = existingRegions.find(
    (r: any) => r.currency_code === "inr" || r.name === "India"
  );

  if (!indiaRegion) {
    logger.info("Creating India Region with INR currency...");
    const { result: newRegions } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries: ["in"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    indiaRegion = newRegions[0];
  }

  // 5. Create real Mehandi Categories
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });

  const categoryNames = [
    "Organic Henna",
    "Henna Kits & Combos",
    "Henna Care & Essential Oils",
    "Cones & Accessories",
  ];

  const categoriesToCreate = categoryNames.filter(
    (catName) => !existingCategories.some((c: any) => c.name === catName)
  );

  let allCategories = [...existingCategories];
  if (categoriesToCreate.length > 0) {
    logger.info(`Creating ${categoriesToCreate.length} categories...`);
    const { result: createdCats } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: categoriesToCreate.map((name) => ({
          name,
          is_active: true,
        })),
      },
    });
    allCategories.push(...createdCats);
  }

  const getCategoryId = (name: string) => {
    const found = allCategories.find((c: any) => c.name === name);
    return found ? [found.id] : [];
  };

  // 6. Define 11 real Mehandi By Sana products with product-specific options
  const realProductsDef = [
    {
      title: "Chemical Free Organic Hair Henna Powder",
      handle: "chemical-free-organic-hair-henna-powder",
      category_ids: getCategoryId("Organic Henna"),
      description:
        "100% natural, triple-sifted, chemical-free organic hair henna powder grown in Rajasthan. Restores scalp health, conditions hair deeply, and imparts rich natural color without any PPD, ammonia, or synthetic chemicals.",
      weight: 200,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Powder-w-Packet.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Powder-w-Packet.png",
        },
      ],
      options: [
        {
          title: "Net Weight",
          values: ["100gm", "200gm", "500gm"],
        },
      ],
      variants: [
        {
          title: "100gm",
          sku: "MBS-POWDER-100G",
          options: { "Net Weight": "100gm" },
          prices: [
            { amount: 99, currency_code: "inr" },
            { amount: 3, currency_code: "usd" },
          ],
        },
        {
          title: "200gm",
          sku: "MBS-POWDER-200G",
          options: { "Net Weight": "200gm" },
          prices: [
            { amount: 180, currency_code: "inr" },
            { amount: 5, currency_code: "usd" },
          ],
        },
        {
          title: "500gm",
          sku: "MBS-POWDER-500G",
          options: { "Net Weight": "500gm" },
          prices: [
            { amount: 410, currency_code: "inr" },
            { amount: 9, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Beginner DIY Kit",
      handle: "beginner-henna-kit",
      category_ids: getCategoryId("Henna Kits & Combos"),
      description:
        "Complete all-in-one DIY henna kit for beginners and hobbyists. Contains fresh organic henna powder, eucalyptus essential oil, sugar sealant, piping bags, rolled cones, and a comprehensive instructional guide.",
      weight: 350,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2023/02/MBS-Box-Cardboard-c-1.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2023/02/MBS-Box-Cardboard-c-1.png",
        },
        {
          url: "https://mehandibysana.com/wp-content/uploads/2023/02/MBS-Box-Cardboard-a-1.png",
        },
      ],
      options: [
        {
          title: "Kit Type",
          values: ["Standard Edition"],
        },
      ],
      variants: [
        {
          title: "Standard Edition",
          sku: "MBS-KIT-BEGINNER",
          options: { "Kit Type": "Standard Edition" },
          prices: [
            { amount: 449, currency_code: "inr" },
            { amount: 10, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Self Care Henna Kit",
      handle: "mbs-self-care-kit",
      category_ids: getCategoryId("Henna Kits & Combos"),
      description:
        "Indulge in artisanal self-care rituals with freshly blended organic henna cones, nourishing aftercare balm, and signature herbal sealant spray packaged in a luxury gift box.",
      weight: 300,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Box-Pink-S-a.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Box-Pink-S-a.png",
        },
      ],
      options: [
        {
          title: "Kit Type",
          values: ["Self Care Edition"],
        },
      ],
      variants: [
        {
          title: "Self Care Edition",
          sku: "MBS-KIT-SELFCARE",
          options: { "Kit Type": "Self Care Edition" },
          prices: [
            { amount: 320, currency_code: "inr" },
            { amount: 8, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Nail Henna Cones",
      handle: "nail-henna",
      category_ids: getCategoryId("Organic Henna"),
      description:
        "Specially formulated 100% natural nail stain henna cones for rich, long-lasting mahogany nail stain. Safe, breathable, and Halal friendly alternative to chemical nail polish.",
      weight: 30,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/nail-henna-batch-scaled.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/nail-henna-batch-scaled.png",
        },
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Nail-Henna.png",
        },
      ],
      options: [
        {
          title: "Pack",
          values: ["Single Cone"],
        },
      ],
      variants: [
        {
          title: "Single Cone",
          sku: "MBS-CONE-NAIL",
          options: { Pack: "Single Cone" },
          prices: [
            { amount: 50, currency_code: "inr" },
            { amount: 2, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Eucalyptus Essential Oil",
      handle: "eucalyptus-blend-essential-oil",
      category_ids: getCategoryId("Henna Care & Essential Oils"),
      description:
        "100% pure steam-distilled eucalyptus essential oil with high terpene levels (cineol) essential for releasing deep dark henna stains. Also excellent for aromatherapy and relaxation.",
      weight: 100,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Eucalyptus-Oil-S.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Eucalyptus-Oil-S.png",
        },
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Eucalyptus-Oil-L.png",
        },
      ],
      options: [
        {
          title: "Bottle Size",
          values: ["Small 30ML", "Medium 100ML"],
        },
      ],
      variants: [
        {
          title: "Small 30ML",
          sku: "MBS-OIL-EUC-30ML",
          options: { "Bottle Size": "Small 30ML" },
          prices: [
            { amount: 150, currency_code: "inr" },
            { amount: 4, currency_code: "usd" },
          ],
        },
        {
          title: "Medium 100ML",
          sku: "MBS-OIL-EUC-100ML",
          options: { "Bottle Size": "Medium 100ML" },
          prices: [
            { amount: 450, currency_code: "inr" },
            { amount: 9, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Bridal Henna Kit",
      handle: "mbs-henna-kit",
      category_ids: getCategoryId("Henna Kits & Combos"),
      description:
        "The premier master bridal suite containing master-grade organic bridal henna cones, premium aftercare balm, sealant spray, practice sheets, and precision sealant applicator.",
      weight: 600,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Box-Pink-L-b.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Box-Pink-L-b.png",
        },
      ],
      options: [
        {
          title: "Kit Tier",
          values: ["Master Bridal Suite"],
        },
      ],
      variants: [
        {
          title: "Master Bridal Suite",
          sku: "MBS-KIT-BRIDAL",
          options: { "Kit Tier": "Master Bridal Suite" },
          prices: [
            { amount: 729, currency_code: "inr" },
            { amount: 15, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Aftercare Henna Balm",
      handle: "aftercare-henna-balm",
      category_ids: getCategoryId("Henna Care & Essential Oils"),
      description:
        "All-natural beeswax and essential oil infusion designed to create a moisture barrier, seal henna color, protect fresh henna against water, and intensify deep burgundy stain development.",
      weight: 50,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Balm-Red.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Balm-Red.png",
        },
      ],
      options: [
        {
          title: "Aroma Blend",
          values: ["Lemongrass", "Orange"],
        },
      ],
      variants: [
        {
          title: "Lemongrass",
          sku: "MBS-BALM-LEMONGRASS",
          options: { "Aroma Blend": "Lemongrass" },
          prices: [
            { amount: 95, currency_code: "inr" },
            { amount: 3, currency_code: "usd" },
          ],
        },
        {
          title: "Orange",
          sku: "MBS-BALM-ORANGE",
          options: { "Aroma Blend": "Orange" },
          prices: [
            { amount: 105, currency_code: "inr" },
            { amount: 3, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Pre Rolled Henna Cones [10 No.]",
      handle: "pre-rolled-henna-cones",
      category_ids: getCategoryId("Cones & Accessories"),
      description:
        "Empty artisan-rolled cellophane cones with ultra-fine precision pin tips (0.38mm), ready to be filled with your custom henna paste.",
      weight: 50,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Transparent-b.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Transparent-b.png",
        },
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Transparent.png",
        },
      ],
      options: [
        {
          title: "Pack Count",
          values: ["Pack of 10"],
        },
      ],
      variants: [
        {
          title: "Pack of 10",
          sku: "MBS-EMPTY-CONES-10",
          options: { "Pack Count": "Pack of 10" },
          prices: [
            { amount: 29, currency_code: "inr" },
            { amount: 1, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Henna Sealant Spray",
      handle: "henna-sealant-spray",
      category_ids: getCategoryId("Henna Care & Essential Oils"),
      description:
        "Natural lemon sugar and rosewater spray designed to keep henna paste hydrated on skin, preventing premature cracking and maximizing stain transfer.",
      weight: 80,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Pinkred-Oil-L.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Pinkred-Oil-L.png",
        },
      ],
      options: [
        {
          title: "Volume",
          values: ["50ML Spray"],
        },
      ],
      variants: [
        {
          title: "50ML Spray",
          sku: "MBS-SEALANT-SPRAY",
          options: { Volume: "50ML Spray" },
          prices: [
            { amount: 49, currency_code: "inr" },
            { amount: 2, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Bulk Henna [400gm]",
      handle: "bulk-henna",
      category_ids: getCategoryId("Organic Henna"),
      description:
        "Freshly prepared bulk organic henna paste (400gm) in piping carrot bag. Ideal for professional artists, bridal events, and high-volume studios.",
      weight: 400,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Filler.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Filler.png",
        },
      ],
      options: [
        {
          title: "Format",
          values: ["400gm Carrot Bag"],
        },
      ],
      variants: [
        {
          title: "400gm Carrot Bag",
          sku: "MBS-PASTE-BULK-400G",
          options: { Format: "400gm Carrot Bag" },
          prices: [
            { amount: 1099, currency_code: "inr" },
            { amount: 22, currency_code: "usd" },
          ],
        },
      ],
    },
    {
      title: "Organic Henna Cones",
      handle: "organic-henna-cones",
      category_ids: getCategoryId("Organic Henna"),
      description:
        "Our bestselling 100% natural organic henna cones freshly mixed with pure eucalyptus essential oil, lemon juice, and filtered rainwater. Guaranteed zero PPD, zero chemical dye, and guaranteed rich stain.",
      weight: 35,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: salesChannel.id }],
      thumbnail:
        "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Hand-Henna-b.png",
      images: [
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Hand-Henna-b.png",
        },
        {
          url: "https://mehandibysana.com/wp-content/uploads/2021/03/MBS-Cone-Hand-Henna.png",
        },
      ],
      options: [
        {
          title: "Tip Size",
          values: ["0.38mm Precision Pin Tip"],
        },
      ],
      variants: [
        {
          title: "0.38mm Precision Pin Tip",
          sku: "MBS-CONE-ORGANIC",
          options: { "Tip Size": "0.38mm Precision Pin Tip" },
          prices: [
            { amount: 60, currency_code: "inr" },
            { amount: 2, currency_code: "usd" },
          ],
        },
      ],
    },
  ];

  // 7. Insert each product individually so any singular issue doesn't abort others
  for (const prod of realProductsDef) {
    const { data: existing } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: prod.handle },
    });

    if (existing && existing.length > 0) {
      logger.info(`Product "${prod.title}" already exists, skipping.`);
      continue;
    }

    try {
      await createProductsWorkflow(container).run({
        input: {
          products: [prod],
        },
      });
      logger.info(`✓ Successfully created product: "${prod.title}"`);
    } catch (err: any) {
      logger.error(`✗ Error creating product "${prod.title}": ${err.message}`);
    }
  }

  // 8. Import real Customers from WooCommerce orders
  const ordersFilePath = path.resolve(
    __dirname,
    "../../../../../migration/data/raw/orders.json"
  );
  if (fs.existsSync(ordersFilePath)) {
    logger.info("Reading real customers from raw orders...");
    const rawOrders = JSON.parse(fs.readFileSync(ordersFilePath, "utf8"));
    const customerMap = new Map<string, any>();

    for (const order of rawOrders) {
      if (order.billing && order.billing.email) {
        const email = order.billing.email.toLowerCase().trim();
        if (email && email.includes("@") && !customerMap.has(email)) {
          customerMap.set(email, {
            email,
            first_name: order.billing.first_name || "",
            last_name: order.billing.last_name || "",
            phone: order.billing.phone || "",
            metadata: {
              source: "woocommerce",
              city: order.billing.city || "",
              postcode: order.billing.postcode || "",
            },
          });
        }
      }
    }

    const { data: existingCustomers } = await query.graph({
      entity: "customer",
      fields: ["id", "email"],
    });

    const existingEmailSet = new Set(
      existingCustomers.map((c: any) => c.email?.toLowerCase().trim())
    );

    const customersToInsert: any[] = [];
    for (const [email, cust] of customerMap.entries()) {
      if (!existingEmailSet.has(email)) {
        customersToInsert.push(cust);
      }
    }

    logger.info(
      `Found ${customerMap.size} total unique customers. ${customersToInsert.length} new to import.`
    );

    // Batch insert in chunks of 50
    const chunkSize = 50;
    let imported = 0;
    for (let i = 0; i < customersToInsert.length; i += chunkSize) {
      const chunk = customersToInsert.slice(i, i + chunkSize);
      try {
        await createCustomersWorkflow(container).run({
          input: {
            customersData: chunk,
          },
        });
        imported += chunk.length;
        if (imported % 200 === 0 || imported === customersToInsert.length) {
          logger.info(
            `Imported ${imported} / ${customersToInsert.length} real customers...`
          );
        }
      } catch (err: any) {
        logger.warn(`Failed to import customers chunk: ${err.message}`);
      }
    }
    logger.info(`✓ Successfully imported ${imported} real customers.`);
  }

  logger.info("=====================================================");
  logger.info("  REAL DATA IMPORT COMPLETED SUCCESSFULLY!          ");
  logger.info("=====================================================");
}
