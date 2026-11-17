import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { runShippingBackfill } from "../../../../lib/backfill-shipping";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  try {
    const summary = await runShippingBackfill();
    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (err: any) {
    console.error("[Admin Shipping Backfill GET Error]:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to run shipping backfill",
    });
  }
}

export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  try {
    const summary = await runShippingBackfill();
    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (err: any) {
    console.error("[Admin Shipping Backfill POST Error]:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to run shipping backfill",
    });
  }
}
