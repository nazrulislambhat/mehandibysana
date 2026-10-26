import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import type { ExecArgs } from "@medusajs/framework/types";

export default async function deleteDummyProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const dummyIds = [
    "prod_01M5VGJAXZ40A675CJZ5ZCQ1FV",
    "prod_01M5VGJAXZAMZGAZFKB3J558ND",
    "prod_01M5VGJAXZ6T447D1A792DFAAV",
    "prod_01M5VGJAXZAC5GZ0VY1NSESW6X"
  ];

  logger.info(`Deleting dummy products: ${dummyIds.join(", ")}`);
  try {
    await deleteProductsWorkflow(container).run({
      input: {
        ids: dummyIds,
      },
    });
    logger.info("Successfully deleted dummy products!");
  } catch (e: any) {
    logger.error(`Error deleting: ${e.message}`);
  }
}
