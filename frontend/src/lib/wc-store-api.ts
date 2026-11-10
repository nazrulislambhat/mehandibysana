import type { StorefrontCart } from '@/types/storefront';

export interface CartApiResponse {
  cart: StorefrontCart | null;
  cartToken: string | null;
  nonce: string | null;
  error: string | null;
}

async function callCartEndpoint(
  endpoint: string,
  options: {
    method: 'GET' | 'POST';
    cartToken: string | null;
    nonce: string | null;
    body?: Record<string, unknown>;
  }
): Promise<CartApiResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.cartToken) headers['X-Cart-Token'] = options.cartToken;
  if (options.nonce) headers['X-WC-Nonce'] = options.nonce;

  const response = await fetch(endpoint, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  const payload = (await response.json()) as CartApiResponse;
  if (!response.ok) {
    return {
      cart: payload.cart ?? null,
      cartToken: payload.cartToken ?? options.cartToken,
      nonce: payload.nonce ?? options.nonce,
      error: payload.error || `Cart request failed (${response.status})`,
    };
  }

  return payload;
}

export const wcStoreClient = {
  getCart(cartToken: string | null, nonce: string | null): Promise<CartApiResponse> {
    return callCartEndpoint('/api/cart', {
      method: 'GET',
      cartToken,
      nonce,
    });
  },

  addItem(
    params: {
      id: number;
      medusaVariantId?: string;
      quantity: number;
      variation?: Array<{ attribute: string; value: string }>;
    },
    cartToken: string | null,
    nonce: string | null
  ): Promise<CartApiResponse> {
    return callCartEndpoint('/api/cart/add-item', {
      method: 'POST',
      cartToken,
      nonce,
      body: params,
    });
  },

  updateItem(
    params: { key: string; quantity: number },
    cartToken: string | null,
    nonce: string | null
  ): Promise<CartApiResponse> {
    return callCartEndpoint('/api/cart/update-item', {
      method: 'POST',
      cartToken,
      nonce,
      body: params,
    });
  },

  removeItem(
    params: { key: string },
    cartToken: string | null,
    nonce: string | null
  ): Promise<CartApiResponse> {
    return callCartEndpoint('/api/cart/remove-item', {
      method: 'POST',
      cartToken,
      nonce,
      body: params,
    });
  },
};

