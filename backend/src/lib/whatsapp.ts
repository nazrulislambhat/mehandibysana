import path from "node:path";
import fs from "node:fs";

const DATA_DIR =
  process.env.STUDIO_DATA_DIR?.trim() || path.resolve(process.cwd(), "../studio-data");
const WHATSAPP_LOG = path.join(DATA_DIR, "whatsapp.log");

function appendWhatsAppLog(entry: Record<string, unknown>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(
      WHATSAPP_LOG,
      `${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`,
      "utf8"
    );
  } catch (err) {
    console.warn("[WhatsApp] Failed to write log:", err);
  }
}

export interface WhatsAppConfig {
  configured: boolean;
  apiKey?: string;
  phone: string;
  provider: "callmebot" | "webhook" | "none";
  webhookUrl?: string;
}

export function getWhatsAppConfig(): WhatsAppConfig {
  const apiKey =
    process.env.CALLMEBOT_API_KEY?.trim() ||
    process.env.WHATSAPP_API_KEY?.trim() ||
    process.env.CALLMEBOT_KEY?.trim();
  const rawPhone = process.env.WHATSAPP_PHONE?.trim() || "9149648717";
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL?.trim();

  // Normalize phone to e.g. 919149648717 (with 91 India country code)
  let cleanPhone = rawPhone.replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const configured = Boolean(apiKey || webhookUrl);
  const provider = apiKey ? "callmebot" : webhookUrl ? "webhook" : "none";

  return {
    configured,
    apiKey,
    phone: cleanPhone,
    provider,
    webhookUrl,
  };
}

/**
 * Send WhatsApp text message via CallMeBot (or webhook fallback)
 */
export async function sendWhatsAppMessage(
  text: string
): Promise<{ success: boolean; error?: string; provider?: string }> {
  const config = getWhatsAppConfig();

  if (!config.configured) {
    console.log(
      `[WhatsApp] Dispatch skipped: CALLMEBOT_API_KEY not configured in backend/.env for ${config.phone}.`
    );
    appendWhatsAppLog({
      status: "skipped",
      reason: "CALLMEBOT_API_KEY_missing",
      phone: config.phone,
      textPreview: text.slice(0, 100),
    });
    return {
      success: false,
      error: "CALLMEBOT_API_KEY is not set in backend/.env. Send 'I allow callmebot to send me messages' to +34 644 44 20 20 on WhatsApp to get your free API key.",
    };
  }

  // 1. Primary: Free CallMeBot WhatsApp Gateway
  if (config.apiKey) {
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
        config.phone
      )}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(
        config.apiKey
      )}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "MehandiBySana/2.0" },
      });

      const bodyText = await res.text();

      // CallMeBot returns 200 with HTML or text e.g. "Message queued" or "Message sent"
      const isSuccess =
        res.ok &&
        (bodyText.toLowerCase().includes("queued") ||
          bodyText.toLowerCase().includes("success") ||
          bodyText.toLowerCase().includes("message sent"));

      if (!isSuccess && !res.ok) {
        console.warn("[WhatsApp] CallMeBot error:", bodyText);
        appendWhatsAppLog({
          status: "error",
          provider: "callmebot",
          error: bodyText || `HTTP ${res.status}`,
          phone: config.phone,
        });
        return { success: false, error: bodyText || `HTTP ${res.status}`, provider: "callmebot" };
      }

      appendWhatsAppLog({
        status: "sent",
        provider: "callmebot",
        phone: config.phone,
        textPreview: text.slice(0, 100),
      });

      return { success: true, provider: "callmebot" };
    } catch (err: any) {
      console.error("[WhatsApp] Network error:", err);
      appendWhatsAppLog({
        status: "exception",
        provider: "callmebot",
        error: err?.message || String(err),
      });
      return { success: false, error: err?.message || "Failed to reach CallMeBot API", provider: "callmebot" };
    }
  }

  // 2. Fallback: Generic Webhook / BSP
  if (config.webhookUrl) {
    try {
      const res = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: config.phone,
          message: text,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        return { success: false, error: `Webhook HTTP ${res.status}`, provider: "webhook" };
      }

      appendWhatsAppLog({
        status: "sent",
        provider: "webhook",
        phone: config.phone,
        textPreview: text.slice(0, 100),
      });

      return { success: true, provider: "webhook" };
    } catch (err: any) {
      return { success: false, error: err?.message || "Webhook failed", provider: "webhook" };
    }
  }

  return { success: false, error: "No provider configured" };
}

