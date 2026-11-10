import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createBridalBooking } from "../../../lib/bridal-bookings";
import { dispatchStudioNotification } from "../../../lib/notifications";

function escapeHtml(text: string): string {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatServiceLabel(raw: string): string {
  const map: Record<string, string> = {
    bridal: "Bridal Mehandi Booking",
    events: "Events & Celebrations",
    botanical: "Custom Bulk Orders / Workshops",
    "order-support": "Existing Store Order Question",
  };
  return map[raw] || raw || "Bridal Mehandi Booking";
}

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

    const serviceLabel = formatServiceLabel(booking.service);
    const detailsHtml = `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <tbody>
          <tr>
            <td style="padding:9px 12px;border-bottom:1px solid #eeeeee;font-size:13px;color:#525252;width:36%;">Inquiry Type</td>
            <td style="padding:9px 12px;border-bottom:1px solid #eeeeee;font-size:13px;font-weight:600;color:#111111;">${escapeHtml(serviceLabel)}</td>
          </tr>
          ${
            booking.eventDate
              ? `<tr>
                  <td style="padding:9px 12px;border-bottom:1px solid #eeeeee;font-size:13px;color:#525252;">Preferred Date</td>
                  <td style="padding:9px 12px;border-bottom:1px solid #eeeeee;font-size:13px;color:#111111;">${escapeHtml(booking.eventDate)}</td>
                </tr>`
              : ""
          }
          ${
            booking.location
              ? `<tr>
                  <td style="padding:9px 12px;border-bottom:1px solid #eeeeee;font-size:13px;color:#525252;">City / Venue</td>
                  <td style="padding:9px 12px;border-bottom:1px solid #eeeeee;font-size:13px;color:#111111;">${escapeHtml(booking.location)}</td>
                </tr>`
              : ""
          }
          ${
            booking.phone
              ? `<tr>
                  <td style="padding:9px 12px;border-bottom:1px solid #eeeeee;font-size:13px;color:#525252;">Phone / WhatsApp</td>
                  <td style="padding:9px 12px;border-bottom:1px solid #eeeeee;font-size:13px;color:#111111;">${escapeHtml(booking.phone)}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding:9px 12px;font-size:13px;color:#525252;vertical-align:top;">Notes</td>
            <td style="padding:9px 12px;font-size:13px;line-height:1.55;color:#111111;">${escapeHtml(booking.message)}</td>
          </tr>
        </tbody>
      </table>
    `;

    const notificationResult = await dispatchStudioNotification({
      scope: req.scope,
      type: "bridal_booking_received",
      recipientEmail: booking.email,
      recipientName: booking.name,
      recipientPhone: booking.phone,
      referenceId: booking.referenceId,
      summary: `We have received your ${serviceLabel} inquiry${
        booking.eventDate ? ` for ${booking.eventDate}` : ""
      }. Sana will personally review availability across Srinagar, Bangalore, or destination venues within 24 hours.`,
      detailsHtml,
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
      emailDispatched: notificationResult.customerEmailSent,
      emailProvider: notificationResult.provider,
    });
  } catch (error: any) {
    console.error("[Bridal Booking Create Error]:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to save booking inquiry.",
    });
  }
}
