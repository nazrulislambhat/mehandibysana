import {
  linkSalesChannelsToStockLocationWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { ExecArgs } from "@medusajs/framework/types";

export default async function linkSalesChannelAndInventory({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Starting linkSalesChannelAndInventory fix...");

  // 1. Get all sales channels
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  logger.info(`Found ${salesChannels.length} sales channels: ${salesChannels.map((sc: any) => sc.id).join(", ")}`);

  // 2. Get all stock locations
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  logger.info(`Found ${stockLocations.length} stock locations: ${stockLocations.map((sl: any) => sl.id).join(", ")}`);

  // Link each stock location to all sales channels
  for (const sl of stockLocations) {
    for (const sc of salesChannels) {
      try {
        await linkSalesChannelsToStockLocationWorkflow(container).run({
          input: {
            id: sl.id,
            add: [sc.id],
          },
        });
        logger.info(`Linked stock location ${sl.id} to sales channel ${sc.id}`);
      } catch (err: any) {
        logger.warn(`Notice while linking location ${sl.id} to ${sc.id}: ${err.message}`);
      }
    }
  }

  // 3. Set manage_inventory: false on all product variants so Add to Bag never fails
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "manage_inventory"],
  });
  logger.info(`Found ${variants.length} product variants. Setting manage_inventory to false...`);

  const updates = variants.map((v: any) => ({
    id: v.id,
    manage_inventory: false,
  }));

  if (updates.length > 0) {
    try {
      await updateProductVariantsWorkflow(container).run({
        input: {
          product_variants: updates,
        },
      });
      logger.info(`Successfully updated ${updates.length} variants with manage_inventory: false`);
    } catch (err: any) {
      logger.warn(`Could not bulk update variants: ${err.message}`);
    }
  }

  logger.info("Done linkSalesChannelAndInventory fix!");
}
