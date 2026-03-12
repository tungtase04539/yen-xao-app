import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  summary: string | null;
  created_at: string;
  content: string | null;
  category: { name: string } | null;
}

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export default async function HomeBlogSection() {
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, thumbnail, summary, created_at, content, category:categories(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3);

  const posts = (data as unknown as PostItem[]) || [];
  if (posts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-warm-white relative overflow-hidden">
      {/* Subtle decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-2">
              Kiến Thức &amp; Chia Sẻ
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
              Blog Yến Sào
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-burgundy hover:text-burgundy-light transition-colors group shrink-0"
          >
            Xem tất cả
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3-column equal grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Thumbnail — fixed 16:9 for all */}
              <div className="relative aspect-[16/9] bg-cream overflow-hidden shrink-0">
                {post.thumbnail ? (
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-burgundy/10 to-gold/10 text-4xl">
                    📝
                  </div>
                )}
                {post.category && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-burgundy/90 text-white backdrop-blur-sm">
                    {post.category.name}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-base font-bold font-serif text-foreground mb-2 line-clamp-2 group-hover:text-burgundy transition-colors leading-snug flex-1">
                  {post.title}
                </h3>
                {post.summary && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {post.summary}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-3 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gold/70" />
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold/70" />
                    {estimateReadTime(post.content)} phút đọc
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-burgundy text-burgundy font-semibold text-sm hover:bg-burgundy hover:text-white transition-all duration-300 group"
          >
            Xem tất cả bài viết
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
