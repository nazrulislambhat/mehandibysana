import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Badge, Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  display_id?: number | string | null;
  created_at?: string;
  email?: string;
  status?: string;
  payment_status?: string;
  total?: number;
  metadata?: Record<string, unknown> | null;
}

export const OrdersDispatchOverviewWidget = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(
      "/admin/orders?limit=15&fields=id,display_id,created_at,email,status,payment_status,total,metadata",
      { credentials: "include" }
    )
      .then((res) => res.json())
      .then((json) => {
        if (active && Array.isArray(json?.orders)) {
          setOrders(json.orders);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading && orders.length === 0) {
    return null;
  }

  // Count dispatch origins
  let srinagarCount = 0;
  let bengaluruCount = 0;
  let pickupCount = 0;
  let pendingCount = 0;

  for (const o of orders) {
    const origin = String(o.metadata?.dispatch_origin || "").toLowerCase();
    const stage = String(o.metadata?.fulfillment_stage || "").toLowerCase();
    if (origin.includes("srinagar")) {
      srinagarCount++;
    } else if (origin.includes("bengaluru")) {
      bengaluruCount++;
    } else if (origin.includes("pickup")) {
      pickupCount++;
    } else if (stage !== "dispatched" && stage !== "delivered" && o.status !== "completed") {
      pendingCount++;
    }
  }

  return (
    <Container className="p-0 border border-ui-border-base bg-ui-bg-base mb-6 overflow-hidden shadow-xs">
      <div className="px-6 py-4 bg-ui-bg-subtle/40 border-b border-ui-border-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Heading level="h2" className="text-base font-semibold">
              Dispatch Origin &amp; Hub Monitor
            </Heading>
            <Badge size="2xsmall" color="purple">STUDIO DISPATCH</Badge>
          </div>
          <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">
            Real-time tracking of order fulfillment origins (Srinagar Atelier vs Bengaluru Studio vs Pickups).
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge size="small" color="blue" className="font-medium">
            🏔️ Srinagar: {srinagarCount}
          </Badge>
          <Badge size="small" color="green" className="font-medium">
            🏙️ Bengaluru: {bengaluruCount}
          </Badge>
          <Badge size="small" color="orange" className="font-medium">
            🛍️ Pickups: {pickupCount}
          </Badge>
          {pendingCount > 0 && (
            <Badge size="small" color="red" className="font-medium">
              ⏳ Ready to Assign: {pendingCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-ui-border-base bg-ui-bg-subtle/20 text-ui-fg-muted uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-4 font-semibold">Order</th>
              <th className="py-2.5 px-4 font-semibold">Customer</th>
              <th className="py-2.5 px-4 font-semibold">Dispatch Origin / Hub</th>
              <th className="py-2.5 px-4 font-semibold">Courier &amp; Tracking</th>
              <th className="py-2.5 px-4 font-semibold">Payment</th>
              <th className="py-2.5 px-4 font-semibold">Stage</th>
              <th className="py-2.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ui-border-base">
            {orders.map((o) => {
              const meta = ((o.metadata || {}) as Record<string, unknown>);
              const origin = String(meta.dispatch_origin || "");
              const courier = String(meta.courier_name || "");
              const tracking = String(meta.tracking_number || "");
              const stage = String(meta.fulfillment_stage || o.status || "received");
              const payStatus = String(meta.payment_status || o.payment_status || "pending");
              const orderNum =
                meta.order_number ||
                meta.wc_order_number ||
                (meta.woo_order_id ? `#${meta.woo_order_id}` : `MBS-${o.display_id || o.id.slice(-4)}`);

              const originColor = origin.includes("Srinagar")
                ? "blue"
                : origin.includes("Bengaluru")
                  ? "green"
                  : origin.includes("Pickup")
                    ? "orange"
                    : "grey";

              const stageColor =
                stage === "delivered" || o.status === "completed"
                  ? "green"
                  : stage === "dispatched"
                    ? "blue"
                    : "orange";

              const payColor =
                payStatus === "paid" || o.payment_status === "captured" || o.status === "completed"
                  ? "green"
                  : "orange";

              return (
                <tr
                  key={o.id}
                  className="hover:bg-ui-bg-subtle/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-ui-fg-base whitespace-nowrap">
                    <a
                      href={`/app/orders/${o.id}`}
                      className="hover:text-ui-fg-interactive hover:underline"
                    >
                      {String(orderNum)}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-ui-fg-subtle whitespace-nowrap max-w-[200px] truncate">
                    {o.email || "Guest"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {origin ? (
                      <Badge size="2xsmall" color={originColor} className="font-medium">
                        {origin.split(" (")[0]}
                      </Badge>
                    ) : (
                      <span className="text-ui-fg-muted italic text-[11px]">
                        Not Assigned Yet
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-ui-fg-subtle whitespace-nowrap">
                    {courier ? (
                      <span className="font-mono text-[11px]">
                        {courier} {tracking ? `· ${tracking}` : ""}
                      </span>
                    ) : (
                      <span className="text-ui-fg-muted italic text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge size="2xsmall" color={payColor}>
                      {payColor === "green" ? "PAID" : "UNPAID"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge size="2xsmall" color={stageColor}>
                      {stage.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <a
                      href={`/app/orders/${o.id}`}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-ui-fg-interactive hover:bg-ui-bg-subtle rounded transition-colors"
                    >
                      Open &rarr;
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.list.before",
});

export default OrdersDispatchOverviewWidget;
