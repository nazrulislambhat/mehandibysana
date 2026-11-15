import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  getWhatsAppConfig,
  sendWhatsAppMessage,
  testWhatsAppAlert,
} from "../../../../lib/whatsapp";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = getWhatsAppConfig();
  return res.status(200).json({
    success: true,
    configured: config.configured,
    phone: config.phone,
    provider: config.provider,
    instructions: {
      step1: "Save +34 644 44 20 20 to your phone contacts as CallMeBot.",
      step2: "Send this exact WhatsApp message from your phone 9149648717 to +34 644 44 20 20: 'I allow callmebot to send me messages'",
      step3: "CallMeBot will reply within seconds with your free apikey (e.g. apikey: 123456).",
      step4: "Add CALLMEBOT_API_KEY=123456 in backend/.env or submit it here via POST /admin/whatsapp/test.",
    },
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    apiKey?: string;
    phone?: string;
    customMessage?: string;
  };

  const config = getWhatsAppConfig();
  const apiKey = body.apiKey?.trim() || config.apiKey;

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message:
        "CALLMEBOT_API_KEY is missing. To get your free key, send 'I allow callmebot to send me messages' to +34 644 44 20 20 from WhatsApp on 9149648717.",
    });
  }

  if (body.apiKey) {
    process.env.CALLMEBOT_API_KEY = body.apiKey.trim();
  }

  const outcome = body.customMessage?.trim()
    ? await sendWhatsAppMessage(body.customMessage.trim())
    : await testWhatsAppAlert(apiKey, body.phone || config.phone);

  return res.status(outcome.success ? 200 : 400).json({
    success: outcome.success,
    message: outcome.success
      ? `Test WhatsApp message sent successfully to +91 ${config.phone}! Check your WhatsApp.`
      : `Failed to send WhatsApp message: ${outcome.error}`,
    error: outcome.error,
    provider: outcome.provider,
    phone: config.phone,
  });
}
