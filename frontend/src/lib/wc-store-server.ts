import { getServerEnv } from '@/lib/env';
import {
  fetchCatalogProducts,
  hashMedusaId,
  resolveStorefrontAssetUrl,
} from '@/lib/wc-catalog';
import type {
  StorefrontCart,
  StorefrontCartItem,
  StorefrontProduct,
} from '@/types/storefront';

export interface StoreProxyResult {
  cart: StorefrontCart | null;
  cartToken: string | null;
  nonce: string | null;
  status: number;
  error: string | null;
}

interface MedusaCartLineItem {
  id: string;
  title: string;
  subtitle?: string | null;
  thumbnail?: string | null;
  quantity: number;
  unit_price: number;
  total?: number;
  subtotal?: number;
  variant_id?: string;
  variant_title?: string | null;
  product_id?: string | null;
  product_handle?: string | null;
}

interface MedusaCart {
  id: string;
  currency_code?: string;
  items?: MedusaCartLineItem[];
  item_subtotal?: number;
  subtotal?: number;
  total?: number;
}

function buildHeaders(publishableKey: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (publishableKey) {
    headers['x-publishable-api-key'] = publishableKey;
  }
  return headers;
}

async function normalizeMedusaCart(raw: MedusaCart): Promise<StorefrontCart> {
  const rawItems = raw.items || [];

  const byVariantId = new Map<string, StorefrontProduct>();
  const byProductId = new Map<string, StorefrontProduct>();
  const byHandle = new Map<string, StorefrontProduct>();
  const byTitle = new Map<string, StorefrontProduct>();

  const needsCatalogEnrichment = rawItems.some(
    (item) =>
      !item.thumbnail ||
      !item.thumbnail.trim() ||
      !item.product_handle
  );

  if (rawItems.length > 0 && needsCatalogEnrichment) {
    try {
      const catalog = await fetchCatalogProducts({ perPage: 100 });
      for (const prod of catalog.products) {
        if (prod.medusaId) {
          byProductId.set(prod.medusaId, prod);
        }
        if (prod.slug) {
          byHandle.set(prod.slug.toLowerCase(), prod);
        }
        if (prod.name) {
          byTitle.set(prod.name.trim().toLowerCase(), prod);
        }
        for (const variation of prod.variations) {
          if (variation.medusaVariantId) {
            byVariantId.set(variation.medusaVariantId, prod);
          }
        }
      }
    } catch {
      // Non-fatal fallback: continue with line-item fields directly
    }
  }

  const items: StorefrontCartItem[] = rawItems.map((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const unitPrice = Number(item.unit_price) || 0;
    const lineTotal =
      typeof item.total === 'number' && item.total > 0
        ? item.total
        : typeof item.subtotal === 'number' && item.subtotal > 0
          ? item.subtotal
          : unitPrice * qty;

    const variantLabel =
      item.variant_title &&
      item.variant_title.toLowerCase() !== 'standard' &&
      item.variant_title.toLowerCase() !== 'default variant'
        ? item.variant_title
        : null;

    const matchedProduct =
      (item.variant_id ? byVariantId.get(item.variant_id) : undefined) ??
      (item.product_id ? byProductId.get(item.product_id) : undefined) ??
      (item.product_handle
        ? byHandle.get(item.product_handle.toLowerCase())
        : undefined) ??
      (item.title ? byTitle.get(item.title.trim().toLowerCase()) : undefined);

    const directThumb =
      item.thumbnail && item.thumbnail.trim()
        ? resolveStorefrontAssetUrl(item.thumbnail)
        : '';
    const catalogThumb = matchedProduct?.images[0]?.src
      ? resolveStorefrontAssetUrl(matchedProduct.images[0].src)
      : '';
    const resolvedSrc = directThumb || catalogThumb;
    const resolvedSlug = item.product_handle || matchedProduct?.slug || '';

    return {
      key: item.id,
      productId: hashMedusaId(item.variant_id || item.id),
      medusaVariantId: item.variant_id,
      name: item.title || matchedProduct?.name || 'Henna Product',
      quantity: qty,
      unitPrice,
      lineTotal,
      currencySymbol: '₹',
      image: resolvedSrc
        ? {
            id: hashMedusaId(`${item.id}-img`),
            src: resolvedSrc,
            alt: item.title || matchedProduct?.name || 'Product',
          }
        : null,
      variationLabel: variantLabel,
      slug: resolvedSlug,
    };
  });

  const computedSubtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const subtotal =
    typeof raw.item_subtotal === 'number' && raw.item_subtotal > 0
      ? raw.item_subtotal
      : computedSubtotal;
  const total =
    typeof raw.total === 'number' && raw.total > 0 ? raw.total : subtotal;
  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items,
    itemsCount,
    subtotal,
    total,
    currencySymbol: '₹',
  };
}

