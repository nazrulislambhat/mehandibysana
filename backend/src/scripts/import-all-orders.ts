import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import * as fs from "fs";
import * as path from "path";
import { syncOrderNativePayment } from "../lib/sync-order-payment";

export default async function importAllOrders({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const orderService = container.resolve(Modules.ORDER);

  logger.info("=====================================================");
  logger.info("       IMPORTING ALL ORDERS INTO MEDUSAJS v2        ");
  logger.info("=====================================================");

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  });
  const indiaRegion =
    regions.find((r: any) => r.currency_code === "inr") || regions[0];

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  });
  const salesChannel = salesChannels[0];

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email"],
  });
  const customerMap = new Map<string, string>();
  for (const c of customers) {
    if (c.email) {
      customerMap.set(c.email.toLowerCase().trim(), c.id);
    }
  }

  const ordersFilePath = path.resolve(
    __dirname,
    "../../../migration/data/raw/orders.json"
  );
  if (!fs.existsSync(ordersFilePath)) {
    logger.error("orders.json not found in migration/data/raw!");
    return;
  }

  const rawOrders = JSON.parse(fs.readFileSync(ordersFilePath, "utf8"));
  logger.info(`Loaded ${rawOrders.length} raw orders from WooCommerce.`);

  // Check already imported woo_order_ids
  const { data: existingOrders } = await query.graph({
    entity: "order",
    fields: ["id", "metadata"],
  });
  const existingWooIds = new Set(
    existingOrders
      .map((o: any) => o.metadata?.woo_order_id)
      .filter(Boolean)
  );
  logger.info(`Already existing orders in Medusa: ${existingWooIds.size}`);

  const ordersToImport = rawOrders.filter(
    (o: any) => !existingWooIds.has(o.id)
  );
  logger.info(`Orders to import: ${ordersToImport.length}`);

  let successCount = 0;
  let errorCount = 0;

  // Process in batches
  const batchSize = 25;
  for (let i = 0; i < ordersToImport.length; i += batchSize) {
    const batch = ordersToImport.slice(i, i + batchSize);
    const orderDTOs: any[] = [];
    const batchMeta: Array<{
      isSettled: boolean;
      paymentMethod: string;
      paymentReference: string;
      paidAt: string | null;
    }> = [];

    for (const o of batch) {
      const email =
        o.billing?.email?.toLowerCase().trim() || "guest@mehandibysana.com";
      const customerId = customerMap.get(email);

      const items = (o.line_items || []).map((li: any) => ({
        title: li.name || "Henna Item",
        quantity: Math.max(1, Number(li.quantity) || 1),
        unit_price: Math.max(
          0,
          parseFloat(
            li.price || (parseFloat(li.total || "0") / (li.quantity || 1)).toString()
          ) || 0
        ),
        metadata: {
          woo_product_id: li.product_id,
          woo_variation_id: li.variation_id,
        },
      }));

      const shippingAmount = Math.max(0, parseFloat(o.shipping_total || "0") || 0);
      const shippingMethodTitle =
        o.shipping_lines?.[0]?.method_title ||
        (shippingAmount === 0 ? "Free Shipping" : "Studio Shipping");

      if (items.length === 0) {
        items.push({
          title: "Henna Item",
          quantity: 1,
          unit_price: Math.max(0, (parseFloat(o.total || "0") || 0) - shippingAmount),
        });
      }

      const itemsSubtotal = items.reduce(
        (sum: number, it: any) => sum + it.unit_price * it.quantity,
        0
      );

      let status = "pending";
      if (o.status === "completed") status = "completed";
      else if (o.status === "cancelled" || o.status === "refunded") status = "canceled";

      const paymentMethod = String(o.payment_method || "").trim().toLowerCase();
      const txId = String(o.transaction_id || "").trim();
      const rawPaidAt =
        o.date_paid ||
        o.meta_data?._paid_date ||
        (o.meta_data?._date_paid
          ? new Date(Number(o.meta_data._date_paid) * 1000).toISOString()
          : null);
      const isSettled =
        status === "completed" ||
        (paymentMethod === "razorpay" && Boolean(txId)) ||
        Boolean(rawPaidAt);

      batchMeta.push({
        isSettled,
        paymentMethod: paymentMethod || "cod",
        paymentReference: txId,
        paidAt: rawPaidAt ? new Date(rawPaidAt).toISOString() : null,
      });

      orderDTOs.push({
        region_id: indiaRegion.id,
        sales_channel_id: salesChannel.id,
        customer_id: customerId,
        email,
        currency_code: "inr",
        status,
        shipping_address: {
          first_name: o.shipping?.first_name || o.billing?.first_name || "Customer",
          last_name: o.shipping?.last_name || o.billing?.last_name || "",
          address_1: o.shipping?.address_1 || o.billing?.address_1 || "Address",
          address_2: o.shipping?.address_2 || o.billing?.address_2 || "",
          city: o.shipping?.city || o.billing?.city || "Srinagar",
          postal_code: o.shipping?.postcode || o.billing?.postcode || "190001",
          country_code: "in",
          phone: o.billing?.phone || "",
        },
        billing_address: {
          first_name: o.billing?.first_name || "Customer",
          last_name: o.billing?.last_name || "",
          address_1: o.billing?.address_1 || "Address",
          address_2: o.billing?.address_2 || "",
          city: o.billing?.city || "Srinagar",
          postal_code: o.billing?.postcode || "190001",
          country_code: "in",
          phone: o.billing?.phone || "",
        },
        items,
        shipping_methods: [
          {
            name: shippingMethodTitle,
            amount: shippingAmount,
            is_tax_inclusive: false,
            is_custom_amount: true,
          },
        ],
        metadata: {
          woo_order_id: o.id,
          woo_status: o.status,
          payment_method: paymentMethod || "cod",
          payment_method_title: o.payment_method_title,
          payment_id: txId,
          payment_status: isSettled ? "paid" : "pending",
          ...(rawPaidAt ? { payment_paid_at: rawPaidAt } : {}),
          woo_date_created: o.date_created,
          subtotal: itemsSubtotal,
          shipping_fee: shippingAmount,
          discount_amount: Math.max(0, parseFloat(o.discount_total || "0") || 0),
          total: o.total,
          customer_note: o.customer_note || "",
        },
      });
    }

    try {
      const createdOrders = await orderService.createOrders(orderDTOs);
      const list = Array.isArray(createdOrders) ? createdOrders : [createdOrders];

      for (let idx = 0; idx < list.length; idx += 1) {
        const created = list[idx];
        const info = batchMeta[idx];
        if (!created?.id || created.status === "canceled") continue;
        try {
          await syncOrderNativePayment(container, {
            orderId: created.id,
            paymentStatus: info.isSettled ? "paid" : "pending",
            paymentMethod: info.paymentMethod,
            paymentReference: info.paymentReference,
            paidAt: info.paidAt,
            actorId: "woo_import",
            skipMetadataUpdate: true,
          });
        } catch (payErr: any) {
          logger.warn(
            `Payment sync warning for imported order ${created.id}: ${payErr?.message}`
          );
        }
      }

      successCount += orderDTOs.length;
      if (successCount % 200 === 0 || successCount === ordersToImport.length) {
        logger.info(`Imported ${successCount} / ${ordersToImport.length} orders...`);
      }
    } catch (err: any) {
      errorCount += orderDTOs.length;
      logger.warn(`Error importing batch starting at ${i}: ${err.message}`);
    }
  }

  logger.info("=====================================================");
  logger.info(`  ORDER IMPORT COMPLETE: ${successCount} SUCCESS, ${errorCount} ERRORS  `);
  logger.info("=====================================================");
}
