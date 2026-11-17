import { MedusaContainer } from "@medusajs/framework/types";
import { runShippingBackfill } from "../lib/backfill-shipping";

export default async function backfillShippingJob(container: MedusaContainer) {
  try {
    const summary = await runShippingBackfill();
    if (summary.ordersUpdated > 0) {
      console.log(
        `[BackfillShippingJob] Successfully backfilled shipping for ${summary.ordersUpdated} orders.`
      );
    }
  } catch (err: any) {
    console.error("[BackfillShippingJob Error]:", err.message);
  }
}

export const config = {
  name: "auto-backfill-order-shipping",
  schedule: "*/15 * * * *", // Runs every 15 minutes, fully idempotent
};
