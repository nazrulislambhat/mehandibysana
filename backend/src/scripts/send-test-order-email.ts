import path from "path";
import fs from "fs";
import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  renderBrandedStudioEmailHtml,
  sendStudioEmail,
} from "../lib/notifications";

export default async function sendTestOrderEmail({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("=====================================================");
  logger.info("  SENDING LIVE TEST ORDER CONFIRMATION EMAIL         ");
  logger.info("=====================================================");

  const targetEmails = ["sana@mehandibysana.com"];
  const orderNumber = "MBS-TEST-VERIFY";
  const siteUrl = "https://mehandibysana.com";

  const paragraphs = [
    "Assalamu Alaikum / Hello,",
    `Thank you for your order (${orderNumber}) with Mehandi By Sana! Fresh organic henna is being prepared for you across Kashmir & Bengaluru.`,
    "This is a live test verifying that the branded Mehandi By Sana logo emblem loads with crystal-clear resolution across all mail clients (Gmail, Apple Mail, Outlook).",
    "❄️ Storage Reminder: Fresh organic henna cones contain zero synthetic chemical preservatives. Please transfer cones to your freezer at -18°C upon delivery.",
  ];

  const detailsHtml = `
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
          <td style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;">100% Pure Organic Rajasthani Sojat Henna Cones (0.38mm Tip)</td>
          <td align="center" style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;">5</td>
          <td align="right" style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;font-weight:600;">₹350</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;">Eucalyptus Henna Aftercare Balm &amp; Sealant</td>
          <td align="center" style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;">1</td>
          <td align="right" style="padding:10px 12px;border-bottom:1px solid #e7ddcf;font-size:14px;color:#3D3D3D;font-weight:600;">₹280</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px 12px 4px;font-size:13px;color:#6b6357;">Subtotal</td>
          <td style="padding:8px 12px 4px;font-size:13px;color:#3D3D3D;text-align:right;font-weight:600;">₹630</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 12px;font-size:13px;color:#6b6357;">Shipping (Kashmir &amp; Standard India)</td>
          <td style="padding:4px 12px;font-size:13px;color:#789904;text-align:right;font-weight:600;">Free</td>
        </tr>
        <tr style="background-color:#f4efe8;">
          <td colspan="2" style="padding:10px 12px;border-top:1px solid #d4c8b8;font-size:15px;font-weight:700;color:#181818;">Total Paid</td>
          <td style="padding:10px 12px;border-top:1px solid #d4c8b8;font-size:15px;font-weight:700;color:#DD6013;text-align:right;">₹630</td>
        </tr>
      </tbody>
    </table>
    <div style="padding:12px 14px;border:1px solid #d4c8b8;border-radius:8px;background-color:#fbf9f6;font-size:13px;line-height:1.6;color:#3D3D3D;">
      <strong>Payment:</strong> Paid &middot; Razorpay Online (Ref: pay_live_logo_verify)<br/>
      <strong>Delivery To:</strong> Sana &amp; Nazrul &mdash; Baghat Barzullah, Srinagar, Kashmir &middot; +91-9149648717
    </div>
  `;

  const html = renderBrandedStudioEmailHtml({
    eyebrow: "Order Confirmation · Live Test",
    heading: `Order Confirmed (#${orderNumber})`,
    bodyParagraphs: paragraphs,
    detailsHtml,
    referenceId: orderNumber,
    ctaLabel: "Track Order Status",
    ctaUrl: `${siteUrl}/track-order?order=${orderNumber}`,
    storefrontUrl: siteUrl,
  });

  try {
    const previewPath = path.resolve(
      process.cwd(),
      "../frontend/data/emails/test-order-email-preview.html"
    );
    fs.writeFileSync(previewPath, html, "utf8");
    logger.info(`Preview HTML written to: ${previewPath}`);
  } catch (fsErr) {
    logger.warn(`Could not save preview HTML: ${fsErr}`);
  }

  const plainText = [
    ...paragraphs,
    "",
    "Track order status: https://mehandibysana.com/track-order",
  ].join("\n\n");

  const sendResult = await sendStudioEmail({
    to: targetEmails,
    subject: `Order Confirmed (#${orderNumber}) — Mehandi By Sana`,
    text: plainText,
    html,
    scope: container as any,
  });

  logger.info(`Email Sent: ${sendResult.sent}`);
  logger.info(`Provider  : ${sendResult.provider}`);
  if (sendResult.messageId) {
    logger.info(`Message ID: ${sendResult.messageId}`);
  }
  if (sendResult.error) {
    logger.error(`Error     : ${sendResult.error}`);
  }
  logger.info("=====================================================");
}
