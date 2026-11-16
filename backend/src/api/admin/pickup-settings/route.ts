import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  loadPickupSettings,
  savePickupSettings,
  StudioPickupSettings,
} from "../../../lib/pickup-settings";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const settings = loadPickupSettings();
  return res.status(200).json({ settings });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as Partial<StudioPickupSettings>;
  const updated = savePickupSettings(body);
  return res.status(200).json({ settings: updated, success: true });
}
