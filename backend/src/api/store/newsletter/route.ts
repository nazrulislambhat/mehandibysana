import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { upsertNewsletterSubscriber } from "../../../lib/newsletter-subscribers";
import { dispatchStudioNotification } from "../../../lib/notifications";
import { sendTelegramMessage, escapeTelegramHtml } from "../../../lib/telegram";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as {
      email?: unknown;
      firstName?: unknown;
      source?: unknown;
      companyWebsite?: unknown;
    };

    if (typeof body.companyWebsite === "string" && body.companyWebsite.trim().length > 0) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: false,
        emailSent: false,
      });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const firstName = String(body.firstName || "").trim();
    const source = String(body.source || "footer").trim() || "footer";

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const { subscriber, alreadySubscribed } = await upsertNewsletterSubscriber(
      req.scope,
      { email, firstName, source }
    );

    let emailSent = false;
    let provider: string = "log-only";

    if (!alreadySubscribed) {
      const outcome = await dispatchStudioNotification({
        scope: req.scope,
        type: "newsletter_subscribed",
        recipientEmail: subscriber.email,
        recipientName: subscriber.firstName || "Friend",
        referenceId: "BATCH-LIST",
        skipAdminAlert: true,
        summary: [
          "Thank you for joining the Mehandi By Sana Dispatch List (Kashmir & Bengaluru).",
          "You will receive early notifications when fresh small-batch organic Sojat henna cones are freshly rolled, along with seasonal Eid & bridal booking dates.",
        ].join("\n\n"),
        details: {
          source: subscriber.source,
          subscribedAt: subscriber.subscribedAt,
        },
      });
      emailSent = outcome.customerEmailSent;
      provider = outcome.provider;

      void sendTelegramMessage(`
🌿 <b>NEW SUBSCRIBER — Mehandi By Sana</b>

A customer has joined the <b>Fresh Batch Dispatch List</b> from the website footer!

✉️ <b>Email:</b> ${escapeTelegramHtml(subscriber.email)}
🏷️ <b>Source:</b> ${escapeTelegramHtml(subscriber.source || "Website Footer")}
📅 <b>Date:</b> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}

Saved to PostgreSQL database &amp; synced with <b>Customer Emails &amp; Marketing &rarr; Fresh Batch Subscribers</b> for email campaigns.
      `.trim());
    }

    return res.status(alreadySubscribed ? 200 : 201).json({
      success: true,
      alreadySubscribed,
      emailSent,
      provider,
      subscriber: {
        email: subscriber.email,
        source: subscriber.source,
      },
    });
  } catch (err: any) {
    console.error("[Newsletter Subscribe Error]:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Could not complete newsletter subscription.",
    });
  }
}

