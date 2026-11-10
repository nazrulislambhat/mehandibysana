import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  BridalBookingStatus,
  loadBridalBookings,
  saveBridalBookings,
} from "../../../lib/bridal-bookings";
import { dispatchStudioNotification } from "../../../lib/notifications";

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const bookings = loadBridalBookings();
  return res.status(200).json({ bookings });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    action?: "update" | "delete";
    id?: string;
    status?: BridalBookingStatus;
    advancePaidInr?: number;
    adminNotes?: string;
  };

  if (!body.id) {
    return res.status(400).json({ success: false, message: "Booking id is required." });
  }

  const current = loadBridalBookings();

  if (body.action === "delete") {
    const next = current.filter((b) => b.id !== body.id);
    saveBridalBookings(next);
    return res.status(200).json({ success: true, bookings: next });
  }

  const idx = current.findIndex((b) => b.id === body.id);
  if (idx < 0) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }

  const target = current[idx];
  const validStatuses: BridalBookingStatus[] = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];

  current[idx] = {
    ...target,
    status:
      body.status && validStatuses.includes(body.status)
        ? body.status
        : target.status,
    advancePaidInr:
      body.advancePaidInr !== undefined
        ? Math.max(0, Number(body.advancePaidInr) || 0)
        : target.advancePaidInr,
    adminNotes:
      body.adminNotes !== undefined ? String(body.adminNotes) : target.adminNotes,
    updatedAt: new Date().toISOString(),
  };

  saveBridalBookings(current);

  if (body.status === "confirmed" && target.status !== "confirmed") {
    await dispatchStudioNotification({
      scope: req.scope,
      type: "bridal_booking_confirmed",
      recipientEmail: current[idx].email,
      recipientName: current[idx].name,
      recipientPhone: current[idx].phone,
      referenceId: current[idx].referenceId,
      summary: `Your ${current[idx].service} booking with Mehandi by Sana${
        current[idx].eventDate ? ` for ${current[idx].eventDate}` : ""
      } is confirmed${
        current[idx].advancePaidInr > 0
          ? ` (advance recorded: ₹${current[idx].advancePaidInr})`
          : ""
      }. Sana will connect with you ahead of the event.`,
    });
  }

  return res.status(200).json({
    success: true,
    booking: current[idx],
    bookings: current,
  });
}

