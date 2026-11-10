import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) {
    return NextResponse.json(
      { success: false, message: 'MEDUSA_BACKEND_URL is not configured.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (medusaPublishableKey) {
      headers['x-publishable-api-key'] = medusaPublishableKey;
    }

    const res = await fetch(`${medusaBackendUrl}/store/place-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : 'Unable to submit order to MedusaJS.',
      },
      { status: 502 }
    );
  }
}

