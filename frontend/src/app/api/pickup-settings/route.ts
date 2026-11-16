import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function GET() {
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();
  if (!medusaBackendUrl) {
    // Graceful fallback defaults if Medusa is temporarily unreachable
    return NextResponse.json({
      enableSrinagarPickup: true,
      enableBengaluruPickup: true,
      srinagarLocationName: 'Srinagar Studio, Kashmir',
      bengaluruLocationName: 'Bengaluru Studio, Karnataka',
    });
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (medusaPublishableKey) {
      headers['x-publishable-api-key'] = medusaPublishableKey;
    }

    const res = await fetch(`${medusaBackendUrl}/store/pickup-settings`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Medusa responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn('[Pickup Settings API] Error fetching from backend, falling back:', err);
    return NextResponse.json({
      enableSrinagarPickup: true,
      enableBengaluruPickup: true,
      srinagarLocationName: 'Srinagar Studio, Kashmir',
      bengaluruLocationName: 'Bengaluru Studio, Karnataka',
    });
  }
}
