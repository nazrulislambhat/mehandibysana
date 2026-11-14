import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateOrderWorkflow } from "@medusajs/medusa/core-flows";
import { ensureStudioEmailSettingsLoaded } from "./email-settings";
import {
  dispatchStudioNotification,
  type DispatchNotificationResult,
  type NotificationEvent,
} from "./notifications";
import {
  deriveOrderNumber,
  formatOrderPaymentMethodLabel,
  normalizeFulfillmentStage,
} from "./studio-order-meta";

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

export function isDeliverableCustomerEmail(raw: unknown): boolean {
  const email = String(raw || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
  if (email === "guest@mehandibysana.com") return false;
  return true;
}

interface ComputedOrderBreakdown {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  addressText: string;
  pincode: string;
  items: Array<{
    title: string;
    variant: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  couponCode: string;
  discountAmount: number;
  total: number;
  paymentMethodLabel: string;
  paymentStatusLabel: string;
  paymentRef: string;
  courierName: string;
  trackingNumber: string;
  trackingUrl: string;
  dispatchNote: string;
}

async function loadOrderForEmail(
  scope: { resolve: (key: string) => any },
  orderId: string
): Promise<{ order: any; breakdown: ComputedOrderBreakdown } | null> {
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
      "fulfillments.*",
      "fulfillments.labels.*",
    ],
  });

  const order = (orders || [])[0] as any;
  if (!order) return null;

  const meta = (order.metadata || {}) as Record<string, unknown>;
  const shipAddr = order.shipping_address || {};
  const firstName = String(shipAddr.first_name || "Customer").trim();
  const lastName = String(shipAddr.last_name || "").trim();
  const customerName = `${firstName} ${lastName}`.trim() || "Customer";
  const email = String(order.email || "").trim().toLowerCase();
  const phone = String(shipAddr.phone || "").trim();
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
  const addressText = addrParts.join(", ");

  const rawItems = Array.isArray(order.items) ? order.items : [];
  const items = rawItems.map((it: any) => {
    const qty = Math.max(1, Number(it.quantity) || 1);
    const unitPrice = Math.max(0, Number(it.unit_price) || 0);
    const variant = String(
      it.variant_title || it.metadata?.variant_title || ""
    ).trim();
    return {
      title: String(it.title || "Henna Product").trim(),
      variant,
      quantity: qty,
      unitPrice,
      lineTotal: unitPrice * qty,
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
    nativeCaptured || metaPayStatus === "paid" || order.status === "completed";
  const paymentStatusLabel =
    metaPayStatus === "refunded"
      ? "Refunded"
      : isPaid
        ? "Paid"
        : "Pending Payment";

  const paymentMethodLabel = formatOrderPaymentMethodLabel(meta.payment_method);
  const paymentRef = String(meta.payment_id || "").trim();

  // Pull courier/tracking either from studio metadata or Medusa fulfillment labels
  const fulfillments = Array.isArray(order.fulfillments) ? order.fulfillments : [];
  let labelTrackingNumber = "";
  let labelTrackingUrl = "";
  for (const ful of fulfillments) {
    for (const lbl of ful?.labels || []) {
      if (!labelTrackingNumber && lbl?.tracking_number) {
        labelTrackingNumber = String(lbl.tracking_number).trim();
      }
      if (!labelTrackingUrl && lbl?.tracking_url) {
        labelTrackingUrl = String(lbl.tracking_url).trim();
      }
    }
  }

  return {
    order,
    breakdown: {
      orderNumber: deriveOrderNumber(order),
      customerName,
      email,
      phone,
      addressText,
      pincode,
      items,
      subtotal,
      shippingFee,
      couponCode: String(meta.coupon_code || "").trim(),
      discountAmount,
      total,
      paymentMethodLabel,
      paymentStatusLabel,
      paymentRef,
      courierName: String(meta.courier_name || "").trim(),
      trackingNumber: String(meta.tracking_number || labelTrackingNumber || "").trim(),
      trackingUrl: String(meta.tracking_url || labelTrackingUrl || "").trim(),
      dispatchNote: String(meta.dispatch_note || "").trim(),
    },
  };
}

function renderOrderDetailsTableHtml(
  b: ComputedOrderBreakdown,
  shipment?: {
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  }
): string {
  const itemRows = b.items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eeeeee;font-size:14px;color:#111111;">
          <strong>${escapeHtml(it.title)}</strong>${
            it.variant
              ? `<br/><span style="font-size:12px;color:#6b6560;">${escapeHtml(it.variant)}</span>`
              : ""
          }
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #eeeeee;font-size:14px;color:#111111;text-align:center;">
          &times;${it.quantity}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #eeeeee;font-size:14px;color:#111111;text-align:right;white-space:nowrap;">
          ${escapeHtml(formatInr(it.lineTotal))}
        </td>
      </tr>`
    )
    .join("");

  const shippingBoxHtml = shipment?.courierName
    ? `<div style="margin-bottom:16px;padding:14px 16px;border:1px solid #f0dfd5;border-radius:8px;background-color:#fdf8f5;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#d9541e;">
          Shipment &amp; Courier Details
        </p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#111111;">
          <strong>Courier:</strong> ${escapeHtml(shipment.courierName)}<br/>
          ${
            shipment.trackingNumber
              ? `<strong>Tracking ID / AWB:</strong> <span style="font-family:monospace;">${escapeHtml(
                  shipment.trackingNumber
                )}</span><br/>`
              : ""
          }
          ${
            shipment.trackingUrl
              ? `<strong>Live Courier Link:</strong> <a href="${escapeHtml(
                  shipment.trackingUrl
                )}" style="color:#d9541e;text-decoration:underline;">${escapeHtml(
                  shipment.trackingUrl
                )}</a>`
              : ""
          }
        </p>
      </div>`
    : "";

  const discountRow =
    b.discountAmount > 0
      ? `<tr>
          <td colspan="2" style="padding:6px 12px;font-size:13px;color:#789904;font-weight:600;">
            Discount${b.couponCode ? ` (${escapeHtml(b.couponCode)})` : ""}
          </td>
          <td style="padding:6px 12px;font-size:13px;color:#789904;font-weight:600;text-align:right;white-space:nowrap;">
            -${escapeHtml(formatInr(b.discountAmount))}
          </td>
        </tr>`
      : "";

  return `
    ${shippingBoxHtml}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #d4c8b8;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background-color:#E7DDCF;">
          <th align="left" style="padding:10px 12px;border-bottom:1px solid #d4c8b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#3D3D3D;">Item</th>
          <th align="center" style="padding:10px 12px;border-bottom:1px solid #d4c8b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#3D3D3D;">Qty</th>
          <th align="right" style="padding:10px 12px;border-bottom:1px solid #d4c8b8;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#3D3D3D;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr>
          <td colspan="2" style="padding:8px 12px 4px;font-size:13px;color:#6b6357;">Subtotal</td>
          <td style="padding:8px 12px 4px;font-size:13px;color:#3D3D3D;text-align:right;white-space:nowrap;">${escapeHtml(
            formatInr(b.subtotal)
          )}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 12px;font-size:13px;color:#6b6357;">Shipping${
            b.pincode ? ` (PIN ${escapeHtml(b.pincode)})` : ""
          }</td>
          <td style="padding:4px 12px;font-size:13px;color:#3D3D3D;text-align:right;white-space:nowrap;">${escapeHtml(
            b.shippingFee === 0 ? "Free" : formatInr(b.shippingFee)
          )}</td>
        </tr>
        ${discountRow}
        <tr style="background-color:#f4efe8;">
          <td colspan="2" style="padding:10px 12px;border-top:1px solid #d4c8b8;font-size:15px;font-weight:700;color:#181818;">Total</td>
          <td style="padding:10px 12px;border-top:1px solid #d4c8b8;font-size:15px;font-weight:700;color:#DD6013;text-align:right;white-space:nowrap;">${escapeHtml(
            formatInr(b.total)
          )}</td>
        </tr>
      </tbody>
    </table>
    <div style="margin-top:14px;padding:12px 14px;border:1px solid #d4c8b8;border-radius:8px;background-color:#fbf9f6;font-size:13px;line-height:1.6;color:#3D3D3D;">
      <strong>Payment:</strong> ${escapeHtml(b.paymentStatusLabel)} &middot; ${escapeHtml(
        b.paymentMethodLabel
      )}${b.paymentRef ? ` (Ref: ${escapeHtml(b.paymentRef)})` : ""}<br/>
      ${
        b.addressText
          ? `<strong>Delivery To:</strong> ${escapeHtml(b.customerName)} &mdash; ${escapeHtml(
              b.addressText
            )}${b.phone ? ` &middot; ${escapeHtml(b.phone)}` : ""}`
          : ""
      }
    </div>
  `;
}

export interface OrderEmailOutcome {
  sent: boolean;
  skipped?: boolean;
  skippedReason?: string;
  result?: DispatchNotificationResult;
}

export async function sendOrderConfirmationEmail(
  scope: { resolve: (key: string) => any },
  orderId: string,
  options?: {
    force?: boolean;
    skipAdminAlert?: boolean;
    actorId?: string;
  }
): Promise<OrderEmailOutcome> {
  const settings = await ensureStudioEmailSettingsLoaded(scope);
  if (!options?.force && !settings.autoSendOrderConfirmation) {
    return {
      sent: false,
      skipped: true,
      skippedReason: "Auto order confirmation email is turned off in Email Settings.",
    };
  }

  const loaded = await loadOrderForEmail(scope, orderId);
  if (!loaded) {
    return {
      sent: false,
      skipped: true,
      skippedReason: `Order ${orderId} not found.`,
    };
  }

  const { order, breakdown: b } = loaded;
  const existingMeta = (order.metadata || {}) as Record<string, unknown>;

  if (
    !options?.force &&
    (existingMeta.order_confirmation_email_sent === true ||
      Boolean(existingMeta.order_confirmation_email_sent_at))
  ) {
    return {
      sent: true,
      skipped: true,
      skippedReason: "Order confirmation email was already dispatched.",
    };
  }

  if (!isDeliverableCustomerEmail(b.email)) {
    return {
      sent: false,
      skipped: true,
      skippedReason: "Order has no valid customer email address.",
    };
  }

  const itemLines = b.items
    .map(
      (it) =>
        `- ${it.title}${it.variant ? ` (${it.variant})` : ""} x${it.quantity}: ${formatInr(
          it.lineTotal
        )}`
    )
    .join("\n");

  const couponLine =
    b.couponCode && b.discountAmount > 0
      ? `Coupon ${b.couponCode}: -${formatInr(b.discountAmount)}\n`
      : "";

  const summary = [
    `Thank you for your order (${b.orderNumber}) with Mehandi by Sana! Fresh small-batch botanicals are being prepared for you across Srinagar & Bengaluru.`,
    `Items Ordered:\n${itemLines}\n\nSubtotal: ${formatInr(b.subtotal)}\nShipping${
      b.pincode ? ` (PIN ${b.pincode})` : ""
    }: ${b.shippingFee === 0 ? "Free" : formatInr(b.shippingFee)}\n${couponLine}Total: ${formatInr(
      b.total
    )}`,
    `Payment: ${b.paymentStatusLabel} (${b.paymentMethodLabel})${
      b.paymentRef ? ` · Ref: ${b.paymentRef}` : ""
    }${b.addressText ? `\nDelivery Address: ${b.customerName}, ${b.addressText}` : ""}`,
  ].join("\n\n");

  const result = await dispatchStudioNotification({
    scope,
    type: "order_confirmed",
    recipientEmail: b.email,
    recipientName: b.customerName,
    recipientPhone: b.phone,
    referenceId: b.orderNumber,
    summary,
    detailsHtml: renderOrderDetailsTableHtml(b),
    skipAdminAlert: options?.skipAdminAlert,
    details: {
      orderId: order.id,
      orderNumber: b.orderNumber,
      subtotal: b.subtotal,
      shippingFee: b.shippingFee,
      couponCode: b.couponCode,
      discountAmount: b.discountAmount,
      total: b.total,
      pincode: b.pincode,
      paymentStatus: b.paymentStatusLabel,
      paymentMethod: b.paymentMethodLabel,
    },
  });

  const nowIso = new Date().toISOString();
  await updateOrderWorkflow(scope as any)
    .run({
      input: {
        id: order.id,
        user_id: options?.actorId || "system",
        metadata: {
          ...existingMeta,
          order_confirmation_email_attempted_at: nowIso,
          order_confirmation_email_sent: result.customerEmailSent,
          ...(result.customerEmailSent
            ? { order_confirmation_email_sent_at: nowIso }
            : {}),
          order_confirmation_email_provider: result.provider,
          order_confirmation_email_error: result.error || "",
        },
      },
    })
    .catch((err) => {
      console.warn(
        `[Order Email] Non-fatal metadata update failure on ${order.id}:`,
        err
      );
    });

  return {
    sent: result.customerEmailSent,
    result,
  };
}

export async function sendOrderShippingEmail(
  scope: { resolve: (key: string) => any },
  orderId: string,
  options?: {
    kind?: "dispatched" | "delivered" | "preparing" | "completed" | "payment_receipt";
    force?: boolean;
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    dispatchNote?: string;
    skipAdminAlert?: boolean;
    actorId?: string;
  }
): Promise<OrderEmailOutcome> {
  const settings = await ensureStudioEmailSettingsLoaded(scope);
  const loaded = await loadOrderForEmail(scope, orderId);
  if (!loaded) {
    return {
      sent: false,
      skipped: true,
      skippedReason: `Order ${orderId} not found.`,
    };
  }

  const { order, breakdown: b } = loaded;
  const existingMeta = (order.metadata || {}) as Record<string, unknown>;

  if (!isDeliverableCustomerEmail(b.email)) {
    return {
      sent: false,
      skipped: true,
      skippedReason: "Order has no real customer email address on file.",
    };
  }

  const resolvedStage = normalizeFulfillmentStage(
    existingMeta.fulfillment_stage,
    order.status
  );
  const kind =
    options?.kind ||
    (resolvedStage === "delivered"
      ? "delivered"
      : resolvedStage === "dispatched"
        ? "dispatched"
        : "dispatched");

  if (!options?.force && kind === "dispatched" && !settings.autoSendShippingEmail) {
    return {
      sent: false,
      skipped: true,
      skippedReason: "Auto shipping notification email is turned off in Email Settings.",
    };
  }

  const courierName =
    options?.courierName?.trim() || b.courierName || "Local Courier";
  const trackingNumber =
    options?.trackingNumber?.trim() || b.trackingNumber || "";
  const trackingUrl = options?.trackingUrl?.trim() || b.trackingUrl || "";
  const dispatchNote = options?.dispatchNote?.trim() || b.dispatchNote || "";

  let notifType: NotificationEvent["type"] = "order_dispatched";
  const summaryLines: string[] = [];

  if (kind === "payment_receipt") {
    notifType = "order_payment_offline";
    summaryLines.push(
      `We have recorded your payment${
        b.total > 0 ? ` of ${formatInr(b.total)}` : ""
      } via ${b.paymentMethodLabel}${
        b.paymentRef ? ` (Ref: ${b.paymentRef})` : ""
      } for order ${b.orderNumber}.`
    );
    if (resolvedStage === "dispatched" && courierName) {
      summaryLines.push(
        `Shipment Status: Dispatched via ${courierName}${
          trackingNumber ? ` (${trackingNumber})` : ""
        }.`
      );
    }
  } else if (kind === "delivered") {
    notifType = "order_delivered";
    summaryLines.push(
      `Your Mehandi by Sana order (${b.orderNumber}) has been delivered${
        courierName ? ` via ${courierName}` : ""
      }. We hope your organic henna cones stain rich and deep!`
    );
  } else if (kind === "completed") {
    notifType = "order_completed";
    summaryLines.push(
      `Your Mehandi by Sana order (${b.orderNumber}) has been marked completed.`
    );
  } else if (kind === "preparing") {
    notifType = "order_preparing";
    summaryLines.push(
      `Your Mehandi by Sana order (${b.orderNumber}) is currently being freshly mixed and packed in small batches.`
    );
  } else {
    notifType = "order_dispatched";
    summaryLines.push(
      `Good news! Your Mehandi by Sana order (${b.orderNumber}) has been shipped via ${courierName}.`
    );
    if (trackingNumber) {
      summaryLines.push(`Tracking / AWB Details: ${trackingNumber}`);
    }
    if (trackingUrl) {
      summaryLines.push(`Track Parcel Online: ${trackingUrl}`);
    }
  }

  summaryLines.push(
    `Payment Status: ${b.paymentStatusLabel} (${b.paymentMethodLabel}${
      b.paymentRef ? ` · Ref: ${b.paymentRef}` : ""
    })`
  );

  if (dispatchNote) {
    summaryLines.push(`Dispatch Note: ${dispatchNote}`);
  }

  const showShipmentBox =
    notifType === "order_dispatched" || notifType === "order_delivered";

  const result = await dispatchStudioNotification({
    scope,
    type: notifType,
    recipientEmail: b.email,
    recipientName: b.customerName,
    recipientPhone: b.phone,
    referenceId: b.orderNumber,
    summary: summaryLines.join("\n\n"),
    detailsHtml: renderOrderDetailsTableHtml(
      b,
      showShipmentBox
        ? { courierName, trackingNumber, trackingUrl }
        : undefined
    ),
    skipAdminAlert: options?.skipAdminAlert ?? true,
  });

  const nowIso = new Date().toISOString();
  const telemetryPatch: Record<string, unknown> =
    notifType === "order_dispatched" || notifType === "order_delivered"
      ? {
          shipping_email_attempted_at: nowIso,
          shipping_email_sent: result.customerEmailSent,
          ...(result.customerEmailSent ? { shipping_email_sent_at: nowIso } : {}),
          shipping_email_provider: result.provider,
          shipping_email_error: result.error || "",
        }
      : notifType === "order_payment_offline"
        ? {
            payment_email_attempted_at: nowIso,
            payment_email_sent: result.customerEmailSent,
            ...(result.customerEmailSent ? { payment_email_sent_at: nowIso } : {}),
            payment_email_provider: result.provider,
            payment_email_error: result.error || "",
          }
        : {};

  if (Object.keys(telemetryPatch).length > 0) {
    await updateOrderWorkflow(scope as any)
      .run({
        input: {
          id: order.id,
          user_id: options?.actorId || "system",
          metadata: {
            ...existingMeta,
            ...telemetryPatch,
          },
        },
      })
      .catch((err) => {
        console.warn(
          `[Order Email] Non-fatal shipping email metadata failure on ${order.id}:`,
          err
        );
      });
  }

  return {
    sent: result.customerEmailSent,
    result,
  };
}

