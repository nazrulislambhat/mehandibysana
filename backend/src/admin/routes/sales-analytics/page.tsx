import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  ArrowDownRightMini,
  ArrowPath,
  ArrowUpRightMini,
  Calendar,
  ChartBar,
  ChartPie,
  CurrencyDollar,
} from "@medusajs/icons";
import { Badge, Button, Container, Heading, Table, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";

interface MonthlySalesStat {
  monthKey: string;
  monthLabel: string;
  orderCount: number;
  totalRevenue: number;
  aov: number;
  onlineOrders: number;
  codOrders: number;
  uniqueCustomers: number;
  growthRate: number | null;
}

interface AnnualSalesStat {
  year: string;
  orderCount: number;
  totalRevenue: number;
  aov: number;
}

interface SalesAnalyticsData {
  success: boolean;
  selectedRange: "6mo" | "1yr" | "all";
  summary: {
    totalRevenue: number;
    totalOrders: number;
    aov: number;
    onlineOrders: number;
    codOrders: number;
    onlinePercentage: number;
    uniqueCustomers: number;
    peakMonth: {
      label: string;
      revenue: number;
      orders: number;
    } | null;
  };
  months: MonthlySalesStat[];
  annualSummary: AnnualSalesStat[];
  lifetime: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
  };
}

