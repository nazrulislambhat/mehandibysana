import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { createWooCommerceOrder } from '@/lib/woocommerce';

interface OrderItem {
  id: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  handle?: string;
  isPerishable?: boolean;
}

interface OrderPayload {
  orderNumber?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    shippingFee: number;
    total: number;
  };
  payment: {
    method: 'razorpay' | 'cod';
    paymentId?: string;
    status: 'paid' | 'pending_cod' | 'pending';
  };
  deliveryDetails?: {
    targetDate?: string;
    specialInstructions?: string;
    isGift?: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: OrderPayload = await req.json();

    if (!body.customer?.email || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid order payload: Missing email or items.' },
        { status: 400 }
      );
    }

    // 0. Primary: Create Authentic Order in WordPress / WooCommerce Backend
    let wooOrderId: number | string | null = null;
    let wooOrderNumber: string | null = null;
    let wooSyncStatus = 'pending';

    try {
      const wooOrder = await createWooCommerceOrder({
        customer: body.customer,
        items: body.items,
        pricing: body.pricing,
        payment: body.payment,
        deliveryDetails: body.deliveryDetails,
      });

      if (wooOrder && wooOrder.id) {
        wooOrderId = wooOrder.id;
        wooOrderNumber = String(wooOrder.number || wooOrder.id);
        wooSyncStatus = `synced_wc_${wooOrderNumber}`;
        console.log(`[WooCommerce Decoupled] Created real order #${wooOrderNumber} in WordPress WooCommerce!`);
      }
    } catch (wooErr: any) {
      wooSyncStatus = `woo_error: ${wooErr.message}`;
      console.warn('[WooCommerce Decoupled Warning]:', wooErr.message);
    }

    const orderNumber =
      wooOrderNumber || body.orderNumber || `MBS-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Build Itemized HTML Table
    const itemsHtml = body.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #EBE2D4;">
          <td style="padding: 12px 8px; vertical-align: middle;">
            <div style="font-weight: 700; color: #1A1613; font-size: 15px;">${item.title}</div>
            ${item.variantTitle ? `<div style="color: #C04A26; font-size: 13px; font-weight: 600;">${item.variantTitle}</div>` : ''}
          </td>
          <td style="padding: 12px 8px; text-align: center; vertical-align: middle; color: #5C544D;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; vertical-align: middle; font-weight: 700; color: #1A1613;">
            ₹${item.price * item.quantity}
          </td>
        </tr>
      `
      )
      .join('');

    // 2. Generate Full Branded Confirmation Email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Confirmation #${orderNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px; color: #1A1613;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #EBE2D4; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #C04A26 0%, #A63B1C 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">Mehandi By Sana</h1>
              <p style="margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.9;">100% Homemade Organic Henna Atelier • Srinagar</p>
            </td>
          </tr>

          <!-- Confirmation Hero -->
          <tr>
            <td style="padding: 30px 24px 20px 24px;">
              <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #C04A26; margin-bottom: 6px;">Order Confirmed</div>
              <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #1A1613;">Thank you, ${body.customer.firstName}!</h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #5C544D;">
                We have received your order <strong>#${orderNumber}</strong>. Your artisanal botanicals are being prepared fresh at our atelier in Baghat Barzullah, Srinagar.
              </p>

              <!-- Payment & Shipping Status Badge -->
              <table width="100%" cellpadding="12" cellspacing="0" style="background: #FAF7F2; border-radius: 8px; border: 1px solid #EBE2D4; margin-bottom: 24px;">
                <tr>
                  <td width="50%" style="font-size: 13px; color: #5C544D;">
                    <div><strong>Order Date:</strong> ${orderDate}</div>
                    <div style="margin-top: 4px;"><strong>Payment Method:</strong> ${
                      body.payment.method === 'razorpay' ? 'Razorpay Online Prepaid' : 'Cash on Delivery (COD)'
                    }</div>
                  </td>
                  <td width="50%" style="font-size: 13px; color: #5C544D; text-align: right;">
                    <div><strong>Payment Status:</strong> <span style="color: ${body.payment.status === 'paid' ? '#2EB85C' : '#C04A26'}; font-weight: 700;">${
      body.payment.status === 'paid' ? 'Paid ✓' : 'Pending COD'
    }</span></div>
                    ${
                      body.payment.paymentId
                        ? `<div style="margin-top: 4px; font-size: 11px; color: #8E847A;">ID: ${body.payment.paymentId}</div>`
                        : ''
                    }
                  </td>
                </tr>
              </table>

              <!-- Freezer Warning for Perishable Cones -->
              <div style="background: rgba(192, 74, 38, 0.08); border-left: 4px solid #C04A26; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; line-height: 1.5; color: #1A1613;">
                <strong>❄️ Storage Protocol:</strong> Our organic henna cones contain zero synthetic chemical preservatives. Please transfer cones to your freezer immediately upon delivery. Thaw at room temperature for 15-20 minutes before use.
              </div>

              <!-- Itemized Receipt -->
              <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1A1613; text-transform: uppercase; letter-spacing: 0.05em;">Order Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <thead>
                  <tr style="border-bottom: 2px solid #EBE2D4; font-size: 12px; font-weight: 700; color: #8E847A; text-transform: uppercase;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: center;">Qty</th>
                    <th style="padding: 8px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <table width="100%" cellpadding="4" cellspacing="0" style="margin-bottom: 24px; font-size: 14px;">
                <tr>
                  <td style="color: #5C544D;">Subtotal</td>
                  <td style="text-align: right; font-weight: 600; color: #1A1613;">₹${body.pricing.subtotal}</td>
                </tr>
                <tr>
                  <td style="color: #5C544D;">Express Shipping</td>
                  <td style="text-align: right; font-weight: 600; color: ${
                    body.pricing.shippingFee === 0 ? '#2EB85C' : '#1A1613'
                  };">
                    ${body.pricing.shippingFee === 0 ? 'FREE' : `₹${body.pricing.shippingFee}`}
                  </td>
                </tr>
                <tr style="border-top: 2px solid #EBE2D4;">
                  <td style="padding-top: 8px; font-size: 17px; font-weight: 800; color: #1A1613;">Total Amount</td>
                  <td style="padding-top: 8px; text-align: right; font-size: 18px; font-weight: 800; color: #C04A26;">₹${body.pricing.total}</td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <div style="background: #FAF7F2; padding: 16px; border-radius: 8px; border: 1px solid #EBE2D4; margin-bottom: 24px; font-size: 13px; line-height: 1.5;">
                <div style="font-weight: 700; color: #1A1613; margin-bottom: 4px;">Shipping Address:</div>
                <div>${body.customer.firstName} ${body.customer.lastName}</div>
                <div>${body.customer.address}${body.customer.apartment ? `, ${body.customer.apartment}` : ''}</div>
                <div>${body.customer.city}, ${body.customer.state} — <strong>${body.customer.pincode}</strong></div>
                <div style="margin-top: 4px;">Phone: <strong>${body.customer.phone}</strong></div>
                ${
                  body.deliveryDetails?.targetDate
                    ? `<div style="margin-top: 6px; color: #C04A26; font-weight: 600;">📅 Target Delivery Date: ${body.deliveryDetails.targetDate}</div>`
                    : ''
                }
              </div>

              <!-- Tracking CTA Button -->
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="https://mehandibysana.com/order-tracking?orderId=${encodeURIComponent(
                  orderNumber
                )}&email=${encodeURIComponent(body.customer.email)}" 
                  style="background: #C04A26; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 14px; font-weight: 700; display: inline-block;">
                  Track Order Status →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #FAF7F2; padding: 20px 24px; text-align: center; font-size: 12px; color: #8E847A; border-top: 1px solid #EBE2D4;">
              <div>Mehandi By Sana • Baghat Barzullah, Srinagar, Kashmir (190005)</div>
              <div style="margin-top: 4px;">WhatsApp Helpline: +91 9149648717 • Email: sana@mehandibysana.com</div>
              <div style="margin-top: 8px; font-size: 11px;">Handmade with pure Rajasthani lawsone & steam-distilled eucalyptus oil.</div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 3. Sync Order to MedusaJS v2 Backend
    let medusaOrderId: string | null = null;
    let medusaDisplayId: number | null = null;
    let medusaError: string | null = null;

    try {
      const medusaBackendUrl = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
      const publishableKey =
        process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
        'pk_866da77cbf7bcac1e6681e9aa0e882b373d390df3e25eb1fb87a100932c11f7c';

      const medusaRes = await fetch(`${medusaBackendUrl}/store/place-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': publishableKey,
        },
        body: JSON.stringify({
          orderNumber,
          customer: body.customer,
          items: body.items,
          pricing: body.pricing,
          payment: body.payment,
          deliveryDetails: body.deliveryDetails,
        }),
      });

      if (medusaRes.ok) {
        const medusaData = await medusaRes.json();
        medusaOrderId = medusaData.order?.id || null;
        medusaDisplayId = medusaData.order?.display_id || null;
        console.log(
          `[Medusa Sync] Successfully created order ${orderNumber} in Medusa backend (ID: ${medusaOrderId}, #${medusaDisplayId})`
        );
      } else {
        const errText = await medusaRes.text();
        medusaError = `Medusa responded with ${medusaRes.status}: ${errText}`;
        console.warn('[Medusa Sync Notice]:', medusaError);
      }
    } catch (mErr: any) {
      medusaError = mErr.message;
      console.warn('[Medusa Sync Error]: Could not reach Medusa backend:', mErr.message);
    }

    // 4. Persist Order to disk / order log for zero data loss
    try {
      const ordersLogPath = path.join(process.cwd(), 'data', 'orders_live.json');
      const dir = path.dirname(ordersLogPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      let currentOrders: any[] = [];
      if (fs.existsSync(ordersLogPath)) {
        try {
          currentOrders = JSON.parse(fs.readFileSync(ordersLogPath, 'utf8'));
        } catch (e) {
          currentOrders = [];
        }
      }

      currentOrders.unshift({
        id: orderNumber,
        wooOrderId,
        medusaOrderId,
        medusaDisplayId,
        createdAt: new Date().toISOString(),
        customer: body.customer,
        items: body.items,
        pricing: body.pricing,
        payment: body.payment,
        deliveryDetails: body.deliveryDetails,
      });

      fs.writeFileSync(ordersLogPath, JSON.stringify(currentOrders, null, 2));

      // Also archive standalone email HTML file for easy offline inspection/printing
      const emailsDir = path.join(dir, 'emails');
      if (!fs.existsSync(emailsDir)) {
        fs.mkdirSync(emailsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(emailsDir, `${orderNumber}.html`), emailHtml);
    } catch (err) {
      console.warn('Notice: Could not write order or email to disk:', err);
    }

    // 4. Dispatch Email
    let emailDispatched = false;
    let emailProvider = 'local_archive';
    let emailStatusMessage = '';

    // A) Try Brevo API if configured
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': brevoApiKey,
          },
          body: JSON.stringify({
            sender: {
              name: 'Mehandi By Sana',
              email: process.env.FROM_EMAIL || 'contact@mehandibysana.com',
            },
            to: [
              {
                email: body.customer.email,
                name: `${body.customer.firstName} ${body.customer.lastName}`.trim(),
              },
            ],
            bcc: [
              {
                email: process.env.ADMIN_EMAIL || 'sana@mehandibysana.com',
                name: 'Sumaiya Rashid',
              },
            ],
            subject: `Order #${orderNumber} Confirmed — Mehandi By Sana`,
            htmlContent: emailHtml,
          }),
        });

        if (brevoRes.ok) {
          emailDispatched = true;
          emailProvider = 'brevo';
          emailStatusMessage = 'Dispatched via Brevo API';
        } else {
          const errData = await brevoRes.json();
          emailStatusMessage = `Brevo API notice: ${errData.message || errData.code}`;
          console.warn('[Email Dispatch Notice]', emailStatusMessage);
        }
      } catch (err: any) {
        emailStatusMessage = `Brevo connection error: ${err.message}`;
        console.warn('[Email Fetch Error]', emailStatusMessage);
      }
    }

    // B) Try SMTP (Nodemailer) if SMTP_HOST configured
    if (!emailDispatched && process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Mehandi By Sana" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
          to: body.customer.email,
          bcc: process.env.ADMIN_EMAIL || 'sana@mehandibysana.com',
          subject: `Order #${orderNumber} Confirmed — Mehandi By Sana`,
          html: emailHtml,
        });

        emailDispatched = true;
        emailProvider = 'smtp';
        emailStatusMessage = 'Dispatched via SMTP';
      } catch (smtpErr: any) {
        emailStatusMessage += ` | SMTP error: ${smtpErr.message}`;
        console.warn('[SMTP Dispatch Notice]', smtpErr);
      }
    }

    // Log complete order confirmation dispatch
    console.log(`[Order Processing] Order #${orderNumber} created for ${body.customer.email}. Payment: ${body.payment.method} (${body.payment.status}). Email: ${emailDispatched ? 'SENT' : 'ARCHIVED'} (${emailProvider}). ${emailStatusMessage}`);

    return NextResponse.json({
      success: true,
      orderNumber,
      wooOrderId,
      wooSyncStatus,
      medusaOrderId,
      medusaDisplayId,
      emailDispatched,
      emailProvider,
      emailStatusMessage,
      message: wooOrderId
        ? `Order #${orderNumber} processed and synchronized with WordPress WooCommerce backend!`
        : `Order #${orderNumber} processed successfully.`,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal error processing order.' },
      { status: 500 }
    );
  }
}
