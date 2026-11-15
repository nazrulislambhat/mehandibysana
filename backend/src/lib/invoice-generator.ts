import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateOrderWorkflow } from "@medusajs/medusa/core-flows";
import { ensureStudioEmailSettingsLoaded } from "./email-settings";
import {
  sendStudioEmail,
  type EmailAttachment,
  type SendEmailResult,
  renderBrandedStudioEmailHtml,
} from "./notifications";
import { deriveOrderNumber, formatOrderPaymentMethodLabel } from "./studio-order-meta";
import { sendTelegramDocument, escapeTelegramHtml } from "./telegram";

export interface InvoiceItem {
  title: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  thumbnail?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderId: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingAddress: string;
  shippingAddress: string;
  pincode: string;
  paymentStatus: "PAID" | "PENDING PAYMENT" | "CASH ON DELIVERY" | "REFUNDED";
  paymentMethod: string;
  paymentRef: string;
  paymentDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode: string;
  total: number;
  courierName?: string;
  trackingNumber?: string;
  targetDeliveryDate?: string;
  deliverySpeed?: string;
  specialInstructions?: string;
  storefrontUrl: string;
}

function resolveStudioDataDir(): string {
  if (process.env.STUDIO_DATA_DIR?.trim()) {
    return process.env.STUDIO_DATA_DIR.trim();
  }
  const rootDir = path.resolve(process.cwd(), "studio-data");
  if (fs.existsSync(rootDir)) {
    return rootDir;
  }
  const parentDir = path.resolve(process.cwd(), "../studio-data");
  if (fs.existsSync(parentDir)) {
    return parentDir;
  }
  return rootDir;
}

