import path from "node:path";
import fs from "node:fs";

const DATA_DIR =
  process.env.STUDIO_DATA_DIR?.trim() || path.resolve(process.cwd(), "../studio-data");
const TELEGRAM_LOG = path.join(DATA_DIR, "telegram.log");

function appendTelegramLog(entry: Record<string, unknown>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(
      TELEGRAM_LOG,
      `${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`,
      "utf8"
    );
  } catch (err) {
    console.warn("[Telegram] Failed to write log:", err);
  }
}

export interface TelegramConfig {
  configured: boolean;
  botToken?: string;
  chatId?: string;
  targetPhone: string;
}

export function getTelegramConfig(): TelegramConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  const targetPhone = process.env.TELEGRAM_TARGET_PHONE?.trim() || "9149648717";

  return {
    configured: Boolean(botToken && chatId),
    botToken,
    chatId,
    targetPhone,
  };
}

export function escapeTelegramHtml(text?: string | null): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type TelegramAddressInput =
  | string
  | {
      first_name?: string;
      last_name?: string;
      company?: string;
      address_1?: string;
      address_2?: string;
      address1?: string;
      address2?: string;
      address?: string;
      apartment?: string;
      city?: string;
      province?: string;
      state?: string;
      postal_code?: string;
      postalCode?: string;
      pincode?: string;
      country_code?: string;
      countryCode?: string;
      country?: string;
      phone?: string;
      formatted?: string;
    }
  | null
  | undefined;

