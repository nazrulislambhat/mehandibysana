import { Client } from "pg";
import { generateEntityId } from "@medusajs/framework/utils";
import { evaluatePincode } from "./pincode-rules";

export interface BackfillSummary {
  scannedOrders: number;
  ordersUpdated: number;
  skippedZeroShipping: number;
  settledUpdated: number;
  pendingUpdated: number;
  errors: string[];
}

function roundInr(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/**
 * Idempotent shipping backfill for Medusa v2 orders.
 * Inspects all active orders that lack `order_shipping` records or have shippingFee = 0
 * when the order total exceeds items subtotal.
 *
 * Works in any environment (local, Railway staging, Railway production) using DATABASE_URL.
 */
export async function runShippingBackfill(databaseUrl?: string): Promise<BackfillSummary> {
  const connString = databaseUrl || process.env.DATABASE_URL;
  if (!connString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client({ connectionString: connString });
  await client.connect();

  const summary: BackfillSummary = {
    scannedOrders: 0,
    ordersUpdated: 0,
    skippedZeroShipping: 0,
    settledUpdated: 0,
    pendingUpdated: 0,
    errors: [],
  };

  try {
    // 1. Fetch default standard shipping option id if available
    const soRes = await client.query<{ id: string; name: string }>(
      `SELECT id, name FROM shipping_option WHERE deleted_at IS NULL ORDER BY created_at ASC`
    );
    const defaultSo =
      soRes.rows.find((r) => r.name.toLowerCase().includes("standard")) ||
      soRes.rows[0] ||
      null;

    // 2. Query all orders that do NOT have order_shipping or where metadata.shipping_fee is missing
    const ordersRes = await client.query<{
      id: string;
      display_id: number;
      version: number;
      status: string;
      created_at: Date;
      metadata: Record<string, any> | null;
      postal_code: string | null;
      summary_id: string | null;
      totals: Record<string, any> | null;
      pc_id: string | null;
      pc_status: string | null;
      pc_amount: string | null;
      pc_captured_amount: string | null;
      items_subtotal: string;
      has_shipping: boolean;
    }>(
      `
      SELECT
        o.id,
        o.display_id,
        o.version,
        o.status,
        o.created_at,
        o.metadata,
        oa.postal_code,
        os.id AS summary_id,
        os.totals,
        pc.id AS pc_id,
        pc.status AS pc_status,
        pc.amount AS pc_amount,
        pc.captured_amount AS pc_captured_amount,
        COALESCE(
          (
            SELECT SUM(oli.unit_price * oi.quantity)
            FROM order_item oi
            JOIN order_line_item oli ON oli.id = oi.item_id
            WHERE oi.order_id = o.id
              AND oi.version = o.version
              AND oi.deleted_at IS NULL
              AND oli.deleted_at IS NULL
          ),
          0
        ) AS items_subtotal,
        EXISTS (
          SELECT 1
          FROM order_shipping osp
          WHERE osp.order_id = o.id
            AND osp.version = o.version
            AND osp.deleted_at IS NULL
        ) AS has_shipping
      FROM "order" o
      LEFT JOIN order_address oa ON oa.id = o.shipping_address_id
      LEFT JOIN order_summary os
        ON os.order_id = o.id
       AND os.version = o.version
       AND os.deleted_at IS NULL
      LEFT JOIN order_payment_collection opc
        ON opc.order_id = o.id
       AND opc.deleted_at IS NULL
      LEFT JOIN payment_collection pc
        ON pc.id = opc.payment_collection_id
       AND pc.deleted_at IS NULL
      WHERE o.deleted_at IS NULL
        AND o.status NOT IN ('canceled')
      ORDER BY o.display_id DESC
      `
    );

    summary.scannedOrders = ordersRes.rows.length;

    for (const row of ordersRes.rows) {
      try {
        const meta = (row.metadata || {}) as Record<string, any>;
        const itemsSubtotal = roundInr(Math.max(0, Number(row.items_subtotal) || 0));

        // Determine expected total
        const rawTotalStr = String(meta.total || "");
        const expectedTotal =
          rawTotalStr && Number.isFinite(Number(rawTotalStr))
            ? roundInr(Number(rawTotalStr))
            : roundInr(Number(row.totals?.original_order_total || itemsSubtotal));

        let shippingFee = 0;
        if (meta.shipping_fee !== undefined && meta.shipping_fee !== null && Number(meta.shipping_fee) > 0) {
          shippingFee = roundInr(Number(meta.shipping_fee));
        } else if (expectedTotal > itemsSubtotal) {
          shippingFee = roundInr(expectedTotal - itemsSubtotal);
        }

        const pincode = String(row.postal_code || "").trim();
        const pinCheck = evaluatePincode(pincode, itemsSubtotal);
        const matchedRule = String(
          meta.pincode_rule || pinCheck.matchedRule?.pattern || "*"
        );

        if (shippingFee <= 0 && (!row.has_shipping || !meta.shipping_fee)) {
          // Check if pincode rule dictates a fee and order total was at subtotal
          // But only if total - itemsSubtotal was 0, it was likely free shipping or discount
          summary.skippedZeroShipping += 1;
          continue;
        }

        const methodName =
          pinCheck.matchedRule?.pattern === matchedRule && pinCheck.matchedRule?.label
            ? pinCheck.matchedRule.label
            : matchedRule === "*"
              ? "Rest of India (All Other Pincodes)"
              : `Dispatch Shipping (${matchedRule})`;

        const needsShippingMethod = !row.has_shipping && shippingFee > 0;
        const needsMetaUpdate =
          meta.shipping_fee !== shippingFee ||
          meta.subtotal !== itemsSubtotal ||
          !meta.pincode_rule;

        if (!needsShippingMethod && !needsMetaUpdate) {
          continue;
        }

        await client.query("BEGIN");

        const shippingMethodId = generateEntityId("", "ordsm");
        const orderShippingId = generateEntityId("", "ordspmv");
        const rawShippingJson = JSON.stringify({ value: String(shippingFee), precision: 20 });
        const shippingDataJson = JSON.stringify({
          zone: pinCheck.zone || "Standard Delivery Zone",
          pincode,
          pincode_rule: matchedRule,
          estimated_days: pinCheck.estimatedDays || "3–5 business days",
        });

        if (needsShippingMethod) {
          // Insert order_shipping_method
          await client.query(
            `
            INSERT INTO order_shipping_method (
              id, name, description, amount, raw_amount, is_tax_inclusive,
              shipping_option_id, data, metadata, created_at, updated_at, is_custom_amount
            ) VALUES (
              $1, $2, NULL, $3, $4::jsonb, false,
              $5, $6::jsonb, NULL, $7, NOW(), true
            )
            `,
            [
              shippingMethodId,
              methodName,
              shippingFee,
              rawShippingJson,
              defaultSo?.id || null,
              shippingDataJson,
              row.created_at,
            ]
          );

          // Insert order_shipping
          await client.query(
            `
            INSERT INTO order_shipping (
              id, order_id, version, shipping_method_id, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, NOW()
            )
            `,
            [
              orderShippingId,
              row.id,
              row.version,
              shippingMethodId,
              row.created_at,
            ]
          );
        }

        // Calculate new totals for order_summary
        const newTotal = expectedTotal > 0 ? expectedTotal : roundInr(itemsSubtotal + shippingFee);
        const rawTotalJson = JSON.stringify({ value: String(newTotal), precision: 20 });

        const prevTotals = (row.totals || {}) as Record<string, any>;
        const pcAmt = roundInr(Number(row.pc_amount ?? 0));
        const pcCap = roundInr(Number(row.pc_captured_amount ?? 0));
        const isSettled =
          row.pc_status === "completed" ||
          (pcAmt > 0 && pcCap >= pcAmt - 0.01) ||
          meta.payment_status === "paid" ||
          row.status === "completed";

        const newPaidTotal = isSettled ? newTotal : roundInr(Number(prevTotals.paid_total ?? 0));
        const pendingDiff = isSettled ? 0 : newTotal;

        const nextTotalsJson = JSON.stringify({
          ...prevTotals,
          accounting_total: newTotal,
          raw_accounting_total: { value: String(newTotal), precision: 20 },
          original_order_total: newTotal,
          raw_original_order_total: { value: String(newTotal), precision: 20 },
          current_order_total: newTotal,
          raw_current_order_total: { value: String(newTotal), precision: 20 },
          paid_total: newPaidTotal,
          raw_paid_total: { value: String(newPaidTotal), precision: 20 },
          pending_difference: pendingDiff,
          raw_pending_difference: { value: String(pendingDiff), precision: 20 },
        });

        if (row.summary_id) {
          await client.query(
            `UPDATE order_summary SET totals = $1::jsonb, updated_at = NOW() WHERE id = $2`,
            [nextTotalsJson, row.summary_id]
          );
        }

        // Update payment collection if exists
        if (row.pc_id) {
          await client.query(
            `
            UPDATE payment_collection
            SET
              amount = $1,
              raw_amount = $2::jsonb,
              authorized_amount = CASE WHEN $3 = true THEN $1 ELSE authorized_amount END,
              raw_authorized_amount = CASE WHEN $3 = true THEN $2::jsonb ELSE raw_authorized_amount END,
              captured_amount = CASE WHEN $3 = true THEN $1 ELSE captured_amount END,
              raw_captured_amount = CASE WHEN $3 = true THEN $2::jsonb ELSE raw_captured_amount END,
              updated_at = NOW()
            WHERE id = $4
            `,
            [newTotal, rawTotalJson, isSettled, row.pc_id]
          );
        }

        // Update order metadata
        const nextMeta = {
          ...meta,
          subtotal: itemsSubtotal,
          shipping_fee: shippingFee,
          pincode_rule: matchedRule,
          total: String(newTotal),
        };

        await client.query(
          `UPDATE "order" SET metadata = $1::jsonb, updated_at = NOW() WHERE id = $2`,
          [JSON.stringify(nextMeta), row.id]
        );

        await client.query("COMMIT");

        summary.ordersUpdated += 1;
        if (isSettled) {
          summary.settledUpdated += 1;
        } else {
          summary.pendingUpdated += 1;
        }
      } catch (orderErr: any) {
        await client.query("ROLLBACK");
        summary.errors.push(`Order #${row.display_id}: ${orderErr.message}`);
      }
    }
  } finally {
    await client.end();
  }

  return summary;
}
