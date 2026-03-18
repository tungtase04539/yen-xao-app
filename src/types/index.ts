// ============================================================
// DATABASE TYPES
// ============================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  type: 'product' | 'blog';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  image_gallery: string[];
  short_description?: string;
  content?: string;
  category_id?: string;
  is_featured: boolean;
  type: 'simple' | 'variable';
  price: number;
  sale_price?: number;
  stock: number;
  sku?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  price: number;
  sale_price?: number;
  stock: number;
  sku?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  summary?: string;
  content?: string;
  category_id?: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  summary?: string;
  content?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_amount: number;
  discount_type: 'percent' | 'fixed';
  min_order_amount: number;
  max_discount?: number;
  start_date?: string;
  end_date?: string;
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number?: string;
  customer_name: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  ward: string;
  exact_address: string;
  order_notes?: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  coupon_code?: string;
  payment_method: 'COD' | 'BANK_TRANSFER';
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_title?: string;
  quantity: number;
  price: number;
  created_at: string;
}

// ============================================================
// CART TYPES
// ============================================================

export interface CartItem {
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_title?: string;
  thumbnail?: string;
  price: number;
  quantity: number;
  slug: string;
}

// ============================================================
// API / LISTING TYPES
// ============================================================

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  short_description?: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  is_featured: boolean;
  type: 'simple' | 'variable';
  price: number;
  sale_price?: number;
  min_variant_price?: number;
  min_variant_sale_price?: number;
  total_count?: number;
}

export type SortOption = 'popular' | 'newest' | 'price_asc' | 'price_desc';

export interface CouponValidation {
  valid: boolean;
  message?: string;
  discount_amount?: number;
  discount_type?: 'percent' | 'fixed';
  min_order_amount?: number;
  max_discount?: number;
}
