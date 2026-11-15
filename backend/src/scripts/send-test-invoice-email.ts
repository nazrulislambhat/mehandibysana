import fs from "fs";
import path from "path";
import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  generateInvoicePdf,
  generateInvoiceHtml,
  saveInvoiceFiles,
  type InvoiceData,
} from "../lib/invoice-generator";
import {
  sendStudioEmail,
  renderBrandedStudioEmailHtml,
} from "../lib/notifications";
import { sendTelegramDocument } from "../lib/telegram";

export default async function sendTestInvoiceEmail({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("=====================================================");
  logger.info("  DISPATCHING SAMPLE TEST TAX INVOICE (PDF ATTACHED) ");
  logger.info("=====================================================");

  const targetEmail = "nazrulislambhat@gmail.com";
  const orderNumber = "MBS-TEST-9922";
  const invoiceNumber = `INV-${orderNumber}`;
  const siteUrl = "https://mehandibysana.com";

  const sampleData: InvoiceData = {
    invoiceNumber,
    invoiceDate: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    orderId: "order_test_dummy_02",
    orderNumber,
    orderDate: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    customerName: "Nazrul Islam",
    customerEmail: targetEmail,
    customerPhone: "+91 9149648717",
    billingAddress: "42 Lavender Lane, Rajbagh, Srinagar, Kashmir, PIN 190008",
    shippingAddress: "42 Lavender Lane, Rajbagh, Srinagar, Kashmir, PIN 190008",
    pincode: "190008",
    paymentStatus: "PENDING PAYMENT",
    paymentMethod: "Offline UPI (GPay / PhonePe)",
    paymentRef: "",
    paymentDate: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    items: [
      {
        title: "100% Pure Organic Henna Cones (0.38mm Tip)",
        variant: "Pack of 5 Cones",
        quantity: 1,
        unitPrice: 350,
        lineTotal: 350,
      },
      {
        title: "Eucalyptus Henna Aftercare Balm & Sealant",
        variant: "30g Botanical Tin",
        quantity: 1,
        unitPrice: 280,
        lineTotal: 280,
      },
      {
        title: "Natural Cajeput & Tea Tree Henna Cones (Deep Stain)",
        variant: "Pack of 2 Cones",
        quantity: 1,
        unitPrice: 170,
        lineTotal: 170,
      },
    ],
    subtotal: 800,
    shippingFee: 60,
    discountAmount: 60,
    couponCode: "ORGANICMEHANDI",
    total: 800,
    deliverySpeed: "Priority Fresh Batch Delivery",
    targetDeliveryDate: "18 Nov 2026",
    specialInstructions: "Please call upon arrival. Transfer cones to freezer at -18°C.",
    storefrontUrl: siteUrl,
  };

  logger.info(`Generating PDF and HTML files for ${invoiceNumber}...`);
  const [pdfBuffer, htmlContent] = await Promise.all([
    generateInvoicePdf(sampleData),
    generateInvoiceHtml(sampleData),
  ]);

  const { pdfPath, htmlPath, relativePdfPath } = await saveInvoiceFiles(
    sampleData,
    pdfBuffer,
    htmlContent
  );
  logger.info(`Saved PDF: ${pdfPath}`);
  logger.info(`Saved HTML: ${htmlPath}`);

  const emailHtml = renderBrandedStudioEmailHtml({
    eyebrow: "Official Tax Invoice & Receipt",
    heading: `Invoice for Order ${sampleData.orderNumber}`,
    bodyParagraphs: [
      `Assalamu Alaikum / Hello ${sampleData.customerName},`,
      `Thank you for shopping with Mehandi By Sana! Please find attached your official tax invoice (${sampleData.invoiceNumber}) for order ${sampleData.orderNumber}.`,
      `Payment Status: ${sampleData.paymentStatus} via ${sampleData.paymentMethod} (Ref: ${sampleData.paymentRef})`,
      "❄️ Storage Reminder: Fresh organic henna cones contain zero synthetic chemical preservatives. Please transfer cones to your freezer at -18°C upon delivery.",
    ],
    detailsHtml: `
      <div style="background:#fdf8f5;border:1.5px solid #d4c8b8;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
        <span style="display:inline-block;padding:4px 14px;border-radius:4px;font-size:12px;font-weight:800;letter-spacing:0.08em;background:#2e7d32;color:#ffffff;text-transform:uppercase;margin-bottom:8px;">
          ${sampleData.paymentStatus}
        </span>
        <div style="font-size:15px;color:#181818;font-weight:700;margin-top:4px;">
          Tax Invoice ${sampleData.invoiceNumber} Attached as PDF
        </div>
        <div style="font-size:12px;color:#6b6560;margin-top:4px;">
          Amount Paid: <strong>₹${sampleData.total}</strong> &middot; Method: ${sampleData.paymentMethod}
        </div>
        <div style="margin-top:12px;">
          <a href="${siteUrl}/track-order?order=${sampleData.orderNumber}&email=${targetEmail}" style="display:inline-block;background:#DD6013;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:6px 14px;border-radius:6px;">
            Track Your Order
          </a>
        </div>
      </div>
    `,
    referenceId: sampleData.invoiceNumber,
    ctaLabel: "View Order & Tracking",
    ctaUrl: `${siteUrl}/track-order?order=${sampleData.orderNumber}&email=${targetEmail}`,
    storefrontUrl: siteUrl,
  });

  logger.info(`Dispatching email with attached PDF to ${targetEmail} via Brevo...`);
  const result = await sendStudioEmail({
    to: targetEmail,
    subject: `Tax Invoice ${sampleData.invoiceNumber} (${sampleData.orderNumber}) [${sampleData.paymentStatus}] — Mehandi By Sana`,
    text: `Invoice ${sampleData.invoiceNumber} for Order ${sampleData.orderNumber}\nPayment Status: ${sampleData.paymentStatus}\nTotal: ₹${sampleData.total}\nAttached: ${sampleData.invoiceNumber}.pdf`,
    html: emailHtml,
    attachments: [
      {
        filename: `${sampleData.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  logger.info(`Email Sent: ${result.sent}`);
  logger.info(`Provider  : ${result.provider}`);
  if (result.messageId) {
    logger.info(`Message ID: ${result.messageId}`);
  }
  if (result.error) {
    logger.error(`Error     : ${result.error}`);
  }

  logger.info("Dispatching test invoice PDF to Telegram...");
  const teleOutcome = await sendTelegramDocument(pdfBuffer, `${sampleData.invoiceNumber}.pdf`, {
    caption: `🧾 <b>Test Tax Invoice ${sampleData.invoiceNumber} [${sampleData.paymentStatus}]</b>\nAttached PDF for testing order #${sampleData.orderNumber} (₹${sampleData.total}).`,
    mimeType: "application/pdf",
  });
  logger.info(`Telegram Sent: ${teleOutcome.success}${teleOutcome.messageId ? ` (Message ID: ${teleOutcome.messageId})` : ""}`);
  logger.info("=====================================================");
}
