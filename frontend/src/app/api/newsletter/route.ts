import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import {
  renderStudioFallbackEmailHtml,
  sendFrontendFallbackEmail,
} from '@/lib/studio-mailer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  let body: {
    email?: unknown;
    firstName?: unknown;
    source?: unknown;
    companyWebsite?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request payload.' },
      { status: 400 }
    );
  }

  if (typeof body.companyWebsite === 'string' && body.companyWebsite.trim().length > 0) {
    return NextResponse.json({ ok: true, alreadySubscribed: false });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
  const source = typeof body.source === 'string' ? body.source.trim() : 'footer';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

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

      const res = await fetch(`${medusaBackendUrl}/store/newsletter`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, firstName, source }),
        cache: 'no-store',
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        alreadySubscribed?: boolean;
        emailSent?: boolean;
        message?: string;
      };

      if (res.ok && data.success) {
        return NextResponse.json({
          ok: true,
          alreadySubscribed: Boolean(data.alreadySubscribed),
          emailSent: Boolean(data.emailSent),
        });
      }
    } catch (err) {
      console.warn('[Newsletter API] Backend sync skipped:', err);
    }
  }

  // Fallback direct welcome email when Next.js mail credentials are configured directly
  const fallback = await sendFrontendFallbackEmail({
    to: email,
    subject: 'Welcome to the Mehandi by Sana Dispatch List — Srinagar & Bengaluru',
    text: 'Thank you for joining the Mehandi by Sana Dispatch List (Srinagar & Bengaluru). We will notify you when fresh small-batch organic Sojat henna cones and bridal slots open.',
    html: renderStudioFallbackEmailHtml({
      eyebrow: 'Fresh Batch Dispatch List',
      heading: 'You are on the Dispatch List',
      paragraphs: [
        'Assalamu Alaikum / Hello,',
        'Thank you for joining the Mehandi by Sana Dispatch List across Srinagar and Bengaluru. You will receive early alerts whenever fresh small-batch organic henna cones are rolled and when seasonal Eid or bridal booking windows open.',
      ],
      ctaLabel: 'Explore the Apothecary',
      ctaUrl: `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://mehandibysana.com').replace(/\/+$/, '')}/shop`,
    }),
  });

  return NextResponse.json({
    ok: true,
    alreadySubscribed: false,
    emailSent: fallback.sent,
  });
}

