import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import CategoryPageClient from './CategoryPageClient';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', slug)
    .single();

  return {
    title: category?.name || 'Danh mục sản phẩm',
    description: `Khám phá sản phẩm ${category?.name || 'yến sào cao cấp'} tại Yến Sào Cao Cấp.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || '1');
  const sort = sp.sort || 'newest';

  // Fetch category info
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  // Fetch products
  const limit = 12;
  const offset = (page - 1) * limit;

  const { data: products } = await supabase.rpc('get_products_with_min_price', {
    p_category_slug: slug,
    p_limit: limit,
    p_offset: offset,
    p_sort: sort,
  });

  const totalCount = products?.[0]?.total_count || 0;
  const totalPages = Math.ceil(Number(totalCount) / limit);

  return (
    <CategoryPageClient
      category={category}
      products={products || []}
      currentPage={page}
      totalPages={totalPages}
      currentSort={sort}
      slug={slug}
    />
  );
}
