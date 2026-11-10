import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  deriveOrderNumber,
  formatOrderPaymentMethodLabel,
  normalizeFulfillmentStage,
  sanitizeHttpUrl,
} from "../../../lib/studio-order-meta";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rawOrder = String(req.query.orderNumber || req.query.order || "")
    .trim()
    .replace(/^#/, "");
  const rawEmail = String(req.query.email || "")
    .trim()
    .toLowerCase();

  if (!rawOrder || !rawEmail) {
    return res.status(400).json({
      found: false,
      message: "Please enter both your Order Reference (e.g. MBS-237270) and Email Address.",
    });
  }

  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "status",
        "currency_code",
        "created_at",
        "metadata",
        "items.*",
        "items.adjustments.*",
        "shipping_methods.*",
        "shipping_methods.adjustments.*",
        "shipping_address.*",
        "payment_collections.*",
      ],
    });

    const normalizedTarget = rawOrder.toLowerCase();

    const matched = (orders || []).find((o: any) => {
      const orderEmail = String(o.email || "").trim().toLowerCase();
      if (orderEmail !== rawEmail) return false;

      const metaOrderNum = String(o.metadata?.order_number || "").toLowerCase();
      const wcOrderNum = String(o.metadata?.wc_order_number || "").toLowerCase();
      const wooOrderId =
        o.metadata?.woo_order_id !== undefined && o.metadata?.woo_order_id !== null
          ? String(o.metadata.woo_order_id).toLowerCase()
          : "";
      const displayIdStr = o.display_id !== undefined ? String(o.display_id) : "";

      return (
        metaOrderNum === normalizedTarget ||
        wcOrderNum === normalizedTarget ||
        (wooOrderId !== "" &&
          (wooOrderId === normalizedTarget || `wc-${wooOrderId}` === normalizedTarget)) ||
        displayIdStr === normalizedTarget ||
        `mbs-${displayIdStr}` === normalizedTarget
      );
    });

    if (!matched) {
      return res.status(404).json({
        found: false,
        message:
          "No matching order was found for that Order Reference and Email combination. Please check your confirmation receipt.",
      });
    }

    const meta = (matched.metadata || {}) as Record<string, any>;
    const status = String(matched.status || "pending").toLowerCase();
    const fulfillmentStage = normalizeFulfillmentStage(meta.fulfillment_stage, status);

    const items = Array.isArray(matched.items)
      ? matched.items.map((item: any) => ({
          id: item.id,
          title: item.title || "Organic Henna Item",
          variantTitle: item.metadata?.variant_title || "",
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unit_price) || 0,
        }))
      : [];

    const itemsSubtotal = items.reduce(
      (acc: number, it: any) => acc + it.unitPrice * it.quantity,
      0
    );
    const hasMetaSubtotal =
      meta.subtotal !== undefined &&
      meta.subtotal !== null &&
      String(meta.subtotal).trim() !== "" &&
      Number.isFinite(Number(meta.subtotal));
    const subtotal = hasMetaSubtotal ? Number(meta.subtotal) : itemsSubtotal;

    const methodsShipping = Array.isArray(matched.shipping_methods)
      ? matched.shipping_methods.reduce(
          (acc: number, sm: any) => acc + (Number(sm.amount) || 0),
          0
        )
      : 0;
    const hasMetaShipping =
      meta.shipping_fee !== undefined &&
      meta.shipping_fee !== null &&
      String(meta.shipping_fee).trim() !== "" &&
      Number.isFinite(Number(meta.shipping_fee));
    const shippingFee =
      Array.isArray(matched.shipping_methods) &&
      matched.shipping_methods.length > 0
        ? methodsShipping
        : hasMetaShipping
          ? Number(meta.shipping_fee)
          : 0;

    let adjustmentsTotal = 0;
    let firstAdjustmentCode = "";
    for (const item of matched.items || []) {
      for (const adj of item?.adjustments || []) {
        adjustmentsTotal += Number(adj?.amount) || 0;
        if (!firstAdjustmentCode && adj?.code) {
          firstAdjustmentCode = String(adj.code);
        }
      }
    }
    for (const sm of matched.shipping_methods || []) {
      for (const adj of sm?.adjustments || []) {
        adjustmentsTotal += Number(adj?.amount) || 0;
        if (!firstAdjustmentCode && adj?.code) {
          firstAdjustmentCode = String(adj.code);
        }
      }
    }

    const hasMetaDiscount =
      meta.discount_amount !== undefined &&
      meta.discount_amount !== null &&
      String(meta.discount_amount).trim() !== "" &&
      Number.isFinite(Number(meta.discount_amount));
    const discountAmount = Math.round(
      (hasMetaDiscount ? Number(meta.discount_amount) : adjustmentsTotal) * 100
    ) / 100;
    const couponCode = String(meta.coupon_code || firstAdjustmentCode || "")
      .trim()
      .toUpperCase();

    const hasMetaTotal =
      meta.total !== undefined &&
      meta.total !== null &&
      String(meta.total).trim() !== "" &&
      Number.isFinite(Number(meta.total));
    const total = hasMetaTotal
      ? Math.max(0, Number(meta.total))
      : Math.max(
          0,
          Math.round((subtotal + shippingFee - discountAmount) * 100) / 100
        );

    const paymentCollections = Array.isArray((matched as any).payment_collections)
      ? (matched as any).payment_collections.filter(
          (pc: any) => pc && pc.status !== "canceled"
        )
      : [];
    const nativeRefunded = paymentCollections.some(
      (pc: any) => Number(pc.refunded_amount || 0) > 0
    );
    const nativeCaptured = paymentCollections.some(
      (pc: any) =>
        pc.status === "completed" || Number(pc.captured_amount || 0) > 0
    );
    const resolvedTrackPaymentStatus = nativeRefunded
      ? "refunded"
      : nativeCaptured
        ? "paid"
        : meta.payment_status || (status === "completed" ? "paid" : "pending");

    return res.status(200).json({
      found: true,
      order: {
        id: matched.id,
        orderNumber: deriveOrderNumber(matched),
        createdAt: matched.created_at,
        status,
        fulfillmentStage,
        paymentMethod: formatOrderPaymentMethodLabel(
          meta.payment_method || meta.payment_method_title
        ),
        paymentStatus: resolvedTrackPaymentStatus,
        paymentId: meta.payment_id || "",
        trackingNumber: meta.tracking_number || "",
        trackingUrl: sanitizeHttpUrl(meta.tracking_url),
        courierName: meta.courier_name || "Mehandi by Sana Dispatch",
        dispatchNote: meta.dispatch_note ? String(meta.dispatch_note) : "",
        pincodeRule: meta.pincode_rule || "*",
        couponCode,
        discountAmount,
        subtotal,
        shippingFee,
        total,
        shippingAddress: matched.shipping_address
          ? {
              firstName: matched.shipping_address.first_name || "",
              lastName: matched.shipping_address.last_name || "",
              city: matched.shipping_address.city || "",
              province: matched.shipping_address.province || "",
              postalCode: matched.shipping_address.postal_code || "",
            }
          : null,
        items,
      },
    });
  } catch (error: any) {
    console.error("[Track Order Error]:", error);
    return res.status(500).json({
      found: false,
      message: error?.message || "Unable to look up order status right now.",
    });
  }
}

