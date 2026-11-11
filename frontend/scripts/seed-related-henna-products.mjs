#!/usr/bin/env node
/**
 * Idempotent WooCommerce REST v3 seeder for related henna tools & supplies.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-related-henna-products.mjs
 *   node --env-file=.env.local scripts/seed-related-henna-products.mjs --apply --status=draft
 *   node --env-file=.env.local scripts/seed-related-henna-products.mjs --apply --status=publish
 *
 * Defaults to DRY-RUN mode (no network writes) unless `--apply` is explicitly passed.
 */

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const statusArg = args.find((arg) => arg.startsWith('--status='));
const targetStatus = statusArg ? statusArg.split('=')[1] : 'draft';

if (!['draft', 'publish'].includes(targetStatus)) {
  console.error(
    'Invalid --status value. Use --status=draft or --status=publish.',
  );
  process.exit(1);
}

const RELATED_CATEGORY = {
  name: 'Mehandi Tools & Supplies',
  slug: 'mehandi-tools-supplies',
  description:
    'Essential henna preparation and cone-rolling tools including cellophane sheets, measuring spoons, micro scales, piping bags, and practice boards.',
};

export const RELATED_HENNA_SUPPLIES = [
  {
    name: 'Pre-Cut Cellophane Henna Cone Sheets (100 Pack)',
    slug: 'pre-cut-cellophane-henna-cone-sheets',
    type: 'simple',
    regular_price: '120',
    manage_stock: true,
    stock_quantity: 50,
    stock_status: 'instock',
    short_description:
      'Crystal-clear, tear-resistant BOPP cellophane triangles pre-cut for rolling smooth, leak-free 0.38mm fine-tip henna cones.',
    description:
      '<p>Pre-cut high-clarity BOPP cellophane sheets sized specifically for hand-rolling precision mehandi cones. Flexible enough for effortless rolling without crinkling, yet sturdy enough to hold firm pressure during detailed bridal linework.</p><ul><li>Pack of 100 pre-cut sheets</li><li>Ideal for rolling ultra-fine 0.35mm–0.45mm tips</li><li>Smooth, non-reactive film safe for essential-oil henna paste</li></ul>',
  },
  {
    name: 'Stainless Steel Henna Measuring Spoons Set (6 Piece)',
    slug: 'henna-measuring-spoons-set',
    type: 'simple',
    regular_price: '180',
    manage_stock: true,
    stock_quantity: 35,
    stock_status: 'instock',
    short_description:
      'Precision stainless steel measuring spoons for repeatable small-batch henna powder, sugar, and essential oil ratios.',
    description:
      '<p>Engraved stainless steel measuring spoon set designed for consistent paste formulation. Resistant to essential oil staining and easy to sanitize between batches.</p><ul><li>Includes 1/8 tsp, 1/4 tsp, 1/2 tsp, 1 tsp, 1/2 tbsp, and 1 tbsp</li><li>Non-reactive food-grade stainless steel</li><li>Ideal for measuring eucalyptus, lavender, and tea tree oils accurately</li></ul>',
  },
  {
    name: 'Digital Precision Micro Weighing Scale (0.01g – 500g)',
    slug: 'digital-precision-henna-weighing-scale',
    type: 'simple',
    regular_price: '450',
    manage_stock: true,
    stock_quantity: 20,
    stock_status: 'instock',
    short_description:
      '0.01g high-accuracy pocket digital weighing machine for exact henna powder, sugar, and essential oil gram measurements.',
    description:
      '<p>Achieve consistent dye release and paste viscosity across every batch with 0.01g precision weighing. Features a brushed stainless weighing platform, backlit LCD readout, and instant tare function for mixing bowls.</p><ul><li>0.01g resolution up to 500g capacity</li><li>Tare zeroing for bowls and beakers</li><li>Switchable g / oz / ml-equivalent units with protective cover</li></ul>',
  },
  {
    name: 'Cone Filling Piping Bags (50 Pack)',
    slug: 'henna-cone-filling-piping-bags',
    type: 'simple',
    regular_price: '140',
    manage_stock: true,
    stock_quantity: 45,
    stock_status: 'instock',
    short_description:
      'Thick, burst-resistant piping bags for mess-free transfer of freshly mixed henna paste into rolled cellophane cones.',
    description:
      '<p>Heavy-duty disposable piping bags that make filling hand-rolled henna cones fast, clean, and air-bubble free after dye release.</p><ul><li>50 thick-gauge piping bags per pack</li><li>Wide opening fits standard mixing bowls easily</li><li>Minimizes paste waste and keeps workspace spotless</li></ul>',
  },
  {
    name: 'Cone Sealing Tape & Stainless Tip Pins Set',
    slug: 'cone-sealing-tape-and-tip-pins-set',
    type: 'simple',
    regular_price: '110',
    manage_stock: true,
    stock_quantity: 60,
    stock_status: 'instock',
    short_description:
      'Low-residue sealing tape roll with rust-proof stainless steel tip pins to keep fine cone openings airtight between sessions.',
    description:
      '<p>Everything required to finish, seal, and preserve freshly rolled cones. Rust-proof stainless pins prevent tip clogging and oxidation while low-residue tape holds seams securely under pressure.</p><ul><li>1 roll high-tack cone sealing tape</li><li>25 rust-resistant stainless steel tip pins</li><li>Helps prevent paste drying at the nozzle</li></ul>',
  },
  {
    name: 'Triple-Sifting Fine Mesh Henna Filter Cloth',
    slug: 'triple-sifting-henna-filter-cloth',
    type: 'simple',
    regular_price: '120',
    manage_stock: true,
    stock_quantity: 30,
    stock_status: 'instock',
    short_description:
      'Ultra-fine reusable nylon stocking/muslin sifting mesh for silky, lump-free henna paste that never clogs 0.38mm tips.',
    description:
      '<p>Dry-sift raw henna powder or strain rested paste for a velvety, stringy consistency that glides effortlessly through ultra-fine bridal cones.</p><ul><li>Micro-fine weave traps leaf fibers and coarse particles</li><li>Washable and reusable across multiple batches</li><li>Essential for smooth bridal lace and shading work</li></ul>',
  },
  {
    name: 'Reusable Acrylic Mehandi Practice Hand Board',
    slug: 'reusable-acrylic-mehandi-practice-hand-board',
    type: 'simple',
    regular_price: '260',
    manage_stock: true,
    stock_quantity: 25,
    stock_status: 'instock',
    short_description:
      'Wipe-clean frosted acrylic hand template for practicing bridal mandalas, pressure control, and fine jali grids.',
    description:
      '<p>Anatomically proportioned acrylic practice hand designed for students and artists refining cone pressure, line symmetry, and intricate bridal patterns without staining skin.</p><ul><li>Smooth matte surface mimics natural skin resistance</li><li>Wipes clean easily with water or damp cloth</li><li>Reusable for daily drills and masterclass practice</li></ul>',
  },
];

