import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  createMedusaStoreOrder,
  type StoreOrderPayload,
} from "../../../lib/create-medusa-order";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as StoreOrderPayload;

    if (!body?.customer?.email || !body?.items || body.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required order fields: email or items.",
      });
    }

    const { order, orderNumber } = await createMedusaStoreOrder(req.scope, body);

    return res.status(201).json({
      success: true,
      order,
      orderNumber,
    });
  } catch (error: any) {
    console.error("[Medusa Order Create Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order in Medusa",
    });
  }
}
