import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { dispatchStudioNotification } from "./notifications";

export interface StoreOrderPayload {
  orderNumber?: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    address?: string;
    apartment?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items: Array<{
    title?: string;
    variantTitle?: string;
    quantity?: number;
    price?: number;
    thumbnail?: string;
    handle?: string;
  }>;
  pricing?: {
    subtotal?: number;
    shippingFee?: number;
    total?: number;
    pincodeRule?: string;
  };
  payment?: {
    method?: string;
    status?: string;
    paymentId?: string;
    razorpayOrderId?: string;
  };
  deliveryDetails?: {
    targetDate?: string;
    specialInstructions?: string;
    isGift?: boolean;
  };
}

export async function createMedusaStoreOrder(
  scope: { resolve: (key: string) => any },
  body: StoreOrderPayload
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY);
  const orderService = scope.resolve(Modules.ORDER);
  const customerService = scope.resolve(Modules.CUSTOMER);

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  });
  const region =
    regions.find((r: any) => r.currency_code === "inr") || regions[0];

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const salesChannel = salesChannels[0];

  const email = body.customer.email.toLowerCase().trim();
  let customerId: string | undefined;

  const { data: existingCustomers } = await query.graph({
    entity: "customer",
    fields: ["id", "email"],
    filters: { email },
  });

  if (existingCustomers && existingCustomers.length > 0) {
    customerId = existingCustomers[0].id;
  } else {
    try {
      const createdCustomer = await customerService.createCustomers({
        email,
        first_name: body.customer.firstName || "Customer",
        last_name: body.customer.lastName || "",
        phone: body.customer.phone || "",
      });
      customerId = createdCustomer.id;
    } catch (custErr) {
      console.warn("[Medusa Order] Could not auto-create customer:", custErr);
    }
  }

  const items = body.items.map((item) => ({
    title: item.title || "Henna Product",
    quantity: Math.max(1, Number(item.quantity) || 1),
    unit_price: Math.max(0, Number(item.price) || 0),
    metadata: {
      variant_title: item.variantTitle || "",
      thumbnail: item.thumbnail || "",
      handle: item.handle || "",
    },
  }));

  const shippingAddress = {
    first_name: body.customer.firstName || "Customer",
    last_name: body.customer.lastName || "",
    address_1: body.customer.address || "Address",
    address_2: body.customer.apartment || "",
    city: body.customer.city || "Srinagar",
    province: body.customer.state || "Jammu & Kashmir",
    postal_code: body.customer.pincode || "190001",
    country_code: "in",
    phone: body.customer.phone || "",
  };

  const billingAddress = { ...shippingAddress };

  const orderNumber =
    body.orderNumber || `MBS-${Math.floor(100000 + Math.random() * 900000)}`;

  const orderDTO = {
    region_id: region?.id,
    sales_channel_id: salesChannel?.id,
    customer_id: customerId,
    email,
    currency_code: "inr",
    status: body.payment?.status === "paid" ? "completed" : "pending",
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    items,
    metadata: {
      order_number: orderNumber,
      payment_method: body.payment?.method || "cod",
      payment_id: body.payment?.paymentId || "",
      razorpay_order_id: body.payment?.razorpayOrderId || "",
      payment_status: body.payment?.status || "pending",
      pincode_rule: body.pricing?.pincodeRule || "*",
      shipping_fee: body.pricing?.shippingFee || 0,
      subtotal: body.pricing?.subtotal || 0,
      total: body.pricing?.total || 0,
      target_delivery_date: body.deliveryDetails?.targetDate || "",
      special_instructions: body.deliveryDetails?.specialInstructions || "",
      is_gift: body.deliveryDetails?.isGift || false,
    },
  };

  const created = await orderService.createOrders([orderDTO]);
  const createdOrder = Array.isArray(created) ? created[0] : created;

  await dispatchStudioNotification({
    type: "order_confirmed",
    recipientEmail: email,
    recipientName: `${body.customer.firstName || "Customer"} ${body.customer.lastName || ""}`.trim(),
    recipientPhone: body.customer.phone || "",
    referenceId: orderNumber,
    summary: `Thank you for your order (${orderNumber}) of ₹${body.pricing?.total || 0} via ${body.payment?.method === "razorpay" ? "Razorpay Online" : "Cash on Delivery"}. Fresh organic batches are being prepared at our Srinagar studio for PIN ${shippingAddress.postal_code}.`,
    details: {
      total: body.pricing?.total || 0,
      shippingFee: body.pricing?.shippingFee || 0,
      pincode: shippingAddress.postal_code,
      paymentMethod: body.payment?.method || "cod",
    },
  });

  return {
    order: createdOrder,
    orderNumber,
  };
}

