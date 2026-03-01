import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChevronRight, Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase
    .from('posts')
    .select('title, summary')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) return { title: 'Bài viết không tìm thấy' };

  return {
    title: post.title,
    description: post.summary || undefined,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from('posts')
    .select('*, category:categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) notFound();

  // Related posts (same category)
  const { data: related } = await supabase
    .from('posts')
    .select('id, title, slug, thumbnail, created_at')
    .eq('status', 'published')
    .eq('category_id', post.category_id)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-burgundy transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-burgundy transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {post.category && (
              <span className="inline-block text-xs font-semibold text-gold uppercase tracking-wider mb-3">
                {post.category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-burgundy mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Thumbnail */}
          {post.thumbnail && (
            <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9] bg-cream">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${post.thumbnail})` }}
              />
            </div>
          )}

          {/* Content */}
          <article className="prose-content bg-white rounded-xl p-6 md:p-8 border border-border/50 shadow-sm">
            <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
          </article>

          {/* Related Posts */}
          {related && related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold font-serif text-burgundy mb-6">Bài viết liên quan</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border border-border/50 hover:shadow-md transition-all"
                  >
                    <div className="aspect-[16/9] bg-cream">
                      {r.thumbnail ? (
                        <div
                          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style={{ backgroundImage: `url(${r.thumbnail})` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📝</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-burgundy transition-colors">
                        {r.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(r.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
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
