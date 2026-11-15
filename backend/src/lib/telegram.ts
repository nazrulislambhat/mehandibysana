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
 */
export async function notifyTelegramOrderPlaced(order: {
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
        `• <b>${it.title}</b> &times; ${it.quantity} (₹${it.lineTotal.toLocaleString("en-IN")})`
    )
    .join("\n");

  const message = `
🛍️ <b>NEW ORDER PLACED — Mehandi by Sana</b>

<b>Order:</b> #${order.orderNumber}
<b>Customer:</b> ${order.customerName}
<b>Phone:</b> ${order.phone || "—"}
<b>Email:</b> ${order.email}
<b>Destination:</b> ${order.city || "—"}${order.pincode ? ` (${order.pincode})` : ""}

<b>Items Ordered:</b>
${itemsText}

<b>Payable Total:</b> ₹${order.total.toLocaleString("en-IN")}
<b>Payment Mode:</b> ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})
  `.trim();

  return sendTelegramMessage(message);
}

/**
 * 2. Alert on Order Shipped / Dispatched
 */
export async function notifyTelegramOrderShipped(order: {
  orderNumber: string;
  customerName: string;
  dispatchOrigin: string;
  courierName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchNote?: string;
}) {
  const message = `
🚀 <b>ORDER SHIPPED / DISPATCHED — Mehandi by Sana</b>

<b>Order:</b> #${order.orderNumber}
<b>Customer:</b> ${order.customerName}

📍 <b>Dispatch Origin:</b> ${order.dispatchOrigin}
📦 <b>Courier Partner:</b> ${order.courierName}
${order.trackingNumber ? `🔖 <b>Tracking / AWB:</b> <code>${order.trackingNumber}</code>\n` : ""}${
    order.trackingUrl ? `🔗 <b>Track Link:</b> ${order.trackingUrl}\n` : ""
  }${order.dispatchNote ? `📝 <b>Dispatch Note:</b> ${order.dispatchNote}\n` : ""}
Customer email notification has been dispatched.
  `.trim();

  return sendTelegramMessage(message);
}

/**
 * 3. Alert on Payment Received
 */
export async function notifyTelegramPaymentReceived(payment: {
  orderNumber: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  referenceId?: string;
  note?: string;
}) {
  const message = `
💰 <b>PAYMENT RECORDED — Mehandi by Sana</b>

<b>Order:</b> #${payment.orderNumber}
<b>Customer:</b> ${payment.customerName}
<b>Amount Received:</b> ₹${payment.amount.toLocaleString("en-IN")}
<b>Payment Mode:</b> ${payment.paymentMethod}
${payment.referenceId ? `🔖 <b>UTR / Ref ID:</b> <code>${payment.referenceId}</code>\n` : ""}${
    payment.note ? `📝 <b>Note:</b> ${payment.note}\n` : ""
  }
Payment status updated to <b>PAID</b> & synced with Medusa ledger.
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
1. 🛍️ An order is placed by a customer
2. 🚀 An order is shipped (with Origin & Courier Tracking)
3. 💰 A payment is received (UPI / Razorpay / COD)
  `.trim();

  return sendTelegramMessage(message);
}
