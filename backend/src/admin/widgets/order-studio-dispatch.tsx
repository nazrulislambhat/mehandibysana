import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types";
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

type FulfillmentStage =
  | "received"
  | "preparing"
  | "dispatched"
  | "delivered"
  | "cancelled";

type PaymentStatusValue = "pending" | "paid" | "refunded";

interface EmailProviderInfo {
  configured: boolean;
  provider: "resend" | "brevo" | "smtp" | "log-only";
  fromEmail: string;
  autoSendOrderConfirmation?: boolean;
  autoSendShippingEmail?: boolean;
}

const STAGE_OPTIONS: Array<{ value: FulfillmentStage; label: string }> = [
  { value: "received", label: "01 · Order Received" },
  { value: "preparing", label: "02 · Small-Batch Prep" },
  { value: "dispatched", label: "03 · Shipped / Dispatched" },
  { value: "delivered", label: "04 · Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS: Array<{
  value: PaymentStatusValue;
  label: string;
}> = [
  { value: "pending", label: "Pending / Not Paid" },
  { value: "paid", label: "Paid / Settled" },
  { value: "refunded", label: "Refunded" },
];

const BASE_PAYMENT_METHOD_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "offline_upi", label: "Offline UPI (GPay / PhonePe)" },
  { value: "offline_cash", label: "Offline Cash / Counter" },
  { value: "offline_bank", label: "Offline Bank Transfer (NEFT / IMPS)" },
  { value: "bacs", label: "Direct Bank Transfer (BACS)" },
  { value: "cod", label: "Cash on Delivery (COD)" },
  { value: "razorpay", label: "Razorpay Online" },
  { value: "free_coupon", label: "100% Coupon Discount" },
];

const COURIER_PRESETS = [
  "Local Courier",
  "Srinagar Local Rider",
  "Bengaluru Local Rider",
  "India Post Speed Post",
  "Delhivery",
  "DTDC",
  "Blue Dart",
];

function resolveStage(
  meta: Record<string, unknown>,
  status: string
): FulfillmentStage {
  const raw = String(meta.fulfillment_stage || "").toLowerCase();
  if (
    raw === "received" ||
    raw === "preparing" ||
    raw === "dispatched" ||
    raw === "delivered" ||
    raw === "cancelled"
  ) {
    return raw;
  }
  const st = status.toLowerCase();
  if (st === "canceled" || st === "cancelled") return "cancelled";
  if (st === "completed") return "preparing";
  return "received";
}

function resolveNativePaymentStatus(order: any): string {
  const direct = String(order?.payment_status || "").toLowerCase();
  if (direct) return direct;

  const pcs = Array.isArray(order?.payment_collections)
    ? order.payment_collections
    : [];
  const active = pcs.filter((pc: any) => pc && pc.status !== "canceled");
  if (active.length === 0) return "not_paid";

  const refunded = active.some((pc: any) => Number(pc.refunded_amount || 0) > 0);
  if (refunded) {
    const allRefunded = active.every((pc: any) => {
      const amt = Number(pc.amount || 0);
      const ref = Number(pc.refunded_amount || 0);
      return amt > 0 && ref >= amt - 0.01;
    });
    return allRefunded ? "refunded" : "partially_refunded";
  }

  const allCaptured = active.every((pc: any) => {
    const amt = Number(pc.amount || 0);
    const cap = Number(pc.captured_amount || 0);
    return pc.status === "completed" || (amt > 0 && cap >= amt - 0.01);
  });
  if (allCaptured) return "captured";
  if (
    active.some(
      (pc: any) =>
        pc.status === "completed" || Number(pc.captured_amount || 0) > 0
    )
  ) {
    return "partially_captured";
  }
  return "not_paid";
}

function resolvePaymentStatus(
  meta: Record<string, unknown>,
  orderStatus: string,
  nativePayStatus: string
): PaymentStatusValue {
  if (
    nativePayStatus === "refunded" ||
    nativePayStatus === "partially_refunded"
  ) {
    return "refunded";
  }
  if (
    nativePayStatus === "captured" ||
    nativePayStatus === "partially_captured"
  ) {
    return "paid";
  }
  const raw = String(meta.payment_status || "").toLowerCase();
  if (raw === "paid" || raw === "refunded" || raw === "pending") {
    return raw;
  }
  return orderStatus.toLowerCase() === "completed" ? "paid" : "pending";
}

