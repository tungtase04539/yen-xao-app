import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/og';

/**
 * Sitemap đọc thẳng từ Supabase.
 *
 * Vì sao bắt buộc: phân trang ở /danh-muc/[slug] render bằng <button> + router.push
 * chứ không phải <a href>, còn /san-pham fetch danh sách trong useEffect — nên trong
 * HTML server-render chỉ có link tới 12 sản phẩm đầu của mỗi danh mục. Sản phẩm thứ 13
 * trở đi không có backlink nội bộ nào; nếu không liệt kê ở đây thì Google không có
 * đường nào khám phá ra chúng.
 */
export const revalidate = 3600;

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

// Các route tĩnh công khai. /checkout, /thank-you và /admin cố tình bị bỏ ra —
// chúng đã bị chặn trong robots.ts.
const STATIC_ROUTES: Array<{ path: string; changeFrequency: ChangeFrequency; priority: number }> = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/san-pham', changeFrequency: 'daily', priority: 0.9 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.7 },
  { path: '/gioi-thieu', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/trien-lam', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/lien-he', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/chinh-sach-bao-hanh', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/chinh-sach-giao-hang', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [{ data: categories }, { data: products }, { data: posts }] = await Promise.all([
    supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('type', 'product')
      .order('sort_order'),
    supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false }),
    // Cùng bộ lọc với /blog: bài 'scheduled' chỉ công khai khi đã tới giờ đăng.
    supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .in('status', ['published', 'scheduled'])
      .lte('published_at', now.toISOString())
      .order('published_at', { ascending: false }),
  ]);

  return [
    ...STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...(categories || []).map((c: { slug: string; updated_at: string | null }) => ({
      url: `${SITE_URL}/danh-muc/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...(products || []).map((p: { slug: string; updated_at: string | null }) => ({
      url: `${SITE_URL}/san-pham/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...(posts || []).map((p: { slug: string; updated_at: string | null; published_at: string | null }) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at || p.published_at || now),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
