import { NextRequest, NextResponse } from 'next/server';
import { proxyStoreCart } from '@/lib/wc-store-server';

interface RemoveItemBody {
  key?: unknown;
}

export async function POST(req: NextRequest) {
  const cartToken = req.headers.get('x-cart-token');
  const nonce = req.headers.get('x-wc-nonce');

  let parsed: RemoveItemBody;
  try {
    parsed = (await req.json()) as RemoveItemBody;
  } catch {
    return NextResponse.json(
      { cart: null, cartToken, nonce, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  if (typeof parsed.key !== 'string' || !parsed.key.trim()) {
    return NextResponse.json(
      { cart: null, cartToken, nonce, error: 'A valid cart item key is required.' },
      { status: 400 }
    );
  }

  const result = await proxyStoreCart({
    path: '/cart/remove-item',
    method: 'POST',
    cartToken,
    nonce,
    body: {
      key: parsed.key,
    },
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

