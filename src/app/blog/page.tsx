import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ChevronRight, Calendar, User, Clock } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yensaocaocap.vn';

export const metadata: Metadata = {
  title: 'Blog Yến Sào | Kiến Thức Sức Khỏe & Bí Quyết Dùng Yến',
  description:
    'Khám phá kiến thức về yến sào, lợi ích sức khỏe, cách dùng yến sào hiệu quả và các tin tức mới nhất từ QiQi Yến Sào — thương hiệu yến sào cao cấp Khánh Hòa.',
  keywords: [
    'blog yến sào',
    'kiến thức yến sào',
    'lợi ích yến sào',
    'cách dùng yến sào',
    'yến sào sức khỏe',
    'yến sào Khánh Hòa',
  ],
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Blog Yến Sào | Kiến Thức Sức Khỏe & Bí Quyết Dùng Yến',
    description:
      'Khám phá kiến thức về yến sào, lợi ích sức khỏe và tin tức mới nhất từ QiQi Yến Sào.',
    url: `${SITE_URL}/blog`,
    type: 'website',
    siteName: 'QiQi Yến Sào',
    images: [{ url: `${SITE_URL}/logo.png`, width: 800, height: 600, alt: 'QiQi Yến Sào Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Yến Sào | QiQi Yến Sào',
    description: 'Kiến thức, tin tức và bí quyết sử dụng yến sào hiệu quả.',
    images: [`${SITE_URL}/logo.png`],
  },
};

interface PostItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  summary: string | null;
  created_at: string;
  author: string;
  content: string | null;
  category: { name: string; slug: string } | null;
}

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, thumbnail, summary, created_at, author, content, category:categories(name, slug)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const postList = (posts as unknown as PostItem[]) || [];

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <div className="bg-gradient-dark-luxury text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="ornament-divider mb-6">
            <span className="text-gold text-lg">✦</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Blog Yến Sào</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Kiến thức, tin tức và bí quyết sử dụng yến sào hiệu quả
          </p>
        </div>
      </div>

      {/* Breadcrumb — schema-friendly nav */}
      <nav aria-label="breadcrumb" className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="hover:text-burgundy transition-colors" itemProp="item">
                <span itemProp="name">Trang chủ</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <ChevronRight className="w-3.5 h-3.5" />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="text-foreground font-medium" itemProp="name">Blog</span>
              <meta itemProp="position" content="2" />
              <meta itemProp="item" content={`${SITE_URL}/blog`} />
            </li>
          </ol>
        </div>
      </nav>

      {/* Post Grid */}
      <div className="container mx-auto px-4 py-12">
        {postList.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Chưa có bài viết nào</h2>
            <p className="text-muted-foreground">Các bài viết sẽ sớm được cập nhật!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postList.map((post) => (
              <article key={post.id} itemScope itemType="https://schema.org/BlogPosting">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="aspect-[16/9] bg-cream overflow-hidden relative">
                    {post.thumbnail ? (
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        itemProp="image"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📝</div>
                    )}
                  </div>
                  <div className="p-5">
                    {post.category && (
                      <span className="text-xs font-semibold text-gold uppercase tracking-wider" itemProp="articleSection">
                        {post.category.name}
                      </span>
                    )}
                    <h2 className="text-lg font-bold font-serif text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-burgundy transition-colors" itemProp="headline">
                      {post.title}
                    </h2>
                    {post.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4" itemProp="description">
                        {post.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span itemProp="author">{post.author}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <time dateTime={post.created_at} itemProp="datePublished">
                          {new Date(post.created_at).toLocaleDateString('vi-VN')}
                        </time>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimateReadTime(post.content)} phút đọc
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
