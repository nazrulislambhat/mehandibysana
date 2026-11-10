import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  PaymentCollectionStatus,
} from "@medusajs/framework/utils";
import {
  capturePaymentWorkflow,
  createOrderPaymentCollectionWorkflow,
  markPaymentCollectionAsPaid,
  refundPaymentWorkflow,
  updateOrderWorkflow,
} from "@medusajs/medusa/core-flows";
import { roundInr } from "./coupons";

export type StudioPaymentStatus = "pending" | "paid" | "refunded";

export interface SyncOrderPaymentInput {
  orderId: string;
  paymentStatus: StudioPaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paymentAmount?: number | string | null;
  paidAt?: string | null;
  note?: string;
  actorId?: string;
  skipMetadataUpdate?: boolean;
}

export interface SyncOrderPaymentResult {
  paymentStatus: StudioPaymentStatus;
  nativePaymentStatus: string;
  capturedAmount: number;
  refundedAmount: number;
  paymentCollectionId: string | null;
  changedNativeLedger: boolean;
}

function deriveNativePaymentStatus(
  paymentCollections: any[]
): string {
  if (!Array.isArray(paymentCollections) || paymentCollections.length === 0) {
    return "not_paid";
  }
  const active = paymentCollections.filter((pc) => pc && pc.status !== "canceled");
  if (active.length === 0) {
    return paymentCollections.every((pc) => pc?.status === "canceled")
      ? "canceled"
      : "not_paid";
  }

  let hasRefunded = false;
  let allRefunded = true;
  let capturedCount = 0;

  for (const pc of active) {
    const amt = Number(pc.amount || 0);
    const cap = Number(pc.captured_amount || 0);
    const ref = Number(pc.refunded_amount || 0);
    if (ref > 0) {
      hasRefunded = true;
      if (amt > 0 && ref < amt - 0.01) {
        allRefunded = false;
      }
    } else {
      allRefunded = false;
    }
    if (pc.status === "completed" || (amt > 0 && cap >= amt - 0.01) || (amt === 0 && pc.status === "completed")) {
      capturedCount += 1;
    }
  }

  if (hasRefunded) {
    return allRefunded && capturedCount === active.length
      ? "refunded"
      : "partially_refunded";
  }
  if (capturedCount === active.length) {
    return "captured";
  }
  if (capturedCount > 0) {
    return "partially_captured";
  }
  if (active.some((pc) => pc.status === "authorized")) {
    return "authorized";
  }
  if (active.some((pc) => pc.status === "awaiting")) {
    return "awaiting";
  }
  return "not_paid";
}

function computeOrderPayableTotal(order: any): number {
  const summaryTotal = Number(order?.summary?.current_order_total);
  if (Number.isFinite(summaryTotal) && summaryTotal >= 0) {
    return roundInr(summaryTotal);
  }
  const metaTotal = Number(order?.metadata?.total);
  if (Number.isFinite(metaTotal) && metaTotal >= 0) {
    return roundInr(metaTotal);
  }
  const items = Array.isArray(order?.items) ? order.items : [];
  const shippingMethods = Array.isArray(order?.shipping_methods)
    ? order.shipping_methods
    : [];
  const itemsSum = items.reduce(
    (sum: number, item: any) =>
      sum + (Number(item?.unit_price) || 0) * (Number(item?.quantity) || 1),
    0
  );
  const shipSum =
    shippingMethods.length > 0
      ? shippingMethods.reduce(
          (sum: number, sm: any) => sum + (Number(sm?.amount) || 0),
          0
        )
      : Number(order?.metadata?.shipping_fee) || 0;
  let discount = Number(order?.metadata?.discount_amount);
  if (!Number.isFinite(discount)) {
    discount = 0;
    for (const it of items) {
      for (const adj of it?.adjustments || []) {
        discount += Number(adj?.amount) || 0;
      }
    }
    for (const sm of shippingMethods) {
      for (const adj of sm?.adjustments || []) {
        discount += Number(adj?.amount) || 0;
      }
    }
  }
  return roundInr(Math.max(0, itemsSum + shipSum - discount));
}

