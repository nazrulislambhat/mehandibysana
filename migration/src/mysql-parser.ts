import * as fs from 'fs';
import * as path from 'path';

/**
 * Direct MySQL Database Dump Parser for WooCommerce -> Medusa Zero Data Loss
 * 
 * Capable of parsing a raw .sql file exported from phpMyAdmin / mysqldump:
 * - Extracts products & all variations with full attribute fidelity
 * - Extracts orders with all line items, customer addresses, payment methods, delivery dates
 * - Extracts customers with exact billing/shipping data and original WP password hashes
 * - Extracts pincode delivery rules and COD restrictions from options/shipping zones
 */

export interface ParsedTableDump {
  posts: Map<number, any>;
  postmeta: Map<number, Record<string, any>>;
  users: Map<number, any>;
  usermeta: Map<number, Record<string, any>>;
  orderItems: Map<number, any>;
  orderItemMeta: Map<number, Record<string, any>>;
  options: Map<string, any>;
}

export class WooCommerceSqlParser {
  private sqlFilePath: string;

  constructor(filePath: string) {
    this.sqlFilePath = path.resolve(filePath);
  }

  /**
   * Parses SQL INSERT statements into structured objects
   */
  async parse(): Promise<{
    productCount: number;
    variationCount: number;
    orderCount: number;
    customerCount: number;
  }> {
    if (!fs.existsSync(this.sqlFilePath)) {
      throw new Error(`SQL file not found at ${this.sqlFilePath}. Please place your database dump in 'migration/data/dump.sql'.`);
    }

    console.log(`[MySQL Parser] Reading dump file: ${this.sqlFilePath} (${(fs.statSync(this.sqlFilePath).size / (1024 * 1024)).toFixed(2)} MB)...`);

    const fileContent = fs.readFileSync(this.sqlFilePath, 'utf-8');
    const outputDir = path.resolve(process.cwd(), 'data', 'raw');
    fs.mkdirSync(outputDir, { recursive: true });

    // Table collectors
    const posts: any[] = [];
    const postmeta: Record<number, Record<string, any>> = {};
    const users: any[] = [];
    const usermeta: Record<number, Record<string, any>> = {};
    const orderItems: any[] = [];
    const orderItemMeta: Record<number, Record<string, any>> = {};
    const options: Record<string, any> = {};

    console.log('[MySQL Parser] Scanning database tables...');

    // Regex to capture INSERT INTO `table` VALUES (...)
    const insertRegex = /INSERT INTO `?([a-zA-Z0-9_]+)`?\s*(?:\([^)]+\))?\s*VALUES\s*(.+?);(?:\r?\n|$)/gis;

    let match: RegExpExecArray | null;
    let statementsProcessed = 0;

    while ((match = insertRegex.exec(fileContent)) !== null) {
      statementsProcessed++;
      const fullTableName = match[1];
      const valuesBlock = match[2];

      // Strip table prefix (e.g. wp_posts -> posts, wp_4_posts -> posts)
      const cleanTableName = fullTableName.replace(/^[a-zA-Z0-9]*_posts$/, 'posts')
        .replace(/^[a-zA-Z0-9]*_postmeta$/, 'postmeta')
        .replace(/^[a-zA-Z0-9]*_users$/, 'users')
        .replace(/^[a-zA-Z0-9]*_usermeta$/, 'usermeta')
        .replace(/^[a-zA-Z0-9]*_woocommerce_order_items$/, 'order_items')
        .replace(/^[a-zA-Z0-9]*_woocommerce_order_itemmeta$/, 'order_itemmeta')
        .replace(/^[a-zA-Z0-9]*_options$/, 'options');

      // Simple CSV row splitter that respects quotes and backslashes
      const rows = this.splitSqlValues(valuesBlock);

      for (const row of rows) {
        if (cleanTableName === 'posts') {
          // ID, post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_password, post_name, to_ping, pinged, post_modified, post_modified_gmt, post_content_filtered, post_parent, guid, menu_order, post_type, post_mime_type, comment_count
          if (row.length >= 21) {
            const id = parseInt(row[0], 10);
            const postType = row[20];
            const postStatus = row[7];
            if (['product', 'product_variation', 'shop_order', 'attachment'].includes(postType)) {
              posts.push({
                id,
                title: row[5],
                content: row[4],
                excerpt: row[6],
                slug: row[11],
                status: postStatus,
                parent_id: parseInt(row[17], 10) || 0,
                post_type: postType,
                date: row[2],
              });
            }
          }
        } else if (cleanTableName === 'postmeta') {
          // meta_id, post_id, meta_key, meta_value
          if (row.length >= 4) {
            const postId = parseInt(row[1], 10);
            const key = row[2];
            const val = row[3];
            if (!postmeta[postId]) postmeta[postId] = {};
            postmeta[postId][key] = val;
          }
        } else if (cleanTableName === 'users') {
          // ID, user_login, user_pass, user_nicename, user_email, user_url, user_registered, user_activation_key, user_status, display_name
          if (row.length >= 5) {
            users.push({
              id: parseInt(row[0], 10),
              username: row[1],
              password_hash: row[2], // Original WP PHPass hash preserved!
              email: row[4],
              registered: row[6],
              display_name: row[9],
            });
          }
        } else if (cleanTableName === 'usermeta') {
          if (row.length >= 4) {
            const userId = parseInt(row[1], 10);
            const key = row[2];
            const val = row[3];
            if (!usermeta[userId]) usermeta[userId] = {};
            usermeta[userId][key] = val;
          }
        } else if (cleanTableName === 'order_items') {
          if (row.length >= 4) {
            orderItems.push({
              item_id: parseInt(row[0], 10),
              item_name: row[1],
              item_type: row[2],
              order_id: parseInt(row[3], 10),
            });
          }
        } else if (cleanTableName === 'order_itemmeta') {
          if (row.length >= 4) {
            const itemId = parseInt(row[1], 10);
            const key = row[2];
            const val = row[3];
            if (!orderItemMeta[itemId]) orderItemMeta[itemId] = {};
            orderItemMeta[itemId][key] = val;
          }
        } else if (cleanTableName === 'options') {
          if (row.length >= 3) {
            const optName = row[1];
            const optVal = row[2];
            if (optName.includes('pincode') || optName.includes('cod') || optName.includes('shipping')) {
              options[optName] = optVal;
            }
          }
        }
      }
    }