async function getIndiaRegionId(
  baseUrl: string,
  publishableKey: string | null
): Promise<string | undefined> {
  try {
    const res = await fetch(`${baseUrl}/store/regions`, {
      headers: buildHeaders(publishableKey),
      cache: 'no-store',
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      regions?: Array<{ id: string; currency_code: string }>;
    };
    const regions = data.regions || [];
    return (
      regions.find((r) => r.currency_code?.toLowerCase() === 'inr')?.id ??
      regions[0]?.id
    );
  } catch {
    return undefined;
  }
}

async function createMedusaCart(
  baseUrl: string,
  publishableKey: string | null
): Promise<MedusaCart | null> {
  const regionId = await getIndiaRegionId(baseUrl, publishableKey);
  const res = await fetch(`${baseUrl}/store/carts`, {
    method: 'POST',
    headers: buildHeaders(publishableKey),
    body: JSON.stringify(regionId ? { region_id: regionId } : {}),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { cart?: MedusaCart };
  return data.cart ?? null;
}

async function fetchMedusaCart(
  baseUrl: string,
  publishableKey: string | null,
  cartId: string
): Promise<MedusaCart | null> {
  if (!cartId || !cartId.startsWith('cart_')) return null;
  const res = await fetch(`${baseUrl}/store/carts/${encodeURIComponent(cartId)}`, {
    headers: buildHeaders(publishableKey),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { cart?: MedusaCart };
  return data.cart ?? null;
}

/**
 * Resolves a numeric storefront product/variant ID + optional variation attributes
 * into the exact MedusaJS variant_id ("variant_01...").
 */
async function resolveMedusaVariantId(
  body: Record<string, unknown> | undefined
): Promise<string | null> {
  if (!body) return null;
  if (typeof body.medusaVariantId === 'string' && body.medusaVariantId.startsWith('variant_')) {
    return body.medusaVariantId;
  }

  const numericId = Number(body.id);
  const variationArr = Array.isArray(body.variation)
    ? (body.variation as Array<{ attribute?: string; value?: string }>)
    : [];

  const catalog = await fetchCatalogProducts({ perPage: 100 });

  // 1. Direct match on hashed variant ID
  for (const prod of catalog.products) {
    const directVar = prod.variations.find((v) => v.id === numericId);
    if (directVar?.medusaVariantId) {
      return directVar.medusaVariantId;
    }
  }

  // 2. Match on hashed product ID + selected variation attributes
  const matchedProduct = catalog.products.find((p) => p.id === numericId);
  if (matchedProduct && matchedProduct.variations.length > 0) {
    if (variationArr.length > 0) {
      const matchedVar = matchedProduct.variations.find((v) =>
        variationArr.every((reqAttr) => {
          const found = v.attributes.find(
            (a) =>
              a.attribute.toLowerCase() ===
              String(reqAttr.attribute || '').toLowerCase()
          );
          return (
            found &&
            found.value.toLowerCase() ===
              String(reqAttr.value || '').toLowerCase()
          );
        })
      );
      if (matchedVar?.medusaVariantId) return matchedVar.medusaVariantId;
    }
    return matchedProduct.variations[0]?.medusaVariantId ?? null;
  }

  return null;
}

export async function proxyStoreCart(params: {
  path: string;
  method: 'GET' | 'POST';
  cartToken?: string | null;
  nonce?: string | null;
  body?: Record<string, unknown>;
}): Promise<StoreProxyResult> {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();

  if (!medusaBackendUrl) {
    return {
      cart: null,
      cartToken: params.cartToken ?? null,
      nonce: null,
      status: 503,
      error: 'MEDUSA_BACKEND_URL is not configured.',
    };
  }

  try {
    let activeCart: MedusaCart | null = null;
    if (params.cartToken && params.cartToken.startsWith('cart_')) {
      activeCart = await fetchMedusaCart(
        medusaBackendUrl,
        medusaPublishableKey,
        params.cartToken
      );
    }

    // GET /cart
    if (params.path === '/cart' && params.method === 'GET') {
      if (!activeCart) {
        activeCart = await createMedusaCart(
          medusaBackendUrl,
          medusaPublishableKey
        );
      }
      if (!activeCart) {
        return {
          cart: null,
          cartToken: null,
          nonce: null,
          status: 502,
          error: 'Unable to initialize Medusa shopping bag.',
        };
      }
      return {
        cart: await normalizeMedusaCart(activeCart),
        cartToken: activeCart.id,
        nonce: 'medusa-v2',
        status: 200,
        error: null,
      };
    }

    // Ensure cart exists for mutations
    if (!activeCart) {
      activeCart = await createMedusaCart(
        medusaBackendUrl,
        medusaPublishableKey
      );
    }
    if (!activeCart) {
      return {
        cart: null,
        cartToken: null,
        nonce: null,
        status: 502,
        error: 'Unable to initialize Medusa shopping bag.',
      };
    }

    // POST /cart/add-item
    if (params.path === '/cart/add-item') {
      const variantId = await resolveMedusaVariantId(params.body);
      if (!variantId) {
        return {
          cart: await normalizeMedusaCart(activeCart),
          cartToken: activeCart.id,
          nonce: 'medusa-v2',
          status: 400,
          error: 'Selected product option could not be resolved in Medusa.',
        };
      }

      const quantity = Math.max(1, Number(params.body?.quantity) || 1);
      const addRes = await fetch(
        `${medusaBackendUrl}/store/carts/${encodeURIComponent(activeCart.id)}/line-items`,
        {
          method: 'POST',
          headers: buildHeaders(medusaPublishableKey),
          body: JSON.stringify({
            variant_id: variantId,
            quantity,
          }),
          cache: 'no-store',
        }
      );

      const addData = (await addRes.json()) as {
        cart?: MedusaCart;
        message?: string;
      };

      if (!addRes.ok || !addData.cart) {
        return {
          cart: await normalizeMedusaCart(activeCart),
          cartToken: activeCart.id,
          nonce: 'medusa-v2',
          status: addRes.status,
          error: addData.message || 'Unable to add item to Medusa bag.',
        };
      }

      return {
        cart: await normalizeMedusaCart(addData.cart),
        cartToken: addData.cart.id,
        nonce: 'medusa-v2',
        status: 200,
        error: null,
      };
    }

    // POST /cart/update-item
    if (params.path === '/cart/update-item') {
      const lineId = String(params.body?.key || '');
      const quantity = Math.max(1, Number(params.body?.quantity) || 1);
      if (!lineId) {
        return {
          cart: await normalizeMedusaCart(activeCart),
          cartToken: activeCart.id,
          nonce: 'medusa-v2',
          status: 400,
          error: 'Missing cart item key.',
        };
      }

      const updRes = await fetch(
        `${medusaBackendUrl}/store/carts/${encodeURIComponent(activeCart.id)}/line-items/${encodeURIComponent(lineId)}`,
        {
          method: 'POST',
          headers: buildHeaders(medusaPublishableKey),
          body: JSON.stringify({ quantity }),
          cache: 'no-store',
        }
      );

      const updData = (await updRes.json()) as {
        cart?: MedusaCart;
        message?: string;
      };

      if (!updRes.ok || !updData.cart) {
        return {
          cart: await normalizeMedusaCart(activeCart),
          cartToken: activeCart.id,
          nonce: 'medusa-v2',
          status: updRes.status,
          error: updData.message || 'Unable to update item quantity.',
        };
      }

      return {
        cart: await normalizeMedusaCart(updData.cart),
        cartToken: updData.cart.id,
        nonce: 'medusa-v2',
        status: 200,
        error: null,
      };
    }

    // POST /cart/remove-item
    if (params.path === '/cart/remove-item') {
      const lineId = String(params.body?.key || '');
      if (!lineId) {
        return {
          cart: await normalizeMedusaCart(activeCart),
          cartToken: activeCart.id,
          nonce: 'medusa-v2',
          status: 400,
          error: 'Missing cart item key.',
        };
      }

      const delRes = await fetch(
        `${medusaBackendUrl}/store/carts/${encodeURIComponent(activeCart.id)}/line-items/${encodeURIComponent(lineId)}`,
        {
          method: 'DELETE',
          headers: buildHeaders(medusaPublishableKey),
          cache: 'no-store',
        }
      );

      // Medusa DELETE line-item returns { id, object, deleted, parent: cart } or updated cart
      let nextCart: MedusaCart | null = null;
      try {
        const delData = (await delRes.json()) as {
          parent?: MedusaCart;
          cart?: MedusaCart;
          message?: string;
        };
        nextCart = delData.parent || delData.cart || null;
        if (!delRes.ok) {
          return {
            cart: await normalizeMedusaCart(activeCart),
            cartToken: activeCart.id,
            nonce: 'medusa-v2',
            status: delRes.status,
            error: delData.message || 'Unable to remove item from bag.',
          };
        }
      } catch {
        // Re-fetch cart below
      }

      if (!nextCart) {
        nextCart = await fetchMedusaCart(
          medusaBackendUrl,
          medusaPublishableKey,
          activeCart.id
        );
      }

      return {
        cart: await normalizeMedusaCart(nextCart ?? activeCart),
        cartToken: activeCart.id,
        nonce: 'medusa-v2',
        status: 200,
        error: null,
      };
    }

    return {
      cart: await normalizeMedusaCart(activeCart),
      cartToken: activeCart.id,
      nonce: 'medusa-v2',
      status: 400,
      error: `Unsupported cart action: ${params.path}`,
    };
  } catch (err) {
    return {
      cart: null,
      cartToken: params.cartToken ?? null,
      nonce: null,
      status: 502,
      error:
        err instanceof Error
          ? err.message
          : 'Unable to reach MedusaJS Store API.',
    };
  }
}
