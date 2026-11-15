import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const rawRange = String(req.query?.range || "6mo").toLowerCase();
    const range: "6mo" | "1yr" | "all" =
      rawRange === "1yr" ? "1yr" : rawRange === "all" ? "all" : "6mo";

    const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);

    // Interval condition based on range
    let intervalClause = "";
    if (range === "6mo") {
      intervalClause = "WHERE COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at) >= (max_d.max_order_date - interval '6 months')";
    } else if (range === "1yr") {
      intervalClause = "WHERE COALESCE((o.metadata->>'woo_date_created')::timestamp, o.created_at) >= (max_d.max_order_date - interval '12 months')";
    } else {
      intervalClause = ""; // all months
    }

    // 1. Monthly series query
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

    // 2. Annual summary query
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

    // 3. Lifetime stats query
    const lifetimeQuery = `
      SELECT 
        count(*)::int as lifetime_orders,
        round(coalesce(sum(COALESCE((o.metadata->>'total')::numeric, (os.totals->>'current_order_total')::numeric, 0)), 0), 2)::float as lifetime_revenue,
        count(DISTINCT o.email)::int as total_customers
      FROM "order" o
      LEFT JOIN order_summary os ON o.id = os.order_id;
    `;

    const [monthlyRes, annualRes, lifetimeRes] = await Promise.all([
      pg.raw(monthlyQuery),
      pg.raw(annualQuery),
      pg.raw(lifetimeQuery),
    ]);

    const rawMonths = monthlyRes?.rows || [];
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

    // Compute period summary
    let periodRevenue = 0;
    let periodOrders = 0;
    let periodOnline = 0;
    let periodCod = 0;
    let periodCustomers = 0;
    let peakMonth: { label: string; revenue: number; orders: number } | null = null;

    for (const m of months) {
      periodRevenue += m.totalRevenue;
      periodOrders += m.orderCount;
      periodOnline += m.onlineOrders;
      periodCod += m.codOrders;
      periodCustomers += m.uniqueCustomers;

      if (!peakMonth || m.totalRevenue > peakMonth.revenue) {
        peakMonth = {
          label: m.monthLabel,
          revenue: m.totalRevenue,
          orders: m.orderCount,
        };
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
      selectedRange: range,
      summary: {
        totalRevenue: Math.round(periodRevenue * 100) / 100,
        totalOrders: periodOrders,
        aov: periodAov,
        onlineOrders: periodOnline,
        codOrders: periodCod,
        onlinePercentage,
        uniqueCustomers: periodCustomers,
        peakMonth,
      },
      months,
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
