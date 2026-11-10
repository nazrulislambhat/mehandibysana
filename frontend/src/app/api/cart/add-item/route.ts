import { NextRequest, NextResponse } from 'next/server';
import { proxyStoreCart } from '@/lib/wc-store-server';

interface AddItemBody {
  id?: unknown;
  medusaVariantId?: unknown;
  quantity?: unknown;
  variation?: unknown;
}

export async function POST(req: NextRequest) {
  const cartToken = req.headers.get('x-cart-token');
  const nonce = req.headers.get('x-wc-nonce');

  let parsed: AddItemBody;
  try {
    parsed = (await req.json()) as AddItemBody;
  } catch {
    return NextResponse.json(
      { cart: null, cartToken, nonce, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  if (typeof parsed.id !== 'number' || !Number.isInteger(parsed.id) || parsed.id <= 0) {
    return NextResponse.json(
      { cart: null, cartToken, nonce, error: 'A valid numeric product ID is required.' },
      { status: 400 }
    );
  }

  const quantity =
    typeof parsed.quantity === 'number' && Number.isInteger(parsed.quantity) && parsed.quantity > 0
      ? parsed.quantity
      : 1;

  const body: Record<string, unknown> = {
    id: parsed.id,
    quantity,
  };

  if (typeof parsed.medusaVariantId === 'string' && parsed.medusaVariantId.length > 0) {
    body.medusaVariantId = parsed.medusaVariantId;
  }

  if (Array.isArray(parsed.variation)) {
    body.variation = parsed.variation;
  }

  const result = await proxyStoreCart({
    path: '/cart/add-item',
    method: 'POST',
    cartToken,
    nonce,
    body,
  });

  return NextResponse.json(
    {
      cart: result.cart,
      cartToken: result.cartToken,
      nonce: result.nonce,
      error: result.error,
    },
    { status: result.status }
  );
}

