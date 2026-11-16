import * as fs from "fs";
import * as path from "path";

export interface StudioPickupSettings {
  enableSrinagarPickup: boolean;
  srinagarLocationName: string;
  srinagarAddress: string;
  enableBengaluruPickup: boolean;
  bengaluruLocationName: string;
  bengaluruAddress: string;
  updatedAt: string;
}

export const DEFAULT_PICKUP_SETTINGS: StudioPickupSettings = {
  enableSrinagarPickup: true,
  srinagarLocationName: "Srinagar Studio, Kashmir",
  srinagarAddress: "Srinagar, Jammu & Kashmir",
  enableBengaluruPickup: true,
  bengaluruLocationName: "Bengaluru Studio, Karnataka",
  bengaluruAddress: "Bengaluru, Karnataka",
  updatedAt: new Date().toISOString(),
};

function getPickupSettingsFilePath(): string {
  const baseDir =
    process.env.STUDIO_DATA_DIR?.trim() ||
    path.resolve(process.cwd(), "..", "studio-data");
  return path.join(baseDir, "pickup-settings.json");
}

function readRawFile(): Partial<StudioPickupSettings> | null {
  const filePath = getPickupSettingsFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function loadPickupSettings(): StudioPickupSettings {
  const parsed = readRawFile() || {};
  return {
    enableSrinagarPickup:
      parsed.enableSrinagarPickup !== undefined
        ? Boolean(parsed.enableSrinagarPickup)
        : DEFAULT_PICKUP_SETTINGS.enableSrinagarPickup,
    srinagarLocationName:
      String(parsed.srinagarLocationName || "").trim() ||
      DEFAULT_PICKUP_SETTINGS.srinagarLocationName,
    srinagarAddress:
      String(parsed.srinagarAddress || "").trim() ||
      DEFAULT_PICKUP_SETTINGS.srinagarAddress,
    enableBengaluruPickup:
      parsed.enableBengaluruPickup !== undefined
        ? Boolean(parsed.enableBengaluruPickup)
        : DEFAULT_PICKUP_SETTINGS.enableBengaluruPickup,
    bengaluruLocationName:
      String(parsed.bengaluruLocationName || "").trim() ||
      DEFAULT_PICKUP_SETTINGS.bengaluruLocationName,
    bengaluruAddress:
      String(parsed.bengaluruAddress || "").trim() ||
      DEFAULT_PICKUP_SETTINGS.bengaluruAddress,
    updatedAt: parsed.updatedAt || DEFAULT_PICKUP_SETTINGS.updatedAt,
  };
}

export function savePickupSettings(
  partial: Partial<StudioPickupSettings>
): StudioPickupSettings {
  const filePath = getPickupSettingsFilePath();
  const current = loadPickupSettings();
  const updated: StudioPickupSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("[Studio Pickup] Failed to write pickup-settings.json:", err);
  }

  return updated;
}