function resolvePaymentMethod(meta: Record<string, unknown>): string {
  const raw = String(meta.payment_method || "").trim();
  return raw || "cod";
}

function resolveOrderBreakdown(order: any, meta: Record<string, unknown>) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const itemsFromLines = items.reduce(
    (sum: number, item: any) =>
      sum + (Number(item?.unit_price) || 0) * (Number(item?.quantity) || 1),
    0
  );
  const itemsTotal =
    Number.isFinite(Number(order?.item_subtotal)) && Number(order?.item_subtotal) > 0
      ? Number(order.item_subtotal)
      : Number.isFinite(Number(order?.item_total)) && Number(order?.item_total) > 0
        ? Number(order.item_total)
        : itemsFromLines > 0
          ? itemsFromLines
          : Math.max(0, Number(meta.subtotal) || 0);

  const shippingMethods = Array.isArray(order?.shipping_methods)
    ? order.shipping_methods
    : [];
  const shippingFromMethods = shippingMethods.reduce(
    (sum: number, sm: any) => sum + (Number(sm?.amount) || 0),
    0
  );
  const shippingTotal =
    Number.isFinite(Number(order?.shipping_total)) && Number(order?.shipping_total) > 0
      ? Number(order.shipping_total)
      : shippingMethods.length > 0
        ? shippingFromMethods
        : Math.max(0, Number(meta.shipping_fee) || 0);

  const discountTotal =
    Number.isFinite(Number(order?.discount_total)) && Number(order?.discount_total) > 0
      ? Number(order.discount_total)
      : Math.max(0, Number(meta.discount_amount) || 0);

  const computedTotal = Math.max(0, itemsTotal + shippingTotal - discountTotal);
  const orderTotal =
    Number.isFinite(Number(order?.total)) && Number(order?.total) >= 0
      ? Number(order.total)
      : Number.isFinite(Number(order?.summary?.current_order_total)) &&
          Number(order?.summary?.current_order_total) >= 0
        ? Number(order.summary.current_order_total)
        : Number.isFinite(Number(meta.total)) && Number(meta.total) >= 0
          ? Number(meta.total)
          : computedTotal;

  return {
    itemsTotal: Math.round(itemsTotal * 100) / 100,
    shippingTotal: Math.round(shippingTotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    orderTotal: Math.round(orderTotal * 100) / 100,
  };
}

function resolveDefaultAmount(
  order: any,
  meta: Record<string, unknown>,
  nativePayStatus?: string
): string {
  const { orderTotal } = resolveOrderBreakdown(order, meta);
  const isSettled =
    nativePayStatus === "captured" ||
    nativePayStatus === "partially_captured" ||
    nativePayStatus === "refunded";
  if (
    isSettled &&
    meta.payment_amount !== undefined &&
    meta.payment_amount !== null &&
    String(meta.payment_amount).trim() !== ""
  ) {
    return String(meta.payment_amount);
  }
  if (Number.isFinite(orderTotal) && orderTotal >= 0) {
    return String(orderTotal);
  }
  if (
    meta.payment_amount !== undefined &&
    meta.payment_amount !== null &&
    String(meta.payment_amount).trim() !== ""
  ) {
    return String(meta.payment_amount);
  }
  return "";
}

function formatPaymentLabel(raw: string): string {
  const found = BASE_PAYMENT_METHOD_OPTIONS.find((m) => m.value === raw);
  return found ? found.label : raw || "Cash on Delivery";
}

function formatNativeStatusLabel(raw: string): string {
  if (raw === "captured") return "PAID";
  if (raw === "partially_captured") return "PARTIAL";
  if (raw === "refunded") return "REFUNDED";
  if (raw === "partially_refunded") return "PARTIAL REFUND";
  if (raw === "authorized") return "AUTHORIZED";
  if (raw === "awaiting") return "AWAITING";
  return "NOT PAID";
}