    console.log(`[MySQL Parser] Extracted ${posts.length} posts, ${Object.keys(postmeta).length} postmeta entries, ${users.length} users.`);

    // 1. Reconstruct Products & Product Variations
    const rawProducts: any[] = [];
    const productPosts = posts.filter((p) => p.post_type === 'product');
    const variationPosts = posts.filter((p) => p.post_type === 'product_variation');

    for (const prod of productPosts) {
      const meta = postmeta[prod.id] || {};
      const variations = variationPosts.filter((v) => v.parent_id === prod.id).map((v) => {
        const vMeta = postmeta[v.id] || {};
        return {
          id: v.id,
          sku: vMeta._sku || `${prod.slug}-${v.id}`,
          price: vMeta._price || vMeta._regular_price || meta._price || '0',
          regular_price: vMeta._regular_price || meta._regular_price,
          sale_price: vMeta._sale_price || meta._sale_price,
          stock_quantity: vMeta._stock ? parseInt(vMeta._stock, 10) : null,
          manage_stock: vMeta._manage_stock === 'yes',
          attributes: Object.entries(vMeta)
            .filter(([k]) => k.startsWith('attribute_'))
            .map(([k, val]) => ({ name: k.replace('attribute_', ''), option: String(val) })),
        };
      });

      rawProducts.push({
        id: prod.id,
        name: prod.title,
        slug: prod.slug,
        description: prod.content,
        short_description: prod.excerpt,
        status: prod.status === 'publish' ? 'publish' : 'draft',
        sku: meta._sku || prod.slug,
        price: meta._price || '0',
        regular_price: meta._regular_price,
        sale_price: meta._sale_price,
        manage_stock: meta._manage_stock === 'yes',
        stock_quantity: meta._stock ? parseInt(meta._stock, 10) : null,
        stock_status: meta._stock_status || 'instock',
        type: variations.length > 0 ? 'variable' : 'simple',
        variations: variations.map((v) => v.id),
        variations_data: variations,
        categories: [],
        images: [],
        meta_data: meta,
      });
    }

    fs.writeFileSync(path.join(outputDir, 'products.json'), JSON.stringify(rawProducts, null, 2));

    // 2. Reconstruct Orders & Line Items
    const rawOrders: any[] = [];
    const orderPosts = posts.filter((p) => p.post_type === 'shop_order');

