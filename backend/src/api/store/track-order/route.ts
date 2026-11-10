import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

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
      const displayIdStr = o.display_id !== undefined ? String(o.display_id) : "";

      return (
        metaOrderNum === normalizedTarget ||
        wcOrderNum === normalizedTarget ||
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
    const fulfillmentStage =
      status === "canceled" || status === "cancelled"
        ? "cancelled"
        : meta.fulfillment_stage
          ? String(meta.fulfillment_stage)
          : status === "completed"
            ? "preparing"
            : "received";

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
        orderNumber:
          meta.order_number ||
          meta.wc_order_number ||
          `MBS-${matched.display_id || matched.id.slice(-6).toUpperCase()}`,
        createdAt: matched.created_at,
        status,
        fulfillmentStage,
        paymentMethod:
          meta.payment_method === "razorpay"
            ? "Razorpay Online"
            : String(meta.payment_method || "Cash on Delivery").toUpperCase(),
        paymentStatus: meta.payment_status || (status === "completed" ? "paid" : "pending"),
        paymentId: meta.payment_id || "",
        trackingNumber: meta.tracking_number || "",
        courierName: meta.courier_name || "Srinagar Studio Express",
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

