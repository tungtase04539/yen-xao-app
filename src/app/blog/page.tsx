import { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChevronRight, Calendar, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tin tức, kiến thức về yến sào và sức khỏe.',
};

interface PostItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  summary: string | null;
  created_at: string;
  author: string;
  category: { name: string; slug: string } | null;
}

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, thumbnail, summary, created_at, author, category:categories(name, slug)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const postList = (posts as unknown as PostItem[]) || [];

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-burgundy-dark to-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Blog Yến Sào</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Kiến thức, tin tức và bí quyết sử dụng yến sào hiệu quả
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-burgundy transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Blog</span>
          </div>
        </div>
      </div>

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
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[16/9] bg-cream overflow-hidden">
                  {post.thumbnail ? (
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url(${post.thumbnail})` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">📝</div>
                  )}
                </div>
                <div className="p-5">
                  {post.category && (
                    <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                      {post.category.name}
                    </span>
                  )}
                  <h2 className="text-lg font-bold font-serif text-foreground mt-1 mb-2 line-clamp-2 group-hover:text-burgundy transition-colors">
                    {post.title}
                  </h2>
                  {post.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {post.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
