import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { loadPickupSettings } from "../../../lib/pickup-settings";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const settings = loadPickupSettings(req.scope);
  return res.status(200).json({
    enableSrinagarPickup: settings.enableSrinagarPickup,
    srinagarLocationName: settings.srinagarLocationName,
    srinagarAddress: settings.srinagarAddress,
    enableBengaluruPickup: settings.enableBengaluruPickup,
    bengaluruLocationName: settings.bengaluruLocationName,
    bengaluruAddress: settings.bengaluruAddress,
    updatedAt: settings.updatedAt,
  });
}
