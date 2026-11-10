import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) {
    return NextResponse.json(
      { found: false, message: 'MEDUSA_BACKEND_URL is not configured.' },
      { status: 503 }
    );
  }

  const orderNumber = request.nextUrl.searchParams.get('orderNumber') || '';
  const email = request.nextUrl.searchParams.get('email') || '';

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (medusaPublishableKey) {
      headers['x-publishable-api-key'] = medusaPublishableKey;
    }

    const res = await fetch(
      `${medusaBackendUrl}/store/track-order?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`,
      {
        headers,
        cache: 'no-store',
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        found: false,
        message:
          err instanceof Error
            ? err.message
            : 'Unable to reach MedusaJS order tracking service.',
      },
      { status: 502 }
    );
  }
}

