import fs from "fs";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  buildInvoiceDataFromOrder,
  generateInvoicePdf,
  generateInvoiceHtml,
  saveInvoiceFiles,
  sendOrderInvoiceEmail,
} from "../../../../../lib/invoice-generator";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const format = String(req.query.format || "pdf").toLowerCase();
    const isDownload = req.query.download === "true" || req.query.download === "1";
    const forcePaid = req.query.forcePaid === "true" || req.query.forcePaid === "1";

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data: orders } = await query.graph({
      entity: "order",
      filters: { id },
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
      return res.status(404).json({ success: false, message: `Order ${id} not found` });
    }

    const invoiceData = buildInvoiceDataFromOrder(order, { forcePaid });

    if (format === "html") {
      const html = generateInvoiceHtml(invoiceData);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    }

    const pdfBuffer = await generateInvoicePdf(invoiceData);
    // Auto-save on access if not present
    const html = generateInvoiceHtml(invoiceData);
    void saveInvoiceFiles(invoiceData, pdfBuffer, html).catch((err) =>
      console.warn(`[Invoice] Background save failed:`, err)
    );

    const disposition = isDownload ? "attachment" : "inline";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${invoiceData.invoiceNumber}.pdf"`
    );
    res.setHeader("Content-Length", String(pdfBuffer.length));
    return res.end(pdfBuffer);
  } catch (err: any) {
    console.error("[Invoice Route] Error generating invoice:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate invoice",
    });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const body = (req.body || {}) as {
      forcePaid?: boolean;
      paymentRef?: string;
      recipients?: string[];
    };

    const outcome = await sendOrderInvoiceEmail(req.scope, id, {
      forcePaid: Boolean(body.forcePaid),
      paymentRef: body.paymentRef,
      recipients: Array.isArray(body.recipients) ? body.recipients : undefined,
      actorId: (req as any).user?.id,
    });

    return res.status(200).json({
      success: true,
      message: `Invoice ${outcome.invoiceNumber} dispatched successfully.`,
      ...outcome,
    });
  } catch (err: any) {
    console.error("[Invoice Route] Error dispatching invoice:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to dispatch invoice email",
    });
  }
}
