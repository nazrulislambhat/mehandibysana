import {
  createProductCategoriesWorkflow,
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { ExecArgs } from "@medusajs/framework/types";

interface CategorySpec {
  name: string;
  handle: string;
  rank: number;
  description: string;
  productHandles: string[];
}

const STUDIO_CATEGORY_SPECS: CategorySpec[] = [
  {
    name: "Organic Henna",
    handle: "organic-henna",
    rank: 1,
    description:
      "Hand-rolled organic henna cones, nail henna cones, bulk artist paste, pre-rolled cones, and triple-sifted organic hair henna powder.",
    productHandles: [
      "organic-henna-cones",
      "chemical-free-organic-hair-henna-powder",
      "bulk-henna",
      "nail-henna",
      "pre-rolled-henna-cones",
    ],
  },
  {
    name: "Henna Kits & Combos",
    handle: "henna-kits-combos",
    rank: 2,
    description:
      "Curated bridal henna suites, self-care stain boxes, and complete beginner DIY mehandi kits.",
    productHandles: [
      "mbs-henna-kit",
      "mbs-self-care-kit",
      "beginner-henna-kit",
    ],
  },
  {
    name: "Henna Care & Essential Oils",
    handle: "henna-care-essential-oils",
    rank: 3,
    description:
      "Steam-distilled eucalyptus essential oil, protective beeswax aftercare balms, and lemon-sugar henna sealant spray.",
    productHandles: [
      "eucalyptus-blend-essential-oil",
      "aftercare-henna-balm",
      "henna-sealant-spray",
    ],
  },
  {
    name: "Mehandi Tools & Supplies",
    handle: "mehandi-tools-supplies",
    rank: 4,
    description:
      "Pre-cut cellophane sheets, micro weighing scales, stainless measuring spoons, piping bags, filter cloths, and artist prep tools.",
    productHandles: [
      "pre-cut-cellophane-henna-cone-sheets",
      "stainless-steel-henna-measuring-spoons",
      "digital-precision-micro-weighing-scale",
      "cone-filling-piping-bags",
      "cone-sealing-tape-tip-pins-set",
      "triple-sifting-fine-mesh-filter-cloth",
      "reusable-acrylic-mehandi-practice-hand",
      "glass-mixing-bowl-silicone-spatula-set",
    ],
  },
  {
    name: "Mehandi Products",
    handle: "mehandi-products",
    rank: 5,
    description: "Core small-batch botanical henna cones, kits, and care essentials.",
    productHandles: [
      "organic-henna-cones",
      "chemical-free-organic-hair-henna-powder",
      "bulk-henna",
      "nail-henna",
      "pre-rolled-henna-cones",
      "mbs-henna-kit",
      "mbs-self-care-kit",
      "beginner-henna-kit",
      "eucalyptus-blend-essential-oil",
      "aftercare-henna-balm",
      "henna-sealant-spray",
    ],
  },
  {
    name: "Cones & Accessories",
    handle: "cones-accessories",
    rank: 6,
    description: "Pre-rolled empty henna cones and cone finishing supplies.",
    productHandles: [],
  },
];

export default async function assignProductCategories({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("=====================================================");
  logger.info("  NORMALIZING CATEGORY HANDLES & PRODUCT FILTERS     ");
  logger.info("=====================================================");

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle", "rank", "is_active"],
  });

  const categoryIdByHandle = new Map<string, string>();

  for (const spec of STUDIO_CATEGORY_SPECS) {
    const existing = (existingCategories || []).find(
      (c: any) =>
        String(c.handle || "").toLowerCase() === spec.handle ||
        String(c.name || "").trim().toLowerCase() === spec.name.toLowerCase()
    );

    if (existing) {
      const needsUpdate =
        existing.handle !== spec.handle ||
        existing.rank !== spec.rank ||
        !existing.is_active;

      if (needsUpdate) {
        await updateProductCategoriesWorkflow(container).run({
          input: {
            selector: { id: existing.id },
            update: {
              handle: spec.handle,
              rank: spec.rank,
              description: spec.description,
              is_active: true,
              is_internal: false,
            },
          },
        });
        logger.info(
          `✓ Updated category "${existing.name}" (${existing.handle} -> ${spec.handle}, rank ${spec.rank})`
        );
      }
      categoryIdByHandle.set(spec.handle, existing.id);
    } else {
      const { result: created } = await createProductCategoriesWorkflow(
        container
      ).run({
        input: {
          product_categories: [
            {
              name: spec.name,
              handle: spec.handle,
              description: spec.description,
              rank: spec.rank,
              is_active: true,
              is_internal: false,
            },
          ],
        },
      });
      if (created?.[0]?.id) {
        categoryIdByHandle.set(spec.handle, created[0].id);
        logger.info(`✓ Created category "${spec.name}" (${spec.handle})`);
      }
    }
  }

  // Build product handle -> desired category IDs map
  const desiredCategoryIdsByProduct = new Map<string, Set<string>>();
  for (const spec of STUDIO_CATEGORY_SPECS) {
    const catId = categoryIdByHandle.get(spec.handle);
    if (!catId) continue;
    for (const prodHandle of spec.productHandles) {
      if (!desiredCategoryIdsByProduct.has(prodHandle)) {
        desiredCategoryIdsByProduct.set(prodHandle, new Set());
      }
      desiredCategoryIdsByProduct.get(prodHandle)!.add(catId);
    }
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "categories.id", "categories.handle"],
  });

  let updatedProducts = 0;
  for (const prod of products || []) {
    const desired = desiredCategoryIdsByProduct.get(prod.handle);
    if (!desired || desired.size === 0) continue;

    const currentIds = new Set<string>(
      (prod.categories || []).map((c: any) => String(c.id))
    );
    const merged = new Set<string>([...currentIds, ...desired]);

    const changed =
      merged.size !== currentIds.size ||
      Array.from(merged).some((id) => !currentIds.has(id));

    if (!changed) continue;

    await updateProductsWorkflow(container).run({
      input: {
        products: [
          {
            id: prod.id,
            category_ids: Array.from(merged),
          },
        ],
      },
    });
    updatedProducts++;
    logger.info(
      `✓ Assigned categories for "${prod.title}" (${prod.handle})`
    );
  }

  logger.info("=====================================================");
  logger.info(
    `  CATEGORY SYNC COMPLETE: ${updatedProducts} PRODUCTS UPDATED`
  );
  logger.info("=====================================================");
}

