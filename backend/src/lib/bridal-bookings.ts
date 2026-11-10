import fs from "node:fs";
import path from "node:path";

export type BridalBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface BridalBookingRecord {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  eventDate: string;
  location: string;
  message: string;
  status: BridalBookingStatus;
  advancePaidInr: number;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR =
  process.env.STUDIO_DATA_DIR?.trim() || path.resolve(process.cwd(), "../studio-data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bridal-bookings.json");

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

export function loadBridalBookings(): BridalBookingRecord[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(BOOKINGS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBridalBookings(records: BridalBookingRecord[]): void {
  ensureStorage();
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(records, null, 2), "utf8");
}

export function createBridalBooking(input: {
  referenceId?: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  eventDate?: string;
  location?: string;
  message: string;
}): BridalBookingRecord {
  const current = loadBridalBookings();
  const now = new Date().toISOString();
  const referenceId =
    input.referenceId || `INQ-${Date.now().toString(36).toUpperCase()}`;

  const record: BridalBookingRecord = {
    id: `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    referenceId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: (input.phone || "").trim(),
    service: (input.service || "bridal").trim(),
    eventDate: (input.eventDate || "").trim(),
    location: (input.location || "").trim(),
    message: input.message.trim(),
    status: "pending",
    advancePaidInr: 0,
    adminNotes: "",
    createdAt: now,
    updatedAt: now,
  };

  current.unshift(record);
  saveBridalBookings(current);
  return record;
}

