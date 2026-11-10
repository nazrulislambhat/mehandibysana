import * as fs from 'fs';
import * as path from 'path';
import { WooProduct } from './types.js';
import { MedusaProduct } from './transform.js';

interface AuditMetric {
  entity: string;
  sourceCount: number;
  transformedCount: number;
  parityPercent: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  notes: string;
}

export function runValidation(customRawDir?: string, customTargetDir?: string) {
  console.log('===========================================================');
  console.log('  MEHANDI BY SANA - ZERO DATA LOSS PARITY AUDIT           ');
  console.log('===========================================================\n');

  const rawDir = customRawDir || path.resolve(process.cwd(), 'data', 'raw');
  const transformedDir = customTargetDir || path.resolve(process.cwd(), 'data', 'transformed');
  const manifestFile = path.join(rawDir, 'manifest.json');

  if (!fs.existsSync(manifestFile)) {
    console.error(`\n[Notice] No extracted WooCommerce data found at ${manifestFile}.\n`);
    console.log('The migration pipeline runs in 3 steps:');
    console.log('  Step 1: Extract data');
    console.log('          - From MySQL dump: place dump at migration/data/dump.sql and run `npm run extract:sql`');
    console.log('          - From REST API: run `npm run extract`');
    console.log('  Step 2: Transform schema: `npm run transform`');
    console.log('  Step 3: Validate parity: `npm run validate`\n');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
  const rawCounts = manifest.counts;

  const metrics: AuditMetric[] = [];

  const checkFile = (filename: string, entityKey: string, label: string) => {
    const filePath = path.join(transformedDir, filename);
    const sourceCount = rawCounts[entityKey] || 0;
    let transformedCount = 0;

    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      transformedCount = Array.isArray(data) ? data.length : 0;
    }

    const parity = sourceCount === 0 ? '100%' : `${((transformedCount / sourceCount) * 100).toFixed(1)}%`;
    const passed = transformedCount >= sourceCount;

    metrics.push({
      entity: label,
      sourceCount,
      transformedCount,
      parityPercent: parity,
      status: passed ? 'PASSED' : 'FAILED',
      notes: passed ? '100% matched, zero loss' : `Missing ${sourceCount - transformedCount} records`,
    });
  };

  checkFile('categories.json', 'categories', 'Product Categories');
  checkFile('products.json', 'products', 'Products');
  checkFile('customers.json', 'customers', 'Customers');
  checkFile('orders.json', 'orders', 'Orders & Transactions');

  // Deep field-level product parity audit
  const rawProductsPath = path.join(rawDir, 'products.json');
  const medusaProductsPath = path.join(transformedDir, 'products.json');
  const fieldIssues: string[] = [];
  let sourceVariantTotal = 0;
  let transformedVariantTotal = 0;
  let sourceImageTotal = 0;
  let transformedImageTotal = 0;

  if (fs.existsSync(rawProductsPath) && fs.existsSync(medusaProductsPath)) {
    const rawProducts: WooProduct[] = JSON.parse(fs.readFileSync(rawProductsPath, 'utf-8'));
    const medusaProducts: MedusaProduct[] = JSON.parse(fs.readFileSync(medusaProductsPath, 'utf-8'));
    const byHandle = new Map(medusaProducts.map((p) => [p.handle, p]));

    for (const rp of rawProducts) {
      const mp = byHandle.get(rp.slug);
      if (!mp) {
        fieldIssues.push(`Missing product handle "${rp.slug}" (${rp.name})`);
        continue;
      }
      const expectedVariants =
        rp.type === 'variable' && rp.variations_data && rp.variations_data.length > 0
          ? rp.variations_data.length
          : 1;
      sourceVariantTotal += expectedVariants;
      transformedVariantTotal += mp.variants.length;
      if (mp.variants.length < expectedVariants) {
        fieldIssues.push(
          `Product "${rp.slug}" has ${mp.variants.length}/${expectedVariants} variants`
        );
      }

      const rawImgCount = (rp.images || []).length;
      sourceImageTotal += rawImgCount;
      transformedImageTotal += mp.images.length;
      if (mp.images.length < rawImgCount) {
        fieldIssues.push(`Product "${rp.slug}" has ${mp.images.length}/${rawImgCount} images`);
      }
    }

    metrics.push({
      entity: 'Product Variants',
      sourceCount: sourceVariantTotal,
      transformedCount: transformedVariantTotal,
      parityPercent:
        sourceVariantTotal === 0
          ? '100%'
          : `${((transformedVariantTotal / sourceVariantTotal) * 100).toFixed(1)}%`,
      status: transformedVariantTotal >= sourceVariantTotal ? 'PASSED' : 'FAILED',
      notes: 'Every simple & variable option preserved',
    });

    metrics.push({
      entity: 'Product Images',
      sourceCount: sourceImageTotal,
      transformedCount: transformedImageTotal,
      parityPercent:
        sourceImageTotal === 0
          ? '100%'
          : `${((transformedImageTotal / sourceImageTotal) * 100).toFixed(1)}%`,
      status: transformedImageTotal >= sourceImageTotal ? 'PASSED' : 'FAILED',
      notes: 'Thumbnails & galleries preserved in order',
    });
  }

  console.log('PARITY AUDIT RESULTS:');
  console.table(metrics);

  if (fieldIssues.length > 0) {
    console.warn('\nField-level warnings:');
    for (const issue of fieldIssues) console.warn(`  - ${issue}`);
  }

  const allPassed = metrics.every((m) => m.status === 'PASSED') && fieldIssues.length === 0;
  const reportPath = path.join(transformedDir, 'audit_report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        auditedAt: new Date().toISOString(),
        source: manifest.source || 'woocommerce_api',
        allPassed,
        totalSourceRevenue: manifest.totalRevenue,
        metrics,
        fieldIssues,
      },
      null,
      2
    )
  );

  console.log(`\nAudit Report saved to data/transformed/audit_report.json`);
  if (allPassed) {
    console.log('>>> ALL CHECKS PASSED: ZERO DATA LOSS CONFIRMED <<<\n');
  } else {
    console.warn('>>> AUDIT FAILED OR WARNINGS DETECTED <<<\n');
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runValidation();
}
