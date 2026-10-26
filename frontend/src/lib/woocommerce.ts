/**
 * WooCommerce REST API Client for Decoupled Next.js Architecture
 */

export interface WooCommerceLineItem {
  product_id?: number;
  variation_id?: number;
  name?: string;
  quantity: number;
  price?: number;
  total?: string;
}

export interface CreateWooOrderParams {
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
  items: Array<{
    id: string;
    title: string;
    variantTitle?: string;
    price: number;
    quantity: number;
    handle?: string;
  }>;
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

// Known product slug & ID catalog mapping for clean line item resolution
const SLUG_TO_PRODUCT_ID: Record<string, number> = {
  'chemical-free-organic-hair-henna-powder': 221087,
  'beginner-henna-kit': 219682,
  'mbs-self-care-kit': 218896,
  'nail-henna': 8901,
  'eucalyptus-blend-essential-oil': 8702,
  'mbs-henna-kit': 8216,
  'aftercare-henna-balm': 8181,
  'pre-rolled-henna-cones': 7976,
  'henna-sealant-spray': 7973,
  'bulk-henna': 7971,
  'organic-henna-cones': 7825,
};

// Known variation mapping
const VARIANT_TO_ID: Record<string, { productId: number; variationId: number }> = {
  '500gm': { productId: 221087, variationId: 221096 },
  '200gm': { productId: 221087, variationId: 221095 },
  '100gm': { productId: 221087, variationId: 221094 },
  'medium 100ml': { productId: 8702, variationId: 218618 },
  'small 30ml': { productId: 8702, variationId: 218617 },
  'orange': { productId: 8181, variationId: 218613 },
  'lemongrass': { productId: 8181, variationId: 218612 },
};

export async function createWooCommerceOrder(params: CreateWooOrderParams) {
  const wooUrl = (process.env.WOOCOMMERCE_URL || 'https://mehandibysana.com').replace(/\/+$/, '');
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_efe49aebc79a66be390bf16cc2ff9b3926434598';
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_8d359cf5e1efd443b32559dae6965688d50c50c2';

  const authHeader = `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`;

  // Resolve line items
  const lineItems: any[] = params.items.map((item) => {
    let productId = 0;
    let variationId = 0;

    // Check slug / handle
    if (item.handle && SLUG_TO_PRODUCT_ID[item.handle]) {
      productId = SLUG_TO_PRODUCT_ID[item.handle];
    } else {
      const numericId = parseInt(item.id.replace(/\D/g, ''), 10);
      if (!isNaN(numericId) && numericId > 0) {
        productId = numericId;
      }
    }

    // Check variation
    if (item.variantTitle) {
      const normVar = item.variantTitle.toLowerCase().trim();
      if (VARIANT_TO_ID[normVar]) {
        productId = VARIANT_TO_ID[normVar].productId;
        variationId = VARIANT_TO_ID[normVar].variationId;
      }
    }

    const lineItemObj: any = {
      quantity: Math.max(1, item.quantity),
      name: item.title,
    };

    if (productId > 0) {
      lineItemObj.product_id = productId;
    }
    if (variationId > 0) {
      lineItemObj.variation_id = variationId;
    }
    if (item.price > 0) {
      lineItemObj.subtotal = String(item.price * item.quantity);
      lineItemObj.total = String(item.price * item.quantity);
    }

    return lineItemObj;
  });

  const isPaid = params.payment.status === 'paid';

  const payload = {
    payment_method: params.payment.method === 'razorpay' ? 'razorpay' : 'cod',
    payment_method_title:
      params.payment.method === 'razorpay' ? 'Razorpay Online Prepaid (UPI/Cards)' : 'Cash on Delivery (COD)',
    set_paid: isPaid,
    status: isPaid ? 'processing' : 'processing', // or 'on-hold' for COD
    transaction_id: params.payment.paymentId || '',
    billing: {
      first_name: params.customer.firstName,
      last_name: params.customer.lastName,
      address_1: params.customer.address,
      address_2: params.customer.apartment || '',
      city: params.customer.city,
      state: params.customer.state,
      postcode: params.customer.pincode,
      country: 'IN',
      email: params.customer.email,
      phone: params.customer.phone,
    },
    shipping: {
      first_name: params.customer.firstName,
      last_name: params.customer.lastName,
      address_1: params.customer.address,
      address_2: params.customer.apartment || '',
      city: params.customer.city,
      state: params.customer.state,
      postcode: params.customer.pincode,
      country: 'IN',
      phone: params.customer.phone,
    },
    line_items: lineItems,
    shipping_lines: [
      {
        method_id: 'flat_rate',
        method_title: 'Express Cold-Chain Delivery',
        total: String(params.pricing.shippingFee || '0'),
      },
    ],
    meta_data: [
      { key: '_custom_frontend', value: 'nextjs_apple_minimal' },
      { key: 'delivery_target_date', value: params.deliveryDetails?.targetDate || '' },
      { key: 'special_instructions', value: params.deliveryDetails?.specialInstructions || '' },
      { key: 'is_gift', value: params.deliveryDetails?.isGift ? 'yes' : 'no' },
      { key: 'razorpay_payment_id', value: params.payment.paymentId || '' },
    ],
  };

  const response = await fetch(`${wooUrl}/wp-json/wc/v3/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WooCommerce API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
}

export async function getWooCommerceOrder(orderId: string | number) {
  const wooUrl = (process.env.WOOCOMMERCE_URL || 'https://mehandibysana.com').replace(/\/+$/, '');
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || 'ck_efe49aebc79a66be390bf16cc2ff9b3926434598';
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || 'cs_8d359cf5e1efd443b32559dae6965688d50c50c2';

  const authHeader = `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`;

  const response = await fetch(`${wooUrl}/wp-json/wc/v3/orders/${orderId}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}