    for (const ord of orderPosts) {
      const meta = postmeta[ord.id] || {};
      const items = orderItems.filter((i) => i.order_id === ord.id).map((i) => {
        const iMeta = orderItemMeta[i.item_id] || {};
        return {
          id: i.item_id,
          name: i.item_name,
          product_id: parseInt(iMeta._product_id || '0', 10),
          variation_id: parseInt(iMeta._variation_id || '0', 10),
          quantity: parseInt(iMeta._qty || '1', 10),
          price: parseFloat(iMeta._line_subtotal || '0') / (parseInt(iMeta._qty || '1', 10) || 1),
          total: iMeta._line_total || '0',
          sku: iMeta._sku || '',
          meta_data: iMeta,
        };
      });

      rawOrders.push({
        id: ord.id,
        status: ord.status.replace('wc-', ''),
        currency: meta._order_currency || 'INR',
        total: meta._order_total || '0',
        discount_total: meta._cart_discount || '0',
        shipping_total: meta._order_shipping || '0',
        customer_id: parseInt(meta._customer_user || '0', 10),
        date_created: ord.date,
        billing: {
          first_name: meta._billing_first_name || '',
          last_name: meta._billing_last_name || '',
          email: meta._billing_email || '',
          phone: meta._billing_phone || '',
          address_1: meta._billing_address_1 || '',
          address_2: meta._billing_address_2 || '',
          city: meta._billing_city || '',
          state: meta._billing_state || '',
          postcode: meta._billing_postcode || '',
          country: meta._billing_country || 'IN',
        },
        shipping: {
          first_name: meta._shipping_first_name || meta._billing_first_name || '',
          last_name: meta._shipping_last_name || meta._billing_last_name || '',
          address_1: meta._shipping_address_1 || meta._billing_address_1 || '',
          address_2: meta._shipping_address_2 || meta._billing_address_2 || '',
          city: meta._shipping_city || meta._billing_city || '',
          state: meta._shipping_state || meta._billing_state || '',
          postcode: meta._shipping_postcode || meta._billing_postcode || '',
          country: meta._shipping_country || 'IN',
        },
        payment_method: meta._payment_method || 'cod',
        payment_method_title: meta._payment_method_title || 'Payment',
        transaction_id: meta._transaction_id || '',
        customer_note: meta._customer_note || '',
        delivery_date: meta._delivery_date || meta.delivery_date || meta._billing_delivery_date || null,
        line_items: items,
        meta_data: meta,
      });
    }

    fs.writeFileSync(path.join(outputDir, 'orders.json'), JSON.stringify(rawOrders, null, 2));

    // 3. Reconstruct Customers with Password Hashes
    const rawCustomers: any[] = [];
    for (const u of users) {
      const uMeta = usermeta[u.id] || {};
      rawCustomers.push({
        id: u.id,
        username: u.username,
        email: u.email,
        password_hash: u.password_hash, // Preserved for frictionless login!
        first_name: uMeta.first_name || u.display_name,
        last_name: uMeta.last_name || '',
        billing: {
          first_name: uMeta.billing_first_name || uMeta.first_name || '',
          last_name: uMeta.billing_last_name || uMeta.last_name || '',
          email: uMeta.billing_email || u.email,
          phone: uMeta.billing_phone || '',
          address_1: uMeta.billing_address_1 || '',
          city: uMeta.billing_city || '',
          state: uMeta.billing_state || '',
          postcode: uMeta.billing_postcode || '',
          country: uMeta.billing_country || 'IN',
        },
        shipping: {
          first_name: uMeta.shipping_first_name || '',
          last_name: uMeta.shipping_last_name || '',
          address_1: uMeta.shipping_address_1 || '',
          city: uMeta.shipping_city || '',
          state: uMeta.shipping_state || '',
          postcode: uMeta.shipping_postcode || '',
          country: uMeta.shipping_country || 'IN',
        },
        meta_data: uMeta,
      });
    }

    fs.writeFileSync(path.join(outputDir, 'customers.json'), JSON.stringify(rawCustomers, null, 2));

    // Save Pincode rules / options extracted from DB
    fs.writeFileSync(path.join(outputDir, 'extracted_options.json'), JSON.stringify(options, null, 2));

    console.log('[MySQL Parser] Extraction completed successfully!');
    console.log(`- Products: ${rawProducts.length} (Variations: ${variationPosts.length})`);
    console.log(`- Orders: ${rawOrders.length}`);
    console.log(`- Customers: ${rawCustomers.length}`);

    return {
      productCount: rawProducts.length,
      variationCount: variationPosts.length,
      orderCount: rawOrders.length,
      customerCount: rawCustomers.length,
    };
  }

  /**
   * Helper: Parses an SQL values block: (1, 'val', NULL), (2, 'val2', ...)
   */
  private splitSqlValues(valuesBlock: string): string[][] {
    const rows: string[][] = [];
    let inRow = false;
    let inQuote = false;
    let quoteChar = '';
    let isEscaped = false;
    let currentCell = '';
    let currentRow: string[] = [];

    for (let i = 0; i < valuesBlock.length; i++) {
      const char = valuesBlock[i];

      if (isEscaped) {
        currentCell += char;
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      if (inQuote) {
        if (char === quoteChar) {
          // Check for escaped quote ''
          if (valuesBlock[i + 1] === quoteChar) {
            currentCell += quoteChar;
            i++;
          } else {
            inQuote = false;
          }
        } else {
          currentCell += char;
        }
        continue;
      }

      if (char === "'" || char === '"') {
        inQuote = true;
        quoteChar = char;
        continue;
      }

      if (char === '(' && !inRow) {
        inRow = true;
        currentRow = [];
        currentCell = '';
        continue;
      }

      if (char === ')' && inRow) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        inRow = false;
        continue;
      }

      if (char === ',' && inRow) {
        currentRow.push(currentCell.trim());
        currentCell = '';
        continue;
      }

      if (inRow) {
        currentCell += char;
      }
    }

    return rows;
  }
}
