import { NextRequest, NextResponse } from 'next/server';
import { proxyStoreCart } from '@/lib/wc-store-server';

interface UpdateItemBody {
  key?: unknown;
  quantity?: unknown;
}

export async function POST(req: NextRequest) {
  const cartToken = req.headers.get('x-cart-token');
  const nonce = req.headers.get('x-wc-nonce');

  let parsed: UpdateItemBody;
  try {
    parsed = (await req.json()) as UpdateItemBody;
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

  if (typeof parsed.quantity !== 'number' || !Number.isInteger(parsed.quantity) || parsed.quantity < 0) {
    return NextResponse.json(
      { cart: null, cartToken, nonce, error: 'A valid non-negative quantity is required.' },
      { status: 400 }
    );
  }

  const result = await proxyStoreCart({
    path: '/cart/update-item',
    method: 'POST',
    cartToken,
    nonce,
    body: {
      key: parsed.key,
      quantity: parsed.quantity,
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