export async function syncOrderNativePayment(
  scope: { resolve: (key: string) => any },
  input: SyncOrderPaymentInput
): Promise<SyncOrderPaymentResult> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);
  const paymentModule = scope.resolve(Modules.PAYMENT);
  const actorId = input.actorId || "admin";
  const nowIso = new Date().toISOString();

  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: input.orderId },
    fields: [
      "id",
      "display_id",
      "status",
      "currency_code",
      "metadata",
      "summary.*",
      "items.*",
      "items.adjustments.*",
      "shipping_methods.*",
      "shipping_methods.adjustments.*",
      "payment_collections.*",
      "payment_collections.payments.*",
      "payment_collections.payments.captures.*",
      "payment_collections.payments.refunds.*",
    ],
  });

  const order = (orders || [])[0] as any;
  if (!order) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order ${input.orderId} not found.`
    );
  }

  const existingMeta = ((order.metadata || {}) as Record<string, unknown>);
  const orderDefaultAmount = computeOrderPayableTotal(order);

  const hasExplicitAmount =
    input.paymentAmount !== undefined &&
    input.paymentAmount !== null &&
    String(input.paymentAmount).trim() !== "" &&
    Number.isFinite(Number(input.paymentAmount));

  const targetAmount = hasExplicitAmount
    ? roundInr(Math.max(0, Number(input.paymentAmount)))
    : orderDefaultAmount;

  const paymentCollections = Array.isArray(order.payment_collections)
    ? order.payment_collections.filter((pc: any) => pc && pc.status !== "canceled")
    : [];

  let activePc: any =
    paymentCollections.find((pc: any) => pc.status === "completed") ||
    paymentCollections.find((pc: any) => pc.status === "not_paid") ||
    paymentCollections[0] ||
    null;

  let changedNativeLedger = false;

  if (input.paymentStatus === "paid") {
    const alreadyCaptured = paymentCollections.some((pc: any) => {
      const cap = Number(pc.captured_amount || 0);
      const ref = Number(pc.refunded_amount || 0);
      const amt = Number(pc.amount || 0);
      const netCap = Math.max(0, cap - ref);
      return (
        (amt > 0 && netCap >= amt - 0.01) ||
        (amt === 0 && pc.status === "completed")
      );
    });

    if (!alreadyCaptured) {
      if (!activePc) {
        const { result: createdPcs } = await createOrderPaymentCollectionWorkflow(
          scope as any
        ).run({
          input: {
            order_id: input.orderId,
            amount: targetAmount,
          },
        });
        activePc = Array.isArray(createdPcs) ? createdPcs[0] : createdPcs;
        changedNativeLedger = true;
      } else if (
        hasExplicitAmount &&
        activePc.status === "not_paid" &&
        Number(activePc.amount) !== targetAmount
      ) {
        await paymentModule.updatePaymentCollections(activePc.id, {
          amount: targetAmount,
        });
        activePc.amount = targetAmount;
      }

      if (activePc) {
        const collectionAmount = Number(activePc.amount ?? targetAmount);
        if (collectionAmount <= 0) {
          // Medusa paymentModule.capturePayment rejects amount <= 0; mark ₹0 collection completed directly.
          await paymentModule.updatePaymentCollections(activePc.id, {
            status: PaymentCollectionStatus.COMPLETED,
            captured_amount: 0,
            completed_at: new Date(),
            metadata: {
              ...(activePc.metadata || {}),
              payment_method:
                input.paymentMethod ||
                String(existingMeta.payment_method || "free_coupon"),
              payment_reference:
                input.paymentReference ?? String(existingMeta.payment_id || ""),
              zero_amount_settled_by: actorId,
              zero_amount_settled_at: nowIso,
            },
          });
          changedNativeLedger = true;
        } else if (activePc.status === "not_paid") {
          await markPaymentCollectionAsPaid(scope as any).run({
            input: {
              order_id: input.orderId,
              payment_collection_id: activePc.id,
              captured_by: actorId,
            },
          });
          changedNativeLedger = true;
        } else {
          const payments = Array.isArray(activePc.payments)
            ? activePc.payments
            : [];
          const uncapturedPayments = payments.filter(
            (p: any) => !p.captured_at && !p.canceled_at
          );
          if (uncapturedPayments.length > 0) {
            for (const p of uncapturedPayments) {
              await capturePaymentWorkflow(scope as any).run({
                input: {
                  payment_id: p.id,
                  captured_by: actorId,
                  amount: Number(p.amount) > 0 ? Number(p.amount) : undefined,
                },
              });
              changedNativeLedger = true;
            }
          } else {
            // Partially captured or stale status without open payment -> ensure collection completes cleanly
            const { result: extraPcs } =
              await createOrderPaymentCollectionWorkflow(scope as any).run({
                input: {
                  order_id: input.orderId,
                  amount: collectionAmount,
                },
              });
            const extraPc = Array.isArray(extraPcs) ? extraPcs[0] : extraPcs;
            if (extraPc?.id) {
              await markPaymentCollectionAsPaid(scope as any).run({
                input: {
                  order_id: input.orderId,
                  payment_collection_id: extraPc.id,
                  captured_by: actorId,
                },
              });
              activePc = extraPc;
              changedNativeLedger = true;
            }
          }
        }
      }
    }

    if (activePc?.id) {
      await paymentModule
        .updatePaymentCollections(activePc.id, {
          metadata: {
            ...(activePc.metadata || {}),
            payment_method:
              input.paymentMethod ||
              String(existingMeta.payment_method || "offline_cash"),
            payment_reference:
              input.paymentReference ?? String(existingMeta.payment_id || ""),
            manual_payment_note:
              input.note ?? String(existingMeta.offline_payment_note || ""),
            updated_by: actorId,
            updated_at: nowIso,
          },
        })
        .catch(() => undefined);
    }
  } else if (input.paymentStatus === "pending") {
    const hasCapturedPayments = paymentCollections.some(
      (pc: any) =>
        Number(pc.captured_amount || 0) > 0 || pc.status === "completed"
    );
    if (hasCapturedPayments) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This order already has a captured payment in Medusa. Mark it as Refunded instead of resetting to Pending."
      );
    }
    if (!activePc && targetAmount > 0) {
      const { result: createdPcs } = await createOrderPaymentCollectionWorkflow(
        scope as any
      ).run({
        input: {
          order_id: input.orderId,
          amount: targetAmount,
        },
      });
      activePc = Array.isArray(createdPcs) ? createdPcs[0] : createdPcs;
      changedNativeLedger = true;
    } else if (
      hasExplicitAmount &&
      activePc?.status === "not_paid" &&
      Number(activePc.amount) !== targetAmount
    ) {
      await paymentModule.updatePaymentCollections(activePc.id, {
        amount: targetAmount,
      });
      activePc.amount = targetAmount;
      changedNativeLedger = true;
    }
  } else if (input.paymentStatus === "refunded") {
    for (const pc of paymentCollections) {
      const payments = Array.isArray(pc.payments) ? pc.payments : [];
      for (const p of payments) {
        if (!p.captured_at || p.canceled_at) continue;
        const capTotal = Number(p.amount || 0);
        const alreadyRefunded = (p.refunds || []).reduce(
          (sum: number, r: any) => sum + (Number(r.amount) || 0),
          0
        );
        const remaining = roundInr(Math.max(0, capTotal - alreadyRefunded));
        if (remaining > 0) {
          await refundPaymentWorkflow(scope as any).run({
            input: {
              payment_id: p.id,
              amount: remaining,
              note:
                input.note ||
                (input.paymentReference
                  ? `Refund Ref: ${input.paymentReference}`
                  : "Marked refunded in Admin"),
              created_by: actorId,
            },
          });
          changedNativeLedger = true;
        }
      }
    }
  }

  if (!input.skipMetadataUpdate) {
    const nextMeta: Record<string, unknown> = {
      ...existingMeta,
      payment_status: input.paymentStatus,
    };

    if (input.paymentMethod !== undefined && input.paymentMethod.trim()) {
      nextMeta.payment_method = input.paymentMethod.trim();
    }
    if (input.paymentReference !== undefined) {
      nextMeta.payment_id = input.paymentReference.trim();
    }
    if (hasExplicitAmount || input.paymentStatus === "paid") {
      nextMeta.payment_amount = targetAmount;
    }
    if (input.note !== undefined) {
      nextMeta.offline_payment_note = input.note.trim();
    }
    if (input.paymentStatus === "paid") {
      const resolvedPaidAt =
        input.paidAt?.trim() ||
        String(existingMeta.payment_paid_at || "") ||
        String(existingMeta.offline_payment_recorded_at || "") ||
        nowIso;
      nextMeta.payment_paid_at = resolvedPaidAt;
      nextMeta.offline_payment_recorded_at = resolvedPaidAt;
      nextMeta.payment_updated_by = actorId;
      nextMeta.payment_updated_at = nowIso;
    } else if (input.paymentStatus === "refunded") {
      nextMeta.refunded_at = nowIso;
      nextMeta.payment_updated_by = actorId;
      nextMeta.payment_updated_at = nowIso;
    }

    await updateOrderWorkflow(scope as any).run({
      input: {
        id: input.orderId,
        user_id: actorId,
        metadata: nextMeta,
      },
    });
  }

  const { data: refreshed } = await query.graph({
    entity: "order",
    filters: { id: input.orderId },
    fields: ["id", "currency_code", "payment_collections.*"],
  });

  const refreshedOrder = (refreshed || [])[0] as any;
  const refreshedPcs = Array.isArray(refreshedOrder?.payment_collections)
    ? refreshedOrder.payment_collections
    : [];

  const capturedAmount = refreshedPcs.reduce(
    (sum: number, pc: any) => sum + (Number(pc.captured_amount) || 0),
    0
  );
  const refundedAmount = refreshedPcs.reduce(
    (sum: number, pc: any) => sum + (Number(pc.refunded_amount) || 0),
    0
  );

  return {
    paymentStatus: input.paymentStatus,
    nativePaymentStatus: deriveNativePaymentStatus(refreshedPcs),
    capturedAmount,
    refundedAmount,
    paymentCollectionId: activePc?.id || refreshedPcs[0]?.id || null,
    changedNativeLedger,
  };
}
