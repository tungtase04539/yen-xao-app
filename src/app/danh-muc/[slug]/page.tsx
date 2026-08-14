import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import CategoryPageClient from './CategoryPageClient';
import { SITE_URL, ogImage } from '@/lib/og';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Always fetch fresh data

export async function generateStaticParams() {
  const { data } = await supabase
    .from('categories')
    .select('slug')
    .eq('type', 'product');
  return (data || []).map((c) => ({ slug: c.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await supabase
    .from('categories')
    .select('name, description, image')
    .eq('slug', slug)
    .single();

  const title = category?.name || 'Danh mục sản phẩm';
  const description = category?.description || `Khám phá các sản phẩm ${category?.name || 'yến sào cao cấp'} tại QiQi Yến Sào.`;
  const image = ogImage(category?.image, title);
  const canonical = `${SITE_URL}/danh-muc/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'QiQi Yến Sào',
      url: canonical,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
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
