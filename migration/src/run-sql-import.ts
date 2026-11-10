import * as path from 'path';
import { WooCommerceSqlParser } from './mysql-parser.js';
import { runTransform } from './transform.js';
import { runValidation } from './validate.js';

async function main() {
  const args = process.argv.slice(2);
  const runPipeline = !args.includes('--extract-only');
  const dumpArg = args.find((a) => !a.startsWith('--'));
  const dumpPath = dumpArg || path.resolve(process.cwd(), 'data', 'dump.sql');

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

    if (runPipeline) {
      await runTransform();
      runValidation();
    } else {
      console.log('\nRun `npm run transform` and `npm run validate` to convert to MedusaJS format.');
    }
  } catch (err: any) {
    console.error('[Error]:', err.message);
    process.exit(1);
  }
}

main();
