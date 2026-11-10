import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createBridalBooking } from "../../../lib/bridal-bookings";
import { dispatchStudioNotification } from "../../../lib/notifications";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = (req.body || {}) as {
      referenceId?: string;
      name?: string;
      email?: string;
      phone?: string;
      service?: string;
      eventDate?: string;
      location?: string;
      message?: string;
    };

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and inquiry message are required.",
      });
    }

    const booking = createBridalBooking({
      referenceId: body.referenceId,
      name,
      email,
      phone: body.phone,
      service: body.service,
      eventDate: body.eventDate,
      location: body.location,
      message,
    });

    await dispatchStudioNotification({
      type: "bridal_booking_received",
      recipientEmail: booking.email,
      recipientName: booking.name,
      recipientPhone: booking.phone,
      referenceId: booking.referenceId,
      summary: `We have received your ${booking.service} inquiry${booking.eventDate ? ` for ${booking.eventDate}` : ""}. Sana and our Srinagar coordinator will review availability within 24 hours.`,
      details: {
        service: booking.service,
        eventDate: booking.eventDate,
        location: booking.location,
      },
    });

    return res.status(201).json({
      success: true,
      booking,
      referenceId: booking.referenceId,
    });
  } catch (error: any) {
    console.error("[Bridal Booking Create Error]:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to save booking inquiry.",
    });
  }
}

