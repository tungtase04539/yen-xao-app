'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/admin/ImageUpload';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[200px] border rounded-lg flex items-center justify-center text-muted-foreground text-sm">Đang tải editor...</div>,
});

interface Category { id: string; name: string }

export default function PostFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('draft');
  const [publishedAt, setPublishedAt] = useState('');

  const generateSlug = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  useEffect(() => {
    supabase.from('categories').select('id, name').eq('type', 'blog').order('sort_order').then(({ data }) => setCategories(data || []));

    if (!isNew) {
      supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setSlug(data.slug);
          setThumbnail(data.thumbnail || '');
          setSummary(data.summary || '');
          setContent(data.content || '');
          setCategoryId(data.category_id || '');
          setStatus(data.status);
          if (data.published_at) {
            const d = new Date(data.published_at);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setPublishedAt(d.toISOString().slice(0, 16));
          }
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    setSaving(true);
    try {
      const postData = {
        title,
        slug: slug || generateSlug(title),
        thumbnail: thumbnail || null,
        summary: summary || null,
        content: content || null,
        category_id: categoryId || null,
        status,
        published_at: status === 'scheduled' && publishedAt
          ? new Date(publishedAt).toISOString()
          : status === 'published'
            ? new Date().toISOString()
            : null,
      };

      if (isNew) {
        const { error } = await supabase.from('posts').insert(postData);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').update(postData).eq('id', id);
        if (error) throw error;
      }

      toast.success(isNew ? 'Tạo bài viết thành công!' : 'Cập nhật thành công!');
      router.push('/admin/posts');
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-burgundy" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <h1 className="text-2xl font-bold font-serif text-burgundy">{isNew ? 'Thêm bài viết' : 'Chỉnh sửa bài viết'}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-burgundy hover:bg-burgundy-light gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tiêu đề *</label>
              <Input value={title} onChange={(e) => { setTitle(e.target.value); if (isNew) setSlug(generateSlug(e.target.value)); }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Danh mục</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full h-10 rounded-md border border-input px-3 text-sm bg-white">
                <option value="">-- Chọn --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Trạng thái</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-10 rounded-md border border-input px-3 text-sm bg-white">
                <option value="draft">Nháp</option>
                <option value="published">Đã đăng</option>
                <option value="scheduled">Lên lịch</option>
              </select>
            </div>
            {status === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Thời gian đăng</label>
              <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
            )}
          </div>
          <ImageUpload value={thumbnail} onChange={setThumbnail} bucket="posts" folder="thumbnails" label="Ảnh đại diện bài viết" />
          <div>
            <label className="block text-sm font-medium mb-1.5">Tóm tắt</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm resize-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Nội dung</h2>
          <RichTextEditor content={content} onChange={setContent} placeholder="Nội dung bài viết..." />
        </div>
      </div>
    </div>
  );
}
