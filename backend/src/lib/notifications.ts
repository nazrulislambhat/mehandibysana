import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import {
  ensureStudioEmailSettingsLoaded,
  getEffectiveEmailSettings,
  type StudioEmailSettingsRecord,
} from "./email-settings";

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
  storefrontUrl: string;
  autoSendOrderConfirmation: boolean;
  autoSendShippingEmail: boolean;
}

function resolveProviderFromSettings(
  settings: StudioEmailSettingsRecord
): EmailProviderType {
  const hasResend = Boolean(settings.resendApiKey?.trim());
  const hasBrevo = Boolean(settings.brevoApiKey?.trim());
  const hasSmtp = Boolean(
    settings.smtpHost?.trim() &&
      settings.smtpUser?.trim() &&
      settings.smtpPass?.trim()
  );

  if (settings.preferredProvider === "resend" && hasResend) return "resend";
  if (settings.preferredProvider === "brevo" && hasBrevo) return "brevo";
  if (settings.preferredProvider === "smtp" && hasSmtp) return "smtp";

  if (hasResend) return "resend";
  if (hasBrevo) return "brevo";
  if (hasSmtp) return "smtp";
  return "log-only";
}

export function getEmailProviderStatus(): EmailProviderStatus {
  const settings = getEffectiveEmailSettings();
  const provider = resolveProviderFromSettings(settings);
  return {
    configured: provider !== "log-only",
    provider,
    fromEmail: settings.fromEmail,
    adminEmail: settings.adminEmail,
    storefrontUrl: settings.storefrontUrl,
    autoSendOrderConfirmation: settings.autoSendOrderConfirmation,
    autoSendShippingEmail: settings.autoSendShippingEmail,
  };
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
  detailsHtml?: string;
  referenceId?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  storefrontUrl?: string;
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

  const detailsBlockHtml = params.detailsHtml ? `<div style="margin:20px 0;">${params.detailsHtml}</div>` : "";

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

  const displaySiteUrl = (params.storefrontUrl || "https://mehandibysana.com").replace(/\/+$/, "");

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px 12px;background-color:#f9f8f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111111;">
    <div style="max-width:620px;margin:0 auto;border:1px solid #e5e5e5;border-top:3px solid #d9541e;border-radius:10px;background-color:#ffffff;padding:32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-bottom:20px;border-bottom:1px solid #e5e5e5;padding-bottom:16px;">
        <tr>
          <td style="width:52px;vertical-align:middle;">
            <img src="${escapeHtml(displaySiteUrl)}/icons/icon-96x96.png" alt="Mehandi by Sana emblem" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:10px;border:0;" />
          </td>
          <td style="vertical-align:middle;padding-left:12px;">
            <span style="display:block;font-family:Georgia,serif;font-size:20px;font-weight:500;color:#111111;line-height:1.15;">Mehandi by Sana</span>
            <span style="display:block;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#d9541e;margin-top:3px;">Srinagar &amp; Bangalore &middot; 0% PPD Organic Henna</span>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#d9541e;">
        ${escapeHtml(params.eyebrow)}
      </p>
      <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;font-weight:500;line-height:1.25;color:#111111;">
        ${escapeHtml(params.heading)}
      </h1>
      ${paragraphsHtml}
      ${detailsBlockHtml}
      ${ctaHtml}
      ${refHtml}
      <p style="margin:22px 0 0;font-size:12px;line-height:1.65;color:#525252;">
        Mehandi by Sana Studios &middot; Srinagar (Baghat Barzullah, J&amp;K 190005) &amp; Bangalore (Karnataka)<br/>
        <a href="${escapeHtml(displaySiteUrl)}" style="color:#d9541e;text-decoration:underline;">${escapeHtml(displaySiteUrl.replace(/^https?:\/\//, ""))}</a>
        &middot; sana@mehandibysana.com &middot; +91-9149648717<br/>
        <a href="${escapeHtml(displaySiteUrl)}/track-order" style="color:#525252;text-decoration:underline;">Track Order</a>
        &middot; <a href="${escapeHtml(displaySiteUrl)}/henna-care" style="color:#525252;text-decoration:underline;">Henna Storage &amp; Stain Care</a>
        &middot; <a href="${escapeHtml(displaySiteUrl)}/refund-policy" style="color:#525252;text-decoration:underline;">Refund Policy</a>
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
  scope?: { resolve: (key: string) => any };
}

export interface SendEmailResult {
  sent: boolean;
  provider: EmailProviderType;
  messageId?: string;
  error?: string;
}

export async function sendStudioEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const settings = await ensureStudioEmailSettingsLoaded(input.scope);
  const provider = resolveProviderFromSettings(settings);
  const recipients = (Array.isArray(input.to) ? input.to : [input.to])
    .map((e) => e.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { sent: false, provider, error: "No valid recipient email." };
  }

  const replyTo = input.replyTo || settings.adminEmail || "sana@mehandibysana.com";

  if (provider === "resend") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: settings.fromEmail,
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

  if (provider === "brevo") {
    try {
      const parsedFrom = parseFromHeader(settings.fromEmail);
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": settings.brevoApiKey,
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

  if (provider === "smtp") {
    try {
      const port = Number(settings.smtpPort || 465);
      const secure =
        settings.smtpSecure !== undefined ? Boolean(settings.smtpSecure) : port === 465;

      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port,
        secure,
        requireTLS: !secure && port === 587,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: settings.smtpUser,
          pass: settings.smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: settings.fromEmail,
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

  return {
    sent: false,
    provider: "log-only",
    error:
      "No email provider configured. Configure SMTP, Resend, or Brevo in Medusa Admin -> Email Campaigns or backend env.",
  };
}

export interface NotificationEvent {
  type:
    | "order_confirmed"
    | "order_preparing"
    | "order_dispatched"
    | "order_delivered"
    | "order_completed"
    | "order_payment_offline"
    | "bridal_booking_received"
    | "bridal_booking_confirmed"
    | "newsletter_subscribed";
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  referenceId: string;
  summary: string;
  detailsHtml?: string;
  details?: Record<string, unknown>;
  ctaLabel?: string;
  ctaUrl?: string;
  skipAdminAlert?: boolean;
  scope?: { resolve: (key: string) => any };
}

export interface DispatchNotificationResult {
  customerEmailSent: boolean;
  provider: EmailProviderType;
  messageId?: string;
  error?: string;
}

export async function dispatchStudioNotification(
  event: NotificationEvent
): Promise<DispatchNotificationResult> {
  const settings = await ensureStudioEmailSettingsLoaded(event.scope);
  const timestamp = new Date().toISOString();
  const { scope: _scope, detailsHtml: _detailsHtml, ...auditEvent } = event;
  appendAudit({ kind: "event", ...auditEvent });

  const siteUrl = settings.storefrontUrl || "https://mehandibysana.com";

  const subjectMap: Record<NotificationEvent["type"], string> = {
    order_confirmed: `Order Confirmed (${event.referenceId}) — Mehandi by Sana`,
    order_preparing: `Order Preparing (${event.referenceId}) — Mehandi by Sana`,
    order_dispatched: `Order Shipped (${event.referenceId}) — Mehandi by Sana`,
    order_delivered: `Order Delivered (${event.referenceId}) — Mehandi by Sana`,
    order_completed: `Order Completed (${event.referenceId}) — Mehandi by Sana`,
    order_payment_offline: `Payment Received (${event.referenceId}) — Mehandi by Sana`,
    bridal_booking_received: `Booking Inquiry Received (${event.referenceId}) — Mehandi by Sana`,
    bridal_booking_confirmed: `Bridal Session Confirmed (${event.referenceId}) — Mehandi by Sana`,
    newsletter_subscribed: `Welcome to the Mehandi by Sana Dispatch List`,
  };

  const eyebrowMap: Record<NotificationEvent["type"], string> = {
    order_confirmed: "Order Confirmation",
    order_preparing: "Small-Batch Preparation",
    order_dispatched: "Parcel Dispatched",
    order_delivered: "Order Delivered",
    order_completed: "Order Completed",
    order_payment_offline: "Payment Confirmed",
    bridal_booking_received: "Booking Inquiry Received",
    bridal_booking_confirmed: "Appointment Confirmed",
    newsletter_subscribed: "Fresh Batch Dispatch List",
  };

  const isOrderEvent = event.type.startsWith("order_");
  const trackUrl =
    event.ctaUrl?.trim() ||
    (isOrderEvent
      ? `${siteUrl}/track-order?order=${encodeURIComponent(
          event.referenceId
        )}&email=${encodeURIComponent(event.recipientEmail)}`
      : event.type === "newsletter_subscribed"
        ? `${siteUrl}/shop`
        : `${siteUrl}/contact`);

  const ctaLabel =
    event.ctaLabel?.trim() ||
    (isOrderEvent
      ? "Track Your Order"
      : event.type === "newsletter_subscribed"
        ? "Browse Fresh Cones"
        : "Visit Studio Contact");

  const plainText = `Assalamu Alaikum / Hello ${event.recipientName},\n\n${event.summary}\n\nReference: ${event.referenceId}\n${
    isOrderEvent ? `Track your order anytime: ${trackUrl}\n` : ""
  }\nWarm regards,\nMehandi by Sana Studios · Srinagar & Bangalore\n${siteUrl}`;

  const html = renderBrandedStudioEmailHtml({
    eyebrow: eyebrowMap[event.type],
    heading: subjectMap[event.type].replace(" — Mehandi by Sana", ""),
    bodyParagraphs: [
      `Assalamu Alaikum / Hello ${event.recipientName},`,
      ...event.summary.split(/\n{2,}/),
    ],
    detailsHtml: event.detailsHtml,
    referenceId: event.referenceId,
    ctaLabel,
    ctaUrl: trackUrl,
    storefrontUrl: siteUrl,
  });

  let custRes: SendEmailResult = {
    sent: false,
    provider: resolveProviderFromSettings(settings),
    error: "No recipient email.",
  };

  if (event.recipientEmail) {
    custRes = await sendStudioEmail({
      to: event.recipientEmail,
      subject: subjectMap[event.type],
      text: plainText,
      html,
      scope: event.scope,
    });
    appendAudit({
      kind: "customer_email",
      type: event.type,
      referenceId: event.referenceId,
      to: event.recipientEmail,
      ...custRes,
    });
  }

  // Optional Studio Admin Copy (configured in Email Settings or STUDIO_ADMIN_EMAIL env)
  const adminEmail = settings.adminEmail?.trim();
  if (
    !event.skipAdminAlert &&
    adminEmail &&
    adminEmail.toLowerCase() !== event.recipientEmail.toLowerCase()
  ) {
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
        detailsHtml: event.detailsHtml,
        referenceId: event.referenceId,
        storefrontUrl: siteUrl,
      }),
      scope: event.scope,
    });
    appendAudit({
      kind: "admin_alert_email",
      type: event.type,
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
          ...auditEvent,
        }),
      });
    } catch (waErr) {
      console.warn("[Notifications] WhatsApp webhook dispatch failed:", waErr);
    }
  }

  return {
    customerEmailSent: custRes.sent,
    provider: custRes.provider,
    messageId: custRes.messageId,
    error: custRes.error,
  };
}

