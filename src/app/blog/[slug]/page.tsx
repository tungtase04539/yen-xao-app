import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ChevronRight, Calendar, User, ArrowLeft, Clock } from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yensaocaocap.vn';

export const revalidate = 60; // ISR: revalidate every 60 seconds

// Pre-generate published blog post pages at build time
export async function generateStaticParams() {
  const { data } = await supabase
    .from('posts')
    .select('slug')
    .in('status', ['published', 'scheduled'])
    .lte('published_at', new Date().toISOString());
  return (data || []).map((post) => ({ slug: post.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase
    .from('posts')
    .select('title, summary, thumbnail, created_at, updated_at, author, published_at')
    .eq('slug', slug)
    .in('status', ['published', 'scheduled'])
    .lte('published_at', new Date().toISOString())
    .single();

  if (!post) return { title: 'Bài viết không tìm thấy' };

  const canonical = `${SITE_URL}/blog/${slug}`;
  const ogImage = post.thumbnail || `${SITE_URL}/logo.png`;

  return {
    title: post.title,
    description: post.summary || `Đọc bài viết "${post.title}" tại QiQi Yến Sào — kiến thức yến sào và sức khỏe.`,
    alternates: { canonical },
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.summary || `Đọc bài viết tại QiQi Yến Sào.`,
      url: canonical,
      type: 'article',
      siteName: 'QiQi Yến Sào',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      authors: [post.author],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || `Đọc bài viết tại QiQi Yến Sào.`,
      images: [ogImage],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from('posts')
    .select('*, category:categories(name, slug)')
    .eq('slug', slug)
    .in('status', ['published', 'scheduled'])
    .lte('published_at', new Date().toISOString())
    .single();

  if (!post) notFound();

  // Related posts (same category)
  const { data: related } = await supabase
    .from('posts')
    .select('id, title, slug, thumbnail, created_at, published_at, summary')
    .in('status', ['published', 'scheduled'])
    .lte('published_at', new Date().toISOString())
    .eq('category_id', post.category_id)
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(3);

  const canonical = `${SITE_URL}/blog/${slug}`;
  const readTime = estimateReadTime(post.content);

  // JSON-LD Article Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || '',
    image: post.thumbnail || `${SITE_URL}/logo.png`,
    url: canonical,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'QiQi Yến Sào',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    ...(post.category && { articleSection: post.category.name }),
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs — schema.org BreadcrumbList */}
      <nav aria-label="breadcrumb" className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <ol
            className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="hover:text-burgundy transition-colors" itemProp="item">
                <span itemProp="name">Trang chủ</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/blog" className="hover:text-burgundy transition-colors" itemProp="item">
                <span itemProp="name">Blog</span>
              </Link>
              <meta itemProp="position" content="2" />
              <meta itemProp="item" content={`${SITE_URL}/blog`} />
            </li>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <li
              className="text-foreground font-medium line-clamp-1 max-w-[200px]"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span itemProp="name">{post.title}</span>
              <meta itemProp="position" content="3" />
              <meta itemProp="item" content={canonical} />
            </li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="inline-block text-xs font-semibold text-gold uppercase tracking-wider mb-3 hover:text-gold-dark transition-colors"
              >
                {post.category.name}
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-burgundy mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span rel="author">{post.author}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readTime} phút đọc
              </span>
            </div>
          </header>

          {/* Thumbnail — dùng <img> có alt để Google index */}
          {post.thumbnail && (
            <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9] relative bg-cream">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {/* Content */}
          <article
            className="prose-content bg-white rounded-xl p-6 md:p-8 border border-border/50 shadow-sm"
            itemScope
            itemType="https://schema.org/BlogPosting"
          >
            <meta itemProp="url" content={canonical} />
            <meta itemProp="datePublished" content={post.created_at} />
            <meta itemProp="author" content={post.author} />
            <div itemProp="articleBody" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
          </article>

          {/* Related Posts */}
          {related && related.length > 0 && (
            <section className="mt-12" aria-label="Bài viết liên quan">
              <h2 className="text-xl font-bold font-serif text-burgundy mb-6">Bài viết liên quan</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border border-border/50 hover:shadow-md transition-all"
                  >
                    <div className="aspect-[16/9] bg-cream relative overflow-hidden">
                      {r.thumbnail ? (
                        <Image
                          src={r.thumbnail}
                          alt={r.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📝</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-burgundy transition-colors">
                        {r.title}
                      </h3>
                      <time className="text-xs text-muted-foreground mt-1 block" dateTime={r.created_at}>
                        {new Date(r.created_at).toLocaleDateString('vi-VN')}
                      </time>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to blog */}
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-burgundy hover:text-burgundy-light transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
