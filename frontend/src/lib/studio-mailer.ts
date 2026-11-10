import nodemailer from 'nodemailer';

export interface FrontendEmailInput {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export interface FrontendEmailResult {
  sent: boolean;
  provider: 'resend' | 'brevo' | 'smtp' | 'none';
  error?: string;
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderStudioFallbackEmailHtml(params: {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  referenceId?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://mehandibysana.com'
  ).replace(/\/+$/, '');

  const bodyHtml = params.paragraphs
    .filter((p) => p.trim().length > 0)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#111111;">${escapeHtml(
          p
        ).replace(/\n/g, '<br/>')}</p>`
    )
    .join('');

  const ctaHtml =
    params.ctaLabel && params.ctaUrl
      ? `<div style="margin:24px 0 8px;">
          <a href="${escapeHtml(params.ctaUrl)}" style="display:inline-block;background-color:#d9541e;color:#fceee3;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:9999px;">
            ${escapeHtml(params.ctaLabel)}
          </a>
        </div>`
      : '';

  const refHtml = params.referenceId
    ? `<p style="margin:18px 0 0;padding-top:14px;border-top:1px solid #e5e5e5;font-family:monospace;font-size:12px;color:#525252;">Reference: ${escapeHtml(
        params.referenceId
      )}</p>`
    : '';

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background-color:#f9f8f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111111;">
    <div style="max-width:620px;margin:0 auto;border:1px solid #e5e5e5;border-radius:12px;background-color:#ffffff;padding:32px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#d9541e;">
        ${escapeHtml(params.eyebrow)}
      </p>
      <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;font-weight:500;line-height:1.25;color:#111111;">
        ${escapeHtml(params.heading)}
      </h1>
      ${bodyHtml}
      ${ctaHtml}
      ${refHtml}
      <p style="margin:22px 0 0;font-size:12px;line-height:1.65;color:#525252;">
        Mehandi by Sana &middot; Srinagar (Baghat Barzullah, J&amp;K 190005) &amp; Bangalore (Karnataka)<br/>
        <a href="${escapeHtml(siteUrl)}" style="color:#d9541e;text-decoration:underline;">${escapeHtml(
          siteUrl.replace(/^https?:\/\//, '')
        )}</a>
        &middot; sana@mehandibysana.com &middot; +91-9149648717
      </p>
    </div>
  </body>
</html>`;
}

export async function sendFrontendFallbackEmail(
  input: FrontendEmailInput
): Promise<FrontendEmailResult> {
  const fromEmail =
    process.env.STUDIO_FROM_EMAIL?.trim() ||
    'Mehandi by Sana <orders@mehandibysana.com>';
  const replyTo =
    input.replyTo?.trim() ||
    process.env.STUDIO_ADMIN_EMAIL?.trim() ||
    'sana@mehandibysana.com';
  const recipients = (Array.isArray(input.to) ? input.to : [input.to])
    .map((e) => e.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { sent: false, provider: 'none', error: 'No recipient provided.' };
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: recipients,
          reply_to: replyTo,
          subject: input.subject,
          text: input.text,
          ...(input.html ? { html: input.html } : {}),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        return {
          sent: false,
          provider: 'resend',
          error: data.message || `Resend HTTP ${res.status}`,
        };
      }
      return { sent: true, provider: 'resend' };
    } catch (err) {
      return {
        sent: false,
        provider: 'resend',
        error: err instanceof Error ? err.message : 'Resend request failed.',
      };
    }
  }

  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  if (brevoApiKey) {
    try {
      const fromMatch = fromEmail.match(/^\s*"?([^"<]+?)"?\s*<([^>]+)>\s*$/);
      const sender = fromMatch
        ? { name: fromMatch[1].trim(), email: fromMatch[2].trim() }
        : { name: 'Mehandi by Sana', email: fromEmail };

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender,
          to: recipients.map((email) => ({ email })),
          replyTo: { email: replyTo },
          subject: input.subject,
          textContent: input.text,
          ...(input.html ? { htmlContent: input.html } : {}),
        }),
      });
      if (!res.ok) {
        return { sent: false, provider: 'brevo', error: `Brevo HTTP ${res.status}` };
      }
      return { sent: true, provider: 'brevo' };
    } catch (err) {
      return {
        sent: false,
        provider: 'brevo',
        error: err instanceof Error ? err.message : 'Brevo request failed.',
      };
    }
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const port = Number(process.env.SMTP_PORT || 465) || 465;
      const secure =
        process.env.SMTP_SECURE !== undefined
          ? process.env.SMTP_SECURE === 'true'
          : port === 465;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure,
        requireTLS: !secure && port === 587,
        connectionTimeout: 10000,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: fromEmail,
        to: recipients.join(', '),
        replyTo,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      return {
        sent: false,
        provider: 'smtp',
        error: err instanceof Error ? err.message : 'SMTP dispatch failed.',
      };
    }
  }

  return { sent: false, provider: 'none', error: 'No fallback email provider configured.' };
}

