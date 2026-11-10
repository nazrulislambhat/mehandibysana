import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const DATA_DIR =
  process.env.STUDIO_DATA_DIR?.trim() || path.resolve(process.cwd(), "../studio-data");
const WEBHOOK_LOG = path.join(DATA_DIR, "razorpay-webhooks.log");

function appendWebhookAudit(entry: Record<string, unknown>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(
      WEBHOOK_LOG,
      `${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`,
      "utf8"
    );
  } catch (err) {
    console.warn("[Razorpay Webhook] Could not append audit log:", err);
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ||
    process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!webhookSecret) {
    return res
      .status(503)
      .json({ received: false, message: "Webhook secret not configured." });
  }

  const signature = req.headers["x-razorpay-signature"];
  if (typeof signature !== "string" || !signature) {
    return res
      .status(400)
      .json({ received: false, message: "Missing x-razorpay-signature header." });
  }

  const rawBody =
    typeof req.rawBody === "string"
      ? req.rawBody
      : Buffer.isBuffer(req.rawBody)
        ? req.rawBody.toString("utf8")
        : JSON.stringify(req.body || {});

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");

  if (
    expectedBuf.length !== actualBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return res
      .status(401)
      .json({ received: false, message: "Invalid Razorpay webhook signature." });
  }

  const event = (req.body || {}) as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          email?: string;
          contact?: string;
          method?: string;
        };
      };
      order?: {
        entity?: {
          id?: string;
          receipt?: string;
          amount_paid?: number;
          status?: string;
        };
      };
    };
  };

  const eventName = event.event || "unknown";
  const paymentEntity = event.payload?.payment?.entity;
  const orderEntity = event.payload?.order?.entity;

  appendWebhookAudit({
    event: eventName,
    razorpayPaymentId: paymentEntity?.id || "",
    razorpayOrderId: paymentEntity?.order_id || orderEntity?.id || "",
    amountPaise: paymentEntity?.amount || orderEntity?.amount_paid || 0,
    method: paymentEntity?.method || "",
    status: paymentEntity?.status || orderEntity?.status || "",
    email: paymentEntity?.email || "",
  });

  console.log(
    `[Razorpay Webhook] Verified event=${eventName} payment_id=${paymentEntity?.id || "n/a"} order_id=${paymentEntity?.order_id || orderEntity?.id || "n/a"}`
  );

  return res.status(200).json({ received: true, event: eventName });
}
