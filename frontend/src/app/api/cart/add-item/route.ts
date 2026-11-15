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

  const numericId =
    typeof parsed.id === 'number' && Number.isInteger(parsed.id) && parsed.id > 0
      ? parsed.id
      : typeof parsed.id === 'string' && /^\d+$/.test(parsed.id)
        ? parseInt(parsed.id, 10)
        : null;

  const hasValidMedusaVariantId =
    typeof parsed.medusaVariantId === 'string' && parsed.medusaVariantId.length > 0;

  if (numericId === null && !hasValidMedusaVariantId) {
    return NextResponse.json(
      { cart: null, cartToken, nonce, error: 'A valid product ID or variant ID is required.' },
      { status: 400 }
    );
  }

  const quantity =
    typeof parsed.quantity === 'number' && Number.isInteger(parsed.quantity) && parsed.quantity > 0
      ? parsed.quantity
      : typeof parsed.quantity === 'string' && /^\d+$/.test(parsed.quantity) && parseInt(parsed.quantity, 10) > 0
        ? parseInt(parsed.quantity, 10)
        : 1;

  const body: Record<string, unknown> = {
    quantity,
  };

  if (numericId !== null) {
    body.id = numericId;
  }

  if (hasValidMedusaVariantId) {
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

