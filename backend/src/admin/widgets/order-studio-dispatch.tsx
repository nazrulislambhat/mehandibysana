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

const DISPATCH_ORIGINS = [
  {
    value: "Srinagar Studio (Kashmir)",
    label: "🏔️ Srinagar Studio (Kashmir)",
    short: "Srinagar Studio",
  },
  {
    value: "Bengaluru Studio (Karnataka)",
    label: "🏙️ Bengaluru Studio (Karnataka)",
    short: "Bengaluru Studio",
  },
  {
    value: "Customer Self-Pickup",
    label: "🛍️ Direct Customer Pickup",
    short: "Customer Pickup",
  },
];

const BASE_PAYMENT_METHOD_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "offline_upi", label: "Offline UPI (GPay / PhonePe / Paytm)" },
  { value: "razorpay", label: "Razorpay Online (UPI / Card / NetBanking)" },
  { value: "cod", label: "Cash on Delivery (COD)" },
  { value: "offline_cash", label: "Cash on Counter / Hand-to-Hand" },
  { value: "offline_bank", label: "Direct Bank Transfer (NEFT / IMPS / BACS)" },
  { value: "free_coupon", label: "100% Coupon Discount" },
];

const COURIER_PRESETS = [
  "Delhivery",
  "Blue Dart",
  "DTDC",
  "India Post Speed Post",
  "Kashmir Local Rider",
  "Bengaluru Local Rider",
  "Direct Customer Pickup",
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
  if (st === "completed") return "delivered";
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

function resolveOrderTotal(order: any, meta: Record<string, unknown>): number {
  if (Number.isFinite(Number(order?.total)) && Number(order?.total) > 0) {
    return Number(order.total);
  }
  if (
    Number.isFinite(Number(order?.summary?.current_order_total)) &&
    Number(order?.summary?.current_order_total) > 0
  ) {
    return Number(order.summary.current_order_total);
  }
  if (Number.isFinite(Number(meta.total)) && Number(meta.total) > 0) {
    return Number(meta.total);
  }
  const subtotal = Math.max(0, Number(meta.subtotal) || 0);
  const shipping = Math.max(0, Number(meta.shipping_fee) || 0);
  const discount = Math.max(0, Number(meta.discount_amount) || 0);
  return Math.max(0, subtotal + shipping - discount);
}

function formatPaymentLabel(raw: string): string {
  const found = BASE_PAYMENT_METHOD_OPTIONS.find((m) => m.value === raw);
  return found ? found.label.split(" (")[0] : raw || "Cash on Delivery";
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
  const orderTotal = resolveOrderTotal(orderAny, initialMeta);

  const hasCustomerEmail =
    Boolean(data.email) &&
    String(data.email).trim().toLowerCase() !== "guest@mehandibysana.com";

  const [emailProviderStatus, setEmailProviderStatus] =
    useState<EmailProviderInfo | null>(null);

  // Payment states
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
    String(initialMeta.payment_amount || orderTotal || "")
  );
  const [offlinePaymentNote, setOfflinePaymentNote] = useState<string>(
    String(initialMeta.offline_payment_note || "")
  );
  const [sendPaymentReceiptEmail, setSendPaymentReceiptEmail] =
    useState<boolean>(false);

  // Dispatch / Fulfillment states
  const [fulfillmentStage, setFulfillmentStage] = useState<FulfillmentStage>(
    resolveStage(initialMeta, orderStatus)
  );
  const [dispatchOrigin, setDispatchOrigin] = useState<string>(
    String(initialMeta.dispatch_origin || "Srinagar Studio (Kashmir)")
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
  const [sendEmail, setSendEmail] = useState<boolean>(hasCustomerEmail);

  const [submitting, setSubmitting] = useState<
    | "complete"
    | "payment"
    | "dispatch"
    | "resend_confirm"
    | "resend_ship"
    | "send_invoice"
    | "send_paid_invoice"
    | null
  >(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
    setPaymentAmount(
      String(meta.payment_amount || resolveOrderTotal(data as any, meta) || "")
    );
    setOfflinePaymentNote(String(meta.offline_payment_note || ""));
    setFulfillmentStage(resolveStage(meta, nextStatus));
    setDispatchOrigin(
      String(meta.dispatch_origin || "Srinagar Studio (Kashmir)")
    );
    setCourierName(String(meta.courier_name || ""));
    setTrackingNumber(String(meta.tracking_number || ""));
    setTrackingUrl(String(meta.tracking_url || ""));
    setDispatchNote(String(meta.dispatch_note || ""));
  }, [data.id, data.status, data.metadata, nativePayStatus]);

  const isOrderPaid =
    paymentStatus === "paid" ||
    nativePayStatus === "captured" ||
    isCompleted;

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

  // 1-Click Action: Ship Order & Trigger Customer Email
  const handleShipOrder = () => {
    void submitStudioUpdate(
      "dispatch",
      {
        action: "ship_order",
        fulfillmentStage: "dispatched",
        dispatchOrigin,
        courierName: courierName || "Local Courier",
        trackingNumber,
        trackingUrl,
        dispatchNote,
        sendEmail: hasCustomerEmail && sendEmail,
      },
      "Order Dispatched & Customer Email Sent!"
    );
  };

  // 1-Click Action: Complete Order & Trigger Customer Email
  const handleCompleteOrder = () => {
    void submitStudioUpdate(
      "complete",
      {
        action: "complete_order",
        completeOrder: true,
        fulfillmentStage: "delivered",
        dispatchOrigin,
        courierName,
        trackingNumber,
        trackingUrl,
        dispatchNote,
        sendEmail: hasCustomerEmail && sendEmail,
      },
      "Order Completed & Customer Delivery Email Sent!"
    );
  };

  // 1-Click Action: Record Payment Received & Sync Ledger
  const handleRecordPayment = () => {
    const parsedAmt =
      paymentAmount.trim() !== "" && Number.isFinite(Number(paymentAmount))
        ? Number(paymentAmount)
        : orderTotal;

    setPaymentStatus("paid");
    void submitStudioUpdate(
      "payment",
      {
        action: "record_payment",
        paymentStatus: "paid",
        paymentMethod,
        paymentReference,
        paymentAmount: parsedAmt,
        offlinePaymentNote,
        sendEmail: hasCustomerEmail && sendPaymentReceiptEmail,
      },
      "Payment Recorded as PAID & Medusa Ledger Synced!"
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
        dispatchOrigin,
        sendEmail: true,
      },
      "Shipping email processed."
    );
  };

  const handleSendInvoiceEmail = async (forcePaid: boolean) => {
    setSubmitting(forcePaid ? "send_paid_invoice" : "send_invoice");
    try {
      const res = await fetch(`/admin/orders/${data.id}/invoice`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forcePaid }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to dispatch invoice email.");
        return;
      }
      await refreshOrderCaches();
      toast.success(
        `Tax invoice ${json.invoiceNumber || ""} (${forcePaid ? "PAID" : "Current Status"}) sent to customer & sana@mehandibysana.com!`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to dispatch invoice email.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeleteOrder = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/admin/orders/${data.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        // Fallback to studio-dispatch action if DELETE route was bypassed
        const fallbackRes = await fetch(
          `/admin/orders/${data.id}/studio-dispatch`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete_order" }),
          }
        );
        const fallbackJson = await fallbackRes.json().catch(() => ({}));
        if (!fallbackRes.ok || !fallbackJson.success) {
          toast.error(
            fallbackJson.message || json.message || "Failed to delete order."
          );
          setIsDeleting(false);
          return;
        }
      }
      toast.success(
        `Order #${orderAny.display_id || data.id.slice(-6)} deleted permanently.`
      );
      setTimeout(() => {
        window.location.href = "/app/orders";
      }, 500);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete order.");
      setIsDeleting(false);
    }
  };

  const currentStage = resolveStage(initialMeta, orderStatus);
  const currentOrigin = String(
    initialMeta.dispatch_origin || dispatchOrigin || "Srinagar Studio (Kashmir)"
  );

  const confSentAt = formatTimestampShort(
    initialMeta.order_confirmation_email_sent_at ||
      initialMeta.order_confirmation_email_attempted_at
  );
  const confSent = Boolean(initialMeta.order_confirmation_email_sent);
  const shipSentAt = formatTimestampShort(
    initialMeta.shipping_email_sent_at || initialMeta.shipping_email_attempted_at
  );
  const shipSent = Boolean(initialMeta.shipping_email_sent);

  const invoiceNumber = String(
    initialMeta.invoice_number ||
      `INV-MBS-${(orderAny.display_id ? String(orderAny.display_id).padStart(4, "0") : data.id.slice(-6)).toUpperCase()}`
  );
  const invoicePdfPath = String(initialMeta.invoice_pdf_path || "");
  const invoiceSentAt = formatTimestampShort(initialMeta.invoice_sent_at);

  return (
    <Container className="divide-y p-0 shadow-sm border border-ui-border-base bg-ui-bg-base mb-6">
      {/* Top Banner: Status & Quick Overview */}
      <div className="px-6 py-4 space-y-3 bg-ui-bg-subtle/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2" className="text-base font-semibold">
                Simplified Order Flow &amp; Dispatch
              </Heading>
              {isCompleted ? (
                <Badge size="2xsmall" color="green">COMPLETED</Badge>
              ) : isCanceled ? (
                <Badge size="2xsmall" color="red">CANCELLED</Badge>
              ) : (
                <Badge size="2xsmall" color="blue">ACTIVE</Badge>
              )}
            </div>
            <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">
              1-click fulfillment, payment recording, origin tracking &amp; automated customer emails.
            </Text>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-ui-fg-subtle block">Payable Total</span>
              <span className="text-base font-bold text-ui-fg-base tabular-nums">
                ₹{orderTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <Button
              size="small"
              variant="danger"
              onClick={() => setShowDeleteConfirm((prev) => !prev)}
              disabled={isDeleting || submitting !== null}
              className="text-xs font-medium"
            >
              🗑️ Delete Order
            </Button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-900 animate-in fade-in">
            <div className="text-xs">
              <strong className="block font-semibold text-red-950">⚠️ Permanently delete this order?</strong>
              Order #{orderAny.display_id || data.id.slice(-6)} and all its associated items and records will be deleted. This action cannot be undone.
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="small"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="danger"
                isLoading={isDeleting}
                disabled={isDeleting}
                onClick={handleDeleteOrder}
                className="bg-red-700 hover:bg-red-800 text-white font-medium"
              >
                Yes, Delete Order
              </Button>
            </div>
          </div>
        )}

        {/* Live Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge
            size="small"
            color={isOrderPaid ? "green" : "orange"}
            className="font-medium"
          >
            {isOrderPaid ? "✓ PAID" : "⏳ UNPAID / COD"} · {formatPaymentLabel(paymentMethod)}
          </Badge>

          <Badge
            size="small"
            color={
              currentStage === "delivered"
                ? "green"
                : currentStage === "dispatched"
                  ? "blue"
                  : "orange"
            }
            className="font-medium"
          >
            STAGE: {currentStage.toUpperCase()}
          </Badge>

          <Badge size="small" color="purple" className="font-medium">
            HUB: {currentOrigin.split(" (")[0]}
          </Badge>

          {Boolean(courierName) && (
            <Badge size="small" color="grey" className="font-mono">
              {courierName} {trackingNumber ? `· ${trackingNumber}` : ""}
            </Badge>
          )}
        </div>
      </div>

      {/* SECTION 1: IF UNPAID -> RECORD PAYMENT RECEIVED */}
      {!isOrderPaid && !isCanceled && (
        <div className="px-6 py-5 space-y-4 bg-ui-tag-orange-bg/20 border-l-4 border-l-ui-tag-orange-border">
          <div className="flex items-center justify-between">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-base flex items-center gap-1.5">
                <span>💰</span> Step 1: Record Payment Received
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Customer hasn&apos;t paid yet or ordered via COD. Select the payment mode to mark Paid and sync the ledger.
              </Text>
            </div>
            <Badge size="2xsmall" color="orange">ACTION REQUIRED</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label size="xsmall" className="mb-1 block font-medium">Payment Mode</Label>
              <Select
                size="small"
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select mode" />
                </Select.Trigger>
                <Select.Content>
                  {BASE_PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div>
              <Label size="xsmall" className="mb-1 block font-medium">Amount Received (₹)</Label>
              <Input
                size="small"
                type="number"
                placeholder={String(orderTotal)}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div>
              <Label size="xsmall" className="mb-1 block font-medium">Transaction / UTR ID</Label>
              <Input
                size="small"
                placeholder="e.g. UPI Ref / Cash collected"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <label
              className={`flex items-center gap-2 ${
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
                  ? `Send payment receipt email to ${data.email}`
                  : "No customer email on file"}
              </Text>
            </label>

            <Button
              size="small"
              variant="primary"
              disabled={submitting !== null}
              isLoading={submitting === "payment"}
              onClick={handleRecordPayment}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              ✓ Record Payment Received &amp; Mark Paid
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 2: SHIP ORDER & SELECT DISPATCH ORIGIN */}
      {!isCanceled && (
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-base flex items-center gap-1.5">
                <span>🚀</span> Step 2: Ship Order (From Origin)
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Select where this parcel is shipped or picked up from, choose courier, and send customer tracking email.
              </Text>
            </div>
            {currentStage === "dispatched" ? (
              <Badge size="2xsmall" color="blue">DISPATCHED</Badge>
            ) : currentStage === "delivered" ? (
              <Badge size="2xsmall" color="green">DELIVERED</Badge>
            ) : (
              <Badge size="2xsmall" color="orange">READY TO SHIP</Badge>
            )}
          </div>

          {/* Dispatch Origin Selector */}
          <div>
            <Label size="xsmall" className="mb-1.5 block font-medium">
              From Where Is It Shipped or Picked Up? *
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DISPATCH_ORIGINS.map((origin) => {
                const isSelected = dispatchOrigin === origin.value;
                return (
                  <button
                    key={origin.value}
                    type="button"
                    onClick={() => setDispatchOrigin(origin.value)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-600"
                        : "border-ui-border-base bg-ui-bg-subtle text-ui-fg-base hover:bg-ui-bg-base-hover"
                    }`}
                  >
                    <span>{origin.label}</span>
                    {isSelected && <span className="text-emerald-700 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Courier & Tracking */}
          <div className="space-y-3 pt-1">
            <div>
              <Label size="xsmall" className="mb-1 block font-medium">Courier Quick Presets</Label>
              <div className="flex flex-wrap gap-1.5">
                {COURIER_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCourierName(preset);
                      if (preset === "Direct Customer Pickup") {
                        setDispatchOrigin("Customer Self-Pickup");
                      }
                    }}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      courierName === preset
                        ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-on-color"
                        : "border-ui-border-base bg-ui-bg-subtle text-ui-fg-base hover:bg-ui-bg-base-hover"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label size="xsmall" className="mb-1 block font-medium">Courier Partner</Label>
                <Input
                  size="small"
                  placeholder="e.g. Delhivery / India Post"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                />
              </div>

              <div>
                <Label size="xsmall" className="mb-1 block font-medium">Tracking / AWB Number</Label>
                <Input
                  size="small"
                  placeholder="e.g. DEL123456789 / Rider Phone"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <div>
                <Label size="xsmall" className="mb-1 block font-medium">Tracking Link (Optional)</Label>
                <Input
                  size="small"
                  placeholder="https://..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label size="xsmall" className="mb-1 block font-medium">Message to Customer (Optional)</Label>
              <Input
                size="small"
                placeholder="e.g. Freshly packed at Srinagar Studio, out for delivery via local courier."
                value={dispatchNote}
                onChange={(e) => setDispatchNote(e.target.value)}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-ui-border-base">
            <label
              className={`flex items-center gap-2 ${
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
                  ? `Trigger Customer Shipment Email to ${data.email}`
                  : "No customer email on file (email disabled)"}
              </Text>
            </label>

            <div className="flex items-center gap-2">
              <Button
                size="small"
                variant="primary"
                disabled={submitting !== null}
                isLoading={submitting === "dispatch"}
                onClick={handleShipOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                🚀 Ship Order &amp; Send Customer Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: COMPLETE ORDER */}
      {!isCanceled && (
        <div className="px-6 py-5 bg-ui-bg-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Text size="small" weight="plus" className="text-ui-fg-base flex items-center gap-1.5">
              <span>✅</span> Step 3: Complete Order
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Marks order as Completed / Delivered and sends the customer delivery confirmation email.
            </Text>
          </div>

          <div>
            {isCompleted ? (
              <Badge size="small" color="green">✓ ORDER ALREADY COMPLETED</Badge>
            ) : (
              <Button
                size="small"
                variant="primary"
                disabled={submitting !== null}
                isLoading={submitting === "complete"}
                onClick={handleCompleteOrder}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
              >
                ✓ Complete Order &amp; Send Delivery Email
              </Button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: TAX INVOICE & BILLING */}
      {!isCanceled && (
        <div className="px-6 py-5 space-y-4 bg-ui-bg-subtle/20 border-t border-ui-border-base">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🧾</span>
                <Text size="small" weight="plus" className="text-ui-fg-base">
                  Official Tax Invoice ({invoiceNumber})
                </Text>
                <Badge
                  size="small"
                  color={isOrderPaid ? "green" : paymentStatus === "refunded" ? "red" : "orange"}
                >
                  {isOrderPaid ? "PAID" : paymentStatus === "refunded" ? "REFUNDED" : "PENDING / COD"}
                </Badge>
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">
                Auto-generated PDF with GST details, order items, shipping fee, discounts, and payment status badge.
                {invoiceSentAt && ` • Last emailed: ${invoiceSentAt}`}
              </Text>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/admin/orders/${data.id}/invoice?download=true`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-xs font-medium text-ui-fg-base shadow-sm hover:bg-ui-bg-base-hover transition-colors"
              >
                📥 Download PDF
              </a>
              <a
                href={`/admin/orders/${data.id}/invoice?format=html`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-xs font-medium text-ui-fg-base shadow-sm hover:bg-ui-bg-base-hover transition-colors"
              >
                👁️ View HTML
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-ui-border-base">
            <div className="text-xs text-ui-fg-subtle">
              {invoicePdfPath ? (
                <span>
                  Saved backend copy: <code className="text-ui-fg-muted font-mono">{invoicePdfPath}</code>
                </span>
              ) : (
                <span>PDF generated on-demand and cached permanently in Medusa storage.</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="small"
                variant="secondary"
                disabled={submitting !== null}
                isLoading={submitting === "send_invoice"}
                onClick={() => handleSendInvoiceEmail(false)}
              >
                📧 Send Current Invoice
              </Button>

              <Button
                size="small"
                variant="primary"
                disabled={submitting !== null}
                isLoading={submitting === "send_paid_invoice"}
                onClick={() => handleSendInvoiceEmail(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
              >
                💳 Send Complete Paid Invoice (with PDF)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email History & Manual Triggers */}
      {!isCanceled && (
        <div className="px-6 py-3 bg-ui-bg-base flex flex-wrap items-center justify-between gap-3 text-xs text-ui-fg-subtle">
          <div className="flex items-center gap-4">
            <span>
              Confirmation:{" "}
              <strong className={confSent ? "text-emerald-700" : ""}>
                {confSent ? `Sent (${confSentAt})` : "Not recorded"}
              </strong>
            </span>
            <span>
              Shipping Email:{" "}
              <strong className={shipSent ? "text-blue-700" : ""}>
                {shipSent ? `Sent (${shipSentAt})` : "Not sent yet"}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting !== null || !hasCustomerEmail}
              onClick={handleResendConfirmationEmail}
              className="text-xs text-ui-fg-interactive hover:underline"
            >
              Resend Confirmation
            </button>
            <span>·</span>
            <button
              type="button"
              disabled={submitting !== null || !hasCustomerEmail}
              onClick={handleResendShippingEmail}
              className="text-xs text-ui-fg-interactive hover:underline"
            >
              Resend Shipping
            </button>
          </div>
        </div>
      )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.before",
});

export default OrderStudioDispatchWidget;
