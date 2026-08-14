import HeroSlider, { type Slide } from '@/components/home/HeroSlider';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryTabs, { type CategoryTab } from '@/components/home/CategoryTabs';
import PressSection from '@/components/home/PressSection';
import Certifications from '@/components/home/Certifications';
import HomeBlogSection from '@/components/home/HomeBlogSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { supabase } from '@/lib/supabase';
import type { ProductListItem } from '@/types';

export const revalidate = 60;

interface CategoryWithCount extends CategoryTab {
  products: { count: number }[] | null;
}

export default async function Home() {
  // Fetch phía server để ảnh hero nằm sẵn trong HTML đầu tiên — trình duyệt
  // preload được ảnh LCP thay vì phải chờ bundle JS → hydrate → round-trip REST.
  const [slidesRes, featuredRes, categoriesRes] = await Promise.all([
    supabase
      .from('hero_slides')
      .select('id, title, subtitle, button_text, button_link, background_image, mobile_image, gradient')
      .eq('is_active', true)
      .order('sort_order'),
    supabase.rpc('get_products_with_min_price', {
      p_is_featured: true,
      p_limit: 4,
      p_offset: 0,
      p_sort: 'newest',
    }),
    // `products.is_active=eq.true` lọc ngay trong subquery đếm, nếu không thì một
    // danh mục toàn hàng đã ẩn vẫn được cấp tab rồi dẫn khách vào lưới rỗng.
    supabase
      .from('categories')
      .select('id, name, slug, products(count)')
      .eq('type', 'product')
      .eq('products.is_active', true),
  ]);

  const categories = ((categoriesRes.data as CategoryWithCount[] | null) ?? [])
    .map((cat) => ({ ...cat, productCount: cat.products?.[0]?.count ?? 0 }))
    .filter((cat) => cat.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .map(({ id, name, slug }) => ({ id, name, slug }));

  const { data: categoryProducts } = categories.length > 0
    ? await supabase.rpc('get_products_with_min_price', {
        p_category_slug: categories[0].slug,
        p_limit: 4,
        p_offset: 0,
        p_sort: 'popular',
      })
    : { data: [] as ProductListItem[] };

  return (
    <>
      {/* Trang chủ không có tiêu đề dạng chữ nào (hero slide chỉ là ảnh), nên h1
          để ẩn về mặt thị giác — vẫn cho screen reader và crawler một tiêu đề cấp 1. */}
      <h1 className="sr-only">
        QiQi Yến Sào — Yến thô, yến tinh chế và yến chưng sẵn nguyên chất
      </h1>
      <HeroSlider slides={(slidesRes.data as Slide[] | null) ?? []} />
      <ScrollReveal><FeaturedProducts products={(featuredRes.data as ProductListItem[] | null) ?? []} /></ScrollReveal>
      <ScrollReveal><CategoryTabs categories={categories} initialProducts={(categoryProducts as ProductListItem[] | null) ?? []} /></ScrollReveal>
      <ScrollReveal><PressSection /></ScrollReveal>
      <ScrollReveal><Certifications /></ScrollReveal>
      <ScrollReveal><HomeBlogSection /></ScrollReveal>
    </>
  );
}