async function run() {
  const wpBaseUrl = (process.env.WP_BASE_URL || '').replace(/\/+$/, '');
  const key = process.env.WC_CONSUMER_KEY || '';
  const secret = process.env.WC_CONSUMER_SECRET || '';

  console.log(
    `Mode: ${apply ? `APPLY (status=${targetStatus})` : 'DRY-RUN (preview only)'}`,
  );
  console.log(`Target store: ${wpBaseUrl || '(WP_BASE_URL not set)'}`);
  console.log(`Category: ${RELATED_CATEGORY.name} (${RELATED_CATEGORY.slug})`);
  console.log(`Items (${RELATED_HENNA_SUPPLIES.length}):`);
  for (const item of RELATED_HENNA_SUPPLIES) {
    console.log(
      `  - ${item.name} [slug=${item.slug}, price=₹${item.regular_price}]`,
    );
  }

  if (!apply) {
    console.log(
      '\nDry-run complete. Re-run with --apply --status=draft (or --status=publish) to create in WooCommerce.',
    );
    return;
  }

  if (!wpBaseUrl || !key || !secret) {
    console.error(
      'Missing WP_BASE_URL, WC_CONSUMER_KEY, or WC_CONSUMER_SECRET in environment.',
    );
    process.exit(1);
  }

  const authHeader = `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
  const headers = {
    Authorization: authHeader,
    'Content-Type': 'application/json',
  };

  // 1. Find or create category
  const catSearchRes = await fetch(
    `${wpBaseUrl}/wp-json/wc/v3/products/categories?slug=${encodeURIComponent(RELATED_CATEGORY.slug)}`,
    { headers },
  );
  if (!catSearchRes.ok) {
    throw new Error(`Failed querying categories: HTTP ${catSearchRes.status}`);
  }
  const existingCats = await catSearchRes.json();
  let categoryId = existingCats[0]?.id ?? null;

  if (!categoryId) {
    const catCreateRes = await fetch(
      `${wpBaseUrl}/wp-json/wc/v3/products/categories`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(RELATED_CATEGORY),
      },
    );
    if (!catCreateRes.ok) {
      throw new Error(`Failed creating category: HTTP ${catCreateRes.status}`);
    }
    const createdCat = await catCreateRes.json();
    categoryId = createdCat.id;
    console.log(
      `Created category "${RELATED_CATEGORY.name}" (id=${categoryId})`,
    );
  } else {
    console.log(
      `Using existing category "${RELATED_CATEGORY.name}" (id=${categoryId})`,
    );
  }

  // 2. Idempotently create each related product
  for (const item of RELATED_HENNA_SUPPLIES) {
    const existingRes = await fetch(
      `${wpBaseUrl}/wp-json/wc/v3/products?slug=${encodeURIComponent(item.slug)}&status=any`,
      { headers },
    );
    const existing = existingRes.ok ? await existingRes.json() : [];
    if (Array.isArray(existing) && existing.length > 0) {
      console.log(
        `Skipped existing product: ${item.name} (id=${existing[0].id}, status=${existing[0].status})`,
      );
      continue;
    }

    const createRes = await fetch(`${wpBaseUrl}/wp-json/wc/v3/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...item,
        status: targetStatus,
        categories: [{ id: categoryId }],
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error(
        `Failed creating ${item.name}: HTTP ${createRes.status} -> ${errBody.slice(0, 200)}`,
      );
      continue;
    }

    const created = await createRes.json();
    console.log(
      `Created product: ${created.name} (id=${created.id}, status=${created.status})`,
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
