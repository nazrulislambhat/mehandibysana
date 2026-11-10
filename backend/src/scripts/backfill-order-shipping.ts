import * as fs from "fs";
import * as path from "path";
import { Client } from "pg";
import { generateEntityId } from "@medusajs/framework/utils";
import { evaluatePincode } from "../lib/pincode-rules";

/**
 * Idempotent shipping + payment ledger backfill for Medusa v2 orders whose active
 * version lacks `order_shipping` rows even though their total includes shipping.
 *
 * Handles both:
 *  - WooCommerce-imported orders (`metadata.woo_order_id`, cross-checked against `orders.json`)
 *  - Storefront orders with `metadata.shipping_fee > 0`
 *
 * Safely skips synthetic empty-line-item Woo orders whose single line item already equals `woo.total`.
 * Updates `order_shipping_method`, `order_shipping`, `order_summary.totals`,
 * `payment_collection`, `payment_session`, `payment`, `capture`, `order_transaction`,
 * and `order.metadata` atomically inside a single SQL transaction.
 *
 * Usage:
 *   DATABASE_URL=... ./node_modules/.bin/ts-node-transpile-only src/scripts/backfill-order-shipping.ts [--dry-run] [--storefront-only]
 */

interface RawWooOrder {
  id: number | string;
  total?: string;
  shipping_total?: string;
  shipping_lines?: Array<{ method_title?: string }>;
  line_items?: Array<unknown>;
}

interface BackfillShippingItem {
  orderId: string;
  displayId: number;
  version: number;
  summaryId: string | null;
  pcId: string | null;
  isSettled: boolean;
  shippingMethodId: string;
  orderShippingId: string;
  methodName: string;
  shippingFee: number;
  rawShippingJson: string;
  shippingOptionId: string | null;
  shippingDataJson: string;
  nextTotalsJson: string | null;
  newTotal: number;
  rawTotalJson: string;
  nextMetaJson: string;
  createdAt: Date;
}

