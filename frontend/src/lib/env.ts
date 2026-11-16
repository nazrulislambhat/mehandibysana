/**
 * Server-only environment variable accessors.
 * Reads MedusaJS v2 backend URL & publishable key.
 */

export interface ServerEnvConfig {
  medusaBackendUrl: string | null;
  medusaPublishableKey: string | null;
  revalidateSecret: string | null;
}

function assertServerSide(): void {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() must only be called on the server.');
  }
}

export function getServerEnv(): ServerEnvConfig {
  assertServerSide();

  const rawMedusaUrl = process.env.MEDUSA_BACKEND_URL?.trim() || '';
  const medusaBackendUrl = rawMedusaUrl ? rawMedusaUrl.replace(/\/+$/, '') : null;
  const medusaPublishableKey = process.env.MEDUSA_PUBLISHABLE_KEY?.trim() || null;
  const revalidateSecret = process.env.REVALIDATE_SECRET?.trim() || null;

  return {
    medusaBackendUrl,
    medusaPublishableKey,
    revalidateSecret,
  };
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}
