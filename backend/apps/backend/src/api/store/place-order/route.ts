import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const body = req.body as any;

    if (!body?.customer?.email || !body?.items || body.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required order fields: email or items.",
      });
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const orderService = req.scope.resolve(Modules.ORDER);
    const customerService = req.scope.resolve(Modules.CUSTOMER);

    // 1. Resolve Region (INR)
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
    });
    const region =
      regions.find((r: any) => r.currency_code === "inr") || regions[0];

    // 2. Resolve Sales Channel
    const { data: salesChannels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "name"],
    });
    const salesChannel = salesChannels[0];

    // 3. Resolve or create Customer
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

    // 4. Line Items
    const items = body.items.map((item: any) => ({
      title: item.title || "Henna Product",
      quantity: Math.max(1, Number(item.quantity) || 1),
      unit_price: Math.max(0, Number(item.price) || 0),
      metadata: {
        variant_title: item.variantTitle || "",
        thumbnail: item.thumbnail || "",
        handle: item.handle || "",
      },
    }));

    // 5. Addresses
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

    // 6. Order DTO
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
        payment_status: body.payment?.status || "pending",
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

    return res.status(201).json({
      success: true,
      order: createdOrder,
      orderNumber,
    });
  } catch (error: any) {
    console.error("[Medusa Order Create Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order in Medusa",
    });
  }
}
