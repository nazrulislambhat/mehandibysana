import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  allocateDiscountAcrossItems,
  claimCouponRedemption,
  normalizeCouponCode,
  releaseCouponRedemption,
  roundInr,
  validateCouponForOrder,
  type CouponValidationResult,
} from "./coupons";
import { sendOrderConfirmationEmail } from "./order-emails";
import { evaluatePincode } from "./pincode-rules";
import { syncOrderNativePayment } from "./sync-order-payment";

export interface StoreOrderPayload {
  orderNumber?: string;
  couponCode?: string;
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
    discountAmount?: number;
    total?: number;
    pincodeRule?: string;
    couponCode?: string;
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
  body: StoreOrderPayload,
  options?: { verifiedPaymentCapture?: boolean }
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

  const baseItems = body.items.map((item) => ({
    title: item.title || "Henna Product",
    variant_title: item.variantTitle || undefined,
    thumbnail: item.thumbnail || undefined,
    product_handle: item.handle || undefined,
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

  const itemsSubtotal = baseItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const subtotal = roundInr(
    itemsSubtotal > 0
      ? itemsSubtotal
      : Math.max(0, Number(body.pricing?.subtotal) || 0)
  );

  const pinEvaluation = evaluatePincode(shippingAddress.postal_code, subtotal);
  const catchAllEvaluation = evaluatePincode("999999", subtotal);

  const rawShippingFee = body.pricing?.shippingFee;
  const hasExplicitShipping =
    rawShippingFee !== undefined &&
    rawShippingFee !== null &&
    String(rawShippingFee).trim() !== "" &&
    Number.isFinite(Number(rawShippingFee));

  // Authoritatively enforce the configured 3-zone shipping rules whenever the PIN is serviceable
  // (190* -> ₹60, 560* -> ₹60, all other -> ₹150) so stale client cache never drops shipping.
  const shippingFee = roundInr(
    pinEvaluation.serviceable
      ? Math.max(0, Number(pinEvaluation.deliveryCharge) || 0)
      : hasExplicitShipping
        ? Math.max(0, Number(rawShippingFee))
        : catchAllEvaluation.serviceable
          ? Math.max(0, Number(catchAllEvaluation.deliveryCharge) || 0)
          : 0
  );

  const rawCouponCode = normalizeCouponCode(
    body.couponCode ?? body.pricing?.couponCode ?? ""
  );

  let couponValidation: CouponValidationResult | null = null;
  if (rawCouponCode) {
    couponValidation = await validateCouponForOrder(scope, {
      code: rawCouponCode,
      subtotal,
      shippingFee,
      ignoreTemporalAndUsageLimits: Boolean(options?.verifiedPaymentCapture),
    });
  }

  let claimedCouponId: string | null = null;
  if (couponValidation?.coupon) {
    await claimCouponRedemption(scope, couponValidation.coupon.id, {
      enforceLimit: !options?.verifiedPaymentCapture,
    });
    claimedCouponId = couponValidation.coupon.id;
  }

  const itemAllocations = couponValidation?.coupon
    ? allocateDiscountAcrossItems(baseItems, couponValidation.itemDiscountAmount)
    : baseItems.map(() => 0);

  const items = baseItems.map((item, idx) => {
    const discountForLine = itemAllocations[idx] || 0;
    if (discountForLine > 0 && couponValidation?.coupon) {
      return {
        ...item,
        adjustments: [
          {
            code: couponValidation.coupon.code,
            amount: discountForLine,
            description: couponValidation.coupon.summaryLabel,
            promotion_id: couponValidation.coupon.id,
          },
        ],
      };
    }
    return item;
  });

  const discountAmount = couponValidation?.discountAmount ?? 0;
  const total = roundInr(Math.max(0, subtotal + shippingFee - discountAmount));

  const matchedPincodeRule =
    pinEvaluation.matchedRule?.pattern || body.pricing?.pincodeRule || "*";

  const shippingZoneLabel =
    pinEvaluation.matchedRule?.pattern === matchedPincodeRule &&
    pinEvaluation.matchedRule?.label
      ? pinEvaluation.matchedRule.label
      : matchedPincodeRule === "*"
        ? "Pan-India Express Shipping"
        : `Studio Shipping (${matchedPincodeRule})`;

  const shippingMethodName =
    shippingFee === 0
      ? `Free Delivery · ${shippingZoneLabel}`
      : shippingZoneLabel;

  let defaultShippingOptionId: string | undefined;
  try {
    const { data: shippingOptions } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name"],
    });
    const preferredOption =
      (shippingOptions || []).find((so: any) =>
        String(so.name || "").toLowerCase().includes("standard")
      ) || (shippingOptions || [])[0];
    if (preferredOption?.id) {
      defaultShippingOptionId = preferredOption.id;
    }
  } catch {
    // Optional; order shipping methods work with or without shipping_option_id
  }

  const orderNumber =
    body.orderNumber || `MBS-${Math.floor(100000 + Math.random() * 900000)}`;

  const resolvedPaymentMethod = options?.verifiedPaymentCapture
    ? body.payment?.method || "razorpay"
    : total === 0 && couponValidation?.coupon
      ? "free_coupon"
      : "cod";
  const resolvedPaymentStatus =
    options?.verifiedPaymentCapture || (total === 0 && couponValidation?.coupon)
      ? "paid"
      : "pending";
  const resolvedOrderStatus =
    resolvedPaymentStatus === "paid" ? "completed" : "pending";

  const shippingDiscountAmount = couponValidation?.shippingDiscountAmount ?? 0;

  const orderDTO = {
    region_id: region?.id,
    sales_channel_id: salesChannel?.id,
    customer_id: customerId,
    email,
    currency_code: "inr",
    status: resolvedOrderStatus,
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    items,
    shipping_methods: [
      {
        name: shippingMethodName,
        amount: shippingFee,
        is_tax_inclusive: false,
        is_custom_amount: true,
        ...(defaultShippingOptionId
          ? { shipping_option_id: defaultShippingOptionId }
          : {}),
        ...(shippingDiscountAmount > 0 && couponValidation?.coupon
          ? {
              adjustments: [
                {
                  code: couponValidation.coupon.code,
                  amount: shippingDiscountAmount,
                  description: couponValidation.coupon.summaryLabel,
                  promotion_id: couponValidation.coupon.id,
                },
              ],
            }
          : {}),
        data: {
          pincode: shippingAddress.postal_code,
          pincode_rule: matchedPincodeRule,
          zone: pinEvaluation.zone || "",
          estimated_days: pinEvaluation.estimatedDays || "",
        },
      },
    ],
    ...(couponValidation?.coupon
      ? { promo_codes: [couponValidation.coupon.code] }
      : {}),
    metadata: {
      order_number: orderNumber,
      payment_method: resolvedPaymentMethod,
      payment_id: options?.verifiedPaymentCapture
        ? body.payment?.paymentId || ""
        : "",
      razorpay_order_id: options?.verifiedPaymentCapture
        ? body.payment?.razorpayOrderId || ""
        : "",
      payment_status: resolvedPaymentStatus,
      pincode_rule: matchedPincodeRule,
      shipping_fee: shippingFee,
      subtotal,
      coupon_code: couponValidation?.coupon?.code || "",
      coupon_id: couponValidation?.coupon?.id || "",
      coupon_type: couponValidation?.coupon?.type || "",
      coupon_value: couponValidation?.coupon?.value ?? null,
      discount_amount: discountAmount,
      discount_total: discountAmount,
      total,
      target_delivery_date: body.deliveryDetails?.targetDate || "",
      special_instructions: body.deliveryDetails?.specialInstructions || "",
      is_gift: body.deliveryDetails?.isGift || false,
    },
  };

  let createdOrder: any;
  try {
    const created = await orderService.createOrders([orderDTO]);
    createdOrder = Array.isArray(created) ? created[0] : created;
  } catch (err) {
    if (claimedCouponId) {
      await releaseCouponRedemption(scope, claimedCouponId);
    }
    throw err;
  }

  if (couponValidation?.coupon?.id && createdOrder?.id) {
    try {
      const link = scope.resolve(ContainerRegistrationKeys.LINK);
      await link.create({
        [Modules.ORDER]: { order_id: createdOrder.id },
        [Modules.PROMOTION]: { promotion_id: couponValidation.coupon.id },
      });
    } catch (linkErr) {
      console.warn(
        "[Medusa Order] Non-fatal order-promotion link warning:",
        linkErr
      );
    }
  }

  if (createdOrder?.id) {
    try {
      await syncOrderNativePayment(scope, {
        orderId: createdOrder.id,
        paymentStatus: resolvedPaymentStatus,
        paymentMethod: resolvedPaymentMethod,
        paymentReference: options?.verifiedPaymentCapture
          ? body.payment?.paymentId || ""
          : "",
        paymentAmount: total,
        actorId: "storefront_checkout",
        skipMetadataUpdate: true,
      });
    } catch (paySyncErr) {
      console.warn(
        "[Medusa Order] Non-fatal native payment collection sync warning:",
        paySyncErr
      );
    }

    try {
      await sendOrderConfirmationEmail(scope, createdOrder.id);
    } catch (emailErr) {
      console.warn(
        "[Medusa Order] Non-fatal order confirmation email warning:",
        emailErr
      );
    }
  }

  return {
    order: createdOrder,
    orderNumber,
    pricing: {
      subtotal,
      shippingFee,
      discountAmount,
      couponCode: couponValidation?.coupon?.code || "",
      total,
    },
  };
}
