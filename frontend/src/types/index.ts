export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number; // in INR rupees
  originalPrice?: number;
  inStock: boolean;
  options?: Record<string, string>;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  price: number; // in INR
  originalPrice?: number;
  onSale: boolean;
  inStock: boolean;
  isPerishable: boolean;
  thumbnail: string;
  images: ProductImage[];
  variants: ProductVariant[];
  ingredients?: string[];
  careInstructions?: string;
  features?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  thumbnail: string;
  handle: string;
  isPerishable?: boolean;
}

export interface DeliveryDetails {
  targetDate?: string;
  specialInstructions?: string;
  isGift?: boolean;
}

export interface BridalBookingInquiry {
  fullName: string;
  phone: string;
  email: string;
  eventDate: string;
  eventType: 'bridal' | 'engagement' | 'guest' | 'other';
  location: string;
  numberOfPeople: number;
  notes?: string;
}
