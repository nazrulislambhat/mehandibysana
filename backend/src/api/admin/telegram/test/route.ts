import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  getTelegramConfig,
  sendTelegramMessage,
  notifyTelegramOrderPlaced,
  notifyTelegramOrderShipped,
  notifyTelegramPaymentReceived,
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
      step1:
        "In Telegram on your phone (9149648717), message @BotFather and send /newbot to create your bot and get the Bot Token.",
      step2:
        "Start a conversation with your bot by pressing START or sending any message.",
      step3:
        "Message @userinfobot or @getmyid_bot to get your Telegram Chat ID (e.g. 1234567890).",
      step4:
        "Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID into backend/.env or your environment variables.",
    },
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    botToken?: string;
    chatId?: string;
    targetPhone?: string;
    customMessage?: string;
    sampleKind?: "activation" | "order_placed" | "order_shipped" | "payment_received";
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

  let outcome: { success: boolean; messageId?: number; error?: string };

  if (body.sampleKind === "order_placed") {
    outcome = await notifyTelegramOrderPlaced({
      orderNumber: "TEST-8842",
      customerName: "Ayesha Malik",
      phone: "+91 9149648717",
      email: "ayesha.malik@example.com",
      address: {
        address_1: "House No. 42, Sector 3, Gulberg Colony",
        address_2: "Opposite Grand Oak Lawn",
        city: "Srinagar",
        province: "Jammu & Kashmir",
        postal_code: "190008",
        country_code: "IN",
      },
      items: [
        {
          title: "100% Pure Organic Rajasthani Henna Cones (Pack of 5)",
          variant: "0.38mm Ultra-Fine Tip",
          quantity: 2,
          lineTotal: 700,
        },
        {
          title: "Fresh Herbal Eucalyptus Aftercare Balm (15g)",
          quantity: 1,
          lineTotal: 250,
        },
      ],
      subtotal: 950,
      shippingFee: 0,
      discountAmount: 95,
      couponCode: "WELCOME10",
      total: 855,
      paymentMethod: "Razorpay (UPI / Card)",
      paymentStatus: "Paid",
      paymentRef: "pay_sample_test12345",
    });
  } else if (body.sampleKind === "order_shipped") {
    outcome = await notifyTelegramOrderShipped({
      orderNumber: "TEST-8842",
      customerName: "Ayesha Malik",
      phone: "+91 9149648717",
      email: "ayesha.malik@example.com",
      address: {
        address_1: "House No. 42, Sector 3, Gulberg Colony",
        address_2: "Opposite Grand Oak Lawn",
        city: "Srinagar",
        province: "Jammu & Kashmir",
        postal_code: "190008",
        country_code: "IN",
      },
      dispatchOrigin: "Srinagar Studio (Kashmir)",
      courierName: "Delhivery Surface Express",
      trackingNumber: "DEL1984712093IN",
      trackingUrl: "https://www.delhivery.com/track/package/DEL1984712093IN",
      dispatchNote: "Fresh batch prepared with lavender essential oil. Store cones frozen upon arrival.",
    });
  } else if (body.sampleKind === "payment_received") {
    outcome = await notifyTelegramPaymentReceived({
      orderNumber: "TEST-8842",
      customerName: "Ayesha Malik",
      phone: "+91 9149648717",
      email: "ayesha.malik@example.com",
      address: {
        city: "Srinagar",
        province: "Jammu & Kashmir",
        postal_code: "190008",
      },
      amount: 855,
      paymentMethod: "UPI (Google Pay / PhonePe)",
      referenceId: "UPI-Ref-419208471029",
      note: "Instant payment capture verified against bank settlement.",
    });
  } else {
    const text =
      body.customMessage?.trim() ||
      `
✨ <b>Mehandi By Sana — Telegram Alerts Activated!</b>

This confirms that your Telegram Order Notification bot is connected to your phone (+91 ${targetPhone}).

You will now receive instant alerts whenever:
1. 🛍️ <b>Order Placed:</b> with customer name, phone, email, full address & line items
2. 🚀 <b>Order Shipped:</b> with dispatch origin (Srinagar/Bengaluru), courier, tracking AWB & address
3. 💰 <b>Payment Received:</b> with customer details, amount, mode & reference ID
      `.trim();

    outcome = await sendTelegramMessage(text);
  }

  return res.status(outcome.success ? 200 : 400).json({
    success: outcome.success,
    message: outcome.success
      ? `Test message sent to Telegram successfully! Check your Telegram app.`
      : `Failed to send Telegram message: ${outcome.error}`,
    messageId: outcome.messageId,
    error: outcome.error,
    targetPhone,
  });
}
