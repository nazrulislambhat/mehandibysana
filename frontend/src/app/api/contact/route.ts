import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import {
  renderStudioFallbackEmailHtml,
  sendFrontendFallbackEmail,
} from '@/lib/studio-mailer';

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

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
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
  let backendHandled = false;

  if (medusaBackendUrl) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (medusaPublishableKey) {
        headers['x-publishable-api-key'] = medusaPublishableKey;
      }

      const res = await fetch(`${medusaBackendUrl}/store/bridal-bookings`, {
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
      backendHandled = res.ok;
      if (!res.ok) {
        console.warn('[Contact API] Medusa booking returned status:', res.status);
      }
    } catch (err) {
      console.warn('[Contact API] Could not sync booking to Medusa:', err);
    }
  }

  // Fallback direct SMTP / Resend / Brevo email dispatch if Medusa backend did not handle it
  if (!backendHandled) {
    const adminEmail =
      process.env.STUDIO_ADMIN_EMAIL?.trim() || 'sana@mehandibysana.com';
    const customerSummary = `We have received your ${service} inquiry${
      eventDate ? ` for ${eventDate}` : ''
    }. Sana and our Srinagar & Bangalore studio coordinator will review availability within 24 hours.`;

    await Promise.allSettled([
      sendFrontendFallbackEmail({
        to: email,
        subject: `Booking Inquiry Received (${referenceId}) — Mehandi by Sana`,
        text: `Assalamu Alaikum / Hello ${name},\n\n${customerSummary}\n\nReference: ${referenceId}`,
        html: renderStudioFallbackEmailHtml({
          eyebrow: 'Booking Inquiry Received',
          heading: `Inquiry Received (${referenceId})`,
          paragraphs: [
            `Assalamu Alaikum / Hello ${name},`,
            customerSummary,
            `Your Notes: ${message}`,
          ],
          referenceId,
        }),
      }),
      sendFrontendFallbackEmail({
        to: adminEmail,
        replyTo: email,
        subject: `[Studio Alert] New ${service} inquiry (${referenceId}) — ${name}`,
        text: `Client: ${name}\nEmail: ${email}\nPhone: ${phone || '—'}\nService: ${service}\nDate: ${
          eventDate || '—'
        }\nLocation: ${location || '—'}\n\n${message}`,
        html: renderStudioFallbackEmailHtml({
          eyebrow: 'Studio Operations Alert',
          heading: `New Inquiry from ${name}`,
          paragraphs: [
            `Client: ${name} (${email}${phone ? ` · ${phone}` : ''})`,
            `Service: ${service}${eventDate ? ` · Date: ${eventDate}` : ''}${
              location ? ` · Location: ${location}` : ''
            }`,
            message,
          ],
          referenceId,
        }),
      }),
    ]);
  }

  return NextResponse.json({
    ok: true,
    referenceId,
  });
}
