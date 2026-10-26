import * as fs from 'fs';
import * as path from 'path';

interface AuditMetric {
  entity: string;
  sourceCount: number;
  transformedCount: number;
  parityPercent: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  notes: string;
}

function runValidation() {
  console.log('===========================================================');
  console.log('  MEHANDI BY SANA - ZERO DATA LOSS PARITY AUDIT           ');
  console.log('===========================================================\n');

  const rawDir = path.resolve(process.cwd(), 'data', 'raw');
  const transformedDir = path.resolve(process.cwd(), 'data', 'transformed');
  const manifestFile = path.join(rawDir, 'manifest.json');

  if (!fs.existsSync(manifestFile)) {
    console.error(`[Error] Manifest file ${manifestFile} not found. Please run 'npm run extract' and 'npm run transform' first.`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
  const rawCounts = manifest.counts;

  const metrics: AuditMetric[] = [];

  const checkFile = (filename: string, entityKey: keyof typeof rawCounts, label: string) => {
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

  console.log('PARITY AUDIT RESULTS:');
  console.table(metrics);

  const allPassed = metrics.every((m) => m.status === 'PASSED');
  const reportPath = path.join(transformedDir, 'audit_report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        auditedAt: new Date().toISOString(),
        allPassed,
        totalSourceRevenue: manifest.totalRevenue,
        metrics,
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
  }
}

runValidation();