export async function sendBulkCampaignBatch(params: {
  recipients: Array<{ email: string; firstName?: string }>;
  subject: string;
  bodyText: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  scope?: { resolve: (key: string) => any };
}): Promise<{
  provider: EmailProviderType;
  attempted: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  await ensureStudioEmailSettingsLoaded(params.scope);
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
            "No email provider configured. Add RESEND_API_KEY, BREVO_API_KEY, or SMTP credentials in backend env or Medusa Admin -> Email Campaigns.",
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
    }Warm regards,\nMehandi by Sana Studios · Srinagar & Bangalore\n${status.storefrontUrl}\n\nTo opt out of studio updates, simply reply "Unsubscribe" to sana@mehandibysana.com.`;

    const html = renderBrandedStudioEmailHtml({
      eyebrow: params.eyebrow || "Mehandi by Sana · Studio Update",
      heading: params.subject,
      bodyParagraphs: [greeting, ...params.bodyText.split(/\n{2,}/)],
      ctaLabel: params.ctaLabel,
      ctaUrl: params.ctaUrl,
      storefrontUrl: status.storefrontUrl,
      footerNote:
        'You received this because you shopped or booked with Mehandi by Sana. Reply "Unsubscribe" to opt out.',
    });

    const result = await sendStudioEmail({
      to: r.email,
      subject: params.subject,
      text,
      html,
      scope: params.scope,
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
