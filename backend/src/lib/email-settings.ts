import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export type StudioEmailPreferredProvider = "auto" | "resend" | "brevo" | "smtp";

export interface StudioEmailSettingsRecord {
  preferredProvider: StudioEmailPreferredProvider;
  fromEmail: string;
  adminEmail: string;
  storefrontUrl: string;
  resendApiKey: string;
  brevoApiKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  autoSendOrderConfirmation: boolean;
  autoSendShippingEmail: boolean;
  updatedAt: string | null;
}

export interface SanitizedStudioEmailSettings {
  preferredProvider: StudioEmailPreferredProvider;
  fromEmail: string;
  adminEmail: string;
  storefrontUrl: string;
  hasResendApiKey: boolean;
  maskedResendApiKey: string;
  hasBrevoApiKey: boolean;
  maskedBrevoApiKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  hasSmtpPass: boolean;
  autoSendOrderConfirmation: boolean;
  autoSendShippingEmail: boolean;
  envOverrides: {
    hasEnvResendApiKey: boolean;
    hasEnvBrevoApiKey: boolean;
    hasEnvSmtp: boolean;
  };
  updatedAt: string | null;
}

export interface UpdateStudioEmailSettingsInput {
  preferredProvider?: StudioEmailPreferredProvider;
  fromEmail?: string;
  adminEmail?: string;
  storefrontUrl?: string;
  resendApiKey?: string;
  clearResendApiKey?: boolean;
  brevoApiKey?: string;
  clearBrevoApiKey?: boolean;
  smtpHost?: string;
  smtpPort?: number | string;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  clearSmtpPass?: boolean;
  autoSendOrderConfirmation?: boolean;
  autoSendShippingEmail?: boolean;
}

const VALID_PROVIDERS = new Set<StudioEmailPreferredProvider>([
  "auto",
  "resend",
  "brevo",
  "smtp",
]);

let cachedDbRow: Partial<StudioEmailSettingsRecord> | null = null;
let lastLoadedAt = 0;
let tableEnsured = false;

const CACHE_TTL_MS = 30_000;

function maskSecret(secret: string): string {
  const trimmed = secret.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 6) return "••••••";
  return `${trimmed.slice(0, 3)}••••${trimmed.slice(-4)}`;
}