/**
 * 1. Alert on Order Placed (Storefront / Manual)
 */
export async function notifyWhatsAppOrderPlaced(order: {
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  city?: string;
  pincode?: string;
  items: Array<{ title: string; quantity: number; lineTotal: number }>;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}) {
  const itemsText = order.items
    .map(
      (it) =>
        `• *${it.title}* x ${it.quantity} (₹${it.lineTotal.toLocaleString("en-IN")})`
    )
    .join("\n");

  const text = `🛍️ *NEW ORDER RECEIVED — Mehandi by Sana*

*Order:* #${order.orderNumber}
*Customer:* ${order.customerName}
*Phone:* ${order.phone || "—"}
*Email:* ${order.email}
*Destination:* ${order.city || "—"}${order.pincode ? ` (${order.pincode})` : ""}

*Items Ordered:*
${itemsText}

*Payable Total:* ₹${order.total.toLocaleString("en-IN")}
*Payment Mode:* ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})`;

  return sendWhatsAppMessage(text);
}

/**
 * 2. Alert on Order Shipped / Dispatched
 */
export async function notifyWhatsAppOrderShipped(order: {
  orderNumber: string;
  customerName: string;
  dispatchOrigin: string;
  courierName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchNote?: string;
}) {
  const text = `🚀 *ORDER SHIPPED / DISPATCHED — Mehandi by Sana*

*Order:* #${order.orderNumber}
*Customer:* ${order.customerName}

📍 *Dispatch Origin:* ${order.dispatchOrigin}
📦 *Courier Partner:* ${order.courierName}
${order.trackingNumber ? `🔖 *Tracking / AWB:* ${order.trackingNumber}\n` : ""}${
    order.trackingUrl ? `🔗 *Track Online:* ${order.trackingUrl}\n` : ""
  }${order.dispatchNote ? `📝 *Note:* ${order.dispatchNote}\n` : ""}
Customer email notification has been sent.`;

  return sendWhatsAppMessage(text.trim());
}

/**
 * 3. Alert on Payment Received
 */
export async function notifyWhatsAppPaymentReceived(payment: {
  orderNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  referenceId?: string;
  note?: string;
}) {
  const text = `💰 *PAYMENT RECEIVED — Mehandi by Sana*

*Order:* #${payment.orderNumber}
*Customer:* ${payment.customerName}
*Amount Received:* ₹${payment.amount.toLocaleString("en-IN")}
*Payment Mode:* ${payment.paymentMethod}
${payment.referenceId ? `🔖 *UTR / Ref ID:* ${payment.referenceId}\n` : ""}${
    payment.note ? `📝 *Note:* ${payment.note}\n` : ""
  }
Payment marked *PAID* and synced with Medusa ledger.`;

  return sendWhatsAppMessage(text.trim());
}

/**
 * 4. Test Notification
 */
export async function testWhatsAppAlert(apiKey?: string, phone = "9149648717") {
  if (apiKey) {
    process.env.CALLMEBOT_API_KEY = apiKey.trim();
  }
  const text = `✨ *Mehandi by Sana — WhatsApp Alerts Activated!*

This confirms that your WhatsApp Order Notification is connected to your phone (+91 ${phone}).

You will now receive instant alerts whenever:
1. 🛍️ An order is placed by a customer
2. 🚀 An order is shipped (with Origin & Courier Tracking)
3. 💰 A payment is received (UPI / Razorpay / COD)`;

  return sendWhatsAppMessage(text);
}
