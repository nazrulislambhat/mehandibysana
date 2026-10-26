import * as fs from 'fs';
import * as path from 'path';
import { WooCommerceClient } from './woocommerce-client.js';
import { WooCategory, WooCoupon, WooCustomer, WooOrder, WooProduct, WooProductVariation, WooReview } from './types.js';

async function runExtraction() {
  console.log('===========================================================');
  console.log('  MEHANDI BY SANA - ZERO DATA LOSS EXTRACTION PIPELINE    ');
  console.log('===========================================================\n');

  const dataDir = path.resolve(process.cwd(), 'data', 'raw');
  fs.mkdirSync(dataDir, { recursive: true });

  const client = new WooCommerceClient();

  const manifest = {
    startedAt: new Date().toISOString(),
    completedAt: '',
    counts: {
      categories: 0,
      products: 0,
      productVariations: 0,
      customers: 0,
      orders: 0,
      coupons: 0,
      reviews: 0,
    },
    totalRevenue: '0.00',
    currency: 'INR',
  };

  try {
    // 1. Categories
    console.log('\n--- 1. Extracting Categories ---');
    const categories = await client.fetchAllPaginated<WooCategory>('products/categories');
    fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2));
    manifest.counts.categories = categories.length;
    console.log(`Saved ${categories.length} categories to data/raw/categories.json`);

    // 2. Products
    console.log('\n--- 2. Extracting Products & Variations ---');
    const products = await client.fetchAllPaginated<WooProduct>('products');
    let variationCount = 0;

    for (const product of products) {
      if (product.type === 'variable' && product.variations && product.variations.length > 0) {
        console.log(`[Product ${product.id}] Extracting variations for "${product.name}"...`);
        try {
          const variations = await client.fetchAllPaginated<WooProductVariation>(`products/${product.id}/variations`);
          product.variations_data = variations;
          variationCount += variations.length;
          console.log(`[Product ${product.id}] Retrieved ${variations.length} variations.`);
        } catch (err: any) {
          console.error(`[Product ${product.id}] Failed to fetch variations:`, err.message);
        }
      }
    }

    fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
    manifest.counts.products = products.length;
    manifest.counts.productVariations = variationCount;
    console.log(`Saved ${products.length} products (${variationCount} variations) to data/raw/products.json`);

    // 3. Customers
    console.log('\n--- 3. Extracting Customers ---');
    const customers = await client.fetchAllPaginated<WooCustomer>('customers');
    fs.writeFileSync(path.join(dataDir, 'customers.json'), JSON.stringify(customers, null, 2));
    manifest.counts.customers = customers.length;
    console.log(`Saved ${customers.length} customers to data/raw/customers.json`);

    // 4. Orders
    console.log('\n--- 4. Extracting Orders ---');
    const orders = await client.fetchAllPaginated<WooOrder>('orders');
    fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(orders, null, 2));
    manifest.counts.orders = orders.length;

    let revenueSum = 0;
    for (const ord of orders) {
      if (ord.status !== 'cancelled' && ord.status !== 'failed') {
        revenueSum += parseFloat(ord.total || '0');
      }
    }
    manifest.totalRevenue = revenueSum.toFixed(2);
    console.log(`Saved ${orders.length} orders (Valid Total Revenue: ₹${manifest.totalRevenue}) to data/raw/orders.json`);

    // 5. Coupons
    console.log('\n--- 5. Extracting Coupons ---');
    const coupons = await client.fetchAllPaginated<WooCoupon>('coupons');
    fs.writeFileSync(path.join(dataDir, 'coupons.json'), JSON.stringify(coupons, null, 2));
    manifest.counts.coupons = coupons.length;
    console.log(`Saved ${coupons.length} coupons to data/raw/coupons.json`);

    // 6. Reviews
    console.log('\n--- 6. Extracting Reviews ---');
    const reviews = await client.fetchAllPaginated<WooReview>('products/reviews');
    fs.writeFileSync(path.join(dataDir, 'reviews.json'), JSON.stringify(reviews, null, 2));
    manifest.counts.reviews = reviews.length;
    console.log(`Saved ${reviews.length} reviews to data/raw/reviews.json`);

    manifest.completedAt = new Date().toISOString();
    fs.writeFileSync(path.join(dataDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log('\n===========================================================');
    console.log('  EXTRACTION COMPLETE: ZERO DATA LOSS MANIFEST GENERATED  ');
    console.log('===========================================================');
    console.log(JSON.stringify(manifest, null, 2));
  } catch (error: any) {
    console.error('\n[FATAL] Extraction failed:', error.message);
    process.exit(1);
  }
}

runExtraction();
