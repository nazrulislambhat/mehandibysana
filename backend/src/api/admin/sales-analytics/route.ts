import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export interface DailySalesStat {
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

export interface MonthlySalesStat {
  monthKey: string;
  monthLabel: string;
  orderCount: number;
  totalRevenue: number;
  aov: number;
  onlineOrders: number;
  codOrders: number;
  uniqueCustomers: number;
  growthRate: number | null; // % growth compared to previous month
}

export interface AnnualSalesStat {
  year: string;
  orderCount: number;
  totalRevenue: number;
  aov: number;
}

export interface SalesAnalyticsResponse {
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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const rawMonth = typeof req.query?.month === "string" ? req.query.month.trim() : null;
    const rawYear = typeof req.query?.year === "string" ? req.query.year.trim() : null;
    const rawRange = String(req.query?.range || "").toLowerCase().trim();

    const selectedMonth = rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : null;
    const selectedYear = rawYear && /^\d{4}$/.test(rawYear) ? rawYear : null;
    const selectedRange = selectedMonth ? "month" : selectedYear ? "year" : rawRange === "1yr" ? "1yr" : rawRange === "all" ? "all" : "6mo";

    const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);

    // 1. Fetch all distinct available months and years (newest first)
    const availableQuery = `
      SELECT 
        to_char(date_trunc('month', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'YYYY-MM') as month_key,
        to_char(date_trunc('month', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'Mon YYYY') as month_label,
        to_char(date_trunc('year', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'YYYY') as year_key
      FROM "order" o
      GROUP BY month_key, month_label, year_key
      ORDER BY month_key DESC;
    `;
    const availableRes = await pg.raw(availableQuery);
    const availableMonths: Array<{ monthKey: string; monthLabel: string }> = (availableRes?.rows || []).map((r: any) => ({
      monthKey: r.month_key,
      monthLabel: r.month_label,
    }));
    const availableYearsSet = new Set<string>();
    for (const r of availableRes?.rows || []) {
      if (r.year_key) availableYearsSet.add(r.year_key);
    }
    const availableYears = Array.from(availableYearsSet).sort((a, b) => b.localeCompare(a));

    // Determine filter clause
    let intervalClause = "";
    const params: any[] = [];

    if (selectedMonth) {
      intervalClause = "WHERE to_char(date_trunc('month', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'YYYY-MM') = $1";
      params.push(selectedMonth);
    } else if (selectedYear) {
      intervalClause = "WHERE to_char(date_trunc('year', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'YYYY') = $1";
      params.push(selectedYear);
    } else if (selectedRange === "6mo") {
      intervalClause = "WHERE COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at) >= (max_d.max_order_date - interval '6 months')";
    } else if (selectedRange === "1yr") {
      intervalClause = "WHERE COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at) >= (max_d.max_order_date - interval '12 months')";
    } else {
      intervalClause = ""; // all
    }

    // 2. Monthly series query
    const monthlyQuery = `
      WITH max_d AS (
        SELECT COALESCE(max(COALESCE((metadata->>'woo_date_created')::timestamp, created_at)), now()) as max_order_date
        FROM "order"
      )
      SELECT 
        to_char(date_trunc('month', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'YYYY-MM') as month_key,
        to_char(date_trunc('month', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'Mon YYYY') as month_label,
        count(*)::int as order_count,
        round(coalesce(sum(COALESCE((o.metadata->>'total')::numeric, (os.totals->>'current_order_total')::numeric, 0)), 0), 2)::float as total_revenue,
        round(coalesce(avg(COALESCE((o.metadata->>'total')::numeric, (os.totals->>'current_order_total')::numeric, 0)), 0), 2)::float as aov,
        count(*) FILTER (WHERE o.metadata->>'payment_method' = 'razorpay' OR (os.totals->>'paid_total')::numeric > 0)::int as online_orders,
        count(*) FILTER (WHERE o.metadata->>'payment_method' = 'cod')::int as cod_orders,
        count(DISTINCT o.email)::int as unique_customers
      FROM "order" o
      CROSS JOIN max_d
      LEFT JOIN order_summary os ON o.id = os.order_id
      ${intervalClause}
      GROUP BY month_key, month_label
      ORDER BY month_key ASC;
    `;

    // 3. Daily series query (if month is selected)
    let dailyQuery = "";
    if (selectedMonth) {
      dailyQuery = `
        SELECT 
          to_char(date_trunc('day', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'YYYY-MM-DD') as day_key,
          to_char(date_trunc('day', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'Mon DD') as day_label,
          extract(day from date_trunc('day', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)))::int as day_number,
          count(*)::int as order_count,
          round(coalesce(sum(COALESCE((o.metadata->>'total')::numeric, (os.totals->>'current_order_total')::numeric, 0)), 0), 2)::float as total_revenue,
          round(coalesce(avg(COALESCE((o.metadata->>'total')::numeric, (os.totals->>'current_order_total')::numeric, 0)), 0), 2)::float as aov,
          count(*) FILTER (WHERE o.metadata->>'payment_method' = 'razorpay' OR (os.totals->>'paid_total')::numeric > 0)::int as online_orders,
          count(*) FILTER (WHERE o.metadata->>'payment_method' = 'cod')::int as cod_orders,
          count(DISTINCT o.email)::int as unique_customers
        FROM "order" o
        LEFT JOIN order_summary os ON o.id = os.order_id
        WHERE to_char(date_trunc('month', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'YYYY-MM') = $1
        GROUP BY day_key, day_label, day_number
        ORDER BY day_key ASC;
      `;
    }

    // 4. Annual summary query
    const annualQuery = `
      SELECT 
        to_char(date_trunc('year', COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at)), 'YYYY') as year_key,
        count(*)::int as order_count,
        round(coalesce(sum(COALESCE((o.metadata->>'total')::numeric, (os.totals->>'current_order_total')::numeric, 0)), 0), 2)::float as total_revenue,
        round(coalesce(avg(COALESCE((o.metadata->>'total')::numeric, (os.totals->>'current_order_total')::numeric, 0)), 0), 2)::float as aov
      FROM "order" o
      LEFT JOIN order_summary os ON o.id = os.order_id
      GROUP BY year_key
      ORDER BY year_key DESC;
    `;

    // 5. Lifetime stats query
    const lifetimeQuery = `
      SELECT 
        count(*)::int as lifetime_orders,
        round(coalesce(sum(COALESCE((o.metadata->>'total')::numeric, (os.totals->>'current_order_total')::numeric, 0)), 0), 2)::float as lifetime_revenue,
        count(DISTINCT o.email)::int as total_customers
      FROM "order" o
      LEFT JOIN order_summary os ON o.id = os.order_id;
    `;

    const [monthlyRes, dailyRes, annualRes, lifetimeRes] = await Promise.all([
      pg.raw(monthlyQuery, params),
      dailyQuery ? pg.raw(dailyQuery, [selectedMonth]) : Promise.resolve({ rows: [] }),
      pg.raw(annualQuery),
      pg.raw(lifetimeQuery),
    ]);

    const rawMonths = monthlyRes?.rows || [];
    const rawDays = dailyRes?.rows || [];
    const rawAnnual = annualRes?.rows || [];
    const rawLifetime = lifetimeRes?.rows?.[0] || {};

    // Calculate growth rates month-over-month
    const months: MonthlySalesStat[] = rawMonths.map((m: any, idx: number) => {
      let growthRate: number | null = null;
      if (idx > 0) {
        const prevRev = Number(rawMonths[idx - 1].total_revenue) || 0;
        const currRev = Number(m.total_revenue) || 0;
        if (prevRev > 0) {
          growthRate = Math.round(((currRev - prevRev) / prevRev) * 1000) / 10;
        }
      }

      return {
        monthKey: m.month_key,
        monthLabel: m.month_label,
        orderCount: Number(m.order_count) || 0,
        totalRevenue: Number(m.total_revenue) || 0,
        aov: Number(m.aov) || 0,
        onlineOrders: Number(m.online_orders) || 0,
        codOrders: Number(m.cod_orders) || 0,
        uniqueCustomers: Number(m.unique_customers) || 0,
        growthRate,
      };
    });

    const days: DailySalesStat[] = rawDays.map((d: any) => ({
      dayKey: d.day_key,
      dayLabel: d.day_label,
      dayNumber: Number(d.day_number) || 0,
      orderCount: Number(d.order_count) || 0,
      totalRevenue: Number(d.total_revenue) || 0,
      aov: Number(d.aov) || 0,
      onlineOrders: Number(d.online_orders) || 0,
      codOrders: Number(d.cod_orders) || 0,
      uniqueCustomers: Number(d.unique_customers) || 0,
    }));

    // Compute period summary
    let periodRevenue = 0;
    let periodOrders = 0;
    let periodOnline = 0;
    let periodCod = 0;
    let periodCustomers = 0;
    let peakPeriod: { label: string; revenue: number; orders: number } | null = null;

    if (selectedMonth && days.length > 0) {
      for (const d of days) {
        periodRevenue += d.totalRevenue;
        periodOrders += d.orderCount;
        periodOnline += d.onlineOrders;
        periodCod += d.codOrders;
        periodCustomers += d.uniqueCustomers;

        if (!peakPeriod || d.totalRevenue > peakPeriod.revenue) {
          peakPeriod = {
            label: d.dayLabel,
            revenue: d.totalRevenue,
            orders: d.orderCount,
          };
        }
      }
    } else {
      for (const m of months) {
        periodRevenue += m.totalRevenue;
        periodOrders += m.orderCount;
        periodOnline += m.onlineOrders;
        periodCod += m.codOrders;
        periodCustomers += m.uniqueCustomers;

        if (!peakPeriod || m.totalRevenue > peakPeriod.revenue) {
          peakPeriod = {
            label: m.monthLabel,
            revenue: m.totalRevenue,
            orders: m.orderCount,
          };
        }
      }
    }

    const periodAov =
      periodOrders > 0
        ? Math.round((periodRevenue / periodOrders) * 100) / 100
        : 0;

    const onlinePercentage =
      periodOrders > 0
        ? Math.round((periodOnline / periodOrders) * 1000) / 10
        : 0;

    const annualSummary: AnnualSalesStat[] = rawAnnual.map((a: any) => ({
      year: a.year_key,
      orderCount: Number(a.order_count) || 0,
      totalRevenue: Number(a.total_revenue) || 0,
      aov: Number(a.aov) || 0,
    }));

    const response: SalesAnalyticsResponse = {
      success: true,
      selectedRange,
      selectedYear,
      selectedMonth,
      availableMonths,
      availableYears,
      summary: {
        totalRevenue: Math.round(periodRevenue * 100) / 100,
        totalOrders: periodOrders,
        aov: periodAov,
        onlineOrders: periodOnline,
        codOrders: periodCod,
        onlinePercentage,
        uniqueCustomers: periodCustomers,
        peakPeriod,
      },
      months,
      days,
      annualSummary,
      lifetime: {
        totalRevenue: Number(rawLifetime.lifetime_revenue) || 0,
        totalOrders: Number(rawLifetime.lifetime_orders) || 0,
        totalCustomers: Number(rawLifetime.total_customers) || 0,
      },
    };

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to aggregate sales analytics.",
    });
  }
}
