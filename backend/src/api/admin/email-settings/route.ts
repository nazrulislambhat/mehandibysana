import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  getSanitizedEmailSettings,
  saveStudioEmailSettings,
  type UpdateStudioEmailSettingsInput,
} from "../../../lib/email-settings";
import {
  getEmailProviderStatus,
  renderBrandedStudioEmailHtml,
  sendStudioEmail,
} from "../../../lib/notifications";

interface EmailSettingsPostBody extends UpdateStudioEmailSettingsInput {
  action?: "save" | "test";
  testEmail?: string;
  saveBeforeTest?: boolean;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const settings = await getSanitizedEmailSettings(req.scope);
    const emailProvider = getEmailProviderStatus();

    return res.status(200).json({
      success: true,
      settings,
      emailProvider,
    });
  } catch (err: any) {
    console.error("[Admin Email Settings GET Error]:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to load email settings.",
    });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as EmailSettingsPostBody;
    const action = body.action || "save";

    const hasSettingsFields =
      body.preferredProvider !== undefined ||
      body.fromEmail !== undefined ||
      body.adminEmail !== undefined ||
      body.storefrontUrl !== undefined ||
      body.resendApiKey !== undefined ||
      body.clearResendApiKey !== undefined ||
      body.brevoApiKey !== undefined ||
      body.clearBrevoApiKey !== undefined ||
      body.smtpHost !== undefined ||
      body.smtpPort !== undefined ||
      body.smtpSecure !== undefined ||
      body.smtpUser !== undefined ||
      body.smtpPass !== undefined ||
      body.clearSmtpPass !== undefined ||
      body.autoSendOrderConfirmation !== undefined ||
      body.autoSendShippingEmail !== undefined;

    let settings =
      action === "save" || (body.saveBeforeTest && hasSettingsFields)
        ? await saveStudioEmailSettings(req.scope, body)
        : await getSanitizedEmailSettings(req.scope);

    const emailProvider = getEmailProviderStatus();

    if (action === "save") {
      return res.status(200).json({
        success: true,
        message: emailProvider.configured
          ? `Email settings saved. Active provider: ${emailProvider.provider.toUpperCase()}.`
          : "Settings saved, but no email provider credentials are configured yet (currently Log-Only).",
        settings,
        emailProvider,
      });
    }

    if (action === "test") {
      const targetEmail = String(
        body.testEmail || settings.adminEmail || ""
      ).trim();

      if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(targetEmail)) {
        return res.status(400).json({
          success: false,
          sent: false,
          provider: emailProvider.provider,
          message: "Please enter a valid Test Email address.",
          settings,
          emailProvider,
        });
      }

      const subject =
        "Mehandi by Sana — Email Delivery Verification";
      const plainText = [
        "Assalamu Alaikum / Hello from Mehandi by Sana Studio,",
        "",
        `This is a verification email confirming that automated order confirmation and shipping dispatch emails are active via provider: ${emailProvider.provider.toUpperCase()}.`,
        "",
        `Sender: ${emailProvider.fromEmail}`,
        `Storefront URL: ${emailProvider.storefrontUrl}`,
      ].join("\n");

      const html = renderBrandedStudioEmailHtml({
        eyebrow: "Studio Email Diagnostics",
        heading: "Email Delivery Is Working",
        bodyParagraphs: [
          "Assalamu Alaikum / Hello from Mehandi by Sana Studio,",
          `This test confirms your email transport (${emailProvider.provider.toUpperCase()}) can send automated order confirmation, payment receipt, and shipping notification emails to customers.`,
          `Sender Address: ${emailProvider.fromEmail}`,
        ],
        referenceId: "SMTP-VERIFIED",
        ctaLabel: "Visit Storefront",
        ctaUrl: emailProvider.storefrontUrl,
        storefrontUrl: emailProvider.storefrontUrl,
      });

      const sendResult = await sendStudioEmail({
        to: targetEmail,
        subject,
        text: plainText,
        html,
        scope: req.scope,
      });

      settings = await getSanitizedEmailSettings(req.scope);

      return res.status(sendResult.sent ? 200 : 502).json({
        success: sendResult.sent,
        sent: sendResult.sent,
        provider: sendResult.provider,
        messageId: sendResult.messageId || null,
        error: sendResult.error || null,
        message: sendResult.sent
          ? `Test email delivered to ${targetEmail} via ${sendResult.provider.toUpperCase()}.`
          : sendResult.error ||
            `Could not send test email via ${sendResult.provider}.`,
        settings,
        emailProvider: getEmailProviderStatus(),
      });
    }

    return res.status(400).json({
      success: false,
      message: `Unsupported action: ${String(action)}`,
    });
  } catch (err: any) {
    console.error("[Admin Email Settings POST Error]:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Failed to update email settings.",
    });
  }
}

