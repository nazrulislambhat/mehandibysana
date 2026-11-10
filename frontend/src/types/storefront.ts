/**
 * Normalized Domain Types for Mehandi by Sana Headless Storefront.
 * Decouples UI components from raw MedusaJS / WooCommerce payloads.
 */

export interface StorefrontImage {
  id: number;
  src: string;
  alt: string;
}

export interface StorefrontCategory {
  id: number;
  medusaId?: string;
  name: string;
  slug: string;
  count: number;
}

export interface StorefrontVariationOption {
  attribute: string;
  value: string;
}

export interface StorefrontVariation {
  id: number;
  medusaVariantId?: string;
  sku: string;
  price: number;
  regularPrice: number | null;
  inStock: boolean;
  attributes: StorefrontVariationOption[];
  image: StorefrontImage | null;
}

export interface StorefrontProduct {
  id: number;
  medusaId?: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  type: string;
  price: number;
  maxPrice?: number | null;
  regularPrice: number | null;
  currencySymbol: string;
  onSale: boolean;
  inStock: boolean;
  featured: boolean;
  categories: Array<{ id: number; medusaId?: string; name: string; slug: string }>;
  images: StorefrontImage[];
  attributes: Array<{
    name: string;
    options: string[];
  }>;
  variations: StorefrontVariation[];
}

export interface StorefrontReview {
  id: number;
  productId: number;
  productName: string;
  reviewer: string;
  rating: number;
  review: string;
}

export interface CatalogSummary {
  totalProducts: number | null;
  ordersCount: number | null;
  featuredProducts: StorefrontProduct[];
  allProducts?: StorefrontProduct[];
  categories: StorefrontCategory[];
  reviews: StorefrontReview[];
  isConfigured: boolean;
  error: string | null;
}

export interface StorefrontCartItem {
  key: string;
  productId: number;
  medusaVariantId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currencySymbol: string;
  image: StorefrontImage | null;
  variationLabel: string | null;
  slug: string;
}

export interface StorefrontCart {
  items: StorefrontCartItem[];
  itemsCount: number;
  subtotal: number;
  total: number;
  currencySymbol: string;
}
