import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  const orderService = req.scope.resolve(Modules.ORDER);
  const remoteLink = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);

  try {
    logger.info(`[Order Delete] Request received to delete order ${id}`);

    try {
      await remoteLink.dismiss({
        [Modules.ORDER]: { order_id: id },
      });
    } catch (linkErr: any) {
      logger.warn(`[Order Delete] RemoteLink dismiss non-fatal warning for ${id}: ${linkErr.message}`);
    }

    await orderService.deleteOrders([id]);

    logger.info(`[Order Delete] Successfully deleted order ${id}`);

    return res.status(200).json({
      success: true,
      id,
      object: "order",
      deleted: true,
      message: `Order ${id} deleted successfully.`,
    });
  } catch (err: any) {
    logger.error(`[Order Delete] Failed to delete order ${id}: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: err.message || `Failed to delete order ${id}`,
    });
  }
}
