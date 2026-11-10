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
import { useEffect, useState } from "react";

type FulfillmentStage =
  | "received"
  | "preparing"
  | "dispatched"
  | "delivered"
  | "cancelled";

type PaymentStatusValue = "pending" | "paid" | "refunded";

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
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

const PAYMENT_METHOD_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "offline_cash", label: "Offline Cash / Counter" },
  { value: "offline_upi", label: "Offline UPI (GPay / PhonePe)" },
  { value: "offline_bank", label: "Offline Bank Transfer (NEFT / IMPS)" },
  { value: "cod", label: "Cash on Delivery (COD)" },
  { value: "razorpay", label: "Razorpay Online" },
];

const COURIER_PRESETS = [
  "Local Courier",
  "Srinagar Studio Rider",
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

function resolvePaymentStatus(
  meta: Record<string, unknown>,
  orderStatus: string
): PaymentStatusValue {
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

function formatPaymentLabel(raw: string): string {
  const found = PAYMENT_METHOD_OPTIONS.find((m) => m.value === raw);
  return found ? found.label : raw || "Cash on Delivery";
}

const OrderStudioDispatchWidget = ({
  data,
}: DetailWidgetProps<AdminOrder>) => {
  const queryClient = useQueryClient();
  const initialMeta = ((data.metadata || {}) as Record<string, unknown>);
  const orderStatus = String(data.status || "pending").toLowerCase();
  const isCanceled = orderStatus === "canceled" || orderStatus === "cancelled";
  const isCompleted = orderStatus === "completed";

  const hasCustomerEmail =
    Boolean(data.email) &&
    String(data.email).trim().toLowerCase() !== "guest@mehandibysana.com";

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue>(
    resolvePaymentStatus(initialMeta, orderStatus)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    resolvePaymentMethod(initialMeta)
  );
  const [paymentReference, setPaymentReference] = useState<string>(
    String(initialMeta.payment_id || "")
  );

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
    "complete" | "payment" | "dispatch" | null
  >(null);

  useEffect(() => {
    const meta = ((data.metadata || {}) as Record<string, unknown>);
    const nextStatus = String(data.status || "pending").toLowerCase();
    setPaymentStatus(resolvePaymentStatus(meta, nextStatus));
    setPaymentMethod(resolvePaymentMethod(meta));
    setPaymentReference(String(meta.payment_id || ""));
    setFulfillmentStage(resolveStage(meta, nextStatus));
    setCourierName(String(meta.courier_name || ""));
    setTrackingNumber(String(meta.tracking_number || ""));
    setTrackingUrl(String(meta.tracking_url || ""));
    setDispatchNote(String(meta.dispatch_note || ""));
    setAlsoCompleteOrder(false);
  }, [data.id, data.status, data.metadata]);

  const submitStudioUpdate = async (
    kind: "complete" | "payment" | "dispatch",
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
        emailResult?: {
          customerEmailSent?: boolean;
          provider?: string;
          error?: string;
        } | null;
      };

      if (!res.ok || !json.success) {
        toast.error(json.message || "Could not update order.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (payload.sendEmail) {
        if (json.emailResult?.customerEmailSent) {
          toast.success(`${successLabel} Email sent to ${data.email}.`);
        } else if (json.emailSkippedReason) {
          toast.warning(`${successLabel} ${json.emailSkippedReason}`);
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

  const handleSaveOfflinePayment = () => {
    const markingPaidOffline = paymentStatus !== "paid";
    const resolvedMethod =
      markingPaidOffline &&
      (paymentMethod === "razorpay" || !paymentMethod)
        ? "offline_cash"
        : paymentMethod;

    if (markingPaidOffline) {
      setPaymentStatus("paid");
      setPaymentMethod(resolvedMethod);
    }

    void submitStudioUpdate(
      "payment",
      {
        action: "mark_offline_paid",
        paymentStatus: markingPaidOffline ? "paid" : paymentStatus,
        paymentMethod: resolvedMethod,
        paymentReference,
        sendEmail: hasCustomerEmail && sendEmail,
      },
      markingPaidOffline
        ? "Offline payment recorded."
        : "Payment details updated."
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

  const currentStage = resolveStage(initialMeta, orderStatus);
  const currentPaymentStatus = resolvePaymentStatus(initialMeta, orderStatus);
  const currentPaymentMethod = resolvePaymentMethod(initialMeta);

  const stageBadgeColor =
    currentStage === "delivered"
      ? "green"
      : currentStage === "dispatched"
        ? "blue"
        : currentStage === "cancelled"
          ? "red"
          : "orange";

  const paymentBadgeColor =
    currentPaymentStatus === "paid"
      ? "green"
      : currentPaymentStatus === "refunded"
        ? "grey"
        : "orange";

  return (
    <Container className="divide-y p-0">
      {/* Header + Quick Complete */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Heading level="h2">Studio Order &amp; Courier</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-0.5">
              Complete orders, record offline payments, and dispatch via local or national couriers.
            </Text>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            size="2xsmall"
            color={isCompleted ? "green" : isCanceled ? "red" : "orange"}
          >
            ORDER: {orderStatus.toUpperCase()}
          </Badge>
          <Badge size="2xsmall" color={paymentBadgeColor}>
            PAY: {currentPaymentStatus.toUpperCase()} ·{" "}
            {formatPaymentLabel(currentPaymentMethod)}
          </Badge>
          <Badge size="2xsmall" color={stageBadgeColor}>
            SHIP: {currentStage.toUpperCase()}
          </Badge>
        </div>

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
            This order is cancelled and locked from dispatch edits.
          </Text>
        )}
      </div>

      {/* Offline / COD Payment Section */}
      {!isCanceled && (
        <div className="px-6 py-4 space-y-3">
          <div>
            <Text size="small" weight="plus">
              Offline Payment / Payment Status
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Record cash, studio counter, bank transfer, or offline UPI payments.
            </Text>
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
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div>
              <Label size="xsmall">UTR / Receipt / Payment Note</Label>
              <Input
                size="small"
                placeholder="e.g. Paid cash to rider / UPI Ref 4312..."
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          </div>

          <Button
            size="small"
            variant="secondary"
            className="w-full"
            disabled={submitting !== null}
            isLoading={submitting === "payment"}
            onClick={handleSaveOfflinePayment}
          >
            {paymentStatus !== "paid"
              ? "Mark Payment Done Offline"
              : "Update Payment Details"}
          </Button>
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
              Add local courier or AWB tracking details and notify the customer.
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

