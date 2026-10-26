import { NextRequest, NextResponse } from 'next/server';
import { getWooCommerceOrder } from '@/lib/woocommerce';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId')?.trim();
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!orderId || !email) {
      return NextResponse.json(
        { success: false, message: 'Order ID and email are required.' },
        { status: 400 }
      );
    }

    // 1. Try WooCommerce REST API (WordPress Backend)
    const numericId = parseInt(orderId.replace(/\D/g, ''), 10);
    if (!isNaN(numericId) && numericId > 0) {
      try {
        const wooOrder = await getWooCommerceOrder(numericId);
        if (wooOrder && wooOrder.id) {
          const billingEmail = (wooOrder.billing?.email || '').toLowerCase().trim();
          if (billingEmail === email || !email) {
            const statusMap: Record<string, string> = {
              pending: 'Payment Pending',
              processing: 'Confirmed & Being Handcrafted at Atelier',
              'on-hold': 'Awaiting Payment Verification',
              completed: 'Delivered Successfully',
              cancelled: 'Cancelled',
              refunded: 'Refunded',
              failed: 'Payment Failed',
            };

            const friendlyStatus = statusMap[wooOrder.status] || wooOrder.status;

            return NextResponse.json({
              success: true,
              source: 'woocommerce',
              order: {
                id: String(wooOrder.id),
                status: friendlyStatus,
                rawStatus: wooOrder.status,
                date: new Date(wooOrder.date_created).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
                total: `₹${wooOrder.total}`,
                shippingFee: `₹${wooOrder.shipping_total || '0'}`,
                carrier: 'Delhivery Express / DTDC Air (Cold-Chain)',
                trackingNumber:
                  wooOrder.meta_data?.find((m: any) => m.key.includes('tracking'))?.value ||
                  `MBS-IN-${wooOrder.id}`,
                items: (wooOrder.line_items || []).map((li: any) => ({
                  name: li.name,
                  quantity: li.quantity,
                  price: `₹${li.price || (parseFloat(li.total) / li.quantity).toFixed(0)}`,
                })),
                shippingAddress: `${wooOrder.shipping?.city || wooOrder.billing?.city || 'Srinagar'}, ${
                  wooOrder.shipping?.state || wooOrder.billing?.state || 'J&K'
                } — ${wooOrder.shipping?.postcode || wooOrder.billing?.postcode || ''}`,
              },
            });
          }
        }
      } catch (wooErr) {
        console.warn('[WooCommerce Track Notice]:', wooErr);
      }
    }

    // 2. Fallback to local live orders archive
    const ordersLogPath = path.join(process.cwd(), 'data', 'orders_live.json');
    if (fs.existsSync(ordersLogPath)) {
      try {
        const orders = JSON.parse(fs.readFileSync(ordersLogPath, 'utf8'));
        const matched = orders.find(
          (o: any) =>
            (o.id === orderId || o.wooOrderId?.toString() === orderId) &&
            o.customer?.email?.toLowerCase().trim() === email
        );

        if (matched) {
          return NextResponse.json({
            success: true,
            source: 'local_archive',
            order: {
              id: matched.id,
              status: matched.payment?.status === 'paid' ? 'Confirmed & Handcrafted at Atelier' : 'Pending COD Verification',
              rawStatus: matched.payment?.status || 'pending',
              date: new Date(matched.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
              total: `₹${matched.pricing?.total || 0}`,
              shippingFee: `₹${matched.pricing?.shippingFee || 0}`,
              carrier: 'Delhivery Express / DTDC Air (Cold-Chain)',
              trackingNumber: `MBS-IN-${matched.id}`,
              items: (matched.items || []).map((it: any) => ({
                name: it.title,
                quantity: it.quantity,
                price: `₹${it.price}`,
              })),
              shippingAddress: `${matched.customer?.city}, ${matched.customer?.state} — ${matched.customer?.pincode}`,
            },
          });
        }
      } catch (err) {
        console.warn('Could not read orders_live.json:', err);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'No matching order found for this Order ID and Email address. Please double check the details.',
      },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error looking up order.' },
      { status: 500 }
    );
  }
}
