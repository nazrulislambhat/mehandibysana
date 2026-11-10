/**
 * Strict TypeScript definitions for WooCommerce REST API v3 and Store API v1.
 */

export interface WCRestCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  count: number;
  image: {
    id: number;
    src: string;
    alt: string;
  } | null;
}

export interface WCRestImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WCRestAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WCRestProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: 'simple' | 'variable' | 'grouped' | 'external' | string;
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  price_html?: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder' | string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: WCRestImage[];
  attributes: WCRestAttribute[];
  variations: number[];
}

export interface WCRestVariation {
  id: number;
  sku: string;
  price: string;
  price_html?: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder' | string;
  image: WCRestImage | null;
  attributes: Array<{
    id: number;
    name: string;
    option: string;
  }>;
}

export interface WCStorePriceBlock {
  price: string;
  price_html?: string;
  regular_price: string;
  sale_price: string;
  price_range?: {
    min_amount: string;
    max_amount: string;
  } | null;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
}

export interface WCStoreImage {
  id: number;
  src: string;
  thumbnail: string;
  name: string;
  alt: string;
}

export interface WCStoreProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  short_description: string;
  description: string;
  sku: string;
  on_sale: boolean;
  is_in_stock: boolean;
  is_purchasable: boolean;
  prices: WCStorePriceBlock;
  images: WCStoreImage[];
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    has_variations: boolean;
    terms: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
  }>;
  variations: Array<{
    id: number;
    attributes: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

export interface WCStoreCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  sku: string;
  variation: Array<{
    attribute: string;
    value: string;
  }>;
  images: WCStoreImage[];
  prices: WCStorePriceBlock;
  totals: {
    line_subtotal: string;
    line_total: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  permalink: string;
}

export interface WCStoreCart {
  items: WCStoreCartItem[];
  items_count: number;
  needs_shipping: boolean;
  totals: {
    total_items: string;
    total_price: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
  errors: Array<{
    code: string;
    message: string;
  }>;
}

export interface WCStoreErrorResponse {
  code?: string;
  message?: string;
  data?: {
    status?: number;
  };
}

