import fs from "node:fs";
import path from "node:path";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { loadBridalBookings } from "./bridal-bookings";

const DATA_DIR =
  process.env.STUDIO_DATA_DIR?.trim() || path.resolve(process.cwd(), "../studio-data");
const EXPORTS_DIR = path.join(DATA_DIR, "exports");

export type CampaignSegment =
  | "all"
  | "repeat_buyers"
  | "kashmir_local"
  | "bridal_inquiries"
  | "one_time_buyers";

export interface CustomerEmailRecord {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  state: string;
  pincode: string;
  ordersCount: number;
  totalSpentInr: number;
  lastOrderAt: string;
  sources: string[];
  segments: CampaignSegment[];
}

export interface CustomerEmailAggregation {
  generatedAt: string;
  totalRawCandidates: number;
  skippedInvalidOrTest: number;
  totalContacts: number;
  segmentCounts: Record<CampaignSegment, number>;
  topDomains: Array<{ domain: string; count: number }>;
  contacts: CustomerEmailRecord[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isSyntheticOrTestEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  if (!EMAIL_REGEX.test(lower)) return true;
  if (lower.startsWith("guest@")) return true;
  if (lower.startsWith("noreply@") || lower.startsWith("no-reply@")) return true;
  if (
    lower.endsWith("@example.com") ||
    lower.endsWith("@example.org") ||
    lower.endsWith("@example.net") ||
    lower.endsWith("@test.com") ||
    lower.includes("@mailinator.")
  ) {
    return true;
  }
  return false;
}

function cleanStr(val: unknown): string {
  return String(val ?? "")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function csvCell(value: string | number): string {
  const raw = String(value ?? "");
  // Prevent CSV formula injection when opened in Excel / Google Sheets
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  if (/[",\n\r]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

async function fetchAllGraphRows(
  query: { graph: (args: Record<string, unknown>) => Promise<{ data?: any[] }> },
  entity: string,
  fields: string[]
): Promise<any[]> {
  const all: any[] = [];
  const take = 1000;
  let skip = 0;

  while (true) {
    const res = await query.graph({
      entity,
      fields,
      pagination: { take, skip },
    });
    const batch = res?.data || [];
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < take) break;
    skip += batch.length;
  }

  return all;
}

export async function aggregateCustomerEmails(
  scope: { resolve: (key: string) => any },
  options: { includeTest?: boolean; segment?: CampaignSegment } = {}
): Promise<CustomerEmailAggregation> {
  const includeTest = Boolean(options.includeTest);
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);

  const [customers, orders] = await Promise.all([
    fetchAllGraphRows(query, "customer", [
      "id",
      "email",
      "first_name",
      "last_name",
      "phone",
      "metadata",
      "created_at",
    ]),
    fetchAllGraphRows(query, "order", [
      "id",
      "email",
      "created_at",
      "metadata",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.city",
      "shipping_address.province",
      "shipping_address.postal_code",
      "shipping_address.phone",
      "billing_address.first_name",
      "billing_address.last_name",
      "billing_address.city",
      "billing_address.province",
      "billing_address.postal_code",
      "billing_address.phone",
    ]),
  ]);

  const bookings = loadBridalBookings();

  const byEmail = new Map<string, CustomerEmailRecord>();
  const rawSeen = new Set<string>();
  const skippedEmails = new Set<string>();

  const ensureEntry = (rawEmail: unknown): CustomerEmailRecord | null => {
    const normalized = String(rawEmail ?? "").toLowerCase().trim();
    if (!normalized) return null;
    rawSeen.add(normalized);

    if (!includeTest && isSyntheticOrTestEmail(normalized)) {
      skippedEmails.add(normalized);
      return null;
    }
    if (!EMAIL_REGEX.test(normalized)) {
      skippedEmails.add(normalized);
      return null;
    }

    let entry = byEmail.get(normalized);
    if (!entry) {
      entry = {
        email: normalized,
        firstName: "",
        lastName: "",
        phone: "",
        city: "",
        state: "",
        pincode: "",
        ordersCount: 0,
        totalSpentInr: 0,
        lastOrderAt: "",
        sources: [],
        segments: ["all"],
      };
      byEmail.set(normalized, entry);
    }
    return entry;
  };

  const addSource = (entry: CustomerEmailRecord, src: string) => {
    if (!entry.sources.includes(src)) {
      entry.sources.push(src);
    }
  };

  for (const c of customers) {
    const entry = ensureEntry(c.email);
    if (!entry) continue;
    addSource(entry, "medusa_customer");
    if (!entry.firstName && c.first_name) entry.firstName = cleanStr(c.first_name);
    if (!entry.lastName && c.last_name) entry.lastName = cleanStr(c.last_name);
    if (!entry.phone && c.phone) entry.phone = cleanStr(c.phone);
    if (!entry.city && c.metadata?.city) entry.city = cleanStr(c.metadata.city);
    if (!entry.pincode && c.metadata?.postcode) entry.pincode = cleanStr(c.metadata.postcode);
  }

  for (const o of orders) {
    const entry = ensureEntry(o.email);
    if (!entry) continue;
    addSource(entry, "order_history");
    entry.ordersCount += 1;

    const orderTotal = Number.parseFloat(String(o.metadata?.total ?? "0"));
    if (Number.isFinite(orderTotal) && orderTotal > 0) {
      entry.totalSpentInr = Math.round((entry.totalSpentInr + orderTotal) * 100) / 100;
    }

    const orderDate = cleanStr(o.metadata?.woo_date_created || o.created_at || "");
    if (orderDate && (!entry.lastOrderAt || orderDate > entry.lastOrderAt)) {
      entry.lastOrderAt = orderDate;
    }

    const ship = o.shipping_address || {};
    const bill = o.billing_address || {};
    if (!entry.firstName || entry.firstName === "Customer") {
      entry.firstName = cleanStr(ship.first_name || bill.first_name || entry.firstName);
    }
    if (!entry.lastName) {
      entry.lastName = cleanStr(ship.last_name || bill.last_name);
    }
    if (!entry.phone) {
      entry.phone = cleanStr(ship.phone || bill.phone);
    }
    if (!entry.city) {
      entry.city = cleanStr(ship.city || bill.city);
    }
    if (!entry.state) {
      entry.state = cleanStr(ship.province || bill.province);
    }
    if (!entry.pincode) {
      entry.pincode = cleanStr(ship.postal_code || bill.postal_code);
    }
  }

  for (const b of bookings) {
    const entry = ensureEntry(b.email);
    if (!entry) continue;
    addSource(entry, "bridal_inquiry");
    if (!entry.firstName && b.name) {
      const parts = cleanStr(b.name).split(/\s+/);
      entry.firstName = parts[0] || "";
      entry.lastName = parts.slice(1).join(" ");
    }
    if (!entry.phone && b.phone) entry.phone = cleanStr(b.phone);
    if (!entry.city && b.location) entry.city = cleanStr(b.location);
  }

  const allContacts = Array.from(byEmail.values());
  const domainMap = new Map<string, number>();

  for (const contact of allContacts) {
    const segs: CampaignSegment[] = ["all"];
    if (contact.ordersCount >= 2) {
      segs.push("repeat_buyers");
    } else if (contact.ordersCount === 1) {
      segs.push("one_time_buyers");
    }
    if (/^19\d{4}$/.test(contact.pincode)) {
      segs.push("kashmir_local");
    }
    if (contact.sources.includes("bridal_inquiry")) {
      segs.push("bridal_inquiries");
    }
    contact.segments = segs;

    const domain = contact.email.split("@")[1] || "unknown";
    domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
  }

  allContacts.sort((a, b) => {
    if (b.ordersCount !== a.ordersCount) return b.ordersCount - a.ordersCount;
    if (b.totalSpentInr !== a.totalSpentInr) return b.totalSpentInr - a.totalSpentInr;
    return a.email.localeCompare(b.email);
  });

  const segmentCounts: Record<CampaignSegment, number> = {
    all: allContacts.length,
    repeat_buyers: allContacts.filter((c) => c.segments.includes("repeat_buyers")).length,
    kashmir_local: allContacts.filter((c) => c.segments.includes("kashmir_local")).length,
    bridal_inquiries: allContacts.filter((c) => c.segments.includes("bridal_inquiries")).length,
    one_time_buyers: allContacts.filter((c) => c.segments.includes("one_time_buyers")).length,
  };

  const selectedSegment = options.segment || "all";
  const filteredContacts =
    selectedSegment === "all"
      ? allContacts
      : allContacts.filter((c) => c.segments.includes(selectedSegment));

  const topDomains = Array.from(domainMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));

  return {
    generatedAt: new Date().toISOString(),
    totalRawCandidates: rawSeen.size,
    skippedInvalidOrTest: skippedEmails.size,
    totalContacts: allContacts.length,
    segmentCounts,
    topDomains,
    contacts: filteredContacts,
  };
}

export function toCustomerEmailsCsv(contacts: CustomerEmailRecord[]): string {
  const header = [
    "email",
    "first_name",
    "last_name",
    "phone",
    "city",
    "state",
    "pincode",
    "orders_count",
    "total_spent_inr",
    "segments",
    "last_order_at",
    "sources",
  ].join(",");

  const rows = contacts.map((c) =>
    [
      csvCell(c.email),
      csvCell(c.firstName),
      csvCell(c.lastName),
      csvCell(c.phone),
      csvCell(c.city),
      csvCell(c.state),
      csvCell(c.pincode),
      csvCell(c.ordersCount),
      csvCell(c.totalSpentInr),
      csvCell(c.segments.filter((s) => s !== "all").join("|") || "general"),
      csvCell(c.lastOrderAt),
      csvCell(c.sources.join("|")),
    ].join(",")
  );

  return [header, ...rows].join("\n") + "\n";
}

export function toCustomerEmailsTxt(contacts: CustomerEmailRecord[]): string {
  return contacts.map((c) => c.email).join("\n") + (contacts.length > 0 ? "\n" : "");
}

export function writeCustomerEmailExports(aggregation: CustomerEmailAggregation): {
  csvPath: string;
  txtPath: string;
  summaryPath: string;
} {
  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  }

  const csvPath = path.join(EXPORTS_DIR, "customer-emails.csv");
  const txtPath = path.join(EXPORTS_DIR, "customer-emails-only.txt");
  const summaryPath = path.join(EXPORTS_DIR, "customer-emails-summary.json");

  fs.writeFileSync(csvPath, toCustomerEmailsCsv(aggregation.contacts), "utf8");
  fs.writeFileSync(txtPath, toCustomerEmailsTxt(aggregation.contacts), "utf8");
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        generatedAt: aggregation.generatedAt,
        totalRawCandidates: aggregation.totalRawCandidates,
        skippedInvalidOrTest: aggregation.skippedInvalidOrTest,
        totalContacts: aggregation.totalContacts,
        segmentCounts: aggregation.segmentCounts,
        topDomains: aggregation.topDomains,
      },
      null,
      2
    ),
    "utf8"
  );

  return { csvPath, txtPath, summaryPath };
}

