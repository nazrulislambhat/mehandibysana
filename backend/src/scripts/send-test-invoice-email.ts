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

  const targetEmail = "nazrulislambhat@gmail.com";
  const siteUrl = "https://mehandibysana.com";
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const testCases: InvoiceData[] = [
    {
      invoiceNumber: "INV-MBS-PAID-7701",
      invoiceDate: today,
      orderId: "order_test_paid_7701",
      orderNumber: "MBS-PAID-7701",
      orderDate: today,
      customerName: "Nazrul Islam",
      customerEmail: targetEmail,
      customerPhone: "+91 9149648717",
      billingAddress: "42 Lavender Lane, Rajbagh, Srinagar, Kashmir, PIN 190008",
      shippingAddress: "42 Lavender Lane, Rajbagh, Srinagar, Kashmir, PIN 190008",
      pincode: "190008",
      paymentStatus: "PAID",
      paymentMethod: "Razorpay Online (UPI / GPay)",
      paymentRef: "pay_Pz92kLmnOp48Xq",
      paymentDate: today,
      items: [
        {
          title: "100% Pure Organic Henna Cones (0.38mm Tip)",
          variant: "Pack of 5 Cones",
          quantity: 2,
          unitPrice: 350,
          lineTotal: 700,
        },
        {
          title: "Eucalyptus Henna Aftercare Balm & Sealant",
          variant: "30g Botanical Tin",
          quantity: 1,
          unitPrice: 280,
          lineTotal: 280,
        },
      ],
      subtotal: 980,
      shippingFee: 0,
      discountAmount: 100,
      couponCode: "EIDSPECIAL",
      total: 880,
      deliverySpeed: "Standard Atelier Dispatch",
      targetDeliveryDate: "18 Nov 2026",
      specialInstructions: "Please transfer cones to freezer at -18°C upon arrival.",
      storefrontUrl: siteUrl,
    },
    {
      invoiceNumber: "INV-MBS-DUE-7702",
      invoiceDate: today,
      orderId: "order_test_due_7702",
      orderNumber: "MBS-DUE-7702",
      orderDate: today,
      customerName: "Nazrul Islam",
      customerEmail: targetEmail,
      customerPhone: "+91 9149648717",
      billingAddress: "42 Lavender Lane, Rajbagh, Srinagar, Kashmir, PIN 190008",
      shippingAddress: "42 Lavender Lane, Rajbagh, Srinagar, Kashmir, PIN 190008",
      pincode: "190008",
      paymentStatus: "PENDING PAYMENT",
      paymentMethod: "Offline UPI (GPay / PhonePe)",
      paymentRef: "",
      items: [
        {
          title: "100% Pure Organic Henna Cones (0.38mm Tip)",
          variant: "Pack of 5 Cones",
          quantity: 1,
          unitPrice: 350,
          lineTotal: 350,
        },
        {
          title: "Pure Nilgiri Eucalyptus Oil (30ml Dropper)",
          quantity: 1,
          unitPrice: 220,
          lineTotal: 220,
        },
      ],
      subtotal: 570,
      shippingFee: 60,
      discountAmount: 50,
      couponCode: "WELCOME50",
      total: 580,
      deliverySpeed: "Priority Dispatch",
      targetDeliveryDate: "19 Nov 2026",
      specialInstructions: "Awaiting UPI payment screenshot on WhatsApp.",
      storefrontUrl: siteUrl,
    },
  ];

  for (const sampleData of testCases) {
    const isPaid = sampleData.paymentStatus === "PAID";
    logger.info("=====================================================");
    logger.info(`  DISPATCHING ${isPaid ? "PAID" : "NOT PAID"} TEST INVOICE (${sampleData.invoiceNumber})`);
    logger.info("=====================================================");

    logger.info(`Generating PDF and HTML files for ${sampleData.invoiceNumber}...`);
    const [pdfBuffer, htmlContent] = await Promise.all([
      generateInvoicePdf(sampleData),
      generateInvoiceHtml(sampleData),
    ]);

    const { pdfPath, htmlPath } = await saveInvoiceFiles(
      sampleData,
      pdfBuffer,
      htmlContent
    );
    logger.info(`Saved PDF: ${pdfPath}`);
    logger.info(`Saved HTML: ${htmlPath}`);

    const badgeColor = isPaid ? "#2e7d32" : "#c62828";
    const statusText = isPaid ? "PAID" : "PENDING PAYMENT / NOT PAID";

    const emailHtml = renderBrandedStudioEmailHtml({
      eyebrow: isPaid ? "Official Tax Invoice & Receipt" : "Order Invoice (Payment Pending)",
      heading: `Tax Invoice for Order ${sampleData.orderNumber}`,
      bodyParagraphs: [
        `Assalamu Alaikum / Hello ${sampleData.customerName},`,
        `Please find attached your official tax invoice (${sampleData.invoiceNumber}) with ${
          isPaid ? "verified PAID studio seal" : "NOT PAID status seal"
        } for order ${sampleData.orderNumber}.`,
        `Payment Status: ${sampleData.paymentStatus} via ${sampleData.paymentMethod}${
          sampleData.paymentRef ? ` (Ref: ${sampleData.paymentRef})` : ""
        }`,
        `Total: ₹${sampleData.total}`,
        "❄️ Storage Reminder: Fresh organic henna cones contain zero synthetic chemical preservatives. Please transfer cones to your freezer at -18°C upon delivery.",
      ],
      detailsHtml: `
        <div style="background:#fdf8f5;border:1.5px solid #d4c8b8;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
          <span style="display:inline-block;padding:5px 14px;border-radius:4px;font-size:12px;font-weight:800;letter-spacing:0.08em;background:${badgeColor};color:#ffffff;text-transform:uppercase;margin-bottom:8px;">
            ${statusText}
          </span>
          <div style="font-size:15px;color:#181818;font-weight:700;margin-top:4px;">
            Tax Invoice ${sampleData.invoiceNumber} Attached as PDF
          </div>
          <div style="font-size:12px;color:#6b6560;margin-top:4px;">
            Payable Amount: <strong>₹${sampleData.total}</strong> &middot; Method: ${sampleData.paymentMethod}
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
      subject: `Tax Invoice ${sampleData.invoiceNumber} (${sampleData.orderNumber}) [${
        isPaid ? "PAID" : "NOT PAID"
      }] — Mehandi By Sana`,
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

    logger.info(`Email Sent: ${result.sent} (Provider: ${result.provider}, Message ID: ${result.messageId || "N/A"})`);

    logger.info(`Dispatching ${isPaid ? "PAID" : "NOT PAID"} PDF invoice to Telegram...`);
    const teleOutcome = await sendTelegramDocument(pdfBuffer, `${sampleData.invoiceNumber}.pdf`, {
      caption: `🧾 <b>Test Tax Invoice ${sampleData.invoiceNumber} [${
        isPaid ? "PAID — GREEN SEAL" : "NOT PAID — RED SEAL"
      }]</b>\nOrder #${sampleData.orderNumber} &middot; ₹${sampleData.total}\nCustomer: ${sampleData.customerName}`,
      mimeType: "application/pdf",
    });
    logger.info(`Telegram Sent: ${teleOutcome.success}${teleOutcome.messageId ? ` (Message ID: ${teleOutcome.messageId})` : ""}`);
  }

  logger.info("=====================================================");
  logger.info("  ALL TEST INVOICES DISPATCHED SUCCESSFULLY!         ");
  logger.info("=====================================================");
}
