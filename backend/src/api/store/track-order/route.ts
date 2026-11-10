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
        "shipping_address.*",
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

    const subtotal =
      Number(meta.subtotal) ||
      items.reduce((acc: number, it: any) => acc + it.unitPrice * it.quantity, 0);
    const shippingFee = Number(meta.shipping_fee) || 0;
    const total = Number(meta.total) || subtotal + shippingFee;

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
        paymentStatus: meta.payment_status || (status === "completed" ? "paid" : "pending"),
        paymentId: meta.payment_id || "",
        trackingNumber: meta.tracking_number || "",
        trackingUrl: sanitizeHttpUrl(meta.tracking_url),
        courierName: meta.courier_name || "Srinagar Studio Express",
        dispatchNote: meta.dispatch_note ? String(meta.dispatch_note) : "",
        pincodeRule: meta.pincode_rule || "*",
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

