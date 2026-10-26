import * as path from 'path';
import { WooCommerceSqlParser } from './mysql-parser.js';

async function main() {
  const dumpPath = process.argv[2] || path.resolve(process.cwd(), 'data', 'dump.sql');

  console.log('===========================================================');
  console.log('  MEHANDI BY SANA - DIRECT MYSQL DUMP PARSER & INGESTION  ');
  console.log('===========================================================\n');
  console.log(`Target SQL dump file: ${dumpPath}\n`);

  try {
    const parser = new WooCommerceSqlParser(dumpPath);
    const summary = await parser.parse();

    console.log('\n===========================================================');
    console.log('  EXTRACTION SUMMARY FROM MYSQL DATABASE DUMP             ');
    console.log('===========================================================');
    console.table(summary);
    console.log('\nRun `npm run transform` and `npm run validate` to convert to MedusaJS format.');
  } catch (err: any) {
    console.error('[Error]:', err.message);
    process.exit(1);
  }
}

main();
