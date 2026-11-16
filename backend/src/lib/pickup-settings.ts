import * as fs from "fs";
import * as path from "path";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

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

let cachedSettings: StudioPickupSettings | null = null;
let tableEnsured = false;

async function ensureTable(pg: any): Promise<void> {
  if (tableEnsured) return;
  await pg.raw(`
    CREATE TABLE IF NOT EXISTS "studio_pickup_settings" (
      "id" TEXT PRIMARY KEY,
      "settings" JSONB NOT NULL,
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  tableEnsured = true;
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

function normalizeSettings(parsed: Partial<StudioPickupSettings> | null): StudioPickupSettings {
  const p = parsed || {};
  return {
    enableSrinagarPickup:
      p.enableSrinagarPickup !== undefined
        ? Boolean(p.enableSrinagarPickup)
        : DEFAULT_PICKUP_SETTINGS.enableSrinagarPickup,
    srinagarLocationName:
      String(p.srinagarLocationName || "").trim() ||
      DEFAULT_PICKUP_SETTINGS.srinagarLocationName,
    srinagarAddress:
      String(p.srinagarAddress || "").trim() ||
      DEFAULT_PICKUP_SETTINGS.srinagarAddress,
    enableBengaluruPickup:
      p.enableBengaluruPickup !== undefined
        ? Boolean(p.enableBengaluruPickup)
        : DEFAULT_PICKUP_SETTINGS.enableBengaluruPickup,
    bengaluruLocationName:
      String(p.bengaluruLocationName || "").trim() ||
      DEFAULT_PICKUP_SETTINGS.bengaluruLocationName,
    bengaluruAddress:
      String(p.bengaluruAddress || "").trim() ||
      DEFAULT_PICKUP_SETTINGS.bengaluruAddress,
    updatedAt: p.updatedAt || DEFAULT_PICKUP_SETTINGS.updatedAt,
  };
}

export function loadPickupSettings(scope?: { resolve: (key: string) => any }): StudioPickupSettings {
  if (scope) {
    try {
      const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
      if (pg) {
        // Asynchronously sync cache from PG if available
        void (async () => {
          try {
            await ensureTable(pg);
            const res = await pg.raw(
              `SELECT "settings" FROM "studio_pickup_settings" WHERE "id" = 'default' LIMIT 1`
            );
            const row = res?.rows?.[0];
            if (row?.settings) {
              cachedSettings = normalizeSettings(
                typeof row.settings === "string" ? JSON.parse(row.settings) : row.settings
              );
            }
          } catch (err) {
            console.warn("[Studio Pickup] PG query error:", err);
          }
        })();
      }
    } catch {
      // ignore
    }
  }

  if (cachedSettings) {
    return cachedSettings;
  }

  const parsed = readRawFile();
  cachedSettings = normalizeSettings(parsed);
  return cachedSettings;
}

export async function loadPickupSettingsAsync(scope?: { resolve: (key: string) => any }): Promise<StudioPickupSettings> {
  if (scope) {
    try {
      const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
      if (pg) {
        await ensureTable(pg);
        const res = await pg.raw(
          `SELECT "settings" FROM "studio_pickup_settings" WHERE "id" = 'default' LIMIT 1`
        );
        const row = res?.rows?.[0];
        if (row?.settings) {
          cachedSettings = normalizeSettings(
            typeof row.settings === "string" ? JSON.parse(row.settings) : row.settings
          );
          return cachedSettings;
        }
      }
    } catch (err) {
      console.warn("[Studio Pickup] Async PG load failed, using fallback:", err);
    }
  }
  return loadPickupSettings();
}

export function savePickupSettings(
  partial: Partial<StudioPickupSettings>,
  scope?: { resolve: (key: string) => any }
): StudioPickupSettings {
  const filePath = getPickupSettingsFilePath();
  const current = loadPickupSettings(scope);
  const updated: StudioPickupSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  cachedSettings = updated;

  // Persist to JSON file
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("[Studio Pickup] Failed to write pickup-settings.json:", err);
  }

  // Persist to PostgreSQL if scope available
  if (scope) {
    void (async () => {
      try {
        const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
        if (pg) {
          await ensureTable(pg);
          await pg.raw(
            `
            INSERT INTO "studio_pickup_settings" ("id", "settings", "updated_at")
            VALUES ('default', ?::jsonb, NOW())
            ON CONFLICT ("id") DO UPDATE SET
              "settings" = EXCLUDED."settings",
              "updated_at" = NOW()
            `,
            [JSON.stringify(updated)]
          );
        }
      } catch (err) {
        console.warn("[Studio Pickup] PG save error:", err);
      }
    })();
  }

  return updated;
}
