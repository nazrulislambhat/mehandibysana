import * as fs from "fs";
import * as path from "path";
import { generateEntityId } from "@medusajs/framework/utils";
import { Client } from "pg";

/**
 * Idempotent payment ledger backfill for Medusa v2 orders missing `payment_collection` rows.
 *
 * Syncs `payment_collection`, `payment_session`, `payment`, `capture`,
 * `order_payment_collection`, `order_transaction`, `order_summary.totals`,
 * and `order.metadata` in batched SQL chunks so Medusa Admin displays accurate
 * `Paid` vs `Not paid` statuses and native payment controls work on every order.
 *
 * Usage:
 *   DATABASE_URL=... ./node_modules/.bin/ts-node-transpile-only src/scripts/backfill-order-payments.ts [--dry-run]
 */

interface RawWooOrder {
  id: number | string;
  status?: string;
  payment_method?: string;
  transaction_id?: string;
  date_paid?: string | null;
  total?: string;
  meta_data?: {
    _paid_date?: string;
    _date_paid?: string | number;
  };
}

interface SettledRecord {
  orderId: string;
  version: number;
  summaryId: string | null;
  currency: string;
  payableAmount: number;
  rawAmountJson: string;
  paidIso: string;
  payColId: string;
  opcId: string;
  sessionId: string | null;
  paymentId: string | null;
  captureId: string | null;
  txRowId: string | null;
  pcMetaJson: string;
  nextTotalsJson: string | null;
  nextOrderMetaJson: string;
}

interface PendingRecord {
  orderId: string;
  currency: string;
  payableAmount: number;
  rawAmountJson: string;
  createdIso: string;
  payColId: string;
  opcId: string;
  pcMetaJson: string;
  nextOrderMetaJson: string;
}

