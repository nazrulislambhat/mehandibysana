import { NextRequest, NextResponse } from 'next/server';
import { proxyStoreCart } from '@/lib/wc-store-server';

export async function GET(req: NextRequest) {
  const cartToken = req.headers.get('x-cart-token');
  const nonce = req.headers.get('x-wc-nonce');

  const result = await proxyStoreCart({
    path: '/cart',
    method: 'GET',
    cartToken,
    nonce,
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

