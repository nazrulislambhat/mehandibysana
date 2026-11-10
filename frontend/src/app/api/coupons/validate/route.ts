import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

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
  const sp = request.nextUrl.searchParams;
  return proxyValidate({
    code: String(sp.get('code') || '').trim(),
    subtotal: Math.max(0, Number(sp.get('subtotal')) || 0),
    shippingFee: Math.max(0, Number(sp.get('shippingFee')) || 0),
  });
}

