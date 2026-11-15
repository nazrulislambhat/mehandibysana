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
import { useEffect, useRef, useState } from "react";

interface DailySalesStat {
  dayKey: string;
  dayLabel: string;
  dayNumber: number;
  orderCount: number;
  totalRevenue: number;
  aov: number;
  onlineOrders: number;
  codOrders: number;
  uniqueCustomers: number;
}

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
  selectedRange: string;
  selectedYear: string | null;
  selectedMonth: string | null;
  availableMonths: Array<{ monthKey: string; monthLabel: string }>;
  availableYears: string[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    aov: number;
    onlineOrders: number;
    codOrders: number;
    onlinePercentage: number;
    uniqueCustomers: number;
    peakPeriod: {
      label: string;
      revenue: number;
      orders: number;
    } | null;
  };
  months: MonthlySalesStat[];
  days: DailySalesStat[];
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
  // Filter state
  const [viewMode, setViewMode] = useState<"range" | "year" | "month">("range");
  const [range, setRange] = useState<"6mo" | "1yr" | "all">("1yr");
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [tableSortDesc, setTableSortDesc] = useState<boolean>(true);

  const [data, setData] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const chartScrollRef = useRef<HTMLDivElement>(null);

  const fetchAnalytics = async (mode: "range" | "year" | "month", val?: string) => {
    setLoading(true);
    try {
      let queryUrl = "/admin/sales-analytics";
      if (mode === "month" && val) {
        queryUrl += `?month=${encodeURIComponent(val)}`;
      } else if (mode === "year" && val) {
        queryUrl += `?year=${encodeURIComponent(val)}`;
      } else {
        queryUrl += `?range=${encodeURIComponent(val || range)}`;
      }

      const res = await fetch(queryUrl, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setData(json);

        // If a month wasn't selected, set default selectedMonth to latest available month
        if (!selectedMonth && json.availableMonths?.length > 0) {
          setSelectedMonth(json.availableMonths[0].monthKey);
        }
      }
    } catch (err) {
      console.error("Failed to fetch sales analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "month" && selectedMonth) {
      fetchAnalytics("month", selectedMonth);
    } else if (viewMode === "year" && selectedYear) {
      fetchAnalytics("year", selectedYear);
    } else {
      fetchAnalytics("range", range);
    }
  }, [viewMode, range, selectedYear, selectedMonth]);

  // When All-Time is loaded, scroll chart to the right (latest data)
  useEffect(() => {
    if (chartScrollRef.current && (range === "all" || (data?.months && data.months.length > 24))) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
    }
  }, [data, range]);

  const handleExportCsv = () => {
    if (!data) return;

    if (viewMode === "month" && data.days && data.days.length > 0) {
      const headers = [
        "Day",
        "Orders",
        "Revenue (INR)",
        "AOV (INR)",
        "Prepaid Orders",
        "COD Orders",
        "Unique Customers",
      ];
      const rows = data.days.map((d) => [
        d.dayLabel,
        d.orderCount,
        d.totalRevenue,
        d.aov,
        d.onlineOrders,
        d.codOrders,
        d.uniqueCustomers,
      ]);
      downloadCsv(headers, rows, `mehandibysana-daily-sales-${selectedMonth}`);
    } else if (data.months && data.months.length > 0) {
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
      downloadCsv(headers, rows, `mehandibysana-monthly-sales-${viewMode === "year" ? selectedYear : range}`);
    }
  };

  const downloadCsv = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine chart items based on viewMode
  const isDailyView = viewMode === "month" && Boolean(data?.days && data.days.length > 0);
  const chartItems = isDailyView
    ? (data?.days || []).map((d) => ({
        key: d.dayKey,
        label: d.dayLabel,
        subLabel: `Day ${d.dayNumber}`,
        totalRevenue: d.totalRevenue,
        orderCount: d.orderCount,
        aov: d.aov,
        onlineOrders: d.onlineOrders,
        codOrders: d.codOrders,
        growthRate: null,
      }))
    : (data?.months || []).map((m) => ({
        key: m.monthKey,
        label: m.monthLabel.split(" ")[0],
        subLabel: m.monthLabel.split(" ")[1],
        totalRevenue: m.totalRevenue,
        orderCount: m.orderCount,
        aov: m.aov,
        onlineOrders: m.onlineOrders,
        codOrders: m.codOrders,
        growthRate: m.growthRate,
        fullLabel: m.monthLabel,
      }));

  const maxRevenue = Math.max(...chartItems.map((it) => it.totalRevenue), 1000);
  const chartHeight = 220;

  // Responsive bar width
  const barWidth = Math.max(
    20,
    Math.min(56, Math.floor(740 / (chartItems.length || 1) - 12))
  );

  // Table items (default sorted newest first)
  const displayTableMonths = [...(data?.months || [])].sort((a, b) => {
    return tableSortDesc
      ? b.monthKey.localeCompare(a.monthKey)
      : a.monthKey.localeCompare(b.monthKey);
  });

  const availableMonths = data?.availableMonths || [];
  const availableYears = data?.availableYears || ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];

  const currentMonthObj = availableMonths.find((m) => m.monthKey === selectedMonth);
  const currentMonthLabel = currentMonthObj?.monthLabel || selectedMonth;

  return (
    <div className="flex flex-col gap-y-6 pb-12">
      {/* Page Header */}
      <Container className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#789904] animate-pulse" />
              <Heading level="h1" className="text-2xl font-serif">
                Sales &amp; Revenue Analytics
              </Heading>
              {availableMonths.length > 0 && (
                <Badge color="green" size="small" className="ml-2 font-mono">
                  Live to {availableMonths[0]?.monthLabel || "Nov 2026"}
                </Badge>
              )}
            </div>
            <Text size="small" className="text-ui-fg-subtle mt-1">
              Live performance metrics, revenue trajectories, basket sizes, and order distributions across Kashmir &amp; Bengaluru.
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode & Range Switchers */}
            <div className="inline-flex rounded-lg border border-ui-border-base bg-ui-bg-subtle p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setViewMode("range");
                  setRange("1yr");
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === "range" && range === "1yr"
                    ? "bg-ui-bg-base text-ui-fg-base shadow-sm font-semibold"
                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                Past 1 Year (Latest)
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("range");
                  setRange("6mo");
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === "range" && range === "6mo"
                    ? "bg-ui-bg-base text-ui-fg-base shadow-sm font-semibold"
                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                Past 6 Months
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("range");
                  setRange("all");
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === "range" && range === "all"
                    ? "bg-ui-bg-base text-ui-fg-base shadow-sm font-semibold"
                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                All-Time
              </button>
            </div>

            {/* Year Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-ui-bg-subtle border border-ui-border-base rounded-lg px-2.5 py-1 text-xs">
              <span className="text-ui-fg-subtle font-medium">Year:</span>
              <select
                value={viewMode === "year" ? selectedYear : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedYear(e.target.value);
                    setViewMode("year");
                  }
                }}
                className="bg-transparent font-semibold text-ui-fg-base cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Select Year</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} {yr === "2026" ? "(Latest)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-ui-bg-subtle border border-ui-border-base rounded-lg px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#789904]" />
              <span className="text-ui-fg-subtle font-medium">Month:</span>
              <select
                value={viewMode === "month" ? selectedMonth : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedMonth(e.target.value);
                    setViewMode("month");
                  }
                }}
                className="bg-transparent font-semibold text-ui-fg-base cursor-pointer focus:outline-none max-w-[130px]"
              >
                <option value="" disabled>Select Month</option>
                {availableMonths.map((m) => (
                  <option key={m.monthKey} value={m.monthKey}>
                    {m.monthLabel}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="secondary"
              size="small"
              onClick={() => {
                if (viewMode === "month" && selectedMonth) {
                  fetchAnalytics("month", selectedMonth);
                } else if (viewMode === "year" && selectedYear) {
                  fetchAnalytics("year", selectedYear);
                } else {
                  fetchAnalytics("range", range);
                }
              }}
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
              disabled={loading}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Active Filter Pill */}
        <div className="mt-4 pt-3 border-t border-ui-border-base flex flex-wrap items-center justify-between text-xs text-ui-fg-subtle">
          <div className="flex items-center gap-2">
            <span>Active View:</span>
            <Badge color="blue" size="small">
              {viewMode === "month"
                ? `Month: ${currentMonthLabel} (Daily Trajectory)`
                : viewMode === "year"
                ? `Year: ${selectedYear} (All Months)`
                : range === "6mo"
                ? "Last 6 Months Trajectory"
                : range === "1yr"
                ? "Last 1 Year Trajectory (Latest)"
                : "All-Time Historical"}
            </Badge>
            {viewMode === "month" && (
              <button
                type="button"
                onClick={() => {
                  setViewMode("range");
                  setRange("1yr");
                }}
                className="text-xs text-[#DD6013] hover:underline cursor-pointer ml-1"
              >
                &larr; Back to Annual/Monthly Overview
              </button>
            )}
          </div>

          <div>
            <span>Lifetime Volume: </span>
            <strong className="text-ui-fg-base font-semibold">
              {data ? formatInr(data.lifetime.totalRevenue) : "—"}
            </strong>{" "}
            &middot; {data ? data.lifetime.totalOrders.toLocaleString("en-IN") : "—"} total orders
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
                {viewMode === "month"
                  ? `${currentMonthLabel} Revenue`
                  : viewMode === "year"
                  ? `${selectedYear} Total Revenue`
                  : range === "6mo"
                  ? "6-Month Revenue"
                  : range === "1yr"
                  ? "1-Year Revenue (Latest)"
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
            {data?.summary.peakPeriod ? (
              <span>
                Peak: <strong>{data.summary.peakPeriod.label}</strong> (
                {formatInr(data.summary.peakPeriod.revenue)})
              </span>
            ) : (
              <span>Calculated from live order data</span>
            )}
          </div>
        </Container>

        {/* Total Orders */}
        <Container className="p-5 flex flex-col justify-between border-l-4 border-l-[#789904]">
          <div>
            <div className="flex items-center justify-between text-xs text-ui-fg-subtle">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {viewMode === "month" ? "Orders This Month" : "Orders Volume"}
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
              {viewMode === "month" ? (
                <>Avg: <strong>{data && data.days.length ? Math.round(data.summary.totalOrders / data.days.length * 10) / 10 : 0}</strong> orders / active day</>
              ) : (
                <>Avg: <strong>{data && data.months.length ? Math.round(data.summary.totalOrders / data.months.length) : 0}</strong> orders / month</>
              )}
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
              {viewMode === "month"
                ? `Daily Revenue & Sales Trajectory (${currentMonthLabel})`
                : `Monthly Revenue & Sales Trajectory (${viewMode === "year" ? selectedYear : range === "6mo" ? "Last 6 Mo" : range === "1yr" ? "Last 12 Mo" : "All Time"})`}
            </Heading>
            <Text size="small" className="text-ui-fg-subtle mt-0.5">
              {viewMode === "month"
                ? "Hover over daily bars to inspect daily gross sales, order volume, and payment method distribution."
                : "Hover over monthly bars to inspect revenue totals, basket size, and growth. Click any bar or choose from dropdown to drill into that month."}
            </Text>
          </div>
          <div className="flex items-center gap-4 text-xs text-ui-fg-subtle">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#DD6013]" />
              <span>Gross Sales (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#789904]" />
              <span>Prepaid Share</span>
            </div>
          </div>
        </div>

        {/* Graphic Canvas */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-ui-fg-subtle">
            <ArrowPath className="w-6 h-6 animate-spin mr-2" />
            <span>Loading sales records...</span>
          </div>
        ) : chartItems.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-ui-fg-subtle">
            No sales records found for this selection.
          </div>
        ) : (
          <div ref={chartScrollRef} className="relative overflow-x-auto pt-4 pb-2 scroll-smooth">
            <div
              className="flex items-end justify-between gap-3 px-2"
              style={{
                height: `${chartHeight + 60}px`,
                minWidth: `${Math.max(680, chartItems.length * (barWidth + 12))}px`,
              }}
            >
              {chartItems.map((item, idx) => {
                const barHeight = Math.max(
                  14,
                  Math.round((item.totalRevenue / maxRevenue) * chartHeight)
                );
                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => {
                      if (!isDailyView && item.key) {
                        setSelectedMonth(item.key);
                        setViewMode("month");
                      }
                    }}
                    className="flex-1 flex flex-col items-center justify-end group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute bottom-[calc(100%+8px)] z-20 w-48 rounded-xl bg-ui-bg-base border border-ui-border-base p-3 shadow-xl text-left pointer-events-none transform -translate-x-1/2 left-1/2">
                        <div className="font-semibold text-xs text-ui-fg-base border-b border-ui-border-base pb-1.5 mb-1.5 flex items-center justify-between">
                          <span>{item.label} {item.subLabel}</span>
                          {item.growthRate !== null && (
                            <span
                              className={`text-[10px] font-bold ${
                                item.growthRate >= 0
                                  ? "text-[#789904]"
                                  : "text-ui-fg-subtle"
                              }`}
                            >
                              {item.growthRate >= 0 ? `+${item.growthRate}%` : `${item.growthRate}%`}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-ui-fg-subtle">
                            <span>Revenue:</span>
                            <span className="font-semibold text-ui-fg-base">
                              {formatInr(item.totalRevenue)}
                            </span>
                          </div>
                          <div className="flex justify-between text-ui-fg-subtle">
                            <span>Orders:</span>
                            <span className="font-medium text-ui-fg-base">
                              {item.orderCount} orders
                            </span>
                          </div>
                          <div className="flex justify-between text-ui-fg-subtle">
                            <span>AOV:</span>
                            <span className="font-medium text-ui-fg-base">
                              {formatInr(item.aov)}
                            </span>
                          </div>
                          <div className="flex justify-between text-ui-fg-subtle">
                            <span>Split:</span>
                            <span className="text-[11px] text-ui-fg-base">
                              {item.onlineOrders} Prepaid / {item.codOrders} COD
                            </span>
                          </div>
                          {!isDailyView && (
                            <div className="text-[10px] text-[#DD6013] font-medium pt-1 border-t border-ui-border-base mt-1">
                              Click bar to view daily breakdown &rarr;
                            </div>
                          )}
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
                      {item.totalRevenue >= 1000
                        ? `₹${(item.totalRevenue / 1000).toFixed(1)}k`
                        : `₹${Math.round(item.totalRevenue)}`}
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
                            item.orderCount > 0
                              ? Math.round(
                                  (item.onlineOrders / item.orderCount) * barHeight
                                )
                              : 0
                          }px`,
                        }}
                        className="absolute bottom-0 left-0 right-0 bg-[#789904]/90 rounded-t-sm"
                      />
                    </div>

                    {/* Label beneath bar */}
                    <div className="mt-2 text-center">
                      <p className="text-[11px] font-medium text-ui-fg-base whitespace-nowrap">
                        {item.label}
                      </p>
                      <p className="text-[9px] text-ui-fg-subtle">
                        {item.subLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>

      {/* Historical Annual Milestones */}
      {data?.annualSummary && data.annualSummary.length > 0 && (
        <Container className="p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Heading level="h2" className="text-base font-medium">
                Annual Performance Milestones (2020 &ndash; Present)
              </Heading>
              <Text size="small" className="text-ui-fg-subtle mt-0.5">
                Click any year to filter the charts and metrics specifically for that year.
              </Text>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {data.annualSummary.map((yr) => {
              const isSelected = viewMode === "year" && selectedYear === yr.year;
              return (
                <button
                  key={yr.year}
                  type="button"
                  onClick={() => {
                    setSelectedYear(yr.year);
                    setViewMode("year");
                  }}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#DD6013] bg-[#DD6013]/10 shadow-sm"
                      : "border-ui-border-base bg-ui-bg-subtle hover:border-ui-border-interactive hover:bg-ui-bg-base"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-ui-fg-subtle">
                    {yr.year} {yr.year === "2026" ? "★" : ""}
                  </p>
                  <p className="text-base font-bold text-ui-fg-base mt-1">
                    {formatInr(yr.totalRevenue)}
                  </p>
                  <p className="text-[11px] text-ui-fg-subtle mt-0.5">
                    {yr.orderCount} orders &middot; {formatInr(yr.aov)} avg
                  </p>
                </button>
              );
            })}
          </div>
        </Container>
      )}

      {/* Detailed Monthly Breakdown Ledger Table */}
      <Container className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-ui-border-base flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Heading level="h2" className="text-base font-medium">
              Monthly Breakdown Ledger
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Complete monthly ledger with basket sizes, payment splits, and growth. Click any row to view its daily breakdown.
            </Text>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTableSortDesc(!tableSortDesc)}
              className="text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base border border-ui-border-base px-2.5 py-1 rounded-md bg-ui-bg-subtle cursor-pointer"
            >
              Order: {tableSortDesc ? "Newest First ↓" : "Oldest First ↑"}
            </button>
            <Badge color="grey">
              {displayTableMonths.length} {displayTableMonths.length === 1 ? "Month" : "Months"}
            </Badge>
          </div>
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
              <Table.HeaderCell className="text-right">Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {displayTableMonths.map((m) => (
              <Table.Row
                key={m.monthKey}
                onClick={() => {
                  setSelectedMonth(m.monthKey);
                  setViewMode("month");
                }}
                className="hover:bg-ui-bg-subtle/70 cursor-pointer transition-colors"
              >
                <Table.Cell className="font-semibold text-ui-fg-base">
                  <div className="flex items-center gap-2">
                    <span>{m.monthLabel}</span>
                    {m.monthKey.startsWith("2026") && (
                      <Badge color="green" size="small">
                        2026
                      </Badge>
                    )}
                  </div>
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
                <Table.Cell className="text-right">
                  <span className="text-xs text-[#DD6013] hover:underline font-medium">
                    View Days &rarr;
                  </span>
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
