import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  service?: unknown;
  eventDate?: unknown;
  location?: unknown;
  message?: unknown;
  companyWebsite?: unknown;
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  // Silently accept honeypot triggers without forwarding
  if (typeof body.companyWebsite === 'string' && body.companyWebsite.trim().length > 0) {
    return NextResponse.json({
      ok: true,
      referenceId: 'MBS-RECEIVED',
    });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim() : 'bridal';
  const eventDate = typeof body.eventDate === 'string' ? body.eventDate.trim() : '';
  const location = typeof body.location === 'string' ? body.location.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Valid name and email address are required.' },
      { status: 400 }
    );
  }

  if (message.length < 10) {
    return NextResponse.json(
      { ok: false, error: 'Please include at least a brief note about your inquiry.' },
      { status: 400 }
    );
  }

  const referenceId = `INQ-${Date.now().toString(36).toUpperCase()}`;
  const { medusaBackendUrl, medusaPublishableKey } = getServerEnv();

  if (medusaBackendUrl) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (medusaPublishableKey) {
        headers['x-publishable-api-key'] = medusaPublishableKey;
      }

      await fetch(`${medusaBackendUrl}/store/bridal-bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          referenceId,
          name,
          email,
          phone,
          service,
          eventDate,
          location,
          message,
        }),
        cache: 'no-store',
      });
    } catch (err) {
      console.warn('[Contact API] Could not sync booking to Medusa:', err);
    }
  }

  return NextResponse.json({
    ok: true,
    referenceId,
  });
}
