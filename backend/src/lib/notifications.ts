import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

const DATA_DIR =
  process.env.STUDIO_DATA_DIR?.trim() || path.resolve(process.cwd(), "../studio-data");
const NOTIFICATIONS_LOG = path.join(DATA_DIR, "notifications.log");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function appendAudit(entry: Record<string, unknown>) {
  ensureDataDir();
  try {
    fs.appendFileSync(
      NOTIFICATIONS_LOG,
      `${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`,
      "utf8"
    );
  } catch (err) {
    console.warn("[Notifications] Failed to append audit log:", err);
  }
}

export type EmailProviderType = "resend" | "brevo" | "smtp" | "log-only";

export interface EmailProviderStatus {
  configured: boolean;
  provider: EmailProviderType;
  fromEmail: string;
  adminEmail: string;
}

export function getEmailProviderStatus(): EmailProviderStatus {
  const fromEmail =
    process.env.STUDIO_FROM_EMAIL?.trim() || "Mehandi by Sana <orders@mehandibysana.com>";
  const adminEmail = process.env.STUDIO_ADMIN_EMAIL?.trim() || "";

  if (process.env.RESEND_API_KEY?.trim()) {
    return { configured: true, provider: "resend", fromEmail, adminEmail };
  }
  if (process.env.BREVO_API_KEY?.trim()) {
    return { configured: true, provider: "brevo", fromEmail, adminEmail };
  }
  if (
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  ) {
    return { configured: true, provider: "smtp", fromEmail, adminEmail };
  }
  return { configured: false, provider: "log-only", fromEmail, adminEmail };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseFromHeader(fromRaw: string): { name: string; email: string } {
  const match = fromRaw.match(/^\s*"?([^"<]+?)"?\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "Mehandi by Sana", email: fromRaw.trim() };
}

export function renderBrandedStudioEmailHtml(params: {
  eyebrow: string;
  heading: string;
  bodyParagraphs: string[];
  referenceId?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const paragraphsHtml = params.bodyParagraphs
    .filter((p) => p.trim().length > 0)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#111111;">${escapeHtml(
          p
        ).replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  const ctaHtml =
    params.ctaLabel && params.ctaUrl
      ? `<div style="margin:26px 0 8px;">
          <a href="${escapeHtml(params.ctaUrl)}" style="display:inline-block;background-color:#d9541e;color:#fceee3;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:6px;">
            ${escapeHtml(params.ctaLabel)}
          </a>
        </div>`
      : "";

  const refHtml = params.referenceId
    ? `<p style="margin:18px 0 0;padding-top:14px;border-top:1px solid #e5e5e5;font-family:monospace;font-size:12px;color:#525252;">Reference: ${escapeHtml(
        params.referenceId
      )}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111111;">
    <div style="max-width:600px;margin:0 auto;border:1px solid #e5e5e5;border-radius:10px;background-color:#ffffff;padding:32px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#d9541e;">
        ${escapeHtml(params.eyebrow)}
      </p>
      <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:28px;font-weight:500;line-height:1.2;color:#111111;">
        ${escapeHtml(params.heading)}
      </h1>
      ${paragraphsHtml}
      ${ctaHtml}
      ${refHtml}
      <p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#525252;">
        Mehandi by Sana Studio &middot; Baghat Barzullah, Srinagar, Jammu &amp; Kashmir<br/>
        <a href="https://mehandibysana.com" style="color:#d9541e;text-decoration:underline;">mehandibysana.com</a>
        &middot; sana@mehandibysana.com
        ${params.footerNote ? `<br/>${escapeHtml(params.footerNote)}` : ""}
      </p>
    </div>
  </body>
</html>`;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  sent: boolean;
  provider: EmailProviderType;
  messageId?: string;
  error?: string;
}