function formatTimestampShort(raw: unknown): string {
  const str = String(raw || "").trim();
  if (!str) return "";
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const OrderStudioDispatchWidget = ({
  data,
}: DetailWidgetProps<AdminOrder>) => {
  const queryClient = useQueryClient();
  const orderAny = data as any;
  const initialMeta = ((data.metadata || {}) as Record<string, unknown>);
  const orderStatus = String(data.status || "pending").toLowerCase();
  const isCanceled = orderStatus === "canceled" || orderStatus === "cancelled";
  const isCompleted = orderStatus === "completed";
  const nativePayStatus = resolveNativePaymentStatus(orderAny);

  const hasCustomerEmail =
    Boolean(data.email) &&
    String(data.email).trim().toLowerCase() !== "guest@mehandibysana.com";

  const [emailProviderStatus, setEmailProviderStatus] =
    useState<EmailProviderInfo | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue>(
    resolvePaymentStatus(initialMeta, orderStatus, nativePayStatus)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    resolvePaymentMethod(initialMeta)
  );
  const [paymentReference, setPaymentReference] = useState<string>(
    String(initialMeta.payment_id || "")
  );
  const [paymentAmount, setPaymentAmount] = useState<string>(
    resolveDefaultAmount(orderAny, initialMeta, nativePayStatus)
  );
  const [offlinePaymentNote, setOfflinePaymentNote] = useState<string>(
    String(initialMeta.offline_payment_note || "")
  );
  const [sendPaymentReceiptEmail, setSendPaymentReceiptEmail] =
    useState<boolean>(false);

  const [fulfillmentStage, setFulfillmentStage] = useState<FulfillmentStage>(
    resolveStage(initialMeta, orderStatus)
  );
  const [courierName, setCourierName] = useState<string>(
    String(initialMeta.courier_name || "")
  );
  const [trackingNumber, setTrackingNumber] = useState<string>(
    String(initialMeta.tracking_number || "")
  );
  const [trackingUrl, setTrackingUrl] = useState<string>(
    String(initialMeta.tracking_url || "")
  );
  const [dispatchNote, setDispatchNote] = useState<string>(
    String(initialMeta.dispatch_note || "")
  );

  const [alsoCompleteOrder, setAlsoCompleteOrder] = useState<boolean>(false);
  const [sendEmail, setSendEmail] = useState<boolean>(hasCustomerEmail);
  const [submitting, setSubmitting] = useState<
    | "complete"
    | "payment"
    | "dispatch"
    | "resend_confirm"
    | "resend_ship"
    | null
  >(null);

  useEffect(() => {
    let active = true;
    fetch(`/admin/orders/${data.id}/studio-dispatch`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        if (active && json?.emailProviderStatus) {
          setEmailProviderStatus(json.emailProviderStatus);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [data.id]);

  useEffect(() => {
    const meta = ((data.metadata || {}) as Record<string, unknown>);
    const nextStatus = String(data.status || "pending").toLowerCase();
    const nextNativePay = resolveNativePaymentStatus(data as any);
    setPaymentStatus(resolvePaymentStatus(meta, nextStatus, nextNativePay));
    setPaymentMethod(resolvePaymentMethod(meta));
    setPaymentReference(String(meta.payment_id || ""));
    setPaymentAmount(resolveDefaultAmount(data as any, meta, nextNativePay));
    setOfflinePaymentNote(String(meta.offline_payment_note || ""));
    setFulfillmentStage(resolveStage(meta, nextStatus));
    setCourierName(String(meta.courier_name || ""));
    setTrackingNumber(String(meta.tracking_number || ""));
    setTrackingUrl(String(meta.tracking_url || ""));
    setDispatchNote(String(meta.dispatch_note || ""));
    setAlsoCompleteOrder(false);
  }, [data.id, data.status, data.metadata, nativePayStatus]);

  const paymentMethodOptions = useMemo(() => {
    const exists = BASE_PAYMENT_METHOD_OPTIONS.some(
      (opt) => opt.value === paymentMethod
    );
    if (!paymentMethod || exists) return BASE_PAYMENT_METHOD_OPTIONS;
    return [
      ...BASE_PAYMENT_METHOD_OPTIONS,
      { value: paymentMethod, label: paymentMethod },
    ];
  }, [paymentMethod]);

  const refreshOrderCaches = async () => {
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
    await queryClient.invalidateQueries({ queryKey: ["order", data.id] });
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        JSON.stringify(query.queryKey).includes(data.id),
    });
  };

  const submitStudioUpdate = async (
    kind: NonNullable<typeof submitting>,
    payload: Record<string, unknown>,
    successLabel: string
  ) => {
    setSubmitting(kind);
    try {
      const res = await fetch(`/admin/orders/${data.id}/studio-dispatch`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        success?: boolean;
        message?: string;
        emailSkippedReason?: string | null;
        emailProviderStatus?: EmailProviderInfo;
        emailResult?: {
          customerEmailSent?: boolean;
          provider?: string;
          error?: string;
        } | null;
      };

      if (json.emailProviderStatus) {
        setEmailProviderStatus(json.emailProviderStatus);
      }

      if (!res.ok || !json.success) {
        toast.error(json.message || "Could not update order.");
        return;
      }

      await refreshOrderCaches();

      if (
        payload.sendEmail ||
        kind === "resend_confirm" ||
        kind === "resend_ship"
      ) {
        if (json.emailResult?.customerEmailSent) {
          toast.success(
            `${successLabel} Email sent to ${data.email} via ${
              json.emailResult.provider || "email"
            }.`
          );
        } else if (json.emailSkippedReason) {
          toast.warning(`${successLabel} ${json.emailSkippedReason}`);
        } else if (json.emailResult?.error) {
          toast.warning(`${successLabel} ${json.emailResult.error}`);
        } else {
          toast.info(
            `${successLabel} Update logged (provider: ${
              json.emailResult?.provider || "log-only"
            }).`
          );
        }
      } else {
        toast.success(successLabel);
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error while saving order update.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleCompleteOrder = () => {
    void submitStudioUpdate(
      "complete",
      {
        action: "complete_order",
        completeOrder: true,
        fulfillmentStage,
        courierName,
        trackingNumber,
        trackingUrl,
        dispatchNote,
        sendEmail: hasCustomerEmail && sendEmail,
      },
      "Order marked completed."
    );
  };

  const handleSaveManualPayment = () => {
    const parsedAmt =
      paymentAmount.trim() !== "" && Number.isFinite(Number(paymentAmount))
        ? Number(paymentAmount)
        : undefined;

    void submitStudioUpdate(
      "payment",
      {
        action: "update_payment",
        paymentStatus,
        paymentMethod,
        paymentReference,
        paymentAmount: parsedAmt,
        offlinePaymentNote,
        sendEmail: hasCustomerEmail && sendPaymentReceiptEmail,
      },
      paymentStatus === "paid"
        ? "Payment marked Paid & Medusa ledger synced."
        : paymentStatus === "refunded"
          ? "Payment marked Refunded & Medusa ledger synced."
          : "Payment info saved."
    );
  };

  const handleQuickMarkPaid = () => {
    const parsedAmt =
      paymentAmount.trim() !== "" && Number.isFinite(Number(paymentAmount))
        ? Number(paymentAmount)
        : undefined;
    setPaymentStatus("paid");
    void submitStudioUpdate(
      "payment",
      {
        action: "update_payment",
        paymentStatus: "paid",
        paymentMethod,
        paymentReference,
        paymentAmount: parsedAmt,
        offlinePaymentNote,
        sendEmail: hasCustomerEmail && sendPaymentReceiptEmail,
      },
      "Payment marked Paid & Medusa ledger synced."
    );
  };

  const handleSaveDispatch = () => {
    void submitStudioUpdate(
      "dispatch",
      {
        action: "update_dispatch",
        fulfillmentStage,
        courierName,
        trackingNumber,
        trackingUrl,
        dispatchNote,
        completeOrder: alsoCompleteOrder,
        sendEmail: hasCustomerEmail && sendEmail,
      },
      "Shipping & courier details saved."
    );
  };

  const handleResendConfirmationEmail = () => {
    void submitStudioUpdate(
      "resend_confirm",
      {
        action: "resend_confirmation_email",
        sendEmail: true,
      },
      "Order confirmation email processed."
    );
  };

  const handleResendShippingEmail = () => {
    void submitStudioUpdate(
      "resend_ship",
      {
        action: "resend_shipping_email",
        courierName,
        trackingNumber,
        trackingUrl,
        dispatchNote,
        sendEmail: true,
      },
      "Shipping email processed."
    );
  };

  const currentStage = resolveStage(initialMeta, orderStatus);
  const currentPaymentStatus = resolvePaymentStatus(
    initialMeta,
    orderStatus,
    nativePayStatus
  );
  const currentPaymentMethod = resolvePaymentMethod(initialMeta);
  const amountBreakdown = resolveOrderBreakdown(orderAny, initialMeta);
  const isLedgerOutOfSync =
    nativePayStatus === "not_paid" &&
    (String(initialMeta.payment_status || "").toLowerCase() === "paid" ||
      orderStatus === "completed");

  const stageBadgeColor =
    currentStage === "delivered"
      ? "green"
      : currentStage === "dispatched"
        ? "blue"
        : currentStage === "cancelled"
          ? "red"
          : "orange";

  const ledgerBadgeColor =
    nativePayStatus === "captured"
      ? "green"
      : nativePayStatus === "refunded" || nativePayStatus === "partially_refunded"
        ? "grey"
        : "orange";

  const confSentAt = formatTimestampShort(
    initialMeta.order_confirmation_email_sent_at ||
      initialMeta.order_confirmation_email_attempted_at
  );
  const confSent = Boolean(initialMeta.order_confirmation_email_sent);
  const confError = String(initialMeta.order_confirmation_email_error || "");

  const shipSentAt = formatTimestampShort(
    initialMeta.shipping_email_sent_at || initialMeta.shipping_email_attempted_at
  );
  const shipSent = Boolean(initialMeta.shipping_email_sent);
  const shipError = String(initialMeta.shipping_email_error || "");

  return (
    <Container className="divide-y p-0">
      {/* Header + Quick Complete */}
      <div className="px-6 py-4 space-y-3">
        <div>
          <Heading level="h2">Order, Payment &amp; Courier Dispatch</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Sync payment status, record manual transactions, dispatch parcels, and send customer emails.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            size="2xsmall"
            color={isCompleted ? "green" : isCanceled ? "red" : "orange"}
          >
            ORDER: {orderStatus.toUpperCase()}
          </Badge>
          <Badge size="2xsmall" color={ledgerBadgeColor}>
            PAY: {formatNativeStatusLabel(nativePayStatus)} ·{" "}
            {formatPaymentLabel(currentPaymentMethod)}
          </Badge>
          <Badge size="2xsmall" color={stageBadgeColor}>
            SHIP: {currentStage.toUpperCase()}
          </Badge>
          {Boolean(initialMeta.coupon_code) && (
            <Badge size="2xsmall" color="purple">
              COUPON: {String(initialMeta.coupon_code)}
              {Number(initialMeta.discount_amount) > 0
                ? ` (-₹${Number(initialMeta.discount_amount).toLocaleString("en-IN")})`
                : ""}
            </Badge>
          )}
        </div>

        {isLedgerOutOfSync && !isCanceled && (
          <div className="rounded-md border border-ui-tag-orange-border bg-ui-tag-orange-bg p-3 space-y-2">
            <Text size="xsmall" weight="plus">
              Medusa payment ledger shows NOT PAID even though payment status is{" "}
              {currentPaymentStatus.toUpperCase()}.
            </Text>
            <Button
              size="small"
              variant="secondary"
              className="w-full"
              disabled={submitting !== null}
              isLoading={submitting === "payment"}
              onClick={handleQuickMarkPaid}
            >
              Sync Medusa Ledger to Paid
            </Button>
          </div>
        )}

        {emailProviderStatus && !emailProviderStatus.configured && (
          <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-2.5 text-[11px] leading-relaxed">
            <span className="font-semibold">Email Delivery: Log-Only.</span>{" "}
            Configure SMTP / Resend / Brevo in{" "}
            <a
              href="/app/email-campaigns"
              className="underline font-medium text-ui-fg-interactive"
            >
              Email Campaigns
            </a>{" "}
            so customer order &amp; shipping emails reach inboxes.
          </div>
        )}

        {!isCompleted && !isCanceled && (
          <Button
            size="small"
            variant="primary"
            className="w-full"
            disabled={submitting !== null}
            isLoading={submitting === "complete"}
            onClick={handleCompleteOrder}
          >
            Complete Order
          </Button>
        )}

        {isCanceled && (
          <Text size="small" className="text-ui-fg-error">
            This order is cancelled and locked from payment &amp; dispatch edits.
          </Text>
        )}
      </div>

      {/* Customer Email Delivery Status + Manual Triggers */}
      {!isCanceled && (
        <div className="px-6 py-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <Text size="small" weight="plus">
              Customer Emails
            </Text>
            {emailProviderStatus && (
              <Badge
                size="2xsmall"
                color={emailProviderStatus.configured ? "green" : "orange"}
              >
                {emailProviderStatus.configured
                  ? emailProviderStatus.provider.toUpperCase()
                  : "LOG ONLY"}
              </Badge>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-ui-fg-subtle">
            <div className="flex items-center justify-between gap-2">
              <span>Order Confirmation:</span>
              <span
                className={
                  confSent
                    ? "text-ui-fg-base font-medium"
                    : confError
                      ? "text-ui-fg-error"
                      : ""
                }
              >
                {confSent
                  ? `Sent${confSentAt ? ` (${confSentAt})` : ""}`
                  : confSentAt
                    ? `Not sent (${confSentAt})`
                    : "Not recorded"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span>Shipping Notification:</span>
              <span
                className={
                  shipSent
                    ? "text-ui-fg-base font-medium"
                    : shipError
                      ? "text-ui-fg-error"
                      : ""
                }
              >
                {shipSent
                  ? `Sent${shipSentAt ? ` (${shipSentAt})` : ""}`
                  : shipSentAt
                    ? `Not sent (${shipSentAt})`
                    : "Not sent yet"}
              </span>
            </div>

            {(confError || shipError) && (
              <Text size="xsmall" className="text-ui-fg-error">
                {shipError || confError}
              </Text>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              size="small"
              variant="secondary"
              disabled={submitting !== null || !hasCustomerEmail}
              isLoading={submitting === "resend_confirm"}
              onClick={handleResendConfirmationEmail}
            >
              {confSent ? "Resend Confirmation" : "Send Confirmation"}
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={submitting !== null || !hasCustomerEmail}
              isLoading={submitting === "resend_ship"}
              onClick={handleResendShippingEmail}
            >
              {shipSent ? "Resend Shipping" : "Email Shipping"}
            </Button>
          </div>
        </div>
      )}

      {/* Manual Payment Info Section */}
      {!isCanceled && (
        <div className="px-6 py-4 space-y-3">
          <div>
            <Text size="small" weight="plus">
              Manual Payment Info &amp; Ledger Sync
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Update Payment Status, Mode, UTR / Transaction ID, or Amount. Syncs Medusa&apos;s native payment status automatically.
            </Text>
          </div>

          <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-ui-fg-subtle">Items Value</span>
              <span className="tabular-nums">
                ₹{amountBreakdown.itemsTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ui-fg-subtle">Shipping</span>
              <span className="tabular-nums">
                {amountBreakdown.shippingTotal === 0
                  ? "₹0"
                  : `₹${amountBreakdown.shippingTotal.toLocaleString("en-IN")}`}
              </span>
            </div>
            {amountBreakdown.discountTotal > 0 && (
              <div className="flex items-center justify-between text-ui-fg-interactive">
                <span>Discount</span>
                <span className="tabular-nums">
                  -₹{amountBreakdown.discountTotal.toLocaleString("en-IN")}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-ui-border-base pt-1 font-semibold">
              <span>Payable Total (Items + Shipping)</span>
              <span className="tabular-nums">
                ₹{amountBreakdown.orderTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label size="xsmall">Payment Status</Label>
              <Select
                size="small"
                value={paymentStatus}
                onValueChange={(val) =>
                  setPaymentStatus(val as PaymentStatusValue)
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select payment status" />
                </Select.Trigger>
                <Select.Content>
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div>
              <Label size="xsmall">Payment Mode</Label>
              <Select
                size="small"
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select payment method" />
                </Select.Trigger>
                <Select.Content>
                  {paymentMethodOptions.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label size="xsmall">Amount (INR)</Label>
                <Input
                  size="small"
                  type="number"
                  placeholder="330"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div>
                <Label size="xsmall">Transaction / UTR ID</Label>
                <Input
                  size="small"
                  placeholder="pay_... / UPI Ref"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label size="xsmall">Payment Note (Optional)</Label>
              <Input
                size="small"
                placeholder="e.g. Verified GPay screenshot / Cash collected"
                value={offlinePaymentNote}
                onChange={(e) => setOfflinePaymentNote(e.target.value)}
              />
            </div>
          </div>

          <label
            className={`flex items-start gap-2 ${
              hasCustomerEmail ? "cursor-pointer" : "opacity-60"
            }`}
          >
            <Checkbox
              checked={hasCustomerEmail && sendPaymentReceiptEmail}
              disabled={!hasCustomerEmail}
              onCheckedChange={(v) => setSendPaymentReceiptEmail(Boolean(v))}
            />
            <Text size="xsmall">
              {hasCustomerEmail
                ? `Also email payment receipt to ${data.email}`
                : "No customer email on file"}
            </Text>
          </label>

          <div className="space-y-2">
            {nativePayStatus !== "captured" && paymentStatus !== "paid" && (
              <Button
                size="small"
                variant="primary"
                className="w-full"
                disabled={submitting !== null}
                isLoading={submitting === "payment"}
                onClick={handleQuickMarkPaid}
              >
                Mark as Paid Now
              </Button>
            )}
            <Button
              size="small"
              variant={
                nativePayStatus !== "captured" && paymentStatus === "paid"
                  ? "primary"
                  : "secondary"
              }
              className="w-full"
              disabled={submitting !== null}
              isLoading={submitting === "payment"}
              onClick={handleSaveManualPayment}
            >
              {nativePayStatus !== "captured" && paymentStatus === "paid"
                ? "Mark as Paid & Save Info"
                : "Save Payment Info"}
            </Button>
          </div>
        </div>
      )}

      {/* Courier & Shipping Section */}
      {!isCanceled && (
        <div className="px-6 py-4 space-y-3">
          <div>
            <Text size="small" weight="plus">
              Courier &amp; Shipping Update
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Add local courier or AWB tracking details and email the customer.
            </Text>
          </div>

          <div>
            <Label size="xsmall">Fulfillment Stage</Label>
            <Select
              size="small"
              value={fulfillmentStage}
              onValueChange={(val) =>
                setFulfillmentStage(val as FulfillmentStage)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select stage" />
              </Select.Trigger>
              <Select.Content>
                {STAGE_OPTIONS.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div>
            <Label size="xsmall">Quick Courier Presets</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {COURIER_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setCourierName(preset);
                    if (
                      fulfillmentStage === "received" ||
                      fulfillmentStage === "preparing"
                    ) {
                      setFulfillmentStage("dispatched");
                    }
                  }}
                  className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-2 py-1 text-[11px] font-medium text-ui-fg-base hover:bg-ui-bg-base-hover transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label size="xsmall">Courier / Delivery Service</Label>
            <Input
              size="small"
              placeholder="e.g. Local Courier / India Post"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
            />
          </div>

          <div>
            <Label size="xsmall">Tracking ID / Rider / Courier Info</Label>
            <Input
              size="small"
              placeholder="AWB # or e.g. Local rider dispatch today"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div>
            <Label size="xsmall">Tracking Link (Optional)</Label>
            <Input
              size="small"
              placeholder="https://..."
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
            />
          </div>

          <div>
            <Label size="xsmall">Message to Customer (Optional)</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Shipped via local Srinagar courier, reaching today by 6 PM."
              value={dispatchNote}
              onChange={(e) => setDispatchNote(e.target.value)}
            />
          </div>

          {!isCompleted && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <Checkbox
                checked={alsoCompleteOrder}
                onCheckedChange={(v) => setAlsoCompleteOrder(Boolean(v))}
              />
              <Text size="xsmall">Also mark order Completed</Text>
            </label>
          )}

          <label
            className={`flex items-start gap-2 ${
              hasCustomerEmail ? "cursor-pointer" : "opacity-60"
            }`}
          >
            <Checkbox
              checked={hasCustomerEmail && sendEmail}
              disabled={!hasCustomerEmail}
              onCheckedChange={(v) => setSendEmail(Boolean(v))}
            />
            <Text size="xsmall">
              {hasCustomerEmail
                ? `Email shipping update to ${data.email}`
                : "No customer email on file (email disabled)"}
            </Text>
          </label>

          <Button
            size="small"
            variant="primary"
            className="w-full"
            disabled={submitting !== null}
            isLoading={submitting === "dispatch"}
            onClick={handleSaveDispatch}
          >
            {hasCustomerEmail && sendEmail
              ? "Save & Email Shipping Info"
              : "Save Shipping Details"}
          </Button>
        </div>
      )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.side",
});

export default OrderStudioDispatchWidget;
