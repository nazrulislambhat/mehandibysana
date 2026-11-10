import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return res.status(503).json({
      success: false,
      code: "RAZORPAY_NOT_CONFIGURED",
      message:
        "Razorpay API keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured on the Medusa backend yet.",
    });
  }

  try {
    const body = (req.body || {}) as {
      amount?: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
    };

    const amountInRupees = Number(body.amount);
    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order amount must be greater than ₹0.",
      });
    }

    const amountPaise = Math.round(amountInRupees * 100);
    const currency = (body.currency || "INR").toUpperCase();
    const receipt =
      body.receipt || `mbs_rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt: receipt.slice(0, 40),
        notes: body.notes || {},
      }),
    });

    const rzpData = (await rzpResponse.json()) as {
      id?: string;
      amount?: number;
      currency?: string;
      receipt?: string;
      error?: { description?: string; code?: string };
    };

    if (!rzpResponse.ok || !rzpData.id) {
      return res.status(rzpResponse.status || 502).json({
        success: false,
        message:
          rzpData.error?.description ||
          "Razorpay order creation failed. Verify your Razorpay API credentials.",
      });
    }

    return res.status(200).json({
      success: true,
      keyId,
      razorpayOrderId: rzpData.id,
      amountPaise: rzpData.amount ?? amountPaise,
      currency: rzpData.currency ?? currency,
      receipt: rzpData.receipt ?? receipt,
    });
  } catch (error: any) {
    console.error("[Razorpay Create Order Error]:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Unexpected error creating Razorpay order.",
    });
  }
}