export async function sendStudioEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const status = getEmailProviderStatus();
  const recipients = (Array.isArray(input.to) ? input.to : [input.to])
    .map((e) => e.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { sent: false, provider: status.provider, error: "No valid recipient email." };
  }

  const replyTo = input.replyTo || status.adminEmail || "sana@mehandibysana.com";

  if (status.provider === "resend") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: status.fromEmail,
          to: recipients,
          reply_to: replyTo,
          subject: input.subject,
          text: input.text,
          ...(input.html ? { html: input.html } : {}),
        }),
      });
      const payload = (await res.json()) as { id?: string; message?: string; name?: string };
      if (!res.ok) {
        return {
          sent: false,
          provider: "resend",
          error: payload?.message || `Resend HTTP ${res.status}`,
        };
      }
      return { sent: true, provider: "resend", messageId: payload?.id };
    } catch (err: any) {
      return {
        sent: false,
        provider: "resend",
        error: err?.message || "Resend request failed.",
      };
    }
  }

  if (status.provider === "brevo") {
    try {
      const parsedFrom = parseFromHeader(status.fromEmail);
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY!.trim(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: parsedFrom,
          to: recipients.map((email) => ({ email })),
          replyTo: { email: replyTo },
          subject: input.subject,
          textContent: input.text,
          ...(input.html ? { htmlContent: input.html } : {}),
        }),
      });
      const payload = (await res.json()) as { messageId?: string; message?: string };
      if (!res.ok) {
        return {
          sent: false,
          provider: "brevo",
          error: payload?.message || `Brevo HTTP ${res.status}`,
        };
      }
      return { sent: true, provider: "brevo", messageId: payload?.messageId };
    } catch (err: any) {
      return {
        sent: false,
        provider: "brevo",
        error: err?.message || "Brevo request failed.",
      };
    }
  }

  if (status.provider === "smtp") {
    try {
      const port = Number(process.env.SMTP_PORT || 465);
      const secure =
        process.env.SMTP_SECURE !== undefined
          ? process.env.SMTP_SECURE === "true"
          : port === 465;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST!.trim(),
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER!.trim(),
          pass: process.env.SMTP_PASS!.trim(),
        },
      });

      const info = await transporter.sendMail({
        from: status.fromEmail,
        to: recipients.join(", "),
        replyTo,
        subject: input.subject,
        text: input.text,
        html: input.html,
      });

      return { sent: true, provider: "smtp", messageId: info.messageId };
    } catch (err: any) {
      return {
        sent: false,
        provider: "smtp",
        error: err?.message || "SMTP delivery failed.",
      };
    }
  }

  return { sent: false, provider: "log-only" };
}

export interface NotificationEvent {
  type: "order_confirmed" | "bridal_booking_received" | "bridal_booking_confirmed";
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  referenceId: string;
  summary: string;
  details?: Record<string, unknown>;
}

export async function dispatchStudioNotification(
  event: NotificationEvent
): Promise<void> {
  const timestamp = new Date().toISOString();
  appendAudit({ kind: "event", ...event });

  const siteUrl = (
    process.env.STORE_SITE_URL?.trim() || "https://mehandibysana.com"
  ).replace(/\/+$/, "");

  const subjectMap: Record<NotificationEvent["type"], string> = {
    order_confirmed: `Order Confirmed (${event.referenceId}) — Mehandi by Sana`,
    bridal_booking_received: `Booking Inquiry Received (${event.referenceId}) — Mehandi by Sana`,
    bridal_booking_confirmed: `Bridal Session Confirmed (${event.referenceId}) — Mehandi by Sana`,
  };

  const eyebrowMap: Record<NotificationEvent["type"], string> = {
    order_confirmed: "Order Confirmation",
    bridal_booking_received: "Booking Inquiry Received",
    bridal_booking_confirmed: "Appointment Confirmed",
  };

  const trackUrl =
    event.type === "order_confirmed"
      ? `${siteUrl}/track-order?order=${encodeURIComponent(
          event.referenceId
        )}&email=${encodeURIComponent(event.recipientEmail)}`
      : `${siteUrl}/contact`;

  const ctaLabel =
    event.type === "order_confirmed" ? "Track Your Order" : "Visit Studio Contact";

  const plainText = `Assalamu Alaikum / Hello ${event.recipientName},\n\n${event.summary}\n\nReference: ${event.referenceId}\n${
    event.type === "order_confirmed" ? `Track your order anytime: ${trackUrl}\n` : ""
  }\nWarm regards,\nMehandi by Sana Studio · Baghat Barzullah, Srinagar\nhttps://mehandibysana.com`;

  const html = renderBrandedStudioEmailHtml({
    eyebrow: eyebrowMap[event.type],
    heading: subjectMap[event.type].replace(" — Mehandi by Sana", ""),
    bodyParagraphs: [
      `Assalamu Alaikum / Hello ${event.recipientName},`,
      event.summary,
    ],
    referenceId: event.referenceId,
    ctaLabel,
    ctaUrl: trackUrl,
  });

  if (event.recipientEmail) {
    const custRes = await sendStudioEmail({
      to: event.recipientEmail,
      subject: subjectMap[event.type],
      text: plainText,
      html,
    });
    appendAudit({
      kind: "customer_email",
      referenceId: event.referenceId,
      to: event.recipientEmail,
      ...custRes,
    });
  }

  // Optional Studio Admin Copy (set STUDIO_ADMIN_EMAIL in backend/.env)
  const adminEmail = process.env.STUDIO_ADMIN_EMAIL?.trim();
  if (adminEmail && adminEmail.toLowerCase() !== event.recipientEmail.toLowerCase()) {
    const adminSubject = `[Studio Alert] ${subjectMap[event.type]}`;
    const adminSummary = `Customer: ${event.recipientName} (${event.recipientEmail}${
      event.recipientPhone ? ` · ${event.recipientPhone}` : ""
    })\n\n${event.summary}`;
    const adminRes = await sendStudioEmail({
      to: adminEmail,
      subject: adminSubject,
      text: adminSummary,
      html: renderBrandedStudioEmailHtml({
        eyebrow: "Studio Operations Alert",
        heading: adminSubject,
        bodyParagraphs: [
          `Client: ${event.recipientName} (${event.recipientEmail}${
            event.recipientPhone ? ` · ${event.recipientPhone}` : ""
          })`,
          event.summary,
        ],
        referenceId: event.referenceId,
      }),
    });
    appendAudit({
      kind: "admin_alert_email",
      referenceId: event.referenceId,
      to: adminEmail,
      ...adminRes,
    });
  }

  // Optional WhatsApp / Automation Webhook
  const whatsappWebhook = process.env.WHATSAPP_WEBHOOK_URL?.trim();
  if (whatsappWebhook) {
    try {
      await fetch(whatsappWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp,
          ...event,
        }),
      });
    } catch (waErr) {
      console.warn("[Notifications] WhatsApp webhook dispatch failed:", waErr);
    }
  }
}

