'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

interface PostRow {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  status: string;
  created_at: string;
  category: { name: string } | null;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, thumbnail, status, created_at, category:categories(name)')
      .order('created_at', { ascending: false });
    setPosts((data as unknown as PostRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa bài viết "${title}"?`)) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) { toast.error('Xóa bài viết thất bại'); return; }
    toast.success('Đã xóa bài viết');
    fetchPosts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-serif text-burgundy">Bài viết</h1>
        <Link href="/admin/posts/new">
          <Button className="bg-burgundy hover:bg-burgundy-light gap-2">
            <Plus className="w-4 h-4" /> Thêm bài viết
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-medium">Danh mục</th>
              <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium">Ngày tạo</th>
              <th className="text-right px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Chưa có bài viết</td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-lg shrink-0">
                      {p.thumbnail ? (
                        <div className="w-full h-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${p.thumbnail})` }} />
                      ) : '📝'}
                    </div>
                    <span className="font-medium line-clamp-1">{p.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category?.name || '—'}</td>
                <td className="px-4 py-3">
                  <Badge className={`text-xs ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status === 'published' ? 'Đã đăng' : 'Nháp'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(p.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/posts/${p.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Pencil className="w-3.5 h-3.5" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDelete(p.id, p.title)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
