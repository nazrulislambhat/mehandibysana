import fs from "node:fs";
import path from "node:path";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export interface NewsletterSubscriberRecord {
  email: string;
  firstName: string;
  source: string;
  subscribedAt: string;
  updatedAt: string;
  unsubscribedAt: string | null;
}

const DATA_DIR =
  process.env.STUDIO_DATA_DIR?.trim() || path.resolve(process.cwd(), "../studio-data");
const NEWSLETTER_FILE = path.join(DATA_DIR, "newsletter-subscribers.json");

let tableEnsured = false;

async function ensureTable(pg: any): Promise<void> {
  if (tableEnsured) return;
  await pg.raw(`
    CREATE TABLE IF NOT EXISTS "studio_newsletter_subscribers" (
      "email" TEXT PRIMARY KEY,
      "first_name" TEXT NOT NULL DEFAULT '',
      "source" TEXT NOT NULL DEFAULT 'footer',
      "subscribed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "unsubscribed_at" TIMESTAMPTZ NULL
    );
  `);
  tableEnsured = true;
}

function loadJsonFallback(): NewsletterSubscriberRecord[] {
  try {
    if (!fs.existsSync(NEWSLETTER_FILE)) return [];
    const raw = JSON.parse(fs.readFileSync(NEWSLETTER_FILE, "utf8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveJsonFallback(rows: NewsletterSubscriberRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(NEWSLETTER_FILE, JSON.stringify(rows, null, 2), "utf8");
  } catch (err) {
    console.warn("[Newsletter] Could not save JSON fallback:", err);
  }
}

export async function upsertNewsletterSubscriber(
  scope: { resolve: (key: string) => any } | undefined,
  input: {
    email: string;
    firstName?: string;
    source?: string;
  }
): Promise<{
  subscriber: NewsletterSubscriberRecord;
  alreadySubscribed: boolean;
}> {
  const email = input.email.trim().toLowerCase();
  const firstName = (input.firstName || "").trim();
  const source = (input.source || "footer").trim() || "footer";
  const nowIso = new Date().toISOString();

  if (scope) {
    try {
      const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
      await ensureTable(pg);

      const existingRes = await pg.raw(
        `SELECT * FROM "studio_newsletter_subscribers" WHERE "email" = ? LIMIT 1`,
        [email]
      );
      const existingRow = existingRes?.rows?.[0] || null;
      const alreadySubscribed = Boolean(existingRow && !existingRow.unsubscribed_at);

      await pg.raw(
        `
        INSERT INTO "studio_newsletter_subscribers" (
          "email", "first_name", "source", "subscribed_at", "updated_at", "unsubscribed_at"
        ) VALUES (?, ?, ?, NOW(), NOW(), NULL)
        ON CONFLICT ("email") DO UPDATE SET
          "first_name" = CASE
            WHEN COALESCE(EXCLUDED."first_name", '') <> '' THEN EXCLUDED."first_name"
            ELSE "studio_newsletter_subscribers"."first_name"
          END,
          "source" = EXCLUDED."source",
          "updated_at" = NOW(),
          "unsubscribed_at" = NULL
        `,
        [email, firstName, source]
      );

      return {
        alreadySubscribed,
        subscriber: {
          email,
          firstName: firstName || String(existingRow?.first_name || ""),
          source,
          subscribedAt: existingRow?.subscribed_at
            ? new Date(existingRow.subscribed_at).toISOString()
            : nowIso,
          updatedAt: nowIso,
          unsubscribedAt: null,
        },
      };
    } catch (err) {
      console.warn("[Newsletter] PG upsert failed, falling back to JSON:", err);
    }
  }

  const current = loadJsonFallback();
  const idx = current.findIndex((r) => r.email === email);
  const alreadySubscribed = idx >= 0 && !current[idx].unsubscribedAt;

  const record: NewsletterSubscriberRecord = {
    email,
    firstName: firstName || (idx >= 0 ? current[idx].firstName : ""),
    source,
    subscribedAt: idx >= 0 ? current[idx].subscribedAt : nowIso,
    updatedAt: nowIso,
    unsubscribedAt: null,
  };

  if (idx >= 0) {
    current[idx] = record;
  } else {
    current.unshift(record);
  }
  saveJsonFallback(current);

  return { subscriber: record, alreadySubscribed };
}

export async function listNewsletterSubscribers(
  scope?: { resolve: (key: string) => any }
): Promise<NewsletterSubscriberRecord[]> {
  if (scope) {
    try {
      const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
      await ensureTable(pg);
      const res = await pg.raw(
        `SELECT * FROM "studio_newsletter_subscribers" WHERE "unsubscribed_at" IS NULL ORDER BY "subscribed_at" DESC`
      );
      const rows = (res?.rows || []) as Array<Record<string, any>>;
      return rows.map((r) => ({
        email: String(r.email || "").toLowerCase().trim(),
        firstName: String(r.first_name || "").trim(),
        source: String(r.source || "footer").trim(),
        subscribedAt: r.subscribed_at
          ? new Date(r.subscribed_at).toISOString()
          : new Date().toISOString(),
        updatedAt: r.updated_at
          ? new Date(r.updated_at).toISOString()
          : new Date().toISOString(),
        unsubscribedAt: r.unsubscribed_at
          ? new Date(r.unsubscribed_at).toISOString()
          : null,
      }));
    } catch (err) {
      console.warn("[Newsletter] PG query failed, falling back to JSON:", err);
    }
  }

  return loadJsonFallback().filter((r) => !r.unsubscribedAt);
}

