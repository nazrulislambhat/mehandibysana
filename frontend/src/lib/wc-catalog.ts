import { normalizeCategorySlug } from '@/lib/category-slugs';
import { getServerEnv } from '@/lib/env';
import type {
  CatalogSummary,
  StorefrontCategory,
  StorefrontProduct,
  StorefrontReview,
  StorefrontVariation,
} from '@/types/storefront';

const REVALIDATE_SECONDS = 60;

export function resolveStorefrontAssetUrl(url: string): string {
  const trimmed = url.trim();
  const studioPrefix = 'https://mehandibysana.vercel.app/images/tools/';
  if (trimmed.startsWith(studioPrefix)) {
    return `/images/tools/${trimmed.slice(studioPrefix.length)}`;
  }
  return trimmed;
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&#8217;/gi, "'")
    .replace(/&#8211;/gi, '–')
    .replace(/&#8212;/gi, '—');
}

function stripHtml(input: string): string {
  return decodeHtmlEntities(input.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministic positive 31-bit integer hash from Medusa string IDs (e.g. "prod_01...", "variant_01...")
 * so all existing components expecting numeric IDs stay 100% type-compatible.
 */
export function hashMedusaId(id: string): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 1) || 1;
}

interface MedusaRegion {
  id: string;
  name: string;
  currency_code: string;
}

interface MedusaVariantOptionValue {
  id?: string;
  value: string;
  option_id?: string;
  option?: {
    id: string;
    title: string;
  };
}

interface MedusaProductVariant {
  id: string;
  title: string;
  sku?: string | null;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
  inventory_quantity?: number | null;
  options?: MedusaVariantOptionValue[];
  calculated_price?: {
    calculated_amount?: number | null;
    original_amount?: number | null;
    currency_code?: string;
  } | null;
  prices?: Array<{
    amount: number;
    currency_code: string;
  }>;
}

interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  images?: Array<{ id: string; url: string }>;
  categories?: Array<{ id: string; name: string; handle: string }>;
  options?: Array<{
    id: string;
    title: string;
    values?: Array<{ id: string; value: string }>;
  }>;
  variants?: MedusaProductVariant[];
  metadata?: Record<string, unknown> | null;
}

interface MedusaCategory {
  id: string;
  name: string;
  handle: string;
  rank?: number | null;
  description?: string | null;
}

export { normalizeCategorySlug };

function medusaHeaders(publishableKey: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (publishableKey) {
    headers['x-publishable-api-key'] = publishableKey;
  }
  return headers;
}

async function resolveIndiaRegionId(
  baseUrl: string,
  publishableKey: string | null
): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/store/regions`, {
      headers: medusaHeaders(publishableKey),
      next: { revalidate: 300, tags: ['regions'] },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { regions?: MedusaRegion[] };
    const regions = data.regions || [];
    const india =
      regions.find((r) => r.currency_code?.toLowerCase() === 'inr') || regions[0];
    return india?.id ?? null;
  } catch {
    return null;
  }
}

function extractVariantInrPrice(variant: MedusaProductVariant): {
  price: number;
  regularPrice: number | null;
} {
  const calc = variant.calculated_price?.calculated_amount;
  const orig = variant.calculated_price?.original_amount;
  if (typeof calc === 'number' && Number.isFinite(calc)) {
    const regular =
      typeof orig === 'number' && Number.isFinite(orig) && orig > calc ? orig : null;
    return { price: calc, regularPrice: regular };
  }

  const inrPrice = variant.prices?.find(
    (p) => p.currency_code?.toLowerCase() === 'inr'
  );
  if (inrPrice && typeof inrPrice.amount === 'number') {
    return { price: inrPrice.amount, regularPrice: null };
  }

  const firstPrice = variant.prices?.[0];
  return {
    price: firstPrice && typeof firstPrice.amount === 'number' ? firstPrice.amount : 0,
    regularPrice: null,
  };
}

function normalizeMedusaProduct(raw: MedusaProduct): StorefrontProduct {
  const optionTitleById = new Map<string, string>();
  for (const opt of raw.options || []) {
    optionTitleById.set(opt.id, opt.title);
  }

  const normalizedVariations: StorefrontVariation[] = (raw.variants || []).map(
    (v): StorefrontVariation => {
      const { price, regularPrice } = extractVariantInrPrice(v);
      const inStock =
        !v.manage_inventory ||
        Boolean(v.allow_backorder) ||
        (typeof v.inventory_quantity === 'number' ? v.inventory_quantity > 0 : true);

      const attributes = (v.options || [])
        .map((optVal) => {
          const attrName =
            optVal.option?.title ||
            (optVal.option_id ? optionTitleById.get(optVal.option_id) : undefined) ||
            'Option';
          return {
            attribute: decodeHtmlEntities(attrName),
            value: decodeHtmlEntities(optVal.value || ''),
          };
        })
        .filter((a) => a.value.length > 0);

      return {
        id: hashMedusaId(v.id),
        medusaVariantId: v.id,
        sku: v.sku || '',
        price,
        regularPrice,
        inStock,
        attributes,
        image: null,
      };
    }
  );

  const variantPrices = normalizedVariations
    .map((v) => v.price)
    .filter((p) => Number.isFinite(p) && p > 0);

  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
  const highestPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : 0;
  const maxPrice = highestPrice > minPrice ? highestPrice : null;

  const firstRegular =
    normalizedVariations.find((v) => v.regularPrice !== null)?.regularPrice ?? null;

  const cleanTitle = decodeHtmlEntities(raw.title);
  const primaryCategoryLabel = raw.categories?.[0]?.name
    ? decodeHtmlEntities(raw.categories[0].name)
    : 'Botanical Apothecary';
  const buildProductImageAlt = (viewIndex: number): string =>
    viewIndex === 0
      ? `${cleanTitle} — ${primaryCategoryLabel} by Mehandi by Sana`
      : `${cleanTitle} (studio view ${viewIndex + 1}) by Mehandi by Sana`;

  const imageList: Array<{ id: number; src: string; alt: string }> = [];
  if (raw.thumbnail) {
    imageList.push({
      id: hashMedusaId(`${raw.id}-thumb`),
      src: resolveStorefrontAssetUrl(raw.thumbnail),
      alt: buildProductImageAlt(0),
    });
  }
  for (const img of raw.images || []) {
    const resolvedUrl = img.url ? resolveStorefrontAssetUrl(img.url) : '';
    if (resolvedUrl && !imageList.some((existing) => existing.src === resolvedUrl)) {
      imageList.push({
        id: hashMedusaId(img.id || resolvedUrl),
        src: resolvedUrl,
        alt: buildProductImageAlt(imageList.length),
      });
    }
  }

  // Only expose interactive option pills if there are multiple variants or a meaningful named option
  const meaningfulOptions = (raw.options || [])
    .map((opt) => ({
      name: decodeHtmlEntities(opt.title),
      options: (opt.values || []).map((v) => decodeHtmlEntities(v.value)),
    }))
    .filter(
      (opt) =>
        opt.options.length > 1 ||
        (opt.options.length === 1 &&
          opt.name.toLowerCase() !== 'option' &&
          opt.options[0].toLowerCase() !== 'standard')
    );

  const metaShort =
    typeof raw.metadata?.short_description === 'string'
      ? raw.metadata.short_description
      : '';

  const shortDesc = stripHtml(raw.subtitle || metaShort || raw.description || '');
  const fullDesc = raw.description || raw.subtitle || '';

  return {
    id: hashMedusaId(raw.id),
    medusaId: raw.id,
    slug: raw.handle,
    name: decodeHtmlEntities(raw.title),
    shortDescription: shortDesc,
    description: fullDesc,
    type: normalizedVariations.length > 1 ? 'variable' : 'simple',
    price: minPrice,
    maxPrice,
    regularPrice: firstRegular,
    currencySymbol: '₹',
    onSale: Boolean(firstRegular && firstRegular > minPrice),
    inStock:
      normalizedVariations.length > 0
        ? normalizedVariations.some((v) => v.inStock)
        : true,
    featured:
      raw.metadata?.featured === true ||
      [
        'organic-henna-cones',
        'mbs-henna-kit',
        'aftercare-henna-balm',
        'henna-sealant-spray',
        'mbs-self-care-kit',
        'eucalyptus-blend-essential-oil',
        'beginner-henna-kit',
        'chemical-free-organic-hair-henna-powder',
      ].includes(raw.handle),
    categories: (raw.categories || []).map((c) => ({
      id: hashMedusaId(c.id),
      medusaId: c.id,
      name: decodeHtmlEntities(c.name),
      slug: c.handle,
    })),
    images: imageList,
    attributes: meaningfulOptions,
    variations: normalizedVariations,
  };
}

async function readMedusaError(res: Response): Promise<string> {
  try {
    const errData = (await res.json()) as { message?: string };
    if (errData?.message) {
      return `Medusa Store API returned ${res.status}: ${errData.message}`;
    }
  } catch {
    // Ignore non-JSON error bodies
  }
  return `Medusa Store API returned ${res.status}`;
}

async function fetchAllMedusaProducts(): Promise<{
  products: StorefrontProduct[];
  isConfigured: boolean;
  error: string | null;
}> {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) {
    return {
      products: [],
      isConfigured: false,
      error: 'MEDUSA_BACKEND_URL is not configured.',
    };
  }
  if (!medusaPublishableKey) {
    return {
      products: [],
      isConfigured: true,
      error: 'MEDUSA_PUBLISHABLE_KEY is not configured.',
    };
  }

  try {
    const regionId = await resolveIndiaRegionId(
      medusaBackendUrl,
      medusaPublishableKey
    );

    const params = new URLSearchParams({
      limit: '100',
      fields:
        '*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,*categories,*images,*options',
    });
    if (regionId) {
      params.set('region_id', regionId);
    }

    const url = `${medusaBackendUrl}/store/products?${params.toString()}`;
    const res = await fetch(url, {
      headers: medusaHeaders(medusaPublishableKey),
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ['products'],
      },
    });

    if (!res.ok) {
      return {
        products: [],
        isConfigured: true,
        error: await readMedusaError(res),
      };
    }

    const data = (await res.json()) as { products?: MedusaProduct[] };
    let rawProducts = data.products || [];

    // Avoid serving a stale cached empty catalog indefinitely if Next.js Data Cache
    // previously cached [] and later revalidations fail (e.g. 400 invalid publishable key).
    if (rawProducts.length === 0) {
      const liveRes = await fetch(url, {
        headers: medusaHeaders(medusaPublishableKey),
        cache: 'no-store',
      });
      if (!liveRes.ok) {
        return {
          products: [],
          isConfigured: true,
          error: await readMedusaError(liveRes),
        };
      }
      const liveData = (await liveRes.json()) as { products?: MedusaProduct[] };
      rawProducts = liveData.products || [];
    }

    const normalized = rawProducts.map(normalizeMedusaProduct);

    return {
      products: normalized,
      isConfigured: true,
      error: null,
    };
  } catch (err) {
    return {
      products: [],
      isConfigured: true,
      error:
        err instanceof Error
          ? err.message
          : 'Unable to reach MedusaJS backend.',
    };
  }
}

export interface ProductQueryOptions {
  categoryId?: number;
  categorySlug?: string;
  search?: string;
  featured?: boolean;
  perPage?: number;
  page?: number;
  orderby?: 'date' | 'price' | 'popularity' | 'title' | 'menu_order';
  order?: 'asc' | 'desc';
}

export interface ProductQueryResult {
  products: StorefrontProduct[];
  total: number | null;
  totalPages: number | null;
  isConfigured: boolean;
  error: string | null;
}

export async function fetchCatalogProducts(
  options: ProductQueryOptions = {}
): Promise<ProductQueryResult> {
  const allResult = await fetchAllMedusaProducts();
  if (!allResult.isConfigured || allResult.error) {
    return {
      products: [],
      total: null,
      totalPages: null,
      isConfigured: allResult.isConfigured,
      error: allResult.error,
    };
  }

  let list = [...allResult.products];

  if (options.categorySlug) {
    const targetSlug = normalizeCategorySlug(options.categorySlug);
    list = list.filter((p) =>
      p.categories.some((c) => normalizeCategorySlug(c.slug) === targetSlug)
    );
  } else if (options.categoryId) {
    list = list.filter((p) =>
      p.categories.some((c) => c.id === options.categoryId)
    );
  }

  if (options.search) {
    const q = options.search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categories.some((c) => c.name.toLowerCase().includes(q)) ||
          p.variations.some((v) => v.sku.toLowerCase().includes(q))
      );
    }
  }

  if (options.featured) {
    const featuredList = list.filter((p) => p.featured);
    if (featuredList.length > 0) {
      list = featuredList;
    }
  }

  const dir = options.order === 'desc' ? -1 : 1;
  if (options.orderby === 'price') {
    list.sort((a, b) => (a.price - b.price) * dir);
  } else if (options.orderby === 'title') {
    list.sort((a, b) => a.name.localeCompare(b.name) * dir);
  } else if (options.orderby === 'popularity') {
    list.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  const total = list.length;
  const perPage = options.perPage ?? 24;
  const page = Math.max(1, options.page ?? 1);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const paged = list.slice(start, start + perPage);

  return {
    products: paged,
    total,
    totalPages,
    isConfigured: true,
    error: null,
  };
}

export async function fetchCatalogCategories(): Promise<StorefrontCategory[]> {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) return [];

  try {
    const [catRes, productsResult] = await Promise.all([
      fetch(`${medusaBackendUrl}/store/product-categories?limit=50`, {
        headers: medusaHeaders(medusaPublishableKey),
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: ['categories'],
        },
      }),
      fetchAllMedusaProducts(),
    ]);

    if (!catRes.ok) return [];
    const catData = (await catRes.json()) as {
      product_categories?: MedusaCategory[];
    };
    const rawCats = catData.product_categories || [];

    const countsByHandle = new Map<string, number>();
    for (const prod of productsResult.products) {
      for (const cat of prod.categories) {
        const key = normalizeCategorySlug(cat.slug);
        countsByHandle.set(key, (countsByHandle.get(key) || 0) + 1);
      }
    }

    return rawCats
      .filter((c) => c.handle !== 'uncategorized')
      .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
      .map((c) => {
        const cleanSlug = normalizeCategorySlug(c.handle);
        return {
          id: hashMedusaId(c.id),
          medusaId: c.id,
          name: decodeHtmlEntities(c.name),
          slug: cleanSlug,
          count: countsByHandle.get(cleanSlug) ?? 0,
        };
      })
      .filter((c) => c.count > 0);
  } catch {
    return [];
  }
}

export async function fetchProductBySlug(
  slug: string
): Promise<StorefrontProduct | null> {
  const allResult = await fetchAllMedusaProducts();
  return allResult.products.find((p) => p.slug === slug) ?? null;
}

export async function fetchOrderCount(): Promise<number | null> {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) return null;

  try {
    const res = await fetch(`${medusaBackendUrl}/store/orders?limit=1`, {
      headers: medusaHeaders(medusaPublishableKey),
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: ['orders-summary'],
      },
    });
    if (!res.ok) return 3499;
    const data = (await res.json()) as { count?: number; orders?: unknown[] };
    if (typeof data.count === 'number' && data.count > 0) {
      return Math.max(3499, data.count);
    }
    return 3499;
  } catch {
    return 3499;
  }
}

export async function fetchCatalogReviews(): Promise<StorefrontReview[]> {
  return [];
}

export function pickCompanionProducts(
  current: StorefrontProduct,
  candidates: StorefrontProduct[],
  limit = 3
): StorefrontProduct[] {
  const pool = candidates.filter((p) => p.id !== current.id);
  const currentText = `${current.slug} ${current.name}`.toLowerCase();

  const scoreProduct = (candidate: StorefrontProduct): number => {
    let score = candidate.inStock ? 20 : -50;
    const text = `${candidate.slug} ${candidate.name}`.toLowerCase();

    if (
      currentText.includes('cone') ||
      currentText.includes('bulk') ||
      currentText.includes('powder')
    ) {
      if (
        text.includes('oil') ||
        text.includes('sealant') ||
        text.includes('balm') ||
        text.includes('cellophane') ||
        text.includes('scale') ||
        text.includes('spoon')
      ) {
        score += 15;
      }
    } else if (currentText.includes('kit')) {
      if (
        text.includes('cone') ||
        text.includes('oil') ||
        text.includes('balm') ||
        text.includes('sealant')
      ) {
        score += 15;
      }
    } else if (
      currentText.includes('oil') ||
      currentText.includes('balm') ||
      currentText.includes('sealant')
    ) {
      if (
        text.includes('cone') ||
        text.includes('bulk') ||
        text.includes('kit')
      ) {
        score += 15;
      }
    } else if (
      currentText.includes('cellophane') ||
      currentText.includes('spoon') ||
      currentText.includes('scale') ||
      currentText.includes('piping') ||
      currentText.includes('pin') ||
      currentText.includes('filter') ||
      currentText.includes('practice') ||
      currentText.includes('bowl')
    ) {
      if (
        text.includes('bulk') ||
        text.includes('pre-rolled') ||
        text.includes('cone') ||
        text.includes('oil') ||
        text.includes('cellophane') ||
        text.includes('spoon') ||
        text.includes('scale')
      ) {
        score += 15;
      }
    }

    if (candidate.images.length > 0) score += 5;
    if (candidate.featured) score += 3;
    return score;
  };

  return [...pool]
    .sort((a, b) => scoreProduct(b) - scoreProduct(a))
    .slice(0, limit);
}

const FEATURED_PRIORITY_HANDLES = [
  'organic-henna-cones',
  'mbs-henna-kit',
  'aftercare-henna-balm',
  'henna-sealant-spray',
  'mbs-self-care-kit',
  'eucalyptus-blend-essential-oil',
  'beginner-henna-kit',
  'chemical-free-organic-hair-henna-powder',
];

export async function fetchHomepageCatalogSummary(): Promise<CatalogSummary> {
  const [featuredResult, allResult, categories, ordersCount, reviews] =
    await Promise.all([
      fetchCatalogProducts({ featured: true, perPage: 12 }),
      fetchCatalogProducts({ perPage: 50 }),
      fetchCatalogCategories(),
      fetchOrderCount(),
      fetchCatalogReviews(),
    ]);

  const rawFeatured =
    featuredResult.products.length > 0
      ? featuredResult.products
      : allResult.products.slice(0, 6);

  const featuredProducts = [...rawFeatured].sort((a, b) => {
    const idxA = FEATURED_PRIORITY_HANDLES.indexOf(a.slug);
    const idxB = FEATURED_PRIORITY_HANDLES.indexOf(b.slug);
    const rankA = idxA === -1 ? 999 : idxA;
    const rankB = idxB === -1 ? 999 : idxB;
    return rankA - rankB;
  });

  const totalProducts = allResult.total ?? featuredResult.total;
  const isConfigured = allResult.isConfigured;
  const error = allResult.error ?? featuredResult.error;

  return {
    totalProducts,
    ordersCount,
    featuredProducts,
    allProducts: allResult.products,
    categories,
    reviews,
    isConfigured,
    error,
  };
}
