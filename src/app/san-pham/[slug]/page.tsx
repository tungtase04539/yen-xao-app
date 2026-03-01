import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from './ProductDetailClient';
import type { Product } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description')
    .eq('slug', slug)
    .single();

  return {
    title: product?.name || 'Chi tiết sản phẩm',
    description: product?.short_description || 'Sản phẩm yến sào cao cấp',
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch product with category and variants
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      variants:product_variants(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🕊️</div>
          <h1 className="text-2xl font-bold font-serif text-burgundy mb-2">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-muted-foreground mb-6">
            Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <a href="/" className="text-burgundy font-semibold hover:text-burgundy-light">
            ← Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  // Sort variants by sort_order
  if (product.variants) {
    product.variants.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
  }

  // Fetch related products (same category)
  const { data: relatedProducts } = await supabase.rpc('get_products_with_min_price', {
    p_category_slug: product.category?.slug || null,
    p_limit: 4,
    p_offset: 0,
    p_sort: 'popular',
  });

  // Filter out current product
  const related = (relatedProducts || []).filter(
    (p: { id: string }) => p.id !== product.id
  );

  return (
    <ProductDetailClient
      product={product as Product}
      relatedProducts={related}
    />
  );
}
