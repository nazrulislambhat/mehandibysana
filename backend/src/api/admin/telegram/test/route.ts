import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  getTelegramConfig,
  testTelegramAlert,
  sendTelegramMessage,
} from "../../../../lib/telegram";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = getTelegramConfig();
  return res.status(200).json({
    success: true,
    configured: config.configured,
    botTokenConfigured: Boolean(config.botToken),
    chatIdConfigured: Boolean(config.chatId),
    targetPhone: config.targetPhone,
    instructions: {
      step1: "In Telegram on your phone (9149648717), message @BotFather and send /newbot to create your bot and get the Bot Token.",
      step2: "Start a conversation with your bot by pressing START or sending any message.",
      step3: "Message @userinfobot or @getmyid_bot to get your Telegram Chat ID (e.g. 1234567890).",
      step4: "Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID into backend/.env or your environment variables.",
    },
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    botToken?: string;
    chatId?: string;
    targetPhone?: string;
    customMessage?: string;
  };

  const config = getTelegramConfig();
  const botToken = body.botToken?.trim() || config.botToken;
  const chatId = body.chatId?.trim() || config.chatId;
  const targetPhone = body.targetPhone?.trim() || config.targetPhone;

  if (!botToken || !chatId) {
    return res.status(400).json({
      success: false,
      message:
        "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing. Please follow the instructions to set up your Telegram bot.",
    });
  }

  // Temporarily set env for the test if passed in body
  if (body.botToken) process.env.TELEGRAM_BOT_TOKEN = body.botToken.trim();
  if (body.chatId) process.env.TELEGRAM_CHAT_ID = body.chatId.trim();

  const text =
    body.customMessage?.trim() ||
    `
✨ <b>Mehandi by Sana — Telegram Alerts Activated!</b>

This confirms that your Telegram Order Notification bot is connected to your phone (+91 ${targetPhone}).

You will now receive instant alerts whenever:
1. 🛍️ An order is placed by a customer
2. 🚀 An order is shipped (with Origin & Courier Tracking)
3. 💰 A payment is received (UPI / Razorpay / COD)
    `.trim();

  const outcome = await sendTelegramMessage(text);

  return res.status(outcome.success ? 200 : 400).json({
    success: outcome.success,
    message: outcome.success
      ? `Test message sent to Telegram successfully! Check your Telegram app.`
      : `Failed to send Telegram message: ${outcome.error}`,
    error: outcome.error,
    targetPhone,
  });
}