function formatInr(val: number): string {
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

const SalesAnalyticsAdminPage = () => {
  const [range, setRange] = useState<"6mo" | "1yr" | "all">("6mo");
  const [data, setData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const fetchAnalytics = async (selectedRange: "6mo" | "1yr" | "all") => {
    setLoading(true);
    try {
      const res = await fetch(`/admin/sales-analytics?range=${selectedRange}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch sales analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const handleExportCsv = () => {
    if (!data || !data.months.length) return;

    const headers = [
      "Month",
      "Orders",
      "Revenue (INR)",
      "AOV (INR)",
      "Prepaid Orders",
      "COD Orders",
      "MoM Growth %",
    ];
    const rows = data.months.map((m) => [
      m.monthLabel,
      m.orderCount,
      m.totalRevenue,
      m.aov,
      m.onlineOrders,
      m.codOrders,
      m.growthRate !== null ? `${m.growthRate}%` : "—",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `mehandibysana-sales-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Calculation
  const months = data?.months || [];
  const maxRevenue = Math.max(...months.map((m) => m.totalRevenue), 1000);
  const chartHeight = 220;
  const barWidth = Math.max(
    18,
    Math.min(52, Math.floor(680 / (months.length || 1) - 14))
  );

  return (
    <div className="flex flex-col gap-y-6 pb-12">
      {/* Page Header */}
      <Container className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#789904] animate-pulse" />
              <Heading level="h1" className="text-2xl font-serif">
                Sales &amp; Revenue Analytics
              </Heading>
            </div>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Live performance metrics, revenue trajectories, basket sizes, and
              order distributions across Kashmir, J&amp;K and Bengaluru, Karnataka.
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Range Toggle Buttons */}
            <div className="inline-flex rounded-lg border border-ui-border-base bg-ui-bg-subtle p-1 text-xs">
              <button
                type="button"
                onClick={() => setRange("6mo")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  range === "6mo"
                    ? "bg-ui-bg-base text-ui-fg-base shadow-sm font-semibold"
                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                Last 6 Months
              </button>
              <button
                type="button"
                onClick={() => setRange("1yr")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  range === "1yr"
                    ? "bg-ui-bg-base text-ui-fg-base shadow-sm font-semibold"
                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                Last 1 Year
              </button>
              <button
                type="button"
                onClick={() => setRange("all")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  range === "all"
                    ? "bg-ui-bg-base text-ui-fg-base shadow-sm font-semibold"
                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                All-Time Monthly
              </button>
            </div>

            <Button
              variant="secondary"
              size="small"
              onClick={() => fetchAnalytics(range)}
              disabled={loading}
              className="gap-1.5"
            >
              <ArrowPath className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="secondary"
              size="small"
              onClick={handleExportCsv}
              disabled={loading || !data?.months?.length}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </Container>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Container className="p-5 flex flex-col justify-between border-l-4 border-l-[#DD6013]">
          <div>
            <div className="flex items-center justify-between text-xs text-ui-fg-subtle">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {range === "6mo"
                  ? "6-Month Revenue"
                  : range === "1yr"
                  ? "1-Year Revenue"
                  : "All-Time Revenue"}
              </span>
              <CurrencyDollar className="w-4 h-4 text-[#DD6013]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-ui-fg-base">
                {data ? formatInr(data.summary.totalRevenue) : "—"}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-ui-border-base text-xs text-ui-fg-subtle">
            {data?.summary.peakMonth ? (
              <span>
                Peak: <strong>{data.summary.peakMonth.label}</strong> (
                {formatInr(data.summary.peakMonth.revenue)})
              </span>
            ) : (
              <span>Calculated from live orders</span>
            )}
          </div>
        </Container>

        {/* Total Orders */}
        <Container className="p-5 flex flex-col justify-between border-l-4 border-l-[#789904]">
          <div>
            <div className="flex items-center justify-between text-xs text-ui-fg-subtle">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Orders Volume
              </span>
              <ChartBar className="w-4 h-4 text-[#789904]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-ui-fg-base">
                {data ? data.summary.totalOrders.toLocaleString("en-IN") : "—"}
              </span>
              <span className="text-xs text-ui-fg-subtle">orders</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-ui-border-base text-xs text-ui-fg-subtle">
            <span>
              Avg:{" "}
              <strong>
                {data && data.months.length
                  ? Math.round(data.summary.totalOrders / data.months.length)
                  : 0}
              </strong>{" "}
              orders / month
            </span>
          </div>
        </Container>

        {/* Average Order Value (AOV) */}
        <Container className="p-5 flex flex-col justify-between border-l-4 border-l-[#181818]">
          <div>
            <div className="flex items-center justify-between text-xs text-ui-fg-subtle">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Average Order Value
              </span>
              <ChartPie className="w-4 h-4 text-ui-fg-subtle" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-ui-fg-base">
                {data ? formatInr(data.summary.aov) : "—"}
              </span>
              <span className="text-xs text-ui-fg-subtle">per basket</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-ui-border-base text-xs text-ui-fg-subtle">
            <span>
              Unique Customers: <strong>{data?.summary.uniqueCustomers || "—"}</strong>
            </span>
          </div>
        </Container>

        {/* Prepaid Ratio */}
        <Container className="p-5 flex flex-col justify-between border-l-4 border-l-[#25D366]">
          <div>
            <div className="flex items-center justify-between text-xs text-ui-fg-subtle">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Payment Distribution
              </span>
              <Badge color="green" size="small">
                {data ? `${data.summary.onlinePercentage}% Online` : "—"}
              </Badge>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-ui-fg-base">
                {data ? `${data.summary.onlineOrders}` : "—"}
              </span>
              <span className="text-xs text-ui-fg-subtle">
                Razorpay / {data?.summary.codOrders || 0} COD
              </span>
            </div>
          </div>
          {/* Progress bar split */}
          <div className="mt-3 pt-3 border-t border-ui-border-base">
            <div className="w-full bg-ui-bg-subtle h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-[#789904] h-full"
                style={{ width: `${data?.summary.onlinePercentage || 50}%` }}
                title="Online Prepaid"
              />
              <div
                className="bg-[#DD6013] h-full"
                style={{
                  width: `${100 - (data?.summary.onlinePercentage || 50)}%`,
                }}
                title="Cash on Delivery"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Visual Interactive Graphic: Revenue & Order Trajectory Chart */}
      <Container className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <Heading level="h2" className="text-lg font-medium">
              Monthly Revenue &amp; Sales Trajectory
            </Heading>
            <Text size="small" className="text-ui-fg-subtle mt-0.5">
              Hover over bars to inspect order totals, basket size, and month-over-month growth.
            </Text>
          </div>
          <div className="flex items-center gap-4 text-xs text-ui-fg-subtle">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#DD6013]" />
              <span>Gross Sales (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#789904]" />
              <span>Digital Orders</span>
            </div>
          </div>
        </div>

        {/* SVG Graphic Canvas */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-ui-fg-subtle">
            <ArrowPath className="w-6 h-6 animate-spin mr-2" />
            <span>Loading sales records...</span>
          </div>
        ) : months.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-ui-fg-subtle">
            No sales records found for this period.
          </div>
        ) : (
          <div className="relative overflow-x-auto pt-4 pb-2">
            <div
              className="flex items-end justify-between gap-3 min-w-[620px] px-2"
              style={{ height: `${chartHeight + 60}px` }}
            >
              {months.map((m, idx) => {
                const barHeight = Math.max(
                  14,
                  Math.round((m.totalRevenue / maxRevenue) * chartHeight)
                );
                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={m.monthKey}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="flex-1 flex flex-col items-center justify-end group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute bottom-[calc(100%+8px)] z-20 w-48 rounded-xl bg-ui-bg-base border border-ui-border-base p-3 shadow-xl text-left pointer-events-none transform -translate-x-1/2 left-1/2">
                        <div className="font-semibold text-xs text-ui-fg-base border-b border-ui-border-base pb-1.5 mb-1.5 flex items-center justify-between">
                          <span>{m.monthLabel}</span>
                          {m.growthRate !== null && (
                            <span
                              className={`text-[10px] font-bold ${
                                m.growthRate >= 0
                                  ? "text-[#789904]"
                                  : "text-ui-fg-subtle"
                              }`}
                            >
                              {m.growthRate >= 0 ? `+${m.growthRate}%` : `${m.growthRate}%`}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-ui-fg-subtle">
                            <span>Revenue:</span>
                            <span className="font-semibold text-ui-fg-base">
                              {formatInr(m.totalRevenue)}
                            </span>
                          </div>
                          <div className="flex justify-between text-ui-fg-subtle">
                            <span>Orders:</span>
                            <span className="font-medium text-ui-fg-base">
                              {m.orderCount} orders
                            </span>
                          </div>
                          <div className="flex justify-between text-ui-fg-subtle">
                            <span>AOV:</span>
                            <span className="font-medium text-ui-fg-base">
                              {formatInr(m.aov)}
                            </span>
                          </div>
                          <div className="flex justify-between text-ui-fg-subtle">
                            <span>Split:</span>
                            <span className="text-[11px] text-ui-fg-base">
                              {m.onlineOrders} Prepaid / {m.codOrders} COD
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Revenue label above bar */}
                    <span
                      className={`text-[10px] font-medium transition-colors mb-1.5 whitespace-nowrap ${
                        isHovered
                          ? "text-[#DD6013] font-bold scale-105"
                          : "text-ui-fg-subtle"
                      }`}
                    >
                      {m.totalRevenue >= 1000
                        ? `₹${(m.totalRevenue / 1000).toFixed(1)}k`
                        : `₹${Math.round(m.totalRevenue)}`}
                    </span>

                    {/* The Visual Bar */}
                    <div
                      style={{
                        height: `${barHeight}px`,
                        width: `${barWidth}px`,
                      }}
                      className={`rounded-t-lg transition-all duration-300 relative overflow-hidden ${
                        isHovered
                          ? "bg-[#DD6013] shadow-[0_0_15px_rgba(221,96,19,0.45)] scale-105"
                          : "bg-[#DD6013]/85 hover:bg-[#DD6013]"
                      }`}
                    >
                      {/* Sub-bar showing online orders share */}
                      <div
                        style={{
                          height: `${
                            m.orderCount > 0
                              ? Math.round(
                                  (m.onlineOrders / m.orderCount) * barHeight
                                )
                              : 0
                          }px`,
                        }}
                        className="absolute bottom-0 left-0 right-0 bg-[#789904]/90 rounded-t-sm"
                      />
                    </div>

                    {/* Month Label beneath bar */}
                    <div className="mt-2.5 text-center">
                      <p className="text-[11px] font-medium text-ui-fg-base whitespace-nowrap">
                        {m.monthLabel.split(" ")[0]}
                      </p>
                      <p className="text-[9px] text-ui-fg-subtle">
                        {m.monthLabel.split(" ")[1]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>

      {/* Annual Summary Row */}
      {data?.annualSummary && data.annualSummary.length > 0 && (
        <Container className="p-6">
          <div className="mb-4">
            <Heading level="h2" className="text-base font-medium">
              Historical Annual Performance (2020 &ndash; Present)
            </Heading>
            <Text size="small" className="text-ui-fg-subtle mt-0.5">
              Cumulative year-by-year revenue milestones since inception.
            </Text>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {data.annualSummary.map((yr) => (
              <div
                key={yr.year}
                className="p-3.5 rounded-xl border border-ui-border-base bg-ui-bg-subtle text-center hover:border-ui-border-interactive transition-colors"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle">
                  {yr.year}
                </p>
                <p className="text-base font-bold text-ui-fg-base mt-1">
                  {formatInr(yr.totalRevenue)}
                </p>
                <p className="text-[11px] text-ui-fg-subtle mt-0.5">
                  {yr.orderCount} orders &middot; {formatInr(yr.aov)} avg
                </p>
              </div>
            ))}
          </div>
        </Container>
      )}

      {/* Detailed Monthly Performance Table */}
      <Container className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-ui-border-base flex items-center justify-between">
          <div>
            <Heading level="h2" className="text-base font-medium">
              Monthly Breakdown Ledger
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Complete monthly ledger with basket sizes, payment splits, and growth.
            </Text>
          </div>
          <Badge color="grey">
            {months.length} {months.length === 1 ? "Month" : "Months"}
          </Badge>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Month</Table.HeaderCell>
              <Table.HeaderCell>Orders</Table.HeaderCell>
              <Table.HeaderCell>Gross Revenue</Table.HeaderCell>
              <Table.HeaderCell>Average Order (AOV)</Table.HeaderCell>
              <Table.HeaderCell>Payment Method</Table.HeaderCell>
              <Table.HeaderCell>Customers</Table.HeaderCell>
              <Table.HeaderCell>MoM Growth</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {months.map((m) => (
              <Table.Row key={m.monthKey} className="hover:bg-ui-bg-subtle/50">
                <Table.Cell className="font-semibold text-ui-fg-base">
                  {m.monthLabel}
                </Table.Cell>
                <Table.Cell>
                  <span className="font-medium text-ui-fg-base">{m.orderCount}</span>{" "}
                  <span className="text-xs text-ui-fg-subtle">orders</span>
                </Table.Cell>
                <Table.Cell className="font-semibold text-ui-fg-base">
                  {formatInr(m.totalRevenue)}
                </Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {formatInr(m.aov)}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#789904] font-medium">
                      {m.onlineOrders} Prepaid
                    </span>
                    <span className="text-ui-fg-subtle">/</span>
                    <span className="text-[#DD6013] font-medium">
                      {m.codOrders} COD
                    </span>
                  </div>
                </Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {m.uniqueCustomers}
                </Table.Cell>
                <Table.Cell>
                  {m.growthRate === null ? (
                    <span className="text-xs text-ui-fg-subtle">—</span>
                  ) : m.growthRate >= 0 ? (
                    <Badge color="green" size="small" className="gap-1">
                      <ArrowUpRightMini className="w-3 h-3" />
                      +{m.growthRate}%
                    </Badge>
                  ) : (
                    <Badge color="red" size="small" className="gap-1">
                      <ArrowDownRightMini className="w-3 h-3" />
                      {m.growthRate}%
                    </Badge>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Sales Analytics",
  icon: ChartBar,
});

export default SalesAnalyticsAdminPage;
