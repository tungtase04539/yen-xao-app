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

  const [featured, ...rest] = posts;

  return (
    <section className="py-16 md:py-24 bg-warm-white relative overflow-hidden">
      {/* Bg decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gold/[0.025] blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="ornament-divider mb-4">
            <span className="text-gold text-base">✦</span>
          </div>
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-gold mb-3">
            Kiến Thức &amp; Chia Sẻ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
            Blog Yến Sào
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base">
            Bí quyết sử dụng yến sào, lợi ích sức khỏe và những kiến thức bổ ích dành cho bạn
          </p>
        </div>

        {/* Grid layout: featured large + 2 smaller */}
        <div className="grid lg:grid-cols-5 gap-6 mb-10">
          {/* Featured post */}
          <Link
            href={`/blog/${featured.slug}`}
            className="lg:col-span-3 group block bg-white rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-[16/9] bg-cream overflow-hidden relative">
              {featured.thumbnail ? (
                <Image
                  src={featured.thumbnail}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-burgundy/10 to-gold/10 text-5xl">📝</div>
              )}
              {featured.category && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-burgundy text-white">
                  {featured.category.name}
                </span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl md:text-2xl font-bold font-serif text-foreground mb-3 line-clamp-2 group-hover:text-burgundy transition-colors leading-snug">
                {featured.title}
              </h3>
              {featured.summary && (
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                  {featured.summary}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold/70" />
                  {new Date(featured.created_at).toLocaleDateString('vi-VN')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold/70" />
                  {estimateReadTime(featured.content)} phút đọc
                </span>
              </div>
            </div>
          </Link>

          {/* Right — smaller posts */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {rest.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex gap-4 bg-white rounded-2xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="relative w-28 md:w-36 shrink-0 aspect-square bg-cream overflow-hidden">
                  {post.thumbnail ? (
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="144px"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-burgundy/10 to-gold/10 text-3xl">📝</div>
                  )}
                </div>
                <div className="flex-1 py-4 pr-4 flex flex-col justify-between min-w-0">
                  <div>
                    {post.category && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="text-sm font-bold font-serif text-foreground mt-1 line-clamp-2 group-hover:text-burgundy transition-colors leading-snug">
                      {post.title}
                    </h3>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                    <Calendar className="w-3 h-3 text-gold/70" />
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-burgundy text-burgundy font-semibold text-sm hover:bg-burgundy hover:text-white transition-all duration-300 group"
          >
            Xem tất cả bài viết
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
