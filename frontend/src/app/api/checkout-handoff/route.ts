import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function GET(req: NextRequest) {
  const { wpBaseUrl } = getServerEnv();
  const tokenFromQuery = req.nextUrl.searchParams.get('cart_token');
  const tokenFromHeader = req.headers.get('x-cart-token');
  const cartToken = tokenFromQuery || tokenFromHeader;

  if (!wpBaseUrl) {
    return NextResponse.json(
      {
        isConfigured: false,
        checkoutUrl: null,
        error: 'Staging WordPress URL (WP_BASE_URL) is not configured.',
      },
      { status: 503 }
    );
  }

  try {
    const target = new URL('/checkout/', wpBaseUrl);
    if (cartToken) {
      target.searchParams.set('cart_token', cartToken);
    }

    return NextResponse.json({
      isConfigured: true,
      checkoutUrl: target.toString(),
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        isConfigured: false,
        checkoutUrl: null,
        error: 'Configured WP_BASE_URL is invalid.',
      },
      { status: 500 }
    );
  }
}