export function getInvoicesStorageDir(): string {
  const dir = path.join(resolveStudioDataDir(), "invoices");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function escapeHtml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInr(amount: number): string {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatInrPdf(amount: number): string {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Build standardized InvoiceData from a Medusa Order
 */
export function buildInvoiceDataFromOrder(
  order: any,
  options?: {
    forcePaid?: boolean;
    paymentRef?: string;
    invoiceNumber?: string;
  }
): InvoiceData {
  const meta = (order.metadata || {}) as Record<string, unknown>;
  const orderNumber = deriveOrderNumber(order);
  const invoiceNumber =
    options?.invoiceNumber ||
    String(meta.invoice_number || "").trim() ||
    `INV-${orderNumber.replace(/^#/, "")}`;

  const shipAddr = order.shipping_address || {};
  const firstName = String(shipAddr.first_name || "Customer").trim();
  const lastName = String(shipAddr.last_name || "").trim();
  const customerName = `${firstName} ${lastName}`.trim() || "Customer";
  const customerEmail = String(order.email || "").trim().toLowerCase();
  const customerPhone = String(shipAddr.phone || "").trim();
  const pincode = String(shipAddr.postal_code || "").trim();

  const addrParts = [
    shipAddr.address_1,
    shipAddr.address_2,
    shipAddr.city,
    shipAddr.province,
    pincode ? `PIN ${pincode}` : "",
  ]
    .map((v) => String(v || "").trim())
    .filter(Boolean);
  const fullAddress = addrParts.join(", ");

  const rawItems = Array.isArray(order.items) ? order.items : [];
  const items: InvoiceItem[] = rawItems.map((it: any) => {
    const qty = Math.max(1, Number(it.quantity) || 1);
    const unitPrice = Math.max(0, Number(it.unit_price) || 0);
    const variant = String(
      it.variant_title || it.metadata?.variant_title || ""
    ).trim();
    const thumbnail = String(
      it.thumbnail || it.metadata?.thumbnail || ""
    ).trim();
    return {
      title: String(it.title || "Organic Henna Product").trim(),
      variant: variant || undefined,
      quantity: qty,
      unitPrice,
      lineTotal: unitPrice * qty,
      thumbnail: thumbnail || undefined,
    };
  });

  const computedSubtotal = items.reduce((s, it) => s + it.lineTotal, 0);
  const hasMetaSubtotal =
    meta.subtotal !== undefined &&
    meta.subtotal !== null &&
    String(meta.subtotal).trim() !== "" &&
    Number.isFinite(Number(meta.subtotal));
  const subtotal =
    computedSubtotal > 0
      ? computedSubtotal
      : hasMetaSubtotal
        ? Math.max(0, Number(meta.subtotal))
        : 0;

  const shippingMethods = Array.isArray(order.shipping_methods)
    ? order.shipping_methods
    : [];
  const shippingFromMethods = shippingMethods.reduce(
    (s: number, sm: any) => s + Math.max(0, Number(sm?.amount) || 0),
    0
  );
  const hasMetaShipping =
    meta.shipping_fee !== undefined &&
    meta.shipping_fee !== null &&
    String(meta.shipping_fee).trim() !== "" &&
    Number.isFinite(Number(meta.shipping_fee));
  const shippingFee =
    shippingMethods.length > 0
      ? shippingFromMethods
      : hasMetaShipping
        ? Math.max(0, Number(meta.shipping_fee))
        : 0;

  let adjustmentDiscount = 0;
  for (const it of rawItems) {
    for (const adj of it?.adjustments || []) {
      adjustmentDiscount += Math.max(0, Number(adj?.amount) || 0);
    }
  }
  for (const sm of shippingMethods) {
    for (const adj of sm?.adjustments || []) {
      adjustmentDiscount += Math.max(0, Number(adj?.amount) || 0);
    }
  }
  const hasMetaDiscount =
    meta.discount_amount !== undefined &&
    meta.discount_amount !== null &&
    String(meta.discount_amount).trim() !== "" &&
    Number.isFinite(Number(meta.discount_amount));
  const discountAmount = hasMetaDiscount
    ? Math.max(0, Number(meta.discount_amount))
    : adjustmentDiscount;

  const hasMetaTotal =
    meta.total !== undefined &&
    meta.total !== null &&
    String(meta.total).trim() !== "" &&
    Number.isFinite(Number(meta.total));
  const summaryTotal = Number(order.summary?.current_order_total);
  const total = hasMetaTotal
    ? Math.max(0, Number(meta.total))
    : Number.isFinite(summaryTotal) && summaryTotal > 0
      ? summaryTotal
      : Math.max(0, subtotal + shippingFee - discountAmount);

  const pcs = Array.isArray(order.payment_collections)
    ? order.payment_collections
    : [];
  const nativeCaptured = pcs.some(
    (pc: any) =>
      pc?.status === "completed" || Number(pc?.captured_amount || 0) > 0
  );
  const metaPayStatus = String(meta.payment_status || "").toLowerCase();
  const isPaid =
    options?.forcePaid ||
    nativeCaptured ||
    metaPayStatus === "paid" ||
    order.status === "completed";

  const isCod =
    String(meta.payment_method || "").toLowerCase() === "cod" ||
    String(meta.payment_method || "").toLowerCase().includes("cash on delivery");

  let paymentStatus: InvoiceData["paymentStatus"] = "PENDING PAYMENT";
  if (metaPayStatus === "refunded") {
    paymentStatus = "REFUNDED";
  } else if (isPaid) {
    paymentStatus = "PAID";
  } else if (isCod) {
    paymentStatus = "CASH ON DELIVERY";
  }

  const paymentMethod = formatOrderPaymentMethodLabel(meta.payment_method);
  const paymentRef =
    options?.paymentRef ||
    String(meta.payment_id || meta.payment_reference || "").trim();

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const invoiceDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    invoiceNumber,
    invoiceDate,
    orderId: order.id,
    orderNumber,
    orderDate,
    customerName,
    customerEmail,
    customerPhone,
    billingAddress: fullAddress,
    shippingAddress: fullAddress,
    pincode,
    paymentStatus,
    paymentMethod,
    paymentRef,
    paymentDate: isPaid ? (meta.paid_at as string) || invoiceDate : undefined,
    items,
    subtotal,
    shippingFee,
    discountAmount,
    couponCode: String(meta.coupon_code || "").trim(),
    total,
    courierName: String(meta.courier_name || "").trim() || undefined,
    trackingNumber: String(meta.tracking_number || "").trim() || undefined,
    targetDeliveryDate:
      String(meta.target_delivery_date || "").trim() || undefined,
    deliverySpeed:
      String(meta.delivery_speed_label || "").trim() || undefined,
    specialInstructions:
      String(meta.special_instructions || "").trim() || undefined,
    storefrontUrl:
      process.env.STORE_SITE_URL?.trim() || "https://mehandibysana.com",
  };
}

/**
 * Generate Standalone, Printable HTML Invoice
 */
export function generateInvoiceHtml(data: InvoiceData): string {
  const isPaid = data.paymentStatus === "PAID";
  const badgeBg = isPaid
    ? "#e8f5e9"
    : data.paymentStatus === "CASH ON DELIVERY"
      ? "#e3f2fd"
      : "#fff3e0";
  const badgeBorder = isPaid
    ? "#81c784"
    : data.paymentStatus === "CASH ON DELIVERY"
      ? "#64b5f6"
      : "#ffb74d";
  const badgeText = isPaid
    ? "#2e7d32"
    : data.paymentStatus === "CASH ON DELIVERY"
      ? "#1565c0"
      : "#e65100";

  const rows = data.items
    .map(
      (it, idx) => `
    <tr style="border-bottom:1px solid #e0d8ce;">
      <td style="padding:10px 12px;font-size:13px;color:#222;vertical-align:middle;text-align:center;">${
        idx + 1
      }</td>
      <td style="padding:10px 12px;font-size:13px;color:#222;vertical-align:middle;">
        <strong>${escapeHtml(it.title)}</strong>
        ${
          it.variant
            ? `<div style="font-size:11px;color:#6b6560;margin-top:2px;">${escapeHtml(
                it.variant
              )}</div>`
            : ""
        }
      </td>
      <td style="padding:10px 12px;font-size:13px;color:#222;vertical-align:middle;text-align:center;">
        ${it.quantity}
      </td>
      <td style="padding:10px 12px;font-size:13px;color:#222;vertical-align:middle;text-align:right;">
        ${formatInr(it.unitPrice)}
      </td>
      <td style="padding:10px 12px;font-size:13px;color:#222;vertical-align:middle;text-align:right;font-weight:600;">
        ${formatInr(it.lineTotal)}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${escapeHtml(data.invoiceNumber)} — Mehandi By Sana</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .invoice-container { box-shadow: none !important; border: none !important; padding: 0 !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #222222;
      background-color: #f7f5f2;
      margin: 0;
      padding: 24px 12px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #d4c8b8;
      border-top: 6px solid #DD6013;
      border-radius: 8px;
      padding: 36px 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
  </style>
</head>
<body>
  <div class="no-print" style="max-width:800px;margin:0 auto 16px;display:flex;justify-content:space-between;align-items:center;">
    <a href="${escapeHtml(
      data.storefrontUrl
    )}" style="color:#DD6013;text-decoration:none;font-size:13px;font-weight:600;">&larr; Return to Mehandi By Sana</a>
    <button onclick="window.print()" style="background:#DD6013;color:#ffffff;border:none;padding:8px 18px;border-radius:6px;font-weight:600;font-size:13px;cursor:pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="invoice-container">
    <!-- Header -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr>
        <td style="vertical-align:top;">
          <h1 style="margin:0 0 4px;font-family:Georgia,serif;font-size:24px;font-weight:600;color:#181818;">
            Mehandi By Sana
          </h1>
          <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#96410D;margin-bottom:8px;">
            100% Pure Organic Henna
          </div>
          <div style="font-size:12px;line-height:1.6;color:#555;">
            Srinagar, Kashmir &middot; Bengaluru, Karnataka<br/>
            Email: sana@mehandibysana.com &middot; Phone: +91-9149648717<br/>
            Web: <a href="${escapeHtml(
              data.storefrontUrl
            )}" style="color:#96410D;text-decoration:none;">${escapeHtml(
    data.storefrontUrl.replace(/^https?:\/\//, "")
  )}</a>
          </div>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <h2 style="margin:0 0 6px;font-size:22px;letter-spacing:0.06em;color:#DD6013;text-transform:uppercase;">
            TAX INVOICE
          </h2>
          <table style="border-collapse:collapse;display:inline-table;text-align:right;font-size:12px;color:#444;">
            <tr>
              <td style="padding:2px 8px;font-weight:600;">Invoice No:</td>
              <td style="padding:2px 0;font-family:monospace;font-size:13px;color:#111;">${escapeHtml(
                data.invoiceNumber
              )}</td>
            </tr>
            <tr>
              <td style="padding:2px 8px;font-weight:600;">Invoice Date:</td>
              <td style="padding:2px 0;">${escapeHtml(data.invoiceDate)}</td>
            </tr>
            <tr>
              <td style="padding:2px 8px;font-weight:600;">Order ID:</td>
              <td style="padding:2px 0;font-family:monospace;font-weight:700;color:#DD6013;">${escapeHtml(
                data.orderNumber
              )}</td>
            </tr>
            <tr>
              <td style="padding:2px 8px;font-weight:600;">Order Date:</td>
              <td style="padding:2px 0;">${escapeHtml(data.orderDate)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Status Banner -->
    <div style="background-color:${badgeBg};border:1.5px solid ${badgeBorder};border-radius:6px;padding:12px 16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <span style="display:inline-block;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:800;letter-spacing:0.08em;background:${badgeText};color:#ffffff;text-transform:uppercase;">
          ${escapeHtml(data.paymentStatus)}
        </span>
        <span style="margin-left:12px;font-size:13px;color:#333;">
          Method: <strong>${escapeHtml(data.paymentMethod)}</strong>
          ${
            data.paymentRef
              ? ` &middot; Ref: <code style="font-family:monospace;">${escapeHtml(
                  data.paymentRef
                )}</code>`
              : ""
          }
        </span>
      </div>
      <div style="font-size:12px;font-weight:600;color:${badgeText};">
        ${isPaid ? "Payment Recorded in Full" : "Pending Settlement"}
      </div>
    </div>

    <!-- Customer & Shipping Addresses -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#faf8f5;border:1px solid #e7ddcf;border-radius:6px;">
      <tr>
        <td style="padding:14px 18px;width:50%;vertical-align:top;border-right:1px solid #e7ddcf;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#96410D;margin-bottom:6px;">
            Billed &amp; Shipped To
          </div>
          <div style="font-size:13px;font-weight:700;color:#181818;margin-bottom:3px;">
            ${escapeHtml(data.customerName)}
          </div>
          <div style="font-size:12px;line-height:1.6;color:#444;">
            ${escapeHtml(data.shippingAddress)}<br/>
            ${
              data.customerPhone
                ? `Phone: <strong>${escapeHtml(data.customerPhone)}</strong><br/>`
                : ""
            }
            ${
              data.customerEmail
                ? `Email: ${escapeHtml(data.customerEmail)}<br/>`
                : ""
            }
          </div>
        </td>
        <td style="padding:14px 18px;width:50%;vertical-align:top;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#96410D;margin-bottom:6px;">
            Delivery Details
          </div>
          <div style="font-size:12px;line-height:1.6;color:#444;">
            ${
              data.deliverySpeed
                ? `<strong>Delivery Speed:</strong> ${escapeHtml(
                    data.deliverySpeed
                  )}<br/>`
                : ""
            }
            ${
              data.targetDeliveryDate
                ? `<strong>Preferred Delivery Date:</strong> <span style="color:#96410D;font-weight:700;">${escapeHtml(
                    data.targetDeliveryDate
                  )}</span><br/>`
                : ""
            }
            ${
              data.courierName
                ? `<strong>Courier:</strong> ${escapeHtml(data.courierName)}<br/>`
                : ""
            }
            ${
              data.trackingNumber
                ? `<strong>Tracking / AWB:</strong> <span style="font-family:monospace;">${escapeHtml(
                    data.trackingNumber
                  )}</span><br/>`
                : ""
            }
            ${
              data.specialInstructions
                ? `<strong>Special Notes:</strong> <em>${escapeHtml(
                    data.specialInstructions
                  )}</em><br/>`
                : ""
            }
          </div>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #d4c8b8;border-radius:6px;overflow:hidden;">
      <thead>
        <tr style="background:#E7DDCF;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#3D3D3D;">
          <th style="padding:10px 12px;width:30px;text-align:center;">#</th>
          <th style="padding:10px 12px;text-align:left;">Item Description</th>
          <th style="padding:10px 12px;width:60px;text-align:center;">Qty</th>
          <th style="padding:10px 12px;width:90px;text-align:right;">Rate</th>
          <th style="padding:10px 12px;width:100px;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <!-- Totals Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr>
        <td style="width:60%;vertical-align:top;padding-right:20px;">
          <div style="background:#fdf8f5;border:1px solid #f0dfd5;border-radius:6px;padding:12px 14px;font-size:12px;line-height:1.6;color:#555;">
            <strong style="color:#DD6013;">❄️ Storage Reminder:</strong><br/>
            Fresh organic henna cones contain zero synthetic chemical preservatives (0% PPD). Please transfer cones to your freezer at -18&deg;C immediately upon arrival. Thaw for 20 minutes before application.
          </div>
        </td>
        <td style="width:40%;vertical-align:top;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr>
              <td style="padding:6px 0;color:#666;">Subtotal:</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:#222;">${formatInr(
                data.subtotal
              )}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#666;">Shipping${
                data.pincode ? ` (${data.pincode})` : ""
              }:</td>
              <td style="padding:6px 0;text-align:right;font-weight:600;color:#222;">${
                data.shippingFee === 0 ? "FREE" : formatInr(data.shippingFee)
              }</td>
            </tr>
            ${
              data.discountAmount > 0
                ? `<tr>
                    <td style="padding:6px 0;color:#2e7d32;">Discount${
                      data.couponCode ? ` (${escapeHtml(data.couponCode)})` : ""
                    }:</td>
                    <td style="padding:6px 0;text-align:right;font-weight:600;color:#2e7d32;">-${formatInr(
                      data.discountAmount
                    )}</td>
                  </tr>`
                : ""
            }
            <tr style="border-top:2px solid #DD6013;border-bottom:2px solid #DD6013;">
              <td style="padding:10px 0;font-size:15px;font-weight:800;color:#181818;">TOTAL (INR):</td>
              <td style="padding:10px 0;text-align:right;font-size:18px;font-weight:800;color:#DD6013;">${formatInr(
                data.total
              )}</td>
            </tr>
          </table>

          <!-- Official Round Studio Seal -->
          <div style="margin-top:14px;display:flex;justify-content:flex-end;">
            <div style="width:100px;height:100px;border-radius:50%;border:2.5px solid ${
              isPaid ? "#1b5e20" : "#c62828"
            };outline:1px dashed ${
              isPaid ? "#2e7d32" : "#d32f2f"
            };outline-offset:-4px;box-shadow:inset 0 0 0 7px #ffffff, inset 0 0 0 8px ${
              isPaid ? "#2e7d32" : "#d32f2f"
            };display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:${
              isPaid ? "#1b5e20" : "#c62828"
            };font-family:'Courier New',Courier,monospace;background:${
              isPaid ? "#f4fbf5" : "#fef5f5"
            };transform:rotate(${
              isPaid ? "-6deg" : "-9deg"
            });user-select:none;padding:6px;box-sizing:border-box;">
              <div style="font-size:6px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">★ MEHANDI BY SANA ★</div>
              <div style="border-top:1px solid ${
                isPaid ? "#2e7d32" : "#d32f2f"
              };border-bottom:1px solid ${
                isPaid ? "#2e7d32" : "#d32f2f"
              };font-size:${
                isPaid ? "16px" : "12px"
              };font-weight:900;letter-spacing:0.12em;line-height:1.2;margin:2px 0;width:85%;text-align:center;">
                ${isPaid ? "PAID" : "NOT PAID"}
              </div>
              <div style="font-size:5.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${
                isPaid ? "OFFICIALLY VERIFIED" : "PAYMENT PENDING"
              }</div>
              <div style="font-size:5px;color:${
                isPaid ? "#388e3c" : "#e53935"
              };margin-top:2px;">${escapeHtml(
                data.paymentDate || data.invoiceDate
              )}</div>
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <div style="border-top:1px solid #e7ddcf;padding-top:16px;text-align:center;font-size:11px;color:#777;line-height:1.6;">
      Thank you for supporting authentic artisanal organic henna &middot; Mehandi By Sana<br/>
      For order queries, contact <strong>sana@mehandibysana.com</strong> or call <strong>+91-9149648717</strong><br/>
      <em>This is an official computer-generated tax invoice. No signature required.</em>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate PDF buffer using PDFKit (A4 format)
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 36,
        size: "A4",
        info: {
          Title: `Invoice ${data.invoiceNumber}`,
          Author: "Mehandi By Sana",
          Subject: `Tax Invoice for Order ${data.orderNumber}`,
        },
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const pageTop = 36;
      const left = 36;
      const pageWidth = doc.page.width - left * 2;

      // Top Terracotta Accent Stripe
      doc.rect(left, pageTop, pageWidth, 4).fill("#DD6013");

      // Studio Header
      doc.fillColor("#181818").font("Helvetica-Bold").fontSize(20).text("Mehandi By Sana", left, pageTop + 16);
      doc.fillColor("#96410D").font("Helvetica-Bold").fontSize(9).text("100% PURE ORGANIC HENNA", left, pageTop + 40);
      doc.fillColor("#555555").font("Helvetica").fontSize(9).text(
        "Srinagar, Kashmir & Bengaluru, Karnataka\nEmail: sana@mehandibysana.com | Phone: +91-9149648717\nWeb: https://mehandibysana.com",
        left,
        pageTop + 54,
        { lineGap: 2 }
      );

      // Invoice Title & Meta (Right Aligned)
      const rightX = left + pageWidth - 200;
      doc.fillColor("#DD6013").font("Helvetica-Bold").fontSize(18).text("TAX INVOICE", rightX, pageTop + 16, { width: 200, align: "right" });
      doc.fillColor("#333333").font("Helvetica-Bold").fontSize(9);
      doc.text(`Invoice No: ${data.invoiceNumber}`, rightX, pageTop + 40, { width: 200, align: "right" });
      doc.font("Helvetica").text(`Invoice Date: ${data.invoiceDate}`, rightX, pageTop + 54, { width: 200, align: "right" });
      doc.font("Helvetica-Bold").fillColor("#DD6013").text(`Order ID: ${data.orderNumber}`, rightX, pageTop + 68, { width: 200, align: "right" });
      doc.font("Helvetica").fillColor("#555555").text(`Order Date: ${data.orderDate}`, rightX, pageTop + 82, { width: 200, align: "right" });

      // Status Badge Box
      const isPaid = data.paymentStatus === "PAID";
      const statusBoxY = pageTop + 104;
      const statusBoxHeight = 32;
      const bgHex = isPaid ? "#e8f5e9" : "#fff3e0";
      const borderHex = isPaid ? "#81c784" : "#ffb74d";
      const textHex = isPaid ? "#2e7d32" : "#e65100";

      doc.rect(left, statusBoxY, pageWidth, statusBoxHeight).fillAndStroke(bgHex, borderHex);
      doc.fillColor(textHex).font("Helvetica-Bold").fontSize(11).text(
        `STATUS: ${data.paymentStatus}`,
        left + 14,
        statusBoxY + 10
      );
      doc.fillColor("#333333").font("Helvetica").fontSize(9).text(
        `Payment Method: ${data.paymentMethod}${data.paymentRef ? ` | Ref: ${data.paymentRef}` : ""}`,
        left + 180,
        statusBoxY + 11
      );

      // Customer & Shipping Info Box
      const infoY = statusBoxY + statusBoxHeight + 14;
      const infoHeight = 70;
      doc.rect(left, infoY, pageWidth, infoHeight).fillAndStroke("#faf8f5", "#e7ddcf");

      // Left Column: Customer
      doc.fillColor("#96410D").font("Helvetica-Bold").fontSize(8).text("BILLED & SHIPPED TO", left + 14, infoY + 10);
      doc.fillColor("#181818").font("Helvetica-Bold").fontSize(10).text(data.customerName, left + 14, infoY + 22);
      doc.fillColor("#444444").font("Helvetica").fontSize(8).text(
        `${data.shippingAddress}\nPhone: ${data.customerPhone || "N/A"} | Email: ${data.customerEmail}`,
        left + 14,
        infoY + 36,
        { width: pageWidth / 2 - 24, lineGap: 2 }
      );

      // Right Column: Delivery Info
      const rightColX = left + pageWidth / 2 + 10;
      doc.fillColor("#96410D").font("Helvetica-Bold").fontSize(8).text("DELIVERY & ORDER DETAILS", rightColX, infoY + 10);
      doc.fillColor("#444444").font("Helvetica").fontSize(8).text(
        `Delivery Speed: ${data.deliverySpeed || "Standard"}\n` +
          (data.targetDeliveryDate ? `Target Delivery Date: ${data.targetDeliveryDate}\n` : "") +
          (data.courierName ? `Courier: ${data.courierName} | Tracking: ${data.trackingNumber || "Assigned on dispatch"}` : "Courier: Standard Dispatch"),
        rightColX,
        infoY + 24,
        { width: pageWidth / 2 - 20, lineGap: 2 }
      );

      // Items Table Header
      const tableY = infoY + infoHeight + 16;
      doc.rect(left, tableY, pageWidth, 20).fill("#E7DDCF");
      doc.fillColor("#3D3D3D").font("Helvetica-Bold").fontSize(8);
      doc.text("#", left + 8, tableY + 6, { width: 20 });
      doc.text("ITEM DESCRIPTION", left + 32, tableY + 6, { width: pageWidth - 230 });
      doc.text("QTY", left + pageWidth - 190, tableY + 6, { width: 40, align: "center" });
      doc.text("UNIT PRICE", left + pageWidth - 140, tableY + 6, { width: 60, align: "right" });
      doc.text("AMOUNT", left + pageWidth - 70, tableY + 6, { width: 60, align: "right" });

      // Table Rows
      let currentY = tableY + 20;
      doc.font("Helvetica").fontSize(8);

      data.items.forEach((it, idx) => {
        const rowHeight = it.variant ? 24 : 18;
        if (idx % 2 === 1) {
          doc.rect(left, currentY, pageWidth, rowHeight).fill("#fcfbfa");
        }
        doc.rect(left, currentY + rowHeight, pageWidth, 0.5).fill("#e0d8ce");

        doc.fillColor("#333333").text(String(idx + 1), left + 8, currentY + 5, { width: 20 });
        doc.fillColor("#181818").font("Helvetica-Bold").text(it.title, left + 32, currentY + 5, { width: pageWidth - 230 });
        if (it.variant) {
          doc.font("Helvetica").fillColor("#777777").fontSize(7).text(it.variant, left + 32, currentY + 14, { width: pageWidth - 230 });
          doc.fontSize(8);
        }
        doc.font("Helvetica").fillColor("#333333");
        doc.text(String(it.quantity), left + pageWidth - 190, currentY + 5, { width: 40, align: "center" });
        doc.text(formatInrPdf(it.unitPrice), left + pageWidth - 140, currentY + 5, { width: 60, align: "right" });
        doc.font("Helvetica-Bold").text(formatInrPdf(it.lineTotal), left + pageWidth - 70, currentY + 5, { width: 60, align: "right" });

        currentY += rowHeight;
      });

      // Totals Box
      currentY += 10;
      const totalsWidth = 200;
      const totalsX = left + pageWidth - totalsWidth;

      doc.font("Helvetica").fontSize(8).fillColor("#666666");
      doc.text("Subtotal:", totalsX, currentY);
      doc.font("Helvetica-Bold").fillColor("#222222").text(formatInrPdf(data.subtotal), totalsX + 80, currentY, { width: 120, align: "right" });

      currentY += 14;
      doc.font("Helvetica").fillColor("#666666");
      doc.text(`Shipping${data.pincode ? ` (${data.pincode})` : ""}:`, totalsX, currentY);
      doc.font("Helvetica-Bold").fillColor("#222222").text(
        data.shippingFee === 0 ? "FREE" : formatInrPdf(data.shippingFee),
        totalsX + 80,
        currentY,
        { width: 120, align: "right" }
      );

      if (data.discountAmount > 0) {
        currentY += 14;
        doc.font("Helvetica").fillColor("#2e7d32");
        doc.text(`Discount${data.couponCode ? ` (${data.couponCode})` : ""}:`, totalsX, currentY);
        doc.font("Helvetica-Bold").text(`-${formatInrPdf(data.discountAmount)}`, totalsX + 80, currentY, { width: 120, align: "right" });
      }

      currentY += 16;
      doc.rect(totalsX, currentY - 2, totalsWidth, 22).fill("#fbf6f2");
      doc.rect(totalsX, currentY - 2, totalsWidth, 1).fill("#DD6013");
      doc.rect(totalsX, currentY + 20, totalsWidth, 1).fill("#DD6013");
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#181818").text("TOTAL (INR):", totalsX + 6, currentY + 4);
      doc.fillColor("#DD6013").text(formatInrPdf(data.total), totalsX + 80, currentY + 4, { width: 114, align: "right" });

      // Official Studio Round Seal (Green if PAID, Red if NOT PAID)
      doc.save();
      const sealRadius = 34;
      const sealCx = totalsX + totalsWidth - sealRadius - 12;
      const sealCy = currentY + sealRadius + 18;

      // Slight rotation for authentic rubber-stamp feel
      doc.rotate(isPaid ? -6 : -8, { origin: [sealCx, sealCy] });

      const sealColor = isPaid ? "#1b5e20" : "#c62828";
      const sealColorSub = isPaid ? "#2e7d32" : "#d32f2f";
      const sealColorLight = isPaid ? "#388e3c" : "#e53935";

      // Outer solid circle
      doc.circle(sealCx, sealCy, sealRadius)
        .lineWidth(2)
        .strokeColor(sealColor)
        .stroke();

      // Middle dashed circle
      doc.circle(sealCx, sealCy, sealRadius - 3.5)
        .lineWidth(0.75)
        .dash(3, { space: 2 })
        .strokeColor(sealColorSub)
        .stroke();
      doc.undash();

      // Inner hairline circle
      doc.circle(sealCx, sealCy, sealRadius - 5.5)
        .lineWidth(0.4)
        .strokeColor(sealColorSub)
        .stroke();

      const boxW = sealRadius * 2 - 12;
      const boxX = sealCx - boxW / 2;

      // Header inside round seal
      doc.fillColor(sealColor).font("Helvetica-Bold").fontSize(5.5).text(
        "* MEHANDI BY SANA *",
        boxX,
        sealCy - 23,
        { width: boxW, align: "center" }
      );

      // Horizontal divider above main status text
      doc.moveTo(sealCx - 20, sealCy - 10).lineTo(sealCx + 20, sealCy - 10).lineWidth(0.5).strokeColor(sealColorSub).stroke();

      // Main status text
      const mainText = isPaid ? "PAID" : "NOT PAID";
      const mainFontSize = isPaid ? 14 : 11;
      doc.fillColor(sealColor).font("Helvetica-Bold").fontSize(mainFontSize).text(
        mainText,
        boxX,
        isPaid ? sealCy - 7 : sealCy - 6,
        { width: boxW, align: "center", characterSpacing: 1.2 }
      );

      // Horizontal divider below main status text
      doc.moveTo(sealCx - 20, sealCy + 8).lineTo(sealCx + 20, sealCy + 8).lineWidth(0.5).strokeColor(sealColorSub).stroke();

      // Subtitle
      doc.fillColor(sealColorSub).font("Helvetica-Bold").fontSize(4.6).text(
        isPaid ? "OFFICIALLY VERIFIED" : "PAYMENT PENDING",
        boxX,
        sealCy + 11,
        { width: boxW, align: "center" }
      );

      // Date
      const dateText = String(data.paymentDate || data.invoiceDate || "");
      if (dateText) {
        doc.fillColor(sealColorLight).font("Helvetica").fontSize(4).text(
          dateText,
          boxX,
          sealCy + 19,
          { width: boxW, align: "center" }
        );
      }

      doc.restore();

      // Left Notice Box (Fresh Henna Storage Instructions)
      const noticeY = currentY - 34;
      const noticeWidth = pageWidth - totalsWidth - 20;
      doc.rect(left, noticeY, noticeWidth, 54).fillAndStroke("#fdf8f5", "#f0dfd5");
      doc.fillColor("#DD6013").font("Helvetica-Bold").fontSize(8).text("STORAGE & FRESHNESS NOTICE:", left + 10, noticeY + 8);
      doc.fillColor("#555555").font("Helvetica").fontSize(7.5).text(
        "Fresh organic henna cones contain zero chemical preservatives (0% PPD).\n" +
          "Please transfer cones to your freezer at -18 deg C immediately upon receipt.\n" +
          "Thaw at room temperature for 20 minutes before application.",
        left + 10,
        noticeY + 20,
        { width: noticeWidth - 20, lineGap: 2 }
      );

      // Bottom Footer
      const footerY = doc.page.height - 50;
      doc.rect(left, footerY - 8, pageWidth, 0.5).fill("#e7ddcf");
      doc.fillColor("#777777").font("Helvetica").fontSize(7.5).text(
        "Thank you for your order with Mehandi By Sana! Artisanal 100% Organic Henna.\n" +
          "Queries or support: sana@mehandibysana.com | Helpline: +91-9149648717 | Official Computer-Generated Tax Invoice",
        left,
        footerY,
        { width: pageWidth, align: "center", lineGap: 2 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Save invoice PDF and HTML to persistent storage directory
 */
export async function saveInvoiceFiles(
  data: InvoiceData,
  pdfBuffer: Buffer,
  htmlContent: string
): Promise<{ pdfPath: string; htmlPath: string; relativePdfPath: string }> {
  const dir = getInvoicesStorageDir();
  const safeFilename = data.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  const pdfPath = path.join(dir, `${safeFilename}.pdf`);
  const htmlPath = path.join(dir, `${safeFilename}.html`);

  fs.writeFileSync(pdfPath, pdfBuffer);
  fs.writeFileSync(htmlPath, htmlContent, "utf8");

  return {
    pdfPath,
    htmlPath,
    relativePdfPath: `studio-data/invoices/${safeFilename}.pdf`,
  };
}

/**
 * Generate and dispatch an official invoice email with PDF attachment
 */
export async function sendOrderInvoiceEmail(
  scope: { resolve: (key: string) => any },
  orderId: string,
  options?: {
    forcePaid?: boolean;
    paymentRef?: string;
    recipients?: string[];
    actorId?: string;
  }
): Promise<{
  sent: boolean;
  invoiceNumber: string;
  pdfPath: string;
  htmlPath: string;
  result?: SendEmailResult;
}> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);
  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: orderId },
    fields: [
      "id",
      "display_id",
      "email",
      "status",
      "currency_code",
      "created_at",
      "metadata",
      "summary.*",
      "items.*",
      "items.adjustments.*",
      "shipping_methods.*",
      "shipping_methods.adjustments.*",
      "shipping_address.*",
      "payment_collections.*",
      "payment_collections.payments.*",
    ],
  });

  const order = (orders || [])[0] as any;
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const invoiceData = buildInvoiceDataFromOrder(order, options);
  const [pdfBuffer, htmlInvoice] = await Promise.all([
    generateInvoicePdf(invoiceData),
    generateInvoiceHtml(invoiceData),
  ]);

  const { pdfPath, htmlPath, relativePdfPath } = await saveInvoiceFiles(
    invoiceData,
    pdfBuffer,
    htmlInvoice
  );

  const settings = await ensureStudioEmailSettingsLoaded(scope);
  const isPaid = invoiceData.paymentStatus === "PAID";
  const subject = `Invoice ${invoiceData.invoiceNumber} (${invoiceData.orderNumber}) [${invoiceData.paymentStatus}] — Mehandi By Sana`;

  const recipients = options?.recipients?.length
    ? options.recipients
    : [invoiceData.customerEmail].filter(Boolean);

  const adminEmail = settings.adminEmail || "sana@mehandibysana.com";
  const allRecipients = Array.from(new Set([...recipients, adminEmail])).filter(
    Boolean
  );

  const emailHtml = renderBrandedStudioEmailHtml({
    eyebrow: isPaid ? "Official Tax Invoice & Receipt" : "Order Invoice",
    heading: `Invoice for Order ${invoiceData.orderNumber}`,
    bodyParagraphs: [
      `Assalamu Alaikum / Hello ${invoiceData.customerName},`,
      `Please find attached your official tax invoice (${invoiceData.invoiceNumber}) for order ${invoiceData.orderNumber}.`,
      `Payment Status: ${invoiceData.paymentStatus} (${invoiceData.paymentMethod}${
        invoiceData.paymentRef ? ` · Ref: ${invoiceData.paymentRef}` : ""
      })`,
      `Total: ${formatInr(invoiceData.total)}`,
      "❄️ Storage Reminder: Fresh organic henna cones contain zero chemical preservatives. Please transfer cones to your freezer at -18°C upon delivery.",
    ],
    detailsHtml: `
      <div style="background:#fdf8f5;border:1.5px solid #d4c8b8;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
        <span style="display:inline-block;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:800;letter-spacing:0.08em;background:${
          isPaid ? "#2e7d32" : "#e65100"
        };color:#ffffff;text-transform:uppercase;margin-bottom:8px;">
          ${escapeHtml(invoiceData.paymentStatus)}
        </span>
        <div style="font-size:14px;color:#222;font-weight:600;margin-top:4px;">
          Invoice ${escapeHtml(invoiceData.invoiceNumber)} attached as PDF.
        </div>
        <div style="font-size:12px;color:#666;margin-top:4px;">
          Amount: <strong>${escapeHtml(formatInr(invoiceData.total))}</strong> &middot; Method: ${escapeHtml(
      invoiceData.paymentMethod
    )}
        </div>
      </div>
    `,
    referenceId: invoiceData.invoiceNumber,
    ctaLabel: "Track Your Order",
    ctaUrl: `${invoiceData.storefrontUrl}/track-order?order=${encodeURIComponent(
      invoiceData.orderNumber
    )}&email=${encodeURIComponent(invoiceData.customerEmail)}`,
    storefrontUrl: invoiceData.storefrontUrl,
  });

  const attachments: EmailAttachment[] = [
    {
      filename: `${invoiceData.invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ];

  const result = await sendStudioEmail({
    to: allRecipients,
    subject,
    text: `Invoice ${invoiceData.invoiceNumber} for Order ${invoiceData.orderNumber}\nPayment Status: ${invoiceData.paymentStatus}\nTotal: ${formatInr(invoiceData.total)}\nAttached PDF: ${invoiceData.invoiceNumber}.pdf`,
    html: emailHtml,
    attachments,
    scope,
  });

  // Also dispatch PDF invoice to Telegram
  const telegramCaption = `🧾 <b>Official Tax Invoice (${escapeTelegramHtml(
    invoiceData.invoiceNumber
  )}) [${escapeTelegramHtml(invoiceData.paymentStatus)}]</b>
Order #${escapeTelegramHtml(invoiceData.orderNumber)} &middot; ₹${Number(
    invoiceData.total || 0
  ).toLocaleString("en-IN")}
Customer: ${escapeTelegramHtml(invoiceData.customerName)} (${escapeTelegramHtml(
    invoiceData.customerEmail || "N/A"
  )})
Payment: ${escapeTelegramHtml(invoiceData.paymentMethod)}${
    invoiceData.paymentRef
      ? ` (Ref: <code>${escapeTelegramHtml(invoiceData.paymentRef)}</code>)`
      : ""
  }`.trim();

  void sendTelegramDocument(pdfBuffer, `${invoiceData.invoiceNumber}.pdf`, {
    caption: telegramCaption,
    mimeType: "application/pdf",
  });

  // Update order metadata with invoice details
  const existingMeta = (order.metadata || {}) as Record<string, unknown>;
  const nowIso = new Date().toISOString();
  await updateOrderWorkflow(scope as any)
    .run({
      input: {
        id: order.id,
        user_id: options?.actorId || "system",
        metadata: {
          ...existingMeta,
          invoice_number: invoiceData.invoiceNumber,
          invoice_generated_at: nowIso,
          invoice_sent_at: result.sent ? nowIso : null,
          invoice_payment_status: invoiceData.paymentStatus.toLowerCase(),
          invoice_pdf_path: relativePdfPath,
          ...(options?.forcePaid ? { payment_status: "paid", paid_at: nowIso } : {}),
        },
      },
    })
    .catch((err) => {
      console.warn(`[Invoice] Metadata update failed on ${order.id}:`, err);
    });

  return {
    sent: result.sent,
    invoiceNumber: invoiceData.invoiceNumber,
    pdfPath,
    htmlPath,
    result,
  };
}
