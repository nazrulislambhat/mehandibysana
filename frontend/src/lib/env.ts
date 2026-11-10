/**
 * Server-only environment variable accessors.
 * Reads MedusaJS v2 backend URL & publishable key (primary) and optional WordPress fallback.
 */

export interface ServerEnvConfig {
  medusaBackendUrl: string | null;
  medusaPublishableKey: string | null;
  wpBaseUrl: string | null;
  wcConsumerKey: string | null;
  wcConsumerSecret: string | null;
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

  const rawUrl = process.env.WP_BASE_URL?.trim() || '';
  const wpBaseUrl = rawUrl ? rawUrl.replace(/\/+$/, '') : null;

  const wcConsumerKey = process.env.WC_CONSUMER_KEY?.trim() || null;
  const wcConsumerSecret = process.env.WC_CONSUMER_SECRET?.trim() || null;
  const revalidateSecret = process.env.REVALIDATE_SECRET?.trim() || null;

  return {
    medusaBackendUrl,
    medusaPublishableKey,
    wpBaseUrl,
    wcConsumerKey,
    wcConsumerSecret,
    revalidateSecret,
  };
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}
