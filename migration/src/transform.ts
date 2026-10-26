import * as fs from 'fs';
import * as path from 'path';
import { WooCategory, WooCustomer, WooOrder, WooProduct } from './types.js';

interface MedusaCategory {
  name: string;
  handle: string;
  description: string;
  is_active: boolean;
  is_internal: boolean;
  metadata: {
    woo_id: number;
    woo_parent_id: number;
  };
}

interface MedusaProductVariant {
  title: string;
  sku: string;
  prices: {
    amount: number; // in paise (e.g. ₹60.00 = 6000)
    currency_code: string;
  }[];
  options: Record<string, string>;
  manage_inventory: boolean;
  inventory_quantity: number;
  metadata: {
    woo_id?: number;
    sale_price?: string;
    regular_price?: string;
  };
}

interface MedusaProduct {
  title: string;
  handle: string;
  description: string;
  subtitle: string;
  status: 'published' | 'draft';
  thumbnail?: string;
  images: { url: string }[];
  options: { title: string; values: string[] }[];
  variants: MedusaProductVariant[];
  categories: { id?: string; name: string; handle: string }[];
  metadata: {
    woo_id: number;
    woo_permalink: string;
    short_description: string;
  };
}

interface MedusaCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  has_account: boolean;
  addresses: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province?: string;
    postal_code: string;
    country_code: string;
    phone?: string;
  }[];
  metadata: {
    woo_id: number;
    username: string;
    is_paying_customer: boolean;
    legacy_auth: boolean;
    date_created: string;
  };
}

interface MedusaOrder {
  external_id: string; // WooCommerce Order ID
  display_id: number;
  currency_code: string;
  email: string;
  status: string;
  total_amount: number; // In paise
  created_at: string;
  shipping_address: any;
  billing_address: any;
  items: {
    title: string;
    sku: string;
    quantity: number;
    unit_price: number;
    metadata: Record<string, any>;
  }[];
  metadata: {
    woo_id: number;
    payment_method: string;
    payment_method_title: string;
    transaction_id: string;
    customer_note: string;
    coupons: string[];
  };
}