export async function sendBulkCampaignBatch(params: {
  recipients: Array<{ email: string; firstName?: string }>;
  subject: string;
  bodyText: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): Promise<{
  provider: EmailProviderType;
  attempted: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const status = getEmailProviderStatus();
  if (!status.configured) {
    return {
      provider: status.provider,
      attempted: 0,
      sent: 0,
      failed: params.recipients.length,
      errors: [
        {
          email: "provider",
          error:
            "No email provider configured. Add RESEND_API_KEY, BREVO_API_KEY, or SMTP_* credentials in backend env.",
        },
      ],
    };
  }

  let sent = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const r of params.recipients) {
    const greeting =
      r.firstName && r.firstName.toLowerCase() !== "customer"
        ? `Assalamu Alaikum / Hello ${r.firstName},`
        : "Assalamu Alaikum / Hello,";

    const text = `${greeting}\n\n${params.bodyText}\n\n${
      params.ctaLabel && params.ctaUrl ? `${params.ctaLabel}: ${params.ctaUrl}\n\n` : ""
    }Warm regards,\nMehandi by Sana Studio · Baghat Barzullah, Srinagar\nhttps://mehandibysana.com\n\nTo opt out of studio updates, simply reply "Unsubscribe" to sana@mehandibysana.com.`;

    const html = renderBrandedStudioEmailHtml({
      eyebrow: params.eyebrow || "Mehandi by Sana · Studio Update",
      heading: params.subject,
      bodyParagraphs: [greeting, ...params.bodyText.split(/\n{2,}/)],
      ctaLabel: params.ctaLabel,
      ctaUrl: params.ctaUrl,
      footerNote:
        'You received this because you shopped or booked with Mehandi by Sana. Reply "Unsubscribe" to opt out.',
    });

    const result = await sendStudioEmail({
      to: r.email,
      subject: params.subject,
      text,
      html,
    });

    if (result.sent) {
      sent += 1;
    } else {
      failed += 1;
      if (errors.length < 20) {
        errors.push({ email: r.email, error: result.error || "Failed" });
      }
    }

    // Light pacing to stay comfortably under Resend/SMTP rate limits
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  appendAudit({
    kind: "campaign_batch",
    subject: params.subject,
    provider: status.provider,
    attempted: params.recipients.length,
    sent,
    failed,
  });

  return {
    provider: status.provider,
    attempted: params.recipients.length,
    sent,
    failed,
    errors,
  };
}
