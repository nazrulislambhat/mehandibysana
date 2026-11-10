import * as fs from 'fs';
import * as path from 'path';

/**
 * Direct MySQL Database Dump Parser for WooCommerce -> MedusaJS v2 (Zero Data Loss)
 *
 * Parses raw .sql dumps exported from phpMyAdmin / mysqldump / WP-CLI:
 * - wp_posts + wp_postmeta: products, product_variation, attachment (images + alt text), shop_order, shop_coupon
 * - wp_terms + wp_term_taxonomy + wp_term_relationships: product_cat (categories), product_tag, product_type, pa_* attributes
 * - wp_comments + wp_commentmeta: verified product reviews & ratings
 * - wp_woocommerce_order_items + wp_woocommerce_order_itemmeta: full order line items & shipping/fee items
 * - wp_users + wp_usermeta: customers with billing/shipping addresses & original WP password hashes
 * - wp_options: pincode/shipping/COD rules
 */

interface SqlCell {
  value: string;
  isNull: boolean;
}

export class WooCommerceSqlParser {
  private sqlFilePath: string;
  private customOutputDir?: string;

  constructor(filePath: string, customOutputDir?: string) {
    this.sqlFilePath = path.resolve(filePath);
    this.customOutputDir = customOutputDir;
  }

  async parse(): Promise<{
    categoryCount: number;
    productCount: number;
    variationCount: number;
    imageCount: number;
    orderCount: number;
    customerCount: number;
    reviewCount: number;
  }> {
    if (!fs.existsSync(this.sqlFilePath)) {
      throw new Error(
        `SQL file not found at ${this.sqlFilePath}. Place your WordPress/WooCommerce SQL dump there or pass its path as an argument.`
      );
    }

    const fileSizeMb = (fs.statSync(this.sqlFilePath).size / (1024 * 1024)).toFixed(2);
    console.log(`[MySQL Parser] Reading dump file: ${this.sqlFilePath} (${fileSizeMb} MB)...`);

    const fileContent = fs.readFileSync(this.sqlFilePath, 'utf-8');
    const outputDir = this.customOutputDir || path.resolve(process.cwd(), 'data', 'raw');
    fs.mkdirSync(outputDir, { recursive: true });

    // Table collectors
    const posts: any[] = [];
    const postmeta: Record<number, Record<string, string>> = {};
    const terms: Map<number, { term_id: number; name: string; slug: string }> = new Map();
    const termTaxonomy: Map<
      number,
      {
        term_taxonomy_id: number;
        term_id: number;
        taxonomy: string;
        description: string;
        parent: number;
        count: number;
      }
    > = new Map();
    const termRelationships: { object_id: number; term_taxonomy_id: number; term_order: number }[] = [];
    const users: any[] = [];
    const usermeta: Record<number, Record<string, string>> = {};
    const orderItems: any[] = [];
    const orderItemMeta: Record<number, Record<string, string>> = {};
    const comments: any[] = [];
    const commentMeta: Record<number, Record<string, string>> = {};
    const options: Record<string, string> = {};

    console.log('[MySQL Parser] Scanning SQL INSERT statements (quote-aware)...');

    const insertStatements = this.extractInsertStatements(fileContent);
    let statementsProcessed = 0;

    for (const stmt of insertStatements) {
      statementsProcessed++;
      const fullTableName = stmt.tableName;
      const columns = stmt.columns;
      const valuesBlock = stmt.valuesBlock;

      // Normalize WordPress table prefix (wp_, wp_2_, mbs_, etc.)
      const cleanTableName = fullTableName
        .replace(/^[a-zA-Z0-9]+_posts$/, 'posts')
        .replace(/^[a-zA-Z0-9]+_postmeta$/, 'postmeta')
        .replace(/^[a-zA-Z0-9]+_terms$/, 'terms')
        .replace(/^[a-zA-Z0-9]+_term_taxonomy$/, 'term_taxonomy')
        .replace(/^[a-zA-Z0-9]+_term_relationships$/, 'term_relationships')
        .replace(/^[a-zA-Z0-9]+_users$/, 'users')
        .replace(/^[a-zA-Z0-9]+_usermeta$/, 'usermeta')
        .replace(/^[a-zA-Z0-9]+_woocommerce_order_items$/, 'order_items')
        .replace(/^[a-zA-Z0-9]+_woocommerce_order_itemmeta$/, 'order_itemmeta')
        .replace(/^[a-zA-Z0-9]+_comments$/, 'comments')
        .replace(/^[a-zA-Z0-9]+_commentmeta$/, 'commentmeta')
        .replace(/^[a-zA-Z0-9]+_options$/, 'options');

      const rows = this.splitSqlValues(valuesBlock);

      for (const row of rows) {
        const getCol = (colName: string, defaultIndex: number): string => {
          const idx = columns ? columns.indexOf(colName) : defaultIndex;
          if (idx < 0 || idx >= row.length) return '';
          return row[idx].isNull ? '' : row[idx].value;
        };

        if (cleanTableName === 'posts' && row.length >= 21) {
          const id = parseInt(getCol('id', 0), 10);
          const postType = getCol('post_type', 20);
          const postStatus = getCol('post_status', 7);
          if (['product', 'product_variation', 'shop_order', 'attachment', 'shop_coupon'].includes(postType)) {
            posts.push({
              id,
              title: getCol('post_title', 5),
              content: getCol('post_content', 4),
              excerpt: getCol('post_excerpt', 6),
              slug: getCol('post_name', 11),
              status: postStatus,
              parent_id: parseInt(getCol('post_parent', 17), 10) || 0,
              guid: getCol('guid', 18),
              menu_order: parseInt(getCol('menu_order', 19), 10) || 0,
              post_type: postType,
              mime_type: getCol('post_mime_type', 21),
              date: getCol('post_date', 2),
            });
          }
        } else if (cleanTableName === 'postmeta' && row.length >= 4) {
          const postId = parseInt(getCol('post_id', 1), 10);
          const key = getCol('meta_key', 2);
          const val = getCol('meta_value', 3);
          if (!postmeta[postId]) postmeta[postId] = {};
          postmeta[postId][key] = val;
        } else if (cleanTableName === 'terms' && row.length >= 3) {
          const termId = parseInt(getCol('term_id', 0), 10);
          terms.set(termId, {
            term_id: termId,
            name: getCol('name', 1),
            slug: getCol('slug', 2),
          });
        } else if (cleanTableName === 'term_taxonomy' && row.length >= 6) {
          const ttId = parseInt(getCol('term_taxonomy_id', 0), 10);
          termTaxonomy.set(ttId, {
            term_taxonomy_id: ttId,
            term_id: parseInt(getCol('term_id', 1), 10),
            taxonomy: getCol('taxonomy', 2),
            description: getCol('description', 3),
            parent: parseInt(getCol('parent', 4), 10) || 0,
            count: parseInt(getCol('count', 5), 10) || 0,
          });
        } else if (cleanTableName === 'term_relationships' && row.length >= 2) {
          termRelationships.push({
            object_id: parseInt(getCol('object_id', 0), 10),
            term_taxonomy_id: parseInt(getCol('term_taxonomy_id', 1), 10),
            term_order: parseInt(getCol('term_order', 2), 10) || 0,
          });
        } else if (cleanTableName === 'users' && row.length >= 5) {
          users.push({
            id: parseInt(getCol('id', 0), 10),
            username: getCol('user_login', 1),
            password_hash: getCol('user_pass', 2),
            email: getCol('user_email', 4),
            registered: getCol('user_registered', 6),
            display_name: getCol('display_name', 9),
          });
        } else if (cleanTableName === 'usermeta' && row.length >= 4) {
          const userId = parseInt(getCol('user_id', 1), 10);
          const key = getCol('meta_key', 2);
          const val = getCol('meta_value', 3);
          if (!usermeta[userId]) usermeta[userId] = {};
          usermeta[userId][key] = val;
        } else if (cleanTableName === 'order_items' && row.length >= 4) {
          orderItems.push({
            item_id: parseInt(getCol('order_item_id', 0), 10),
            item_name: getCol('order_item_name', 1),
            item_type: getCol('order_item_type', 2),
            order_id: parseInt(getCol('order_id', 3), 10),
          });
        } else if (cleanTableName === 'order_itemmeta' && row.length >= 4) {
          const itemId = parseInt(getCol('order_item_id', 1), 10);
          const key = getCol('meta_key', 2);
          const val = getCol('meta_value', 3);
          if (!orderItemMeta[itemId]) orderItemMeta[itemId] = {};
          orderItemMeta[itemId][key] = val;
        } else if (cleanTableName === 'comments' && row.length >= 11) {
          const commentType = getCol('comment_type', 11) || 'review';
          if (commentType === 'review') {
            comments.push({
              id: parseInt(getCol('comment_id', 0), 10),
              product_id: parseInt(getCol('comment_post_id', 1), 10),
              reviewer: getCol('comment_author', 2),
              reviewer_email: getCol('comment_author_email', 3),
              date_created: getCol('comment_date', 6),
              review: getCol('comment_content', 8),
              status: getCol('comment_approved', 10) === '1' ? 'approved' : 'hold',
            });
          }
        } else if (cleanTableName === 'commentmeta' && row.length >= 4) {
          const cId = parseInt(getCol('comment_id', 1), 10);
          const key = getCol('meta_key', 2);
          const val = getCol('meta_value', 3);
          if (!commentMeta[cId]) commentMeta[cId] = {};
          commentMeta[cId][key] = val;
        } else if (cleanTableName === 'options' && row.length >= 3) {
          const optName = getCol('option_name', 1);
          const optVal = getCol('option_value', 2);
          if (
            optName.includes('pincode') ||
            optName.includes('cod') ||
            optName.includes('shipping') ||
            optName === 'siteurl'
          ) {
            options[optName] = optVal;
          }
        }
      }
    }

    console.log(
      `[MySQL Parser] Processed ${statementsProcessed} INSERT statements (${posts.length} posts, ${terms.size} terms, ${termRelationships.length} taxonomy links).`
    );

    // Build Attachment Lookup Map (Attachment ID -> URL + Alt Text)
    const attachmentsById = new Map<number, { id: number; src: string; name: string; alt: string }>();
    const siteUrl = (options.siteurl || 'https://mehandibysana.com').replace(/\/$/, '');
    for (const p of posts) {
      if (p.post_type === 'attachment') {
        const aMeta = postmeta[p.id] || {};
        let src = p.guid || '';
        if (!src && aMeta._wp_attached_file) {
          src = `${siteUrl}/wp-content/uploads/${aMeta._wp_attached_file}`;
        }
        if (src) {
          attachmentsById.set(p.id, {
            id: p.id,
            src,
            name: p.title || p.slug || `image-${p.id}`,
            alt: aMeta._wp_attachment_image_alt || p.title || '',
          });
        }
      }
    }

    // Build Categories list from product_cat taxonomy
    const rawCategories: any[] = [];
    for (const [ttId, tt] of termTaxonomy.entries()) {
      if (tt.taxonomy === 'product_cat') {
        const term = terms.get(tt.term_id);
        if (term && term.slug !== 'uncategorized') {
          const catMeta = postmeta[term.term_id] || {};
          const thumbId = parseInt(catMeta.thumbnail_id || '0', 10);
          rawCategories.push({
            id: term.term_id,
            term_taxonomy_id: ttId,
            name: this.decodeEntities(term.name),
            slug: term.slug,
            parent: tt.parent,
            description: tt.description,
            image: thumbId ? attachmentsById.get(thumbId) || null : null,
            count: tt.count,
          });
        }
      }
    }
    fs.writeFileSync(path.join(outputDir, 'categories.json'), JSON.stringify(rawCategories, null, 2));

    // Index term relationships by object_id
    const objectTaxonomies = new Map<number, { taxonomy: string; term_id: number; name: string; slug: string }[]>();
    for (const rel of termRelationships) {
      const tt = termTaxonomy.get(rel.term_taxonomy_id);
      if (!tt) continue;
      const term = terms.get(tt.term_id);
      if (!term) continue;
      const list = objectTaxonomies.get(rel.object_id) || [];
      list.push({
        taxonomy: tt.taxonomy,
        term_id: term.term_id,
        name: this.decodeEntities(term.name),
        slug: term.slug,
      });
      objectTaxonomies.set(rel.object_id, list);
    }

    // 1. Reconstruct Products & Product Variations with FULL metadata, categories, images & attributes
    const rawProducts: any[] = [];
    const productPosts = posts.filter((p) => p.post_type === 'product');
    const variationPosts = posts.filter((p) => p.post_type === 'product_variation');
    let totalResolvedImages = 0;

    for (const prod of productPosts) {
      const meta = postmeta[prod.id] || {};
      const linkedTax = objectTaxonomies.get(prod.id) || [];

      const categories = linkedTax
        .filter((t) => t.taxonomy === 'product_cat' && t.slug !== 'uncategorized')
        .map((t) => ({ id: t.term_id, name: t.name, slug: t.slug }));

      const tags = linkedTax
        .filter((t) => t.taxonomy === 'product_tag')
        .map((t) => ({ id: t.term_id, name: t.name, slug: t.slug }));

      const productTypeTerm = linkedTax.find((t) => t.taxonomy === 'product_type');

      // Resolve featured image + gallery images in exact order
      const imageIds: number[] = [];
      const thumbId = parseInt(meta._thumbnail_id || '0', 10);
      if (thumbId > 0) imageIds.push(thumbId);
      if (meta._product_image_gallery) {
        for (const idStr of meta._product_image_gallery.split(',')) {
          const gid = parseInt(idStr.trim(), 10);
          if (gid > 0 && !imageIds.includes(gid)) imageIds.push(gid);
        }
      }
      const images = imageIds
        .map((imgId) => attachmentsById.get(imgId))
        .filter((img): img is { id: number; src: string; name: string; alt: string } => Boolean(img));
      totalResolvedImages += images.length;

      // Parse _product_attributes PHP serialized string + taxonomy terms
      const parsedAttributes = this.parseProductAttributes(meta._product_attributes || '', linkedTax);

      // Build variations
      const variations = variationPosts
        .filter((v) => v.parent_id === prod.id)
        .sort((a, b) => a.menu_order - b.menu_order || a.id - b.id)
        .map((v) => {
          const vMeta = postmeta[v.id] || {};
          const vThumbId = parseInt(vMeta._thumbnail_id || '0', 10);
          const vImage = vThumbId ? attachmentsById.get(vThumbId) : undefined;

          const attrs = Object.entries(vMeta)
            .filter(([k]) => k.startsWith('attribute_'))
            .map(([k, rawVal]) => {
              const rawSlug = k.replace('attribute_', '');
              const cleanName = this.formatAttributeName(rawSlug, parsedAttributes);
              const resolvedOption = this.resolveAttributeOptionLabel(rawSlug, String(rawVal), linkedTax);
              return {
                id: 0,
                name: cleanName,
                option: resolvedOption,
              };
            });

          return {
            id: v.id,
            description: v.excerpt || vMeta._variation_description || '',
            sku: vMeta._sku || `${prod.slug}-${v.id}`,
            price: vMeta._price || vMeta._regular_price || meta._price || '0',
            regular_price: vMeta._regular_price || meta._regular_price || '',
            sale_price: vMeta._sale_price || '',
            stock_quantity: vMeta._stock !== undefined && vMeta._stock !== '' ? parseInt(vMeta._stock, 10) : null,
            manage_stock: vMeta._manage_stock === 'yes',
            attributes: attrs,
            image: vImage,
          };
        });

      // Ensure attribute options include all values actually used on variations
      for (const v of variations) {
        for (const attr of v.attributes) {
          let existingAttr = parsedAttributes.find(
            (a) => a.name.toLowerCase() === attr.name.toLowerCase()
          );
          if (!existingAttr) {
            existingAttr = {
              id: 0,
              name: attr.name,
              position: parsedAttributes.length,
              visible: true,
              variation: true,
              options: [],
            };
            parsedAttributes.push(existingAttr);
          }
          if (attr.option && !existingAttr.options.includes(attr.option)) {
            existingAttr.options.push(attr.option);
          }
        }
      }

      const inferredType =
        (productTypeTerm?.slug as 'simple' | 'variable' | 'grouped' | 'external') ||
        (variations.length > 0 ? 'variable' : 'simple');

      rawProducts.push({
        id: prod.id,
        name: this.decodeEntities(prod.title),
        slug: prod.slug,
        permalink: `${siteUrl}/product/${prod.slug}/`,
        type: inferredType,
        status: prod.status === 'publish' ? 'publish' : prod.status,
        featured: linkedTax.some((t) => t.taxonomy === 'product_visibility' && t.slug === 'featured'),
        description: prod.content,
        short_description: prod.excerpt,
        sku: meta._sku || prod.slug,
        price: meta._price || meta._regular_price || '0',
        regular_price: meta._regular_price || '',
        sale_price: meta._sale_price || '',
        weight: meta._weight || '',
        manage_stock: meta._manage_stock === 'yes',
        stock_quantity: meta._stock !== undefined && meta._stock !== '' ? parseInt(meta._stock, 10) : null,
        stock_status: meta._stock_status || 'instock',
        categories,
        tags,
        images,
        attributes: parsedAttributes,
        variations: variations.map((v) => v.id),
        variations_data: variations,
        meta_data: meta,
      });
    }

    fs.writeFileSync(path.join(outputDir, 'products.json'), JSON.stringify(rawProducts, null, 2));

    // 2. Reconstruct Orders & Line Items
    const rawOrders: any[] = [];
    const orderPosts = posts.filter((p) => p.post_type === 'shop_order');

    for (const ord of orderPosts) {
      const meta = postmeta[ord.id] || {};
      const items = orderItems
        .filter((i) => i.order_id === ord.id && i.item_type === 'line_item')
        .map((i) => {
          const iMeta = orderItemMeta[i.item_id] || {};
          const qty = Math.max(1, parseInt(iMeta._qty || '1', 10));
          return {
            id: i.item_id,
            name: i.item_name,
            product_id: parseInt(iMeta._product_id || '0', 10),
            variation_id: parseInt(iMeta._variation_id || '0', 10),
            quantity: qty,
            price: parseFloat(iMeta._line_subtotal || '0') / qty,
            subtotal: iMeta._line_subtotal || '0',
            total: iMeta._line_total || '0',
            sku: iMeta._sku || '',
            meta_data: iMeta,
          };
        });

      const couponLines = orderItems
        .filter((i) => i.order_id === ord.id && i.item_type === 'coupon')
        .map((i) => {
          const iMeta = orderItemMeta[i.item_id] || {};
          return {
            id: i.item_id,
            code: i.item_name,
            discount: iMeta.discount_amount || '0',
          };
        });

      rawOrders.push({
        id: ord.id,
        status: ord.status.replace(/^wc-/, ''),
        currency: meta._order_currency || 'INR',
        total: meta._order_total || '0',
        discount_total: meta._cart_discount || '0',
        shipping_total: meta._order_shipping || '0',
        customer_id: parseInt(meta._customer_user || '0', 10),
        date_created: ord.date,
        billing: {
          first_name: meta._billing_first_name || '',
          last_name: meta._billing_last_name || '',
          company: meta._billing_company || '',
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
          company: meta._shipping_company || '',
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
        line_items: items,
        coupon_lines: couponLines,
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
        date_created: u.registered,
        username: u.username,
        email: u.email,
        password_hash: u.password_hash,
        first_name: uMeta.first_name || u.display_name || '',
        last_name: uMeta.last_name || '',
        is_paying_customer: uMeta.paying_customer === '1',
        billing: {
          first_name: uMeta.billing_first_name || uMeta.first_name || '',
          last_name: uMeta.billing_last_name || uMeta.last_name || '',
          company: uMeta.billing_company || '',
          email: uMeta.billing_email || u.email,
          phone: uMeta.billing_phone || '',
          address_1: uMeta.billing_address_1 || '',
          address_2: uMeta.billing_address_2 || '',
          city: uMeta.billing_city || '',
          state: uMeta.billing_state || '',
          postcode: uMeta.billing_postcode || '',
          country: uMeta.billing_country || 'IN',
        },
        shipping: {
          first_name: uMeta.shipping_first_name || '',
          last_name: uMeta.shipping_last_name || '',
          company: uMeta.shipping_company || '',
          address_1: uMeta.shipping_address_1 || '',
          address_2: uMeta.shipping_address_2 || '',
          city: uMeta.shipping_city || '',
          state: uMeta.shipping_state || '',
          postcode: uMeta.shipping_postcode || '',
          country: uMeta.shipping_country || 'IN',
        },
        meta_data: uMeta,
      });
    }
    fs.writeFileSync(path.join(outputDir, 'customers.json'), JSON.stringify(rawCustomers, null, 2));

    // 4. Reconstruct Reviews
    const rawReviews = comments.map((c) => ({
      ...c,
      rating: parseInt(commentMeta[c.id]?.rating || '5', 10),
      verified: commentMeta[c.id]?.verified === '1',
    }));
    fs.writeFileSync(path.join(outputDir, 'reviews.json'), JSON.stringify(rawReviews, null, 2));

    // 5. Save extracted options
    fs.writeFileSync(path.join(outputDir, 'extracted_options.json'), JSON.stringify(options, null, 2));

    const totalRev = rawOrders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'failed')
      .reduce((sum, o) => sum + parseFloat(o.total || '0'), 0)
      .toFixed(2);

    const manifest = {
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      source: 'mysql_dump',
      sourceFile: this.sqlFilePath,
      counts: {
        categories: rawCategories.length,
        products: rawProducts.length,
        productVariations: variationPosts.length,
        resolvedImages: totalResolvedImages,
        customers: rawCustomers.length,
        orders: rawOrders.length,
        coupons: posts.filter((p) => p.post_type === 'shop_coupon').length,
        reviews: rawReviews.length,
      },
      totalRevenue: totalRev,
      currency: 'INR',
    };
    fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log('[MySQL Parser] Zero-data-loss extraction completed successfully!');
    console.log(`- Categories: ${rawCategories.length}`);
    console.log(`- Products: ${rawProducts.length} (Variations: ${variationPosts.length}, Images: ${totalResolvedImages})`);
    console.log(`- Orders: ${rawOrders.length} (Revenue: ₹${totalRev})`);
    console.log(`- Customers: ${rawCustomers.length}`);
    console.log(`- Reviews: ${rawReviews.length}`);

    return {
      categoryCount: rawCategories.length,
      productCount: rawProducts.length,
      variationCount: variationPosts.length,
      imageCount: totalResolvedImages,
      orderCount: rawOrders.length,
      customerCount: rawCustomers.length,
      reviewCount: rawReviews.length,
    };
  }