function roundInr(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function parseIsoTimestamp(raw: unknown, fallbackIso: string): string {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    return new Date(raw * 1000).toISOString();
  }
  const str = String(raw || "").trim();
  if (!str) return fallbackIso;
  if (/^\d{9,12}$/.test(str)) {
    return new Date(Number(str) * 1000).toISOString();
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? fallbackIso : parsed.toISOString();
}

function loadWooOrderMap(): Map<string, RawWooOrder> {
  const filePath = path.resolve(__dirname, "../../../migration/data/raw/orders.json");
  const map = new Map<string, RawWooOrder>();
  if (!fs.existsSync(filePath)) {
    console.warn(
      `[Backfill Payments] Woo raw file not found at ${filePath}; continuing using DB metadata only.`
    );
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

async function flushSettledBatch(client: Client, batch: SettledRecord[]) {
  if (batch.length === 0) return;

  await client.query(
    `
    INSERT INTO payment_collection (
      id, currency_code, amount, raw_amount,
      authorized_amount, raw_authorized_amount,
      captured_amount, raw_captured_amount,
      refunded_amount, raw_refunded_amount,
      completed_at, status, metadata, created_at, updated_at
    )
    SELECT
      u.id,
      u.currency,
      u.amount,
      u.raw_amount::jsonb,
      u.amount,
      u.raw_amount::jsonb,
      u.amount,
      u.raw_amount::jsonb,
      0,
      '{"value":"0","precision":20}'::jsonb,
      u.paid_at,
      'completed',
      u.meta::jsonb,
      u.paid_at,
      NOW()
    FROM UNNEST(
      $1::text[], $2::text[], $3::numeric[], $4::text[], $5::timestamptz[], $6::text[]
    ) AS u(id, currency, amount, raw_amount, paid_at, meta)
    `,
    [
      batch.map((r) => r.payColId),
      batch.map((r) => r.currency),
      batch.map((r) => r.payableAmount),
      batch.map((r) => r.rawAmountJson),
      batch.map((r) => r.paidIso),
      batch.map((r) => r.pcMetaJson),
    ]
  );

  await client.query(
    `
    INSERT INTO order_payment_collection (
      id, order_id, payment_collection_id, created_at, updated_at
    )
    SELECT u.id, u.order_id, u.pc_id, u.created_at, NOW()
    FROM UNNEST($1::varchar[], $2::varchar[], $3::varchar[], $4::timestamptz[])
      AS u(id, order_id, pc_id, created_at)
    `,
    [
      batch.map((r) => r.opcId),
      batch.map((r) => r.orderId),
      batch.map((r) => r.payColId),
      batch.map((r) => r.paidIso),
    ]
  );

  const positive = batch.filter((r) => r.payableAmount > 0 && r.sessionId && r.paymentId && r.captureId && r.txRowId);
  if (positive.length > 0) {
    await client.query(
      `
      INSERT INTO payment_session (
        id, currency_code, amount, raw_amount, provider_id,
        data, context, status, authorized_at, payment_collection_id,
        metadata, created_at, updated_at
      )
      SELECT
        u.id, u.currency, u.amount, u.raw_amount::jsonb, 'pp_system_default',
        '{}'::jsonb, '{}'::jsonb, 'captured', u.paid_at, u.pc_id,
        u.meta::jsonb, u.paid_at, NOW()
      FROM UNNEST(
        $1::text[], $2::text[], $3::numeric[], $4::text[], $5::timestamptz[], $6::text[], $7::text[]
      ) AS u(id, currency, amount, raw_amount, paid_at, pc_id, meta)
      `,
      [
        positive.map((r) => r.sessionId!),
        positive.map((r) => r.currency),
        positive.map((r) => r.payableAmount),
        positive.map((r) => r.rawAmountJson),
        positive.map((r) => r.paidIso),
        positive.map((r) => r.payColId),
        positive.map((r) => r.pcMetaJson),
      ]
    );

    await client.query(
      `
      INSERT INTO payment (
        id, amount, raw_amount, currency_code, provider_id,
        data, captured_at, payment_collection_id, payment_session_id,
        metadata, created_at, updated_at
      )
      SELECT
        u.id, u.amount, u.raw_amount::jsonb, u.currency, 'pp_system_default',
        '{}'::jsonb, u.paid_at, u.pc_id, u.ps_id,
        u.meta::jsonb, u.paid_at, NOW()
      FROM UNNEST(
        $1::text[], $2::numeric[], $3::text[], $4::text[], $5::timestamptz[], $6::text[], $7::text[], $8::text[]
      ) AS u(id, amount, raw_amount, currency, paid_at, pc_id, ps_id, meta)
      `,
      [
        positive.map((r) => r.paymentId!),
        positive.map((r) => r.payableAmount),
        positive.map((r) => r.rawAmountJson),
        positive.map((r) => r.currency),
        positive.map((r) => r.paidIso),
        positive.map((r) => r.payColId),
        positive.map((r) => r.sessionId!),
        positive.map((r) => r.pcMetaJson),
      ]
    );

    await client.query(
      `
      INSERT INTO capture (
        id, amount, raw_amount, payment_id, created_by,
        metadata, created_at, updated_at
      )
      SELECT
        u.id, u.amount, u.raw_amount::jsonb, u.payment_id, 'backfill_order_payments',
        u.meta::jsonb, u.paid_at, NOW()
      FROM UNNEST(
        $1::text[], $2::numeric[], $3::text[], $4::text[], $5::text[], $6::timestamptz[]
      ) AS u(id, amount, raw_amount, payment_id, meta, paid_at)
      `,
      [
        positive.map((r) => r.captureId!),
        positive.map((r) => r.payableAmount),
        positive.map((r) => r.rawAmountJson),
        positive.map((r) => r.paymentId!),
        positive.map((r) => r.pcMetaJson),
        positive.map((r) => r.paidIso),
      ]
    );

    await client.query(
      `
      INSERT INTO order_transaction (
        id, order_id, version, amount, raw_amount,
        currency_code, reference, reference_id,
        created_at, updated_at
      )
      SELECT
        u.id, u.order_id, u.version, u.amount, u.raw_amount::jsonb,
        u.currency, 'capture', u.capture_id,
        u.paid_at, NOW()
      FROM UNNEST(
        $1::text[], $2::text[], $3::int4[], $4::numeric[], $5::text[], $6::text[], $7::text[], $8::timestamptz[]
      ) AS u(id, order_id, version, amount, raw_amount, currency, capture_id, paid_at)
      `,
      [
        positive.map((r) => r.txRowId!),
        positive.map((r) => r.orderId),
        positive.map((r) => r.version),
        positive.map((r) => r.payableAmount),
        positive.map((r) => r.rawAmountJson),
        positive.map((r) => r.currency),
        positive.map((r) => r.captureId!),
        positive.map((r) => r.paidIso),
      ]
    );

    const summaries = positive.filter((r) => r.summaryId && r.nextTotalsJson);
    if (summaries.length > 0) {
      await client.query(
        `
        UPDATE order_summary AS os
        SET totals = u.totals::jsonb, updated_at = NOW()
        FROM UNNEST($1::text[], $2::text[]) AS u(id, totals)
        WHERE os.id = u.id
        `,
        [
          summaries.map((r) => r.summaryId!),
          summaries.map((r) => r.nextTotalsJson!),
        ]
      );
    }
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
      batch.map((r) => r.nextOrderMetaJson),
    ]
  );
}

async function flushPendingBatch(client: Client, batch: PendingRecord[]) {
  if (batch.length === 0) return;

  await client.query(
    `
    INSERT INTO payment_collection (
      id, currency_code, amount, raw_amount,
      status, metadata, created_at, updated_at
    )
    SELECT
      u.id, u.currency, u.amount, u.raw_amount::jsonb,
      'not_paid', u.meta::jsonb, u.created_at, NOW()
    FROM UNNEST(
      $1::text[], $2::text[], $3::numeric[], $4::text[], $5::text[], $6::timestamptz[]
    ) AS u(id, currency, amount, raw_amount, meta, created_at)
    `,
    [
      batch.map((r) => r.payColId),
      batch.map((r) => r.currency),
      batch.map((r) => r.payableAmount),
      batch.map((r) => r.rawAmountJson),
      batch.map((r) => r.pcMetaJson),
      batch.map((r) => r.createdIso),
    ]
  );

  await client.query(
    `
    INSERT INTO order_payment_collection (
      id, order_id, payment_collection_id, created_at, updated_at
    )
    SELECT u.id, u.order_id, u.pc_id, u.created_at, NOW()
    FROM UNNEST($1::varchar[], $2::varchar[], $3::varchar[], $4::timestamptz[])
      AS u(id, order_id, pc_id, created_at)
    `,
    [
      batch.map((r) => r.opcId),
      batch.map((r) => r.orderId),
      batch.map((r) => r.payColId),
      batch.map((r) => r.createdIso),
    ]
  );

  await client.query(
    `
    UPDATE "order" AS o
    SET metadata = u.metadata::jsonb, updated_at = NOW()
    FROM UNNEST($1::text[], $2::text[]) AS u(id, metadata)
    WHERE o.id = u.id
    `,
    [
      batch.map((r) => r.orderId),
      batch.map((r) => r.nextOrderMetaJson),
    ]
  );
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const databaseUrl =
    process.env.DATABASE_URL?.trim() ||
    "postgres://nazrul@localhost:5432/medusa_mehandibysana";

  const wooMap = loadWooOrderMap();
  console.log(
    `[Backfill Payments] Loaded ${wooMap.size} WooCommerce reference records (dryRun=${dryRun}).`
  );

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const ordersRes = await client.query<{
      id: string;
      display_id: number;
      version: number;
      status: string;
      currency_code: string;
      created_at: Date;
      metadata: Record<string, any> | null;
      summary_id: string | null;
      totals: Record<string, any> | null;
    }>(`
      SELECT
        o.id,
        o.display_id,
        o.version,
        o.status,
        o.currency_code,
        o.created_at,
        o.metadata,
        os.id AS summary_id,
        os.totals
      FROM "order" o
      LEFT JOIN order_summary os
        ON os.order_id = o.id
       AND os.version = o.version
       AND os.deleted_at IS NULL
      WHERE o.deleted_at IS NULL
        AND o.status NOT IN ('canceled')
        AND NOT EXISTS (
          SELECT 1
          FROM order_payment_collection opc
          JOIN payment_collection pc ON pc.id = opc.payment_collection_id
          WHERE opc.order_id = o.id
            AND opc.deleted_at IS NULL
            AND pc.deleted_at IS NULL
        )
      ORDER BY o.display_id ASC
    `);

    const rows = ordersRes.rows;
    console.log(`[Backfill Payments] Found ${rows.length} order(s) missing payment_collection.`);

    const settledRecords: SettledRecord[] = [];
    const pendingRecords: PendingRecord[] = [];
    let settledZeroCount = 0;
    let skippedZeroPendingCount = 0;
    const sampleSettled: string[] = [];
    const samplePending: string[] = [];
    const backfillTimestamp = new Date().toISOString();

    for (const row of rows) {
      const meta = (row.metadata || {}) as Record<string, any>;
      const status = String(row.status || "").toLowerCase();
      const currency = String(row.currency_code || "inr").toLowerCase();
      const wooId = meta.woo_order_id !== undefined ? String(meta.woo_order_id) : "";
      const woo = wooId ? wooMap.get(wooId) : undefined;

      const metaPayStatus = String(meta.payment_status || "").toLowerCase();
      const paymentMethod =
        String(meta.payment_method || woo?.payment_method || "cod")
          .trim()
          .toLowerCase() || "cod";
      const txId = String(meta.payment_id || woo?.transaction_id || "").trim();
      const rawPaidDate =
        meta.payment_paid_at ||
        meta.offline_payment_recorded_at ||
        woo?.date_paid ||
        woo?.meta_data?._paid_date ||
        woo?.meta_data?._date_paid ||
        null;

      const isSettled =
        metaPayStatus === "paid" ||
        status === "completed" ||
        (paymentMethod === "razorpay" && Boolean(txId)) ||
        Boolean(rawPaidDate);

      const totals = row.totals || {};
      const summaryCurrentTotal = Number(totals.current_order_total);
      const payableAmount =
        Number.isFinite(summaryCurrentTotal) && summaryCurrentTotal >= 0
          ? roundInr(summaryCurrentTotal)
          : roundInr(Math.max(0, Number(meta.total || meta.subtotal || 0) || 0));

      const rawAmountJson = JSON.stringify({
        value: String(payableAmount),
        precision: 20,
      });

      const createdIso = new Date(row.created_at).toISOString();
      const paidIso = parseIsoTimestamp(rawPaidDate, createdIso);

      if (isSettled) {
        if (payableAmount === 0) settledZeroCount += 1;
        if (sampleSettled.length < 5) {
          sampleSettled.push(
            `#${row.display_id} (${meta.order_number || row.id}, ${paymentMethod}, ₹${payableAmount}, tx=${txId || "-"})`
          );
        }

        const payColId = generateEntityId(undefined, "paycol");
        const opcId = generateEntityId(undefined, "ordpaycol");
        const sessionId =
          payableAmount > 0 ? generateEntityId(undefined, "payses") : null;
        const paymentId =
          payableAmount > 0 ? generateEntityId(undefined, "pay") : null;
        const captureId =
          payableAmount > 0 ? generateEntityId(undefined, "capt") : null;
        const txRowId =
          payableAmount > 0 ? generateEntityId(undefined, "ordtx") : null;

        let nextTotalsJson: string | null = null;
        if (payableAmount > 0 && row.summary_id) {
          const curOrderTotal = Number(totals.current_order_total ?? payableAmount);
          const existingTxTotal = Number(totals.transaction_total ?? 0);
          const existingPaidTotal = Number(totals.paid_total ?? 0);
          const newPaidTotal = roundInr(existingPaidTotal + payableAmount);
          const newTxTotal = roundInr(existingTxTotal + payableAmount);
          const newPendingDiff = roundInr(curOrderTotal - newTxTotal);

          nextTotalsJson = JSON.stringify({
            ...totals,
            paid_total: newPaidTotal,
            raw_paid_total: { value: String(newPaidTotal), precision: 20 },
            transaction_total: newTxTotal,
            raw_transaction_total: { value: String(newTxTotal), precision: 20 },
            pending_difference: newPendingDiff,
            raw_pending_difference: {
              value: String(newPendingDiff),
              precision: 20,
            },
          });
        }

        settledRecords.push({
          orderId: row.id,
          version: row.version,
          summaryId: row.summary_id,
          currency,
          payableAmount,
          rawAmountJson,
          paidIso,
          payColId,
          opcId,
          sessionId,
          paymentId,
          captureId,
          txRowId,
          pcMetaJson: JSON.stringify({
            payment_method: paymentMethod,
            ...(txId ? { payment_reference: txId } : {}),
            backfilled_by: "backfill_order_payments",
            backfilled_at: backfillTimestamp,
          }),
          nextTotalsJson,
          nextOrderMetaJson: JSON.stringify({
            ...meta,
            payment_status: "paid",
            payment_method: paymentMethod,
            ...(txId && !meta.payment_id ? { payment_id: txId } : {}),
            ...(meta.payment_amount === undefined
              ? { payment_amount: payableAmount }
              : {}),
            ...(!meta.payment_paid_at ? { payment_paid_at: paidIso } : {}),
          }),
        });
      } else {
        if (payableAmount <= 0) {
          skippedZeroPendingCount += 1;
          continue;
        }
        if (samplePending.length < 5) {
          samplePending.push(
            `#${row.display_id} (${meta.order_number || row.id}, ${paymentMethod}, ₹${payableAmount})`
          );
        }

        pendingRecords.push({
          orderId: row.id,
          currency,
          payableAmount,
          rawAmountJson,
          createdIso,
          payColId: generateEntityId(undefined, "paycol"),
          opcId: generateEntityId(undefined, "ordpaycol"),
          pcMetaJson: JSON.stringify({
            payment_method: paymentMethod,
            backfilled_by: "backfill_order_payments",
            backfilled_at: backfillTimestamp,
          }),
          nextOrderMetaJson: JSON.stringify({
            ...meta,
            payment_status: metaPayStatus || "pending",
            payment_method: paymentMethod,
          }),
        });
      }
    }

    if (!dryRun && (settledRecords.length > 0 || pendingRecords.length > 0)) {
      await client.query("BEGIN");
      for (const batch of chunkArray(settledRecords, 300)) {
        await flushSettledBatch(client, batch);
      }
      for (const batch of chunkArray(pendingRecords, 300)) {
        await flushPendingBatch(client, batch);
      }
      await client.query("COMMIT");
      console.log("[Backfill Payments] Transaction committed.");
    }

    console.log("=====================================================");
    console.log(
      `[Backfill Payments Summary] dryRun=${dryRun}\n` +
        `  Settled -> Captured (Paid): ${settledRecords.length} (zero-amount=${settledZeroCount})\n` +
        `  Pending -> Not Paid collection: ${pendingRecords.length} (zero-amount skipped=${skippedZeroPendingCount})\n` +
        `  Sample Paid: ${sampleSettled.join(" | ")}\n` +
        `  Sample Not Paid: ${samplePending.join(" | ")}`
    );
    console.log("=====================================================");
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
  console.error("[Backfill Payments Failed]:", err);
  process.exit(1);
});
