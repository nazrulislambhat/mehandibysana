import fs from "node:fs";
import path from "node:path";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export type BridalBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface BridalBookingRecord {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  eventDate: string;
  location: string;
  message: string;
  status: BridalBookingStatus;
  advancePaidInr: number;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR =
  process.env.STUDIO_DATA_DIR?.trim() || path.resolve(process.cwd(), "../studio-data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bridal-bookings.json");

let tableEnsured = false;

async function ensureTable(pg: any): Promise<void> {
  if (tableEnsured) return;
  await pg.raw(`
    CREATE TABLE IF NOT EXISTS "studio_bridal_bookings" (
      "id" TEXT PRIMARY KEY,
      "reference_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT NOT NULL DEFAULT '',
      "service" TEXT NOT NULL DEFAULT 'bridal',
      "event_date" TEXT NOT NULL DEFAULT '',
      "location" TEXT NOT NULL DEFAULT '',
      "message" TEXT NOT NULL DEFAULT '',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "advance_paid_inr" NUMERIC NOT NULL DEFAULT 0,
      "admin_notes" TEXT NOT NULL DEFAULT '',
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  tableEnsured = true;
}

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

export function loadBridalBookings(scope?: { resolve: (key: string) => any }): BridalBookingRecord[] {
  if (scope) {
    try {
      const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
      if (pg) {
        // Trigger background sync or read
        void (async () => {
          try {
            await ensureTable(pg);
          } catch (err) {
            console.warn("[Bridal Bookings] PG ensureTable error:", err);
          }
        })();
      }
    } catch {
      // ignore
    }
  }

  ensureStorage();
  try {
    const raw = fs.readFileSync(BOOKINGS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function listBridalBookingsAsync(
  scope?: { resolve: (key: string) => any }
): Promise<BridalBookingRecord[]> {
  if (scope) {
    try {
      const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
      if (pg) {
        await ensureTable(pg);
        const res = await pg.raw(
          `SELECT * FROM "studio_bridal_bookings" ORDER BY "created_at" DESC`
        );
        const rows = (res?.rows || []) as Array<Record<string, any>>;
        if (rows.length > 0) {
          return rows.map((r) => ({
            id: String(r.id),
            referenceId: String(r.reference_id || ""),
            name: String(r.name || ""),
            email: String(r.email || ""),
            phone: String(r.phone || ""),
            service: String(r.service || "bridal"),
            eventDate: String(r.event_date || ""),
            location: String(r.location || ""),
            message: String(r.message || ""),
            status: (r.status as BridalBookingStatus) || "pending",
            advancePaidInr: Number(r.advance_paid_inr || 0),
            adminNotes: String(r.admin_notes || ""),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
          }));
        }
      }
    } catch (err) {
      console.warn("[Bridal Bookings] PG query failed, using JSON fallback:", err);
    }
  }

  return loadBridalBookings();
}

export function saveBridalBookings(
  records: BridalBookingRecord[],
  scope?: { resolve: (key: string) => any }
): void {
  ensureStorage();
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(records, null, 2), "utf8");

  if (scope) {
    void (async () => {
      try {
        const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
        if (pg) {
          await ensureTable(pg);
          for (const r of records) {
            await pg.raw(
              `
              INSERT INTO "studio_bridal_bookings" (
                "id", "reference_id", "name", "email", "phone", "service",
                "event_date", "location", "message", "status", "advance_paid_inr",
                "admin_notes", "created_at", "updated_at"
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
              ON CONFLICT ("id") DO UPDATE SET
                "status" = EXCLUDED."status",
                "advance_paid_inr" = EXCLUDED."advance_paid_inr",
                "admin_notes" = EXCLUDED."admin_notes",
                "updated_at" = NOW()
              `,
              [
                r.id,
                r.referenceId,
                r.name,
                r.email,
                r.phone,
                r.service,
                r.eventDate,
                r.location,
                r.message,
                r.status,
                r.advancePaidInr,
                r.adminNotes,
                r.createdAt,
              ]
            );
          }
        }
      } catch (err) {
        console.warn("[Bridal Bookings] PG bulk save error:", err);
      }
    })();
  }
}

export function createBridalBooking(
  input: {
    referenceId?: string;
    name: string;
    email: string;
    phone?: string;
    service?: string;
    eventDate?: string;
    location?: string;
    message: string;
  },
  scope?: { resolve: (key: string) => any }
): BridalBookingRecord {
  const current = loadBridalBookings(scope);
  const now = new Date().toISOString();
  const referenceId =
    input.referenceId || `INQ-${Date.now().toString(36).toUpperCase()}`;

  const record: BridalBookingRecord = {
    id: `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    referenceId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: (input.phone || "").trim(),
    service: (input.service || "bridal").trim(),
    eventDate: (input.eventDate || "").trim(),
    location: (input.location || "").trim(),
    message: input.message.trim(),
    status: "pending",
    advancePaidInr: 0,
    adminNotes: "",
    createdAt: now,
    updatedAt: now,
  };

  current.unshift(record);
  saveBridalBookings(current, scope);

  if (scope) {
    void (async () => {
      try {
        const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
        if (pg) {
          await ensureTable(pg);
          await pg.raw(
            `
            INSERT INTO "studio_bridal_bookings" (
              "id", "reference_id", "name", "email", "phone", "service",
              "event_date", "location", "message", "status", "advance_paid_inr",
              "admin_notes", "created_at", "updated_at"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON CONFLICT ("id") DO NOTHING
            `,
            [
              record.id,
              record.referenceId,
              record.name,
              record.email,
              record.phone,
              record.service,
              record.eventDate,
              record.location,
              record.message,
              record.status,
              record.advancePaidInr,
              record.adminNotes,
              record.createdAt,
            ]
          );
        }
      } catch (err) {
        console.warn("[Bridal Bookings] PG insert error:", err);
      }
    })();
  }

  return record;
}