async function runTransform() {
  console.log('===========================================================');
  console.log('  MEHANDI BY SANA - TRANSFORM TO MEDUSAJS v2 FORMAT       ');
  console.log('===========================================================\n');

  const rawDir = path.resolve(process.cwd(), 'data', 'raw');
  const targetDir = path.resolve(process.cwd(), 'data', 'transformed');
  fs.mkdirSync(targetDir, { recursive: true });

  if (!fs.existsSync(rawDir)) {
    console.error(`[Error] Raw data directory ${rawDir} not found. Please run 'npm run extract' first.`);
    process.exit(1);
  }

  // Helper: INR to Paise
  const toPaise = (amtStr: string | number): number => {
    const val = typeof amtStr === 'string' ? parseFloat(amtStr) : amtStr;
    if (isNaN(val)) return 0;
    return Math.round(val * 100);
  };

  // Helper: clean HTML from text
  const cleanHtml = (html: string = ''): string => {
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
  };

  // 1. Transform Categories
  const rawCategoriesFile = path.join(rawDir, 'categories.json');
  if (fs.existsSync(rawCategoriesFile)) {
    const rawCategories: WooCategory[] = JSON.parse(fs.readFileSync(rawCategoriesFile, 'utf-8'));
    const transformedCategories: MedusaCategory[] = rawCategories.map((c) => ({
      name: c.name,
      handle: c.slug,
      description: cleanHtml(c.description),
      is_active: true,
      is_internal: false,
      metadata: {
        woo_id: c.id,
        woo_parent_id: c.parent,
      },
    }));

    fs.writeFileSync(path.join(targetDir, 'categories.json'), JSON.stringify(transformedCategories, null, 2));
    console.log(`Transformed ${transformedCategories.length} categories.`);
  }

  // 2. Transform Products
  const rawProductsFile = path.join(rawDir, 'products.json');
  if (fs.existsSync(rawProductsFile)) {
    const rawProducts: WooProduct[] = JSON.parse(fs.readFileSync(rawProductsFile, 'utf-8'));
    const transformedProducts: MedusaProduct[] = rawProducts.map((p) => {
      // Options
      const options = (p.attributes || [])
        .filter((attr) => attr.visible || attr.variation)
        .map((attr) => ({
          title: attr.name,
          values: attr.options,
        }));

      // Variants
      const variants: MedusaProductVariant[] = [];
      if (p.type === 'variable' && p.variations_data && p.variations_data.length > 0) {
        for (const v of p.variations_data) {
          const varOptions: Record<string, string> = {};
          v.attributes?.forEach((a) => {
            varOptions[a.name] = a.option;
          });

          variants.push({
            title: Object.values(varOptions).join(' / ') || 'Default',
            sku: v.sku || `${p.slug}-${v.id}`,
            prices: [
              {
                amount: toPaise(v.price || v.regular_price || p.price),
                currency_code: 'inr',
              },
            ],
            options: varOptions,
            manage_inventory: v.manage_stock,
            inventory_quantity: v.stock_quantity ?? 0,
            metadata: {
              woo_id: v.id,
              regular_price: v.regular_price,
              sale_price: v.sale_price,
            },
          });
        }
      } else {
        // Simple product has 1 default variant
        variants.push({
          title: 'Default Variant',
          sku: p.sku || p.slug,
          prices: [
            {
              amount: toPaise(p.price || p.regular_price || '0'),
              currency_code: 'inr',
            },
          ],
          options: {},
          manage_inventory: p.manage_stock,
          inventory_quantity: p.stock_quantity ?? (p.stock_status === 'instock' ? 100 : 0),
          metadata: {
            woo_id: p.id,
            regular_price: p.regular_price,
            sale_price: p.sale_price,
          },
        });
      }

      return {
        title: p.name,
        handle: p.slug,
        description: cleanHtml(p.description),
        subtitle: cleanHtml(p.short_description),
        status: p.status === 'publish' ? 'published' : 'draft',
        thumbnail: p.images?.[0]?.src,
        images: (p.images || []).map((img) => ({ url: img.src })),
        options,
        variants,
        categories: (p.categories || []).map((c) => ({
          name: c.name,
          handle: c.slug,
        })),
        metadata: {
          woo_id: p.id,
          woo_permalink: p.permalink,
          short_description: p.short_description,
        },
      };
    });

    fs.writeFileSync(path.join(targetDir, 'products.json'), JSON.stringify(transformedProducts, null, 2));
    console.log(`Transformed ${transformedProducts.length} products.`);
  }

  // 3. Transform Customers
  const rawCustomersFile = path.join(rawDir, 'customers.json');
  if (fs.existsSync(rawCustomersFile)) {
    const rawCustomers: WooCustomer[] = JSON.parse(fs.readFileSync(rawCustomersFile, 'utf-8'));
    const transformedCustomers: MedusaCustomer[] = rawCustomers.map((c) => {
      const addresses: MedusaCustomer['addresses'] = [];

      if (c.shipping?.address_1) {
        addresses.push({
          first_name: c.shipping.first_name || c.first_name,
          last_name: c.shipping.last_name || c.last_name,
          address_1: c.shipping.address_1,
          address_2: c.shipping.address_2 || undefined,
          city: c.shipping.city,
          province: c.shipping.state || undefined,
          postal_code: c.shipping.postcode,
          country_code: (c.shipping.country || 'IN').toLowerCase(),
          phone: c.shipping.phone || c.billing?.phone || undefined,
        });
      }

      return {
        email: c.email.toLowerCase().trim(),
        first_name: c.first_name || 'Customer',
        last_name: c.last_name || '',
        phone: c.billing?.phone || c.shipping?.phone,
        has_account: true,
        addresses,
        metadata: {
          woo_id: c.id,
          username: c.username,
          is_paying_customer: c.is_paying_customer,
          legacy_auth: true,
          date_created: c.date_created,
        },
      };
    });

    fs.writeFileSync(path.join(targetDir, 'customers.json'), JSON.stringify(transformedCustomers, null, 2));
    console.log(`Transformed ${transformedCustomers.length} customers.`);
  }

  // 4. Transform Orders
  const rawOrdersFile = path.join(rawDir, 'orders.json');
  if (fs.existsSync(rawOrdersFile)) {
    const rawOrders: WooOrder[] = JSON.parse(fs.readFileSync(rawOrdersFile, 'utf-8'));
    const transformedOrders: MedusaOrder[] = rawOrders.map((o) => ({
      external_id: String(o.id),
      display_id: o.id,
      currency_code: (o.currency || 'INR').toLowerCase(),
      email: o.billing?.email || '',
      status: o.status,
      total_amount: toPaise(o.total),
      created_at: o.date_created,
      shipping_address: o.shipping,
      billing_address: o.billing,
      items: (o.line_items || []).map((item) => ({
        title: item.name,
        sku: item.sku || `ITEM-${item.product_id}`,
        quantity: item.quantity,
        unit_price: toPaise(item.price),
        metadata: {
          product_id: item.product_id,
          variation_id: item.variation_id,
        },
      })),
      metadata: {
        woo_id: o.id,
        payment_method: o.payment_method,
        payment_method_title: o.payment_method_title,
        transaction_id: o.transaction_id,
        customer_note: o.customer_note,
        coupons: (o.coupon_lines || []).map((cp) => cp.code),
      },
    }));

    fs.writeFileSync(path.join(targetDir, 'orders.json'), JSON.stringify(transformedOrders, null, 2));
    console.log(`Transformed ${transformedOrders.length} orders.`);
  }

  console.log('\nAll data transformed successfully to data/transformed/.');
}

runTransform();