async function ensureTable(pg: any): Promise<void> {
  if (tableEnsured) return;
  await pg.raw(`
    CREATE TABLE IF NOT EXISTS "studio_email_settings" (
      "id" TEXT PRIMARY KEY,
      "preferred_provider" TEXT NOT NULL DEFAULT 'auto',
      "from_email" TEXT NOT NULL DEFAULT '',
      "admin_email" TEXT NOT NULL DEFAULT '',
      "storefront_url" TEXT NOT NULL DEFAULT '',
      "resend_api_key" TEXT NOT NULL DEFAULT '',
      "brevo_api_key" TEXT NOT NULL DEFAULT '',
      "smtp_host" TEXT NOT NULL DEFAULT '',
      "smtp_port" INTEGER NOT NULL DEFAULT 465,
      "smtp_secure" BOOLEAN NOT NULL DEFAULT TRUE,
      "smtp_user" TEXT NOT NULL DEFAULT '',
      "smtp_pass" TEXT NOT NULL DEFAULT '',
      "auto_send_order_confirmation" BOOLEAN NOT NULL DEFAULT TRUE,
      "auto_send_shipping_email" BOOLEAN NOT NULL DEFAULT TRUE,
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  tableEnsured = true;
}

function normalizeProvider(raw: unknown): StudioEmailPreferredProvider {
  const val = String(raw || "auto").trim().toLowerCase() as StudioEmailPreferredProvider;
  return VALID_PROVIDERS.has(val) ? val : "auto";
}

function parseRow(row: any): Partial<StudioEmailSettingsRecord> {
  if (!row) return {};
  return {
    preferredProvider: normalizeProvider(row.preferred_provider),
    fromEmail: String(row.from_email || "").trim(),
    adminEmail: String(row.admin_email || "").trim(),
    storefrontUrl: String(row.storefront_url || "").trim(),
    resendApiKey: String(row.resend_api_key || "").trim(),
    brevoApiKey: String(row.brevo_api_key || "").trim(),
    smtpHost: String(row.smtp_host || "").trim(),
    smtpPort: Number(row.smtp_port) > 0 ? Number(row.smtp_port) : 465,
    smtpSecure: row.smtp_secure !== false,
    smtpUser: String(row.smtp_user || "").trim(),
    smtpPass: String(row.smtp_pass || "").trim(),
    autoSendOrderConfirmation: row.auto_send_order_confirmation !== false,
    autoSendShippingEmail: row.auto_send_shipping_email !== false,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

export async function ensureStudioEmailSettingsLoaded(
  scope?: { resolve: (key: string) => any },
  force = false
): Promise<StudioEmailSettingsRecord> {
  if (
    scope &&
    (force || !cachedDbRow || Date.now() - lastLoadedAt > CACHE_TTL_MS)
  ) {
    try {
      const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
      await ensureTable(pg);
      const res = await pg.raw(
        `SELECT * FROM "studio_email_settings" WHERE "id" = ? LIMIT 1`,
        ["default"]
      );
      const row = res?.rows?.[0] || null;
      cachedDbRow = row ? parseRow(row) : {};
      lastLoadedAt = Date.now();
    } catch (err) {
      console.warn("[Email Settings] Could not load DB email settings (using env):", err);
    }
  }

  return getEffectiveEmailSettings();
}

export function getEffectiveEmailSettings(): StudioEmailSettingsRecord {
  const db = cachedDbRow || {};

  const envResend = process.env.RESEND_API_KEY?.trim() || "";
  const envBrevo = process.env.BREVO_API_KEY?.trim() || "";
  const envSmtpHost = process.env.SMTP_HOST?.trim() || "";
  const envSmtpPort = Number(process.env.SMTP_PORT || 465) || 465;
  const envSmtpSecure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : envSmtpPort === 465;
  const envSmtpUser = process.env.SMTP_USER?.trim() || "";
  const envSmtpPass = process.env.SMTP_PASS?.trim() || "";

  const fromEmail =
    db.fromEmail?.trim() ||
    process.env.STUDIO_FROM_EMAIL?.trim() ||
    "Mehandi by Sana <orders@mehandibysana.com>";

  const adminEmail =
    db.adminEmail !== undefined && db.updatedAt
      ? db.adminEmail.trim()
      : db.adminEmail?.trim() || process.env.STUDIO_ADMIN_EMAIL?.trim() || "";

  const storefrontUrl = (
    db.storefrontUrl?.trim() ||
    process.env.STORE_SITE_URL?.trim() ||
    "https://mehandibysana.com"
  ).replace(/\/+$/, "");

  const smtpPort = db.smtpHost ? db.smtpPort || 465 : envSmtpHost ? envSmtpPort : 465;
  const smtpSecure = db.smtpHost
    ? db.smtpSecure ?? smtpPort === 465
    : envSmtpSecure;

  return {
    preferredProvider: db.preferredProvider || "auto",
    fromEmail,
    adminEmail,
    storefrontUrl,
    resendApiKey: db.resendApiKey?.trim() || envResend,
    brevoApiKey: db.brevoApiKey?.trim() || envBrevo,
    smtpHost: db.smtpHost?.trim() || envSmtpHost,
    smtpPort,
    smtpSecure,
    smtpUser: db.smtpUser?.trim() || envSmtpUser,
    smtpPass: db.smtpPass?.trim() || envSmtpPass,
    autoSendOrderConfirmation: db.autoSendOrderConfirmation ?? true,
    autoSendShippingEmail: db.autoSendShippingEmail ?? true,
    updatedAt: db.updatedAt || null,
  };
}

export async function getSanitizedEmailSettings(
  scope: { resolve: (key: string) => any }
): Promise<SanitizedStudioEmailSettings> {
  const effective = await ensureStudioEmailSettingsLoaded(scope, true);
  return {
    preferredProvider: effective.preferredProvider,
    fromEmail: effective.fromEmail,
    adminEmail: effective.adminEmail,
    storefrontUrl: effective.storefrontUrl,
    hasResendApiKey: Boolean(effective.resendApiKey),
    maskedResendApiKey: maskSecret(effective.resendApiKey),
    hasBrevoApiKey: Boolean(effective.brevoApiKey),
    maskedBrevoApiKey: maskSecret(effective.brevoApiKey),
    smtpHost: effective.smtpHost,
    smtpPort: effective.smtpPort,
    smtpSecure: effective.smtpSecure,
    smtpUser: effective.smtpUser,
    hasSmtpPass: Boolean(effective.smtpPass),
    autoSendOrderConfirmation: effective.autoSendOrderConfirmation,
    autoSendShippingEmail: effective.autoSendShippingEmail,
    envOverrides: {
      hasEnvResendApiKey: Boolean(process.env.RESEND_API_KEY?.trim()),
      hasEnvBrevoApiKey: Boolean(process.env.BREVO_API_KEY?.trim()),
      hasEnvSmtp: Boolean(
        process.env.SMTP_HOST?.trim() &&
          process.env.SMTP_USER?.trim() &&
          process.env.SMTP_PASS?.trim()
      ),
    },
    updatedAt: effective.updatedAt,
  };
}

export async function saveStudioEmailSettings(
  scope: { resolve: (key: string) => any },
  input: UpdateStudioEmailSettingsInput
): Promise<SanitizedStudioEmailSettings> {
  const pg = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  await ensureTable(pg);

  const existingRes = await pg.raw(
    `SELECT * FROM "studio_email_settings" WHERE "id" = ? LIMIT 1`,
    ["default"]
  );
  const existingDb = parseRow(existingRes?.rows?.[0] || null);

  const preferredProvider =
    input.preferredProvider !== undefined
      ? normalizeProvider(input.preferredProvider)
      : existingDb.preferredProvider || "auto";

  const fromEmail =
    input.fromEmail !== undefined
      ? String(input.fromEmail).trim()
      : existingDb.fromEmail ?? "";

  const adminEmail =
    input.adminEmail !== undefined
      ? String(input.adminEmail).trim()
      : existingDb.adminEmail ?? "";

  const storefrontUrl =
    input.storefrontUrl !== undefined
      ? String(input.storefrontUrl).trim().replace(/\/+$/, "")
      : existingDb.storefrontUrl ?? "";

  let resendApiKey = existingDb.resendApiKey ?? "";
  if (input.clearResendApiKey) {
    resendApiKey = "";
  } else if (input.resendApiKey !== undefined && input.resendApiKey.trim()) {
    resendApiKey = input.resendApiKey.trim();
  }

  let brevoApiKey = existingDb.brevoApiKey ?? "";
  if (input.clearBrevoApiKey) {
    brevoApiKey = "";
  } else if (input.brevoApiKey !== undefined && input.brevoApiKey.trim()) {
    brevoApiKey = input.brevoApiKey.trim();
  }

  const smtpHost =
    input.smtpHost !== undefined
      ? String(input.smtpHost).trim()
      : existingDb.smtpHost ?? "";

  const rawPort =
    input.smtpPort !== undefined ? Number(input.smtpPort) : existingDb.smtpPort || 465;
  const smtpPort = Number.isInteger(rawPort) && rawPort > 0 && rawPort <= 65535 ? rawPort : 465;

  const smtpSecure =
    input.smtpSecure !== undefined
      ? Boolean(input.smtpSecure)
      : existingDb.smtpSecure ?? smtpPort === 465;

  const smtpUser =
    input.smtpUser !== undefined
      ? String(input.smtpUser).trim()
      : existingDb.smtpUser ?? "";

  let smtpPass = existingDb.smtpPass ?? "";
  if (input.clearSmtpPass) {
    smtpPass = "";
  } else if (input.smtpPass !== undefined && input.smtpPass.trim()) {
    smtpPass = input.smtpPass.trim();
  }

  const autoSendOrderConfirmation =
    input.autoSendOrderConfirmation !== undefined
      ? Boolean(input.autoSendOrderConfirmation)
      : existingDb.autoSendOrderConfirmation ?? true;

  const autoSendShippingEmail =
    input.autoSendShippingEmail !== undefined
      ? Boolean(input.autoSendShippingEmail)
      : existingDb.autoSendShippingEmail ?? true;

  await pg.raw(
    `
    INSERT INTO "studio_email_settings" (
      "id", "preferred_provider", "from_email", "admin_email", "storefront_url",
      "resend_api_key", "brevo_api_key", "smtp_host", "smtp_port", "smtp_secure",
      "smtp_user", "smtp_pass", "auto_send_order_confirmation", "auto_send_shipping_email",
      "updated_at"
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON CONFLICT ("id") DO UPDATE SET
      "preferred_provider" = EXCLUDED."preferred_provider",
      "from_email" = EXCLUDED."from_email",
      "admin_email" = EXCLUDED."admin_email",
      "storefront_url" = EXCLUDED."storefront_url",
      "resend_api_key" = EXCLUDED."resend_api_key",
      "brevo_api_key" = EXCLUDED."brevo_api_key",
      "smtp_host" = EXCLUDED."smtp_host",
      "smtp_port" = EXCLUDED."smtp_port",
      "smtp_secure" = EXCLUDED."smtp_secure",
      "smtp_user" = EXCLUDED."smtp_user",
      "smtp_pass" = EXCLUDED."smtp_pass",
      "auto_send_order_confirmation" = EXCLUDED."auto_send_order_confirmation",
      "auto_send_shipping_email" = EXCLUDED."auto_send_shipping_email",
      "updated_at" = NOW()
    `,
    [
      "default",
      preferredProvider,
      fromEmail,
      adminEmail,
      storefrontUrl,
      resendApiKey,
      brevoApiKey,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      autoSendOrderConfirmation,
      autoSendShippingEmail,
    ]
  );

  cachedDbRow = null;
  lastLoadedAt = 0;

  return getSanitizedEmailSettings(scope);
}

