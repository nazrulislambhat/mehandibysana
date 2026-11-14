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
  template?:
    | "verification"
    | "customer_order"
    | "shipping_dispatch"
    | "password_reset"
    | "campaign_preview";
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

      const template = body.template || "verification";
      const siteUrl = emailProvider.storefrontUrl || "https://mehandibysana.com";

      let subject = "Mehandi by Sana — Email Delivery Verification";
      let eyebrow = "Email Delivery Diagnostics";
      let heading = "Email Delivery Is Working";
      let paragraphs = [
        "Assalamu Alaikum / Hello from Mehandi by Sana,",
        `This test confirms your email transport (${emailProvider.provider.toUpperCase()}) can send automated order confirmation, payment receipt, and shipping notification emails to customers.`,
        `Sender Address: ${emailProvider.fromEmail}`,
      ];
      let detailsHtml: string | undefined = undefined;
      let referenceId = "TEST-VERIFIED";
      let ctaLabel: string | undefined = "Visit Storefront";
      let ctaUrl: string | undefined = siteUrl;

      if (template === "customer_order") {
        subject = "Order Confirmed (#MBS-DEMO-73) — Mehandi by Sana";
        eyebrow = "Order Confirmation (Demo Test)";
        heading = "Order Confirmed (#MBS-DEMO-73)";
        referenceId = "MBS-DEMO-73";
        ctaLabel = "Track Your Order";
        ctaUrl = `${siteUrl}/track-order?order=MBS-DEMO-73&email=${encodeURIComponent(targetEmail)}`;
        paragraphs = [
          "Assalamu Alaikum / Hello Test Customer,",
          "Thank you for your order (#MBS-DEMO-73) with Mehandi by Sana! Fresh small-batch botanicals are being prepared for you across Srinagar & Bengaluru.",
          "This is a demonstration preview of the automated Order Confirmation email sent to customers immediately upon checkout, including full line items, delivery address, and tracking link.",
        ];
        detailsHtml = `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #d4c8b8;border-radius:8px;overflow:hidden;margin-bottom:14px;">
            <thead>
              <tr style="background-color:#E7DDCF;">
                <th align="left" style="padding:10px 12px;border-bottom:1px solid #d4c8b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#3D3D3D;">Item</th>
                <th align="center" style="padding:10px 12px;border-bottom:1px solid #d4c8b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#3D3D3D;">Qty</th>
                <th align="right" style="padding:10px 12px;border-bottom:1px solid #d4c8b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#3D3D3D;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;">Organic Rajasthani Sojat Henna Cones (0.38mm Tip)</td>
                <td align="center" style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;">2</td>
                <td align="right" style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;font-weight:600;">₹440</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;">Eucalyptus Henna Aftercare Balm &amp; Sealant</td>
                <td align="center" style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;">1</td>
                <td align="right" style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;font-weight:600;">₹280</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:8px 12px 4px;font-size:13px;color:#6b6357;">Subtotal</td>
                <td style="padding:8px 12px 4px;font-size:13px;color:#3D3D3D;text-align:right;font-weight:600;">₹720</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:4px 12px;font-size:13px;color:#6b6357;">Shipping (Standard India)</td>
                <td style="padding:4px 12px;font-size:13px;color:#789904;text-align:right;font-weight:600;">Free</td>
              </tr>
              <tr style="background-color:#f4efe8;">
                <td colspan="2" style="padding:10px 12px;border-top:1px solid #d4c8b8;font-size:15px;font-weight:700;color:#181818;">Total</td>
                <td style="padding:10px 12px;border-top:1px solid #d4c8b8;font-size:15px;font-weight:700;color:#DD6013;text-align:right;">₹720</td>
              </tr>
            </tbody>
          </table>
          <div style="padding:12px 14px;border:1px solid #d4c8b8;border-radius:8px;background-color:#fbf9f6;font-size:13px;line-height:1.6;color:#3D3D3D;">
            <strong>Payment:</strong> Paid &middot; Razorpay Online (Ref: pay_demo73)<br/>
            <strong>Delivery To:</strong> Test Customer &mdash; Baghat Barzullah, Srinagar, J&amp;K 190001 &middot; +91-9149648717
          </div>
        `;
      } else if (template === "shipping_dispatch") {
        subject = "Order Shipped (#MBS-DEMO-73) — Mehandi by Sana";
        eyebrow = "Parcel Dispatched (Demo Test)";
        heading = "Your Fresh Cones Have Been Dispatched";
        referenceId = "MBS-DEMO-73";
        ctaLabel = "Track Live Dispatch";
        ctaUrl = `${siteUrl}/track-order?order=MBS-DEMO-73&email=${encodeURIComponent(targetEmail)}`;
        paragraphs = [
          "Assalamu Alaikum / Hello Test Customer,",
          "Your Mehandi by Sana parcel (#MBS-DEMO-73) has been freshly packed, sealed, and handed over to our courier partner.",
          "Our fresh organic henna cones are made with pure Sojat triple-filtered powder and organic cajeput/eucalyptus essential oils. To keep cones in peak staining potency, freeze immediately upon delivery until application day.",
        ];
        detailsHtml = `
          <div style="padding:16px;border:1px solid #d4c8b8;border-left:4px solid #789904;border-radius:8px;background-color:#fbf9f6;margin-bottom:14px;font-size:13px;line-height:1.65;color:#3D3D3D;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#789904;">Courier Tracking Dossier</p>
            <strong>Courier Partner:</strong> Delhivery Express<br/>
            <strong>AWB / Tracking Number:</strong> <code style="background-color:#E7DDCF;padding:2px 6px;border-radius:4px;font-weight:600;">DL984128509IN</code><br/>
            <strong>Destination:</strong> Srinagar, Jammu &amp; Kashmir (PIN 190001)<br/>
            <strong>Direct Carrier Link:</strong> <a href="https://www.delhivery.com/track/package/DL984128509IN" target="_blank" style="color:#96410D;text-decoration:underline;font-weight:600;">Track on Delhivery.com &rarr;</a>
          </div>
        `;
      } else if (template === "password_reset") {
        subject = "Reset Your Password — Mehandi by Sana";
        eyebrow = "Account Security (Demo Test)";
        heading = "Reset Your Password";
        referenceId = "PW-RESET-DEMO";
        ctaLabel = "Reset My Password";
        ctaUrl = `${siteUrl}/account/reset-password?token=demo_token_123&email=${encodeURIComponent(targetEmail)}`;
        paragraphs = [
          "Assalamu Alaikum / Hello,",
          `We received a request to reset the password for your Mehandi by Sana account (${targetEmail}).`,
          "To choose a new password, click the button below. For your security, this password reset link is valid for 15 minutes.",
          "If you did not request a password reset, you can safely ignore this email — your account credentials remain unchanged.",
        ];
      } else if (template === "campaign_preview") {
        subject = "Fresh Harvest Organic Sojat Cones Now In Stock — Mehandi by Sana";
        eyebrow = "Fresh Batch Dispatch Update";
        heading = "New Small-Batch Harvest Cones";
        referenceId = "CAMPAIGN-PREVIEW";
        ctaLabel = "Browse Fresh Cones";
        ctaUrl = `${siteUrl}/shop`;
        paragraphs = [
          "Assalamu Alaikum / Hello,",
          "We just blended a new artisanal small batch of fresh Sojat henna cones with organic eucalyptus and cajeput essential oils.",
          "Every cone is hand-rolled with 0.38mm precision pin tips for ultra-fine bridal lines, dark mahogany stain progression, and 100% PPD-free botanical purity.",
          "Limited batches are shipped every Monday & Thursday to ensure maximum freshness across India.",
        ];
      }

      const plainText = [
        ...paragraphs,
        "",
        ctaLabel && ctaUrl ? `${ctaLabel}: ${ctaUrl}` : "",
        `Sender: ${emailProvider.fromEmail}`,
        `Storefront URL: ${siteUrl}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const html = renderBrandedStudioEmailHtml({
        eyebrow,
        heading,
        bodyParagraphs: paragraphs,
        detailsHtml,
        referenceId,
        ctaLabel,
        ctaUrl,
        storefrontUrl: siteUrl,
      });

      const sendResult = await sendStudioEmail({
        to: targetEmail,
        subject,
        text: plainText,
        html,
        scope: req.scope,
      });

      // Also send owner alert copy if template is customer_order and admin email is configured
      if (
        template === "customer_order" &&
        settings.adminEmail &&
        settings.adminEmail.toLowerCase() !== targetEmail.toLowerCase()
      ) {
        try {
          await sendStudioEmail({
            to: settings.adminEmail,
            subject: `[Dispatch Alert] ${subject}`,
            text: `[Operations Alert Copy]\nCustomer: Test Customer (${targetEmail})\n\n${plainText}`,
            html: renderBrandedStudioEmailHtml({
              eyebrow: "Operations Alert (Owner Copy)",
              heading: `[Dispatch Alert] ${heading}`,
              bodyParagraphs: [
                `Customer: Test Customer (${targetEmail} · +91-9149648717)`,
                "This is the studio owner alert copy sent automatically whenever a new customer places an order.",
              ],
              detailsHtml,
              referenceId,
              storefrontUrl: siteUrl,
            }),
            scope: req.scope,
          });
        } catch (adminErr) {
          console.warn("[Admin Test Email] Non-fatal admin copy error:", adminErr);
        }
      }

      settings = await getSanitizedEmailSettings(req.scope);

      const templateLabels: Record<string, string> = {
        verification: "General Transport Verification",
        customer_order: "Customer Order Confirmation (+ Owner Alert)",
        shipping_dispatch: "Shipping & Courier Tracking",
        password_reset: "Password Reset & Account",
        campaign_preview: "Email Campaign Broadcast",
      };

      return res.status(sendResult.sent ? 200 : 502).json({
        success: sendResult.sent,
        sent: sendResult.sent,
        provider: sendResult.provider,
        template,
        templateLabel: templateLabels[template] || template,
        messageId: sendResult.messageId || null,
        error: sendResult.error || null,
        message: sendResult.sent
          ? `${templateLabels[template] || "Test"} email delivered to ${targetEmail} via ${sendResult.provider.toUpperCase()}.`
          : sendResult.error ||
            `Could not send ${templateLabels[template] || "test"} email via ${sendResult.provider}.`,
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

