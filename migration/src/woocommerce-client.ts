import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load migration/.env if present, and fall back to ../frontend/.env.local so WP credentials are shared seamlessly
dotenv.config();
const frontendEnvLocal = path.resolve(process.cwd(), '..', 'frontend', '.env.local');
if (fs.existsSync(frontendEnvLocal)) {
  dotenv.config({ path: frontendEnvLocal, override: false });
}

export interface WooClientConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  version?: string;
}

export class WooCommerceClient {
  private url: string;
  private authHeader: string;
  private apiVersion: string;

  constructor(config?: Partial<WooClientConfig>) {
    const siteUrl =
      config?.url ||
      process.env.WOOCOMMERCE_URL ||
      process.env.WP_BASE_URL;
    const key =
      config?.consumerKey ||
      process.env.WOOCOMMERCE_CONSUMER_KEY ||
      process.env.WC_CONSUMER_KEY;
    const secret =
      config?.consumerSecret ||
      process.env.WOOCOMMERCE_CONSUMER_SECRET ||
      process.env.WC_CONSUMER_SECRET;

    if (!siteUrl || !key || !secret) {
      throw new Error(
        'Missing WooCommerce credentials. Set WOOCOMMERCE_URL/WOOCOMMERCE_CONSUMER_KEY/WOOCOMMERCE_CONSUMER_SECRET in migration/.env or WP_BASE_URL/WC_CONSUMER_KEY/WC_CONSUMER_SECRET in frontend/.env.local.'
      );
    }

    this.url = siteUrl.replace(/\/$/, '');
    this.apiVersion = config?.version || 'wc/v3';
    this.authHeader = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
  }

  async fetchEndpoint<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<{ data: T; total: number; totalPages: number }> {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      query.append(k, String(v));
    }

    const endpointPath = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const requestUrl = `${this.url}/wp-json/${this.apiVersion}/${endpointPath}${query.toString() ? `?${query.toString()}` : ''}`;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const response = await fetch(requestUrl, {
          headers: {
            Authorization: this.authHeader,
            Accept: 'application/json',
            'User-Agent': 'MehandiBySana-MigrationEngine/2.0',
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `WooCommerce API Error (${response.status} ${response.statusText}): ${errorBody}`
          );
        }

        const data = (await response.json()) as T;
        const total = parseInt(response.headers.get('x-wp-total') || '0', 10);
        const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);

        return { data, total, totalPages };
      } catch (err: any) {
        if (attempts >= maxAttempts) throw err;
        const backoffMs = attempts * 1500;
        console.warn(
          `[WooCommerceClient] Warning on ${requestUrl} (Attempt ${attempts}): ${err.message}. Retrying in ${backoffMs}ms...`
        );
        await new Promise((res) => setTimeout(res, backoffMs));
      }
    }

    throw new Error(`Failed to fetch ${endpoint} after ${maxAttempts} attempts`);
  }

  async fetchAllPaginated<T>(
    endpoint: string,
    baseParams: Record<string, string | number> = {}
  ): Promise<T[]> {
    const results: T[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      console.log(`[WooCommerceClient] Fetching ${endpoint} (Page ${page})...`);
      const res = await this.fetchEndpoint<T[]>(endpoint, {
        ...baseParams,
        page,
        per_page: perPage,
      });

      if (!Array.isArray(res.data) || res.data.length === 0) {
        break;
      }

      results.push(...res.data);
      console.log(
        `[WooCommerceClient] Fetched ${results.length} / ${res.total || results.length} items from ${endpoint}.`
      );

      if (page >= res.totalPages || res.data.length < perPage) {
        break;
      }
      page++;
    }

    return results;
  }
}
