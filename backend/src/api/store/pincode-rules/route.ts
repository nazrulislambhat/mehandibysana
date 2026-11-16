import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { loadPincodeRules } from "../../../lib/pincode-rules";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rules = loadPincodeRules(req.scope).filter((r) => r.active);
  return res.status(200).json({ rules });
}
