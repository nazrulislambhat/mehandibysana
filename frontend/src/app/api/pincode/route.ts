import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

function buildHeaders(publishableKey: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (publishableKey) {
    headers['x-publishable-api-key'] = publishableKey;
  }
  return headers;
}

export async function GET(request: NextRequest) {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) {
    return NextResponse.json(
      { error: 'MEDUSA_BACKEND_URL is not configured.' },
      { status: 503 }
    );
  }

  const pincode = request.nextUrl.searchParams.get('pincode');
  const subtotal = request.nextUrl.searchParams.get('subtotal') || '0';

  try {
    if (pincode !== null) {
      const res = await fetch(
        `${medusaBackendUrl}/store/pincode-check?pincode=${encodeURIComponent(pincode)}&subtotal=${encodeURIComponent(subtotal)}`,
        {
          headers: buildHeaders(medusaPublishableKey),
          cache: 'no-store',
        }
      );
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const res = await fetch(`${medusaBackendUrl}/store/pincode-rules`, {
      headers: buildHeaders(medusaPublishableKey),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Unable to reach Medusa pincode service.',
      },
      { status: 502 }
    );
  }
}