export function formatTelegramAddress(addr: TelegramAddressInput): string {
  if (!addr) return "Not provided";
  if (typeof addr === "string") {
    const trimmed = addr.trim();
    return trimmed ? escapeTelegramHtml(trimmed) : "Not provided";
  }

  if (addr.formatted && addr.formatted.trim()) {
    return escapeTelegramHtml(addr.formatted.trim());
  }

  const parts: string[] = [];

  const comp = (addr.company || "").trim();
  if (comp) parts.push(escapeTelegramHtml(comp));

  const line1 = (addr.address_1 || addr.address1 || addr.address || "").trim();
  if (line1) parts.push(escapeTelegramHtml(line1));

  const line2 = (addr.address_2 || addr.address2 || addr.apartment || "").trim();
  if (line2) parts.push(escapeTelegramHtml(line2));

  const city = (addr.city || "").trim();
  const state = (addr.province || addr.state || "").trim();
  const pin = (addr.postal_code || addr.postalCode || addr.pincode || "").trim();

  const cityStatePin = [
    city,
    state,
    pin ? `PIN: ${pin}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  if (cityStatePin) parts.push(escapeTelegramHtml(cityStatePin));

  const country = (addr.country_code || addr.countryCode || addr.country || "").trim().toUpperCase();
  if (country && country !== "IN" && country !== "INDIA") {
    parts.push(escapeTelegramHtml(country));
  }

  return parts.length > 0 ? parts.join("\n") : "Not provided";
}

export async function sendTelegramMessage(
  text: string,
  options?: { parseMode?: "HTML" | "Markdown" }
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const { configured, botToken, chatId, targetPhone } = getTelegramConfig();

  if (!configured || !botToken || !chatId) {
    console.log(
      `[Telegram] Skipped dispatch (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set for phone ${targetPhone}).`
    );
    appendTelegramLog({
      status: "skipped",
      reason: "credentials_not_configured",
      targetPhone,
      textPreview: text.slice(0, 100),
    });
    return {
      success: false,
      error: "Telegram Bot Token or Chat ID not configured in backend .env",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode || "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = (await res.json()) as any;
    if (!res.ok || !data.ok) {
      const errMsg = data?.description || `HTTP ${res.status}`;
      console.warn("[Telegram] API error:", errMsg);
      appendTelegramLog({ status: "error", error: errMsg, textPreview: text.slice(0, 100) });
      return { success: false, error: errMsg };
    }

    appendTelegramLog({
      status: "sent",
      messageId: data.result?.message_id,
      chatId,
      textPreview: text.slice(0, 100),
    });

    return { success: true, messageId: data.result?.message_id };
  } catch (err: any) {
    console.error("[Telegram] Network exception:", err);
    appendTelegramLog({ status: "exception", error: err?.message || String(err) });
    return { success: false, error: err?.message || "Failed to reach Telegram API" };
  }
}

/**
 * 1. Alert on Order Placed (Storefront / Manual)
 * Includes complete customer contact info and full delivery address
 */
export async function notifyTelegramOrderPlaced(order: {
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  address?: TelegramAddressInput;
  city?: string;
  pincode?: string;
  items: Array<{ title: string; variant?: string; quantity: number; lineTotal: number }>;
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentRef?: string;
}) {
  const itemsText =
    order.items && order.items.length > 0
      ? order.items
          .map((it) => {
            const varLabel =
              it.variant && it.variant.trim()
                ? ` <i>(${escapeTelegramHtml(it.variant.trim())})</i>`
                : "";
            return `• <b>${escapeTelegramHtml(it.title)}</b>${varLabel} &times; ${it.quantity} — ₹${Number(
              it.lineTotal || 0
            ).toLocaleString("en-IN")}`;
          })
          .join("\n")
      : "• Standard items";

  const resolvedAddress =
    order.address || {
      city: order.city,
      postal_code: order.pincode,
    };
  const formattedAddress = formatTelegramAddress(resolvedAddress);

  const breakdownLines: string[] = [];
  if (order.subtotal !== undefined && order.subtotal > 0) {
    breakdownLines.push(`• Subtotal: ₹${Number(order.subtotal).toLocaleString("en-IN")}`);
  }
  if (order.shippingFee !== undefined) {
    breakdownLines.push(
      `• Shipping: ${order.shippingFee === 0 ? "Free" : `₹${Number(order.shippingFee).toLocaleString("en-IN")}`}`
    );
  }
  if (order.discountAmount !== undefined && order.discountAmount > 0) {
    breakdownLines.push(
      `• Discount (${order.couponCode || "Coupon"}): -₹${Number(order.discountAmount).toLocaleString("en-IN")}`
    );
  }

  const breakdownBlock =
    breakdownLines.length > 0
      ? `\n<b>Breakdown:</b>\n${breakdownLines.join("\n")}\n`
      : "";

  const paymentRefLine = order.paymentRef
    ? `\n🔖 <b>Payment Ref:</b> <code>${escapeTelegramHtml(order.paymentRef)}</code>`
    : "";

  const message = `
🛍️ <b>NEW ORDER PLACED — Mehandi by Sana</b>

<b>Order:</b> #${escapeTelegramHtml(order.orderNumber)}
<b>Customer:</b> ${escapeTelegramHtml(order.customerName)}
📞 <b>Phone:</b> ${order.phone ? `<b>${escapeTelegramHtml(order.phone)}</b>` : "Not provided"}
✉️ <b>Email:</b> ${escapeTelegramHtml(order.email)}

📍 <b>Delivery Address:</b>
${formattedAddress}

📦 <b>Items Ordered (${order.items?.length || 0}):</b>
${itemsText}
${breakdownBlock}
💰 <b>Payable Total:</b> ₹${Number(order.total || 0).toLocaleString("en-IN")}
💳 <b>Payment Mode:</b> ${escapeTelegramHtml(order.paymentMethod.toUpperCase())} (${escapeTelegramHtml(
    order.paymentStatus.toUpperCase()
  )})${paymentRefLine}
  `.trim();

  return sendTelegramMessage(message);
}

/**
 * 2. Alert on Order Shipped / Dispatched
 * Includes complete customer contact info and full delivery address
 */
export async function notifyTelegramOrderShipped(order: {
  orderNumber: string;
  customerName: string;
  email?: string;
  phone?: string;
  address?: TelegramAddressInput;
  dispatchOrigin: string;
  courierName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchNote?: string;
}) {
  const formattedAddress = formatTelegramAddress(order.address);

  const phoneLine = order.phone
    ? `📞 <b>Phone:</b> <b>${escapeTelegramHtml(order.phone)}</b>\n`
    : "";
  const emailLine = order.email
    ? `✉️ <b>Email:</b> ${escapeTelegramHtml(order.email)}\n`
    : "";

  const addressBlock =
    formattedAddress && formattedAddress !== "Not provided"
      ? `📍 <b>Delivery Address:</b>\n${formattedAddress}\n\n`
      : "";

  const message = `
🚀 <b>ORDER SHIPPED / DISPATCHED — Mehandi by Sana</b>

<b>Order:</b> #${escapeTelegramHtml(order.orderNumber)}
<b>Customer:</b> ${escapeTelegramHtml(order.customerName)}
${phoneLine}${emailLine}
${addressBlock}🏭 <b>Dispatch Origin:</b> ${escapeTelegramHtml(order.dispatchOrigin)}
📦 <b>Courier Partner:</b> ${escapeTelegramHtml(order.courierName)}
${order.trackingNumber ? `🔖 <b>Tracking / AWB:</b> <code>${escapeTelegramHtml(order.trackingNumber)}</code>\n` : ""}${
    order.trackingUrl ? `🔗 <b>Track Link:</b> ${escapeTelegramHtml(order.trackingUrl)}\n` : ""
  }${order.dispatchNote ? `📝 <b>Dispatch Note:</b> ${escapeTelegramHtml(order.dispatchNote)}\n` : ""}
✅ Customer shipping notification email dispatched.
  `.trim();

  return sendTelegramMessage(message);
}

/**
 * 3. Alert on Payment Received
 * Includes complete customer contact info and delivery destination
 */
export async function notifyTelegramPaymentReceived(payment: {
  orderNumber: string;
  customerName: string;
  email?: string;
  phone?: string;
  address?: TelegramAddressInput;
  amount: number;
  paymentMethod: string;
  referenceId?: string;
  note?: string;
}) {
  const formattedAddress = payment.address ? formatTelegramAddress(payment.address) : "";

  const phoneLine = payment.phone
    ? `📞 <b>Phone:</b> <b>${escapeTelegramHtml(payment.phone)}</b>\n`
    : "";
  const emailLine = payment.email
    ? `✉️ <b>Email:</b> ${escapeTelegramHtml(payment.email)}\n`
    : "";

  const addressBlock =
    formattedAddress && formattedAddress !== "Not provided"
      ? `📍 <b>Delivery Destination:</b>\n${formattedAddress}\n\n`
      : "";

  const message = `
💰 <b>PAYMENT RECORDED — Mehandi by Sana</b>

<b>Order:</b> #${escapeTelegramHtml(payment.orderNumber)}
<b>Customer:</b> ${escapeTelegramHtml(payment.customerName)}
${phoneLine}${emailLine}
${addressBlock}💵 <b>Amount Received:</b> ₹${Number(payment.amount || 0).toLocaleString("en-IN")}
💳 <b>Payment Mode:</b> ${escapeTelegramHtml(payment.paymentMethod)}
${payment.referenceId ? `🔖 <b>UTR / Ref ID:</b> <code>${escapeTelegramHtml(payment.referenceId)}</code>\n` : ""}${
    payment.note ? `📝 <b>Note:</b> ${escapeTelegramHtml(payment.note)}\n` : ""
  }
✅ Payment status updated to <b>PAID</b> & synced with Medusa ledger.
  `.trim();

  return sendTelegramMessage(message);
}

/**
 * 4. Test Notification
 */
export async function testTelegramAlert(targetPhone = "9149648717") {
  const message = `
✨ <b>Mehandi by Sana — Telegram Alerts Activated!</b>

This confirms that your Telegram Order Notification bot is connected to your phone (+91 ${targetPhone}).

You will now receive instant alerts whenever:
1. 🛍️ <b>Order Placed:</b> with customer name, phone, email, full address & line items
2. 🚀 <b>Order Shipped:</b> with dispatch origin (Srinagar/Bengaluru), courier, tracking AWB & address
3. 💰 <b>Payment Received:</b> with customer details, amount, mode & reference ID
  `.trim();

  return sendTelegramMessage(message);
}