  private decodeEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—');
  }

  private formatAttributeName(
    rawSlug: string,
    parsedAttributes: { name: string; slug?: string }[]
  ): string {
    const cleanSlug = rawSlug.replace(/^pa_/, '');
    const found = parsedAttributes.find(
      (a) =>
        a.slug?.replace(/^pa_/, '').toLowerCase() === cleanSlug.toLowerCase() ||
        a.name.toLowerCase().replace(/\s+/g, '-') === cleanSlug.toLowerCase()
    );
    if (found) return found.name;
    return cleanSlug
      .split(/[-_]/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ');
  }

  private resolveAttributeOptionLabel(
    rawSlug: string,
    optionSlugOrVal: string,
    linkedTax: { taxonomy: string; name: string; slug: string }[]
  ): string {
    if (!optionSlugOrVal) return '';
    const taxMatch = linkedTax.find(
      (t) =>
        (t.taxonomy === rawSlug || t.taxonomy === `pa_${rawSlug}`) &&
        (t.slug === optionSlugOrVal || t.name.toLowerCase() === optionSlugOrVal.toLowerCase())
    );
    if (taxMatch) return taxMatch.name;
    return optionSlugOrVal;
  }

  /**
   * Parses WooCommerce PHP-serialized `_product_attributes` metadata so custom and global attributes are preserved
   */
  private parseProductAttributes(
    serialized: string,
    linkedTax: { taxonomy: string; name: string; slug: string }[]
  ): {
    id: number;
    name: string;
    slug?: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }[] {
    if (!serialized) return [];
    const results: {
      id: number;
      name: string;
      slug?: string;
      position: number;
      visible: boolean;
      variation: boolean;
      options: string[];
    }[] = [];

    // Match each attribute block in PHP serialized array: s:N:"key";a:6:{...}
    const entryRegex = /s:\d+:"([^"]+)";a:\d+:\{([^}]+)\}/g;
    let m: RegExpExecArray | null;
    while ((m = entryRegex.exec(serialized)) !== null) {
      const attrKey = m[1];
      const body = m[2];
      const nameMatch = /s:4:"name";s:\d+:"([^"]*)"/.exec(body);
      const valMatch = /s:5:"value";s:\d+:"([^"]*)"/.exec(body);
      const posMatch = /s:8:"position";(?:i:(\d+)|s:\d+:"(\d+)")/.exec(body);
      const visMatch = /s:10:"is_visible";(?:i:(\d+)|s:\d+:"(\d+)")/.exec(body);
      const varMatch = /s:12:"is_variation";(?:i:(\d+)|s:\d+:"(\d+)")/.exec(body);
      const taxMatch = /s:11:"is_taxonomy";(?:i:(\d+)|s:\d+:"(\d+)")/.exec(body);

      const isTax = (taxMatch?.[1] || taxMatch?.[2]) === '1';
      const rawName = nameMatch?.[1] || attrKey;
      const displayName = isTax
        ? rawName
            .replace(/^pa_/, '')
            .split(/[-_]/)
            .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
            .join(' ')
        : rawName;

      let options: string[] = [];
      if (isTax) {
        options = linkedTax.filter((t) => t.taxonomy === rawName || t.taxonomy === attrKey).map((t) => t.name);
      } else if (valMatch?.[1]) {
        options = valMatch[1]
          .split('|')
          .map((o) => o.trim())
          .filter(Boolean);
      }

      results.push({
        id: 0,
        name: displayName,
        slug: attrKey,
        position: parseInt(posMatch?.[1] || posMatch?.[2] || String(results.length), 10),
        visible: (visMatch?.[1] || visMatch?.[2] || '1') === '1',
        variation: (varMatch?.[1] || varMatch?.[2] || '0') === '1',
        options,
      });
    }

    return results;
  }

  /**
   * Quote-aware SQL INSERT statement extractor so semicolons inside HTML descriptions or serialized PHP never truncate rows.
   */
  private extractInsertStatements(
    sql: string
  ): { tableName: string; columns: string[] | null; valuesBlock: string }[] {
    const statements: { tableName: string; columns: string[] | null; valuesBlock: string }[] = [];
    const headerRegex = /INSERT\s+(?:IGNORE\s+)?INTO\s+`?([a-zA-Z0-9_]+)`?\s*(?:\(([^)]+)\))?\s*VALUES\s*/gi;

    let match: RegExpExecArray | null;
    while ((match = headerRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const columnListRaw = match[2];
      const columns = columnListRaw
        ? columnListRaw.split(',').map((c) => c.replace(/[`\s]/g, '').toLowerCase())
        : null;

      let pos = headerRegex.lastIndex;
      let inQuote = false;
      let quoteChar = '';
      let isEscaped = false;
      const startValues = pos;

      while (pos < sql.length) {
        const ch = sql[pos];
        if (isEscaped) {
          isEscaped = false;
          pos++;
          continue;
        }
        if (ch === '\\' && inQuote) {
          isEscaped = true;
          pos++;
          continue;
        }
        if (inQuote) {
          if (ch === quoteChar) {
            if (sql[pos + 1] === quoteChar) {
              pos += 2;
              continue;
            }
            inQuote = false;
          }
          pos++;
          continue;
        }
        if (ch === "'" || ch === '"') {
          inQuote = true;
          quoteChar = ch;
          pos++;
          continue;
        }
        if (ch === ';') {
          break;
        }
        pos++;
      }

      const valuesBlock = sql.slice(startValues, pos);
      statements.push({ tableName, columns, valuesBlock });
      headerRegex.lastIndex = pos + 1;
    }

    return statements;
  }

  /**
   * Parses SQL VALUES rows: (1, 'val', NULL), (2, 'val2', ...) with full MySQL escape decoding
   */
  private splitSqlValues(valuesBlock: string): SqlCell[][] {
    const rows: SqlCell[][] = [];
    let inRow = false;
    let inQuote = false;
    let quoteChar = '';
    let isEscaped = false;
    let currentCell = '';
    let cellWasQuoted = false;
    let hasClosedQuote = false;
    let currentRow: SqlCell[] = [];

    const pushCell = () => {
      const trimmed = currentCell.trim();
      const isNull = !cellWasQuoted && trimmed.toUpperCase() === 'NULL';
      currentRow.push({
        value: isNull ? '' : cellWasQuoted ? currentCell : trimmed,
        isNull,
      });
      currentCell = '';
      cellWasQuoted = false;
      hasClosedQuote = false;
    };

    for (let i = 0; i < valuesBlock.length; i++) {
      const char = valuesBlock[i];

      if (isEscaped) {
        if (char === 'n') currentCell += '\n';
        else if (char === 'r') currentCell += '\r';
        else if (char === 't') currentCell += '\t';
        else if (char === '0') currentCell += '\0';
        else currentCell += char;
        isEscaped = false;
        continue;
      }

      if (char === '\\' && inQuote) {
        isEscaped = true;
        continue;
      }

      if (inQuote) {
        if (char === quoteChar) {
          if (valuesBlock[i + 1] === quoteChar) {
            currentCell += quoteChar;
            i++;
          } else {
            inQuote = false;
            hasClosedQuote = true;
          }
        } else {
          currentCell += char;
        }
        continue;
      }

      if ((char === "'" || char === '"') && inRow) {
        if (currentCell.trim() === '') {
          currentCell = '';
        }
        inQuote = true;
        cellWasQuoted = true;
        hasClosedQuote = false;
        quoteChar = char;
        continue;
      }

      if (char === '(' && !inRow) {
        inRow = true;
        currentRow = [];
        currentCell = '';
        cellWasQuoted = false;
        hasClosedQuote = false;
        continue;
      }

      if (char === ')' && inRow) {
        pushCell();
        rows.push(currentRow);
        currentRow = [];
        inRow = false;
        continue;
      }

      if (char === ',' && inRow) {
        pushCell();
        continue;
      }

      if (inRow && !hasClosedQuote) {
        currentCell += char;
      }
    }

    return rows;
  }
}
