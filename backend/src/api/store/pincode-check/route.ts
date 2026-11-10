import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { evaluatePincode } from "../../../lib/pincode-rules";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pincode = String(req.query.pincode || req.query.pin || "");
  const subtotal = Number(req.query.subtotal || 0) || 0;
  const result = evaluatePincode(pincode, subtotal);
  return res.status(200).json(result);
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as { pincode?: string; subtotal?: number };
  const result = evaluatePincode(
    String(body.pincode || ""),
    Number(body.subtotal || 0) || 0
  );
  return res.status(200).json(result);
}

