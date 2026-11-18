import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export { POST } from "../place-order/route";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "status"],
    });

    const count = (orders || []).length;
    return res.status(200).json({
      count,
    });
  } catch (error: any) {
    console.error("[Orders Summary Error]:", error);
    return res.status(200).json({
      count: 0,
      error: error?.message || "Failed to query orders",
    });
  }
}
