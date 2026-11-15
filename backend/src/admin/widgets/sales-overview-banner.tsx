import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { ArrowUpRightMini, ChartBar, CurrencyDollar } from "@medusajs/icons";
import { Button, Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

interface SalesOverviewData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    aov: number;
    onlinePercentage: number;
  };
  months: Array<{
    monthKey: string;
    monthLabel: string;
    totalRevenue: number;
    orderCount: number;
  }>;
}

function formatInr(val: number): string {
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

const SalesOverviewBannerWidget = () => {
  const [data, setData] = useState<SalesOverviewData | null>(null);

  useEffect(() => {
    fetch("/admin/sales-analytics?range=6mo", { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
      })
      .catch((err) => console.error("Widget sales fetch error:", err));
  }, []);

  if (!data) return null;

  const months = data.months || [];
  const maxRevenue = Math.max(...months.map((m) => m.totalRevenue), 1);

  return (
    <Container className="p-5 mb-4 border border-ui-border-base bg-gradient-to-r from-ui-bg-subtle via-ui-bg-base to-ui-bg-subtle">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Stats Overview */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#DD6013]/10 text-[#DD6013] flex items-center justify-center">
              <CurrencyDollar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
                6-Month Sales
              </p>
              <p className="text-lg font-bold text-ui-fg-base">
                {formatInr(data.summary.totalRevenue)}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-ui-border-base hidden sm:block" />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
              Orders Volume
            </p>
            <p className="text-lg font-semibold text-ui-fg-base">
              {data.summary.totalOrders} <span className="text-xs font-normal text-ui-fg-subtle">orders</span>
            </p>
          </div>

          <div className="h-8 w-px bg-ui-border-base hidden sm:block" />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
              Average Order Value
            </p>
            <p className="text-lg font-semibold text-ui-fg-base">
              {formatInr(data.summary.aov)}
            </p>
          </div>
        </div>

        {/* Right: Sparkline Mini-Bar Graphic & Link */}
        <div className="flex items-center gap-4">
          {/* Mini Sparkline Bar Graphic */}
          <div className="hidden lg:flex items-end gap-1.5 h-9 px-2 py-1 rounded-md bg-ui-bg-base border border-ui-border-base">
            {months.map((m) => {
              const h = Math.max(
                4,
                Math.round((m.totalRevenue / maxRevenue) * 24)
              );
              return (
                <div
                  key={m.monthKey}
                  title={`${m.monthLabel}: ${formatInr(m.totalRevenue)} (${m.orderCount} orders)`}
                  style={{ height: `${h}px` }}
                  className="w-2.5 rounded-t-sm bg-[#DD6013] hover:bg-[#789904] transition-colors"
                />
              );
            })}
          </div>

          <a href="/app/sales-analytics">
            <Button variant="secondary" size="small" className="gap-1.5 text-xs">
              <ChartBar className="w-3.5 h-3.5" />
              <span>Full Sales Analytics</span>
              <ArrowUpRightMini className="w-3.5 h-3.5 text-ui-fg-subtle" />
            </Button>
          </a>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.list.before",
});

export default SalesOverviewBannerWidget;