function roundInr(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function loadWooOrderMap(): Map<string, RawWooOrder> {
  const filePath = path.resolve(
    __dirname,
    "../../../migration/data/raw/orders.json"
  );
  const map = new Map<string, RawWooOrder>();
  if (!fs.existsSync(filePath)) {
    return map;
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as RawWooOrder[];
  for (const o of raw) {
    map.set(String(o.id), o);
  }
  return map;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function flushBatch(client: Client, batch: BackfillShippingItem[]) {
  if (batch.length === 0) return;

  await client.query(
    `
    INSERT INTO order_shipping_method (
      id, name, description, amount, raw_amount, is_tax_inclusive,
      shipping_option_id, data, metadata, created_at, updated_at, is_custom_amount
    )
    SELECT
      u.id, u.name, NULL, u.amount, u.raw_amount::jsonb, false,
      NULLIF(u.so_id, ''), u.data::jsonb, NULL, u.created_at, NOW(), true
    FROM UNNEST(
      $1::text[], $2::text[], $3::numeric[], $4::text[], $5::text[], $6::text[], $7::timestamptz[]
    ) AS u(id, name, amount, raw_amount, so_id, data, created_at)
    `,
    [
      batch.map((r) => r.shippingMethodId),
      batch.map((r) => r.methodName),
      batch.map((r) => r.shippingFee),
      batch.map((r) => r.rawShippingJson),
      batch.map((r) => r.shippingOptionId || ""),
      batch.map((r) => r.shippingDataJson),
      batch.map((r) => r.createdAt),
    ]
  );

  await client.query(
    `
    INSERT INTO order_shipping (
      id, order_id, version, shipping_method_id, created_at, updated_at
    )
    SELECT
      u.id, u.order_id, u.version, u.sm_id, u.created_at, NOW()
    FROM UNNEST(
      $1::text[], $2::text[], $3::int4[], $4::text[], $5::timestamptz[]
    ) AS u(id, order_id, version, sm_id, created_at)
    `,
    [
      batch.map((r) => r.orderShippingId),
      batch.map((r) => r.orderId),
      batch.map((r) => r.version),
      batch.map((r) => r.shippingMethodId),
      batch.map((r) => r.createdAt),
    ]
  );

  const summaryRows = batch.filter((r) => r.summaryId && r.nextTotalsJson);
  if (summaryRows.length > 0) {
    await client.query(
      `
      UPDATE order_summary AS os
      SET totals = u.totals::jsonb, updated_at = NOW()
      FROM UNNEST($1::text[], $2::text[]) AS u(id, totals)
      WHERE os.id = u.id
      `,
      [
        summaryRows.map((r) => r.summaryId!),
        summaryRows.map((r) => r.nextTotalsJson!),
      ]
    );
  }

  const settledWithPc = batch.filter((r) => r.pcId && r.isSettled);
  if (settledWithPc.length > 0) {
    await client.query(
      `
      UPDATE payment_collection AS pc
      SET
        amount = u.amount,
        raw_amount = u.raw_amount::jsonb,
        authorized_amount = u.amount,
        raw_authorized_amount = u.raw_amount::jsonb,
        captured_amount = u.amount,
        raw_captured_amount = u.raw_amount::jsonb,
        updated_at = NOW()
      FROM UNNEST($1::text[], $2::numeric[], $3::text[]) AS u(id, amount, raw_amount)
      WHERE pc.id = u.id
      `,
      [
        settledWithPc.map((r) => r.pcId!),
        settledWithPc.map((r) => r.newTotal),
        settledWithPc.map((r) => r.rawTotalJson),
      ]
    );

    await client.query(
      `
      UPDATE payment_session AS ps
      SET
        amount = u.amount,
        raw_amount = u.raw_amount::jsonb,
        updated_at = NOW()
      FROM UNNEST($1::text[], $2::numeric[], $3::text[]) AS u(pc_id, amount, raw_amount)
      WHERE ps.payment_collection_id = u.pc_id
        AND ps.deleted_at IS NULL
      `,
      [
        settledWithPc.map((r) => r.pcId!),
        settledWithPc.map((r) => r.newTotal),
        settledWithPc.map((r) => r.rawTotalJson),
      ]
    );

    await client.query(
      `
      UPDATE payment AS p
      SET
        amount = u.amount,
        raw_amount = u.raw_amount::jsonb,
        updated_at = NOW()
      FROM UNNEST($1::text[], $2::numeric[], $3::text[]) AS u(pc_id, amount, raw_amount)
      WHERE p.payment_collection_id = u.pc_id
        AND p.deleted_at IS NULL
        AND p.canceled_at IS NULL
      `,
      [
        settledWithPc.map((r) => r.pcId!),
        settledWithPc.map((r) => r.newTotal),
        settledWithPc.map((r) => r.rawTotalJson),
      ]
    );

    await client.query(
      `
      UPDATE capture AS c
      SET
        amount = u.amount,
        raw_amount = u.raw_amount::jsonb,
        updated_at = NOW()
      FROM payment AS p
      JOIN UNNEST($1::text[], $2::numeric[], $3::text[]) AS u(pc_id, amount, raw_amount)
        ON u.pc_id = p.payment_collection_id
      WHERE c.payment_id = p.id
        AND p.deleted_at IS NULL
        AND c.deleted_at IS NULL
      `,
      [
        settledWithPc.map((r) => r.pcId!),
        settledWithPc.map((r) => r.newTotal),
        settledWithPc.map((r) => r.rawTotalJson),
      ]
    );

    await client.query(
      `
      UPDATE order_transaction AS ot
      SET
        amount = u.amount,
        raw_amount = u.raw_amount::jsonb,
        updated_at = NOW()
      FROM UNNEST($1::text[], $2::int4[], $3::numeric[], $4::text[]) AS u(order_id, version, amount, raw_amount)
      WHERE ot.order_id = u.order_id
        AND ot.version = u.version
        AND ot.reference = 'capture'
        AND ot.deleted_at IS NULL
      `,
      [
        settledWithPc.map((r) => r.orderId),
        settledWithPc.map((r) => r.version),
        settledWithPc.map((r) => r.newTotal),
        settledWithPc.map((r) => r.rawTotalJson),
      ]
    );
  }

  const pendingWithPc = batch.filter((r) => r.pcId && !r.isSettled);
  if (pendingWithPc.length > 0) {
    await client.query(
      `
      UPDATE payment_collection AS pc
      SET
        amount = u.amount,
        raw_amount = u.raw_amount::jsonb,
        updated_at = NOW()
      FROM UNNEST($1::text[], $2::numeric[], $3::text[]) AS u(id, amount, raw_amount)
      WHERE pc.id = u.id
      `,
      [
        pendingWithPc.map((r) => r.pcId!),
        pendingWithPc.map((r) => r.newTotal),
        pendingWithPc.map((r) => r.rawTotalJson),
      ]
    );
  }

  await client.query(
    `
    UPDATE "order" AS o
    SET metadata = u.metadata::jsonb, updated_at = NOW()
    FROM UNNEST($1::text[], $2::text[]) AS u(id, metadata)
    WHERE o.id = u.id
    `,
    [
      batch.map((r) => r.orderId),
      batch.map((r) => r.nextMetaJson),
    ]
  );
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const storefrontOnly = process.argv.includes("--storefront-only");
  const databaseUrl =
    process.env.DATABASE_URL?.trim() ||
    "postgres://nazrul@localhost:5432/medusa_mehandibysana";

  const wooMap = storefrontOnly ? new Map<string, RawWooOrder>() : loadWooOrderMap();
  console.log(
    `[Backfill Order Shipping] Loaded ${wooMap.size} WooCommerce reference records (dryRun=${dryRun}, storefrontOnly=${storefrontOnly}).`
  );

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const soRes = await client.query<{ id: string; name: string }>(
      `SELECT id, name FROM shipping_option WHERE deleted_at IS NULL ORDER BY created_at ASC`
    );
    const standardSo =
      soRes.rows.find((r) => r.name.toLowerCase().includes("standard")) ||
      soRes.rows[0] ||
      null;

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
        ) AS items_subtotal
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
        AND ($1::boolean = false OR o.metadata->>'woo_order_id' IS NULL)
        AND NOT EXISTS (
          SELECT 1
          FROM order_shipping osp
          WHERE osp.order_id = o.id
            AND osp.version = o.version
            AND osp.deleted_at IS NULL
        )
      ORDER BY o.display_id DESC
      `,
      [storefrontOnly]
    );

    const itemsToUpdate: BackfillShippingItem[] = [];
    let skippedSyntheticCount = 0;
    let skippedZeroShippingCount = 0;
    let settledUpdatedCount = 0;
    let pendingUpdatedCount = 0;

    for (const row of ordersRes.rows) {
      const meta = row.metadata || {};
      const wooId =
        meta.woo_order_id !== undefined && meta.woo_order_id !== null
          ? String(meta.woo_order_id)
          : "";
      const woo = wooId ? wooMap.get(wooId) : undefined;
      const itemsSubtotal = roundInr(Math.max(0, Number(row.items_subtotal) || 0));

      let shippingFee = 0;
      if (wooId) {
        const expectedTotal = roundInr(
          parseFloat(String(woo?.total ?? meta.total ?? "0")) || 0
        );
        const rawDiff = roundInr(expectedTotal - itemsSubtotal);
        if (rawDiff <= 0.05) {
          if (woo && parseFloat(woo.shipping_total || "0") > 0 && (!woo.line_items || woo.line_items.length === 0)) {
            skippedSyntheticCount += 1;
          } else {
            skippedZeroShippingCount += 1;
          }
          continue;
        }
        shippingFee = rawDiff;
      } else {
        const metaShip = roundInr(Math.max(0, Number(meta.shipping_fee) || 0));
        if (metaShip <= 0) {
          skippedZeroShippingCount += 1;
          continue;
        }
        shippingFee = metaShip;
      }

      const pincode = String(row.postal_code || "").trim();
      const pinCheck = evaluatePincode(pincode, itemsSubtotal);
      const matchedRule = String(
        meta.pincode_rule || pinCheck.matchedRule?.pattern || "*"
      );
      const methodName =
        woo?.shipping_lines?.[0]?.method_title ||
        (pinCheck.matchedRule?.pattern === matchedRule && pinCheck.matchedRule?.label
          ? pinCheck.matchedRule.label
          : matchedRule === "*"
            ? "Rest of India (All Other Pincodes)"
            : `Studio Shipping (${matchedRule})`);

      const prevTotals = row.totals || {};
      const curTotal = roundInr(Number(prevTotals.current_order_total ?? itemsSubtotal));
      const origTotal = roundInr(Number(prevTotals.original_order_total ?? itemsSubtotal));
      const accTotal = roundInr(Number(prevTotals.accounting_total ?? curTotal));
      const txTotal = roundInr(Number(prevTotals.transaction_total ?? 0));

      const newCurrentTotal = roundInr(curTotal + shippingFee);
      const newOriginalTotal = roundInr(origTotal + shippingFee);
      const newAccountingTotal = roundInr(accTotal + shippingFee);

      const pcAmt = roundInr(Number(row.pc_amount ?? 0));
      const pcCap = roundInr(Number(row.pc_captured_amount ?? 0));
      const isSettled =
        row.pc_status === "completed" ||
        (pcAmt > 0 && pcCap >= pcAmt - 0.01);

      if (isSettled) {
        settledUpdatedCount += 1;
      } else {
        pendingUpdatedCount += 1;
      }

      const newPaidTotal = isSettled ? newCurrentTotal : roundInr(Number(prevTotals.paid_total ?? 0));
      const newTxTotal = isSettled ? newCurrentTotal : txTotal;
      const newPendingDiff = isSettled ? 0 : roundInr(newCurrentTotal - newTxTotal);

      const nextTotalsJson = row.summary_id
        ? JSON.stringify({
            ...prevTotals,
            current_order_total: newCurrentTotal,
            raw_current_order_total: {
              value: String(newCurrentTotal),
              precision: 20,
            },
            original_order_total: newOriginalTotal,
            raw_original_order_total: {
              value: String(newOriginalTotal),
              precision: 20,
            },
            accounting_total: newAccountingTotal,
            raw_accounting_total: {
              value: String(newAccountingTotal),
              precision: 20,
            },
            paid_total: newPaidTotal,
            raw_paid_total: {
              value: String(newPaidTotal),
              precision: 20,
            },
            transaction_total: newTxTotal,
            raw_transaction_total: {
              value: String(newTxTotal),
              precision: 20,
            },
            pending_difference: newPendingDiff,
            raw_pending_difference: {
              value: String(newPendingDiff),
              precision: 20,
            },
          })
        : null;

      const nextMeta: Record<string, unknown> = {
        ...meta,
        subtotal: itemsSubtotal,
        shipping_fee: shippingFee,
        pincode_rule: matchedRule,
        total: meta.total ?? newCurrentTotal.toFixed(2),
        ...(isSettled || meta.payment_amount !== undefined
          ? { payment_amount: newCurrentTotal }
          : {}),
      };

      itemsToUpdate.push({
        orderId: row.id,
        displayId: row.display_id,
        version: row.version,
        summaryId: row.summary_id,
        pcId: row.pc_id,
        isSettled,
        shippingMethodId: generateEntityId(undefined, "ordsm"),
        orderShippingId: generateEntityId(undefined, "ordspmv"),
        methodName,
        shippingFee,
        rawShippingJson: JSON.stringify({
          value: String(shippingFee),
          precision: 20,
        }),
        shippingOptionId: standardSo?.id || null,
        shippingDataJson: JSON.stringify({
          pincode,
          pincode_rule: matchedRule,
          zone: pinCheck.zone || "",
          estimated_days: pinCheck.estimatedDays || "",
        }),
        nextTotalsJson,
        newTotal: newCurrentTotal,
        rawTotalJson: JSON.stringify({
          value: String(newCurrentTotal),
          precision: 20,
        }),
        nextMetaJson: JSON.stringify(nextMeta),
        createdAt: row.created_at,
      });
    }

    console.log(
      `[Backfill Order Shipping] Prepared ${itemsToUpdate.length} order(s) to update ` +
        `(settled=${settledUpdatedCount}, pending=${pendingUpdatedCount}, ` +
        `skippedZero=${skippedZeroShippingCount}, skippedSynthetic=${skippedSyntheticCount}).`
    );

    for (const preview of itemsToUpdate.slice(0, 12)) {
      console.log(
        `  -> #${preview.displayId} (${preview.orderId}, settled=${preview.isSettled}): +shipping=₹${preview.shippingFee} (${preview.methodName}), newTotal=₹${preview.newTotal}`
      );
    }

    if (!dryRun && itemsToUpdate.length > 0) {
      await client.query("BEGIN");
      for (const batch of chunkArray(itemsToUpdate, 250)) {
        await flushBatch(client, batch);
      }
      await client.query("COMMIT");
      console.log("[Backfill Order Shipping] Transaction committed successfully.");
    }
  } catch (err) {
    if (!dryRun) {
      await client.query("ROLLBACK").catch(() => undefined);
    }
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[Backfill Order Shipping Failed]:", err);
  process.exit(1);
});
