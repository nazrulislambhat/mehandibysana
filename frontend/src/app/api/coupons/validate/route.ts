import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

async function proxyValidate(params: {
  code: string;
  subtotal: number;
  shippingFee: number;
}) {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) {
    return NextResponse.json(
      {
        valid: false,
        code: params.code,
        message: 'MEDUSA_BACKEND_URL is not configured.',
        discountAmount: 0,
      },
      { status: 503 }
    );
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (medusaPublishableKey) {
      headers['x-publishable-api-key'] = medusaPublishableKey;
    }

    const res = await fetch(`${medusaBackendUrl}/store/coupons/validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        valid: false,
        code: params.code,
        message:
          err instanceof Error
            ? err.message
            : 'Unable to validate coupon code right now.',
        discountAmount: 0,
      },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`coupon:${clientIp}`, { limit: 15, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        valid: false,
        code: '',
        message: 'Too many coupon validation attempts. Please wait a minute before trying again.',
        discountAmount: 0,
      },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as {
      code?: string;
      subtotal?: number;
      shippingFee?: number;
    };
    return await proxyValidate({
      code: String(body?.code || '').trim(),
      subtotal: Math.max(0, Number(body?.subtotal) || 0),
      shippingFee: Math.max(0, Number(body?.shippingFee) || 0),
    });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        code: '',
        message: 'Invalid coupon request payload.',
        discountAmount: 0,
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`coupon:${clientIp}`, { limit: 15, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        valid: false,
        code: '',
        message: 'Too many coupon validation attempts. Please wait a minute before trying again.',
        discountAmount: 0,
      },
      { status: 429 }
    );
  }

  const sp = request.nextUrl.searchParams;
  return proxyValidate({
    code: String(sp.get('code') || '').trim(),
    subtotal: Math.max(0, Number(sp.get('subtotal')) || 0),
    shippingFee: Math.max(0, Number(sp.get('shippingFee')) || 0),
  });
}

