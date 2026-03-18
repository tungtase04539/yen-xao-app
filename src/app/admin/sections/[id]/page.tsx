'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, ArrowLeft, Eye, EyeOff, Upload, X, Film, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SectionMedia {
  id?: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
  sort_order: number;
}

export default function SectionFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [sectionType, setSectionType] = useState('nha-may');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [media, setMedia] = useState<SectionMedia[]>([]);

  useEffect(() => {
    if (!isNew) {
      (async () => {
        const { data } = await supabase.from('page_sections').select('*').eq('id', id).single();
        if (data) {
          setTitle(data.title);
          setSectionType(data.section_type);
          setDescription(data.description || '');
          setSortOrder(data.sort_order || 0);
          setIsPublished(data.is_published ?? true);
        }
        const { data: mediaItems } = await supabase
          .from('section_media')
          .select('*')
          .eq('section_id', id)
          .order('sort_order');
        if (mediaItems) setMedia(mediaItems.map((m: Record<string, unknown>) => ({
          id: m.id as string,
          media_url: m.media_url as string,
          media_type: (m.media_type as 'image' | 'video') || 'image',
          caption: (m.caption as string) || '',
          sort_order: m.sort_order as number,
        })));
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newMedia: SectionMedia[] = [];

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) continue;
      if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name} quá lớn (>50MB)`); continue; }

      try {
        const ext = file.name.split('.').pop();
        const fileName = `sections/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('products').upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
        newMedia.push({
          media_url: publicUrl,
          media_type: isVideo ? 'video' : 'image',
          caption: '',
          sort_order: media.length + newMedia.length,
        });
      } catch {
        toast.error(`Upload ${file.name} thất bại`);
      }
    }

    setMedia([...media, ...newMedia]);
    setUploading(false);
    if (newMedia.length > 0) toast.success(`Upload ${newMedia.length} file thành công!`);
    e.target.value = '';
  };

  const removeMedia = (index: number) => setMedia(media.filter((_, i) => i !== index));
  const updateCaption = (index: number, caption: string) => setMedia(media.map((m, i) => i === index ? { ...m, caption } : m));

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Nhập tiêu đề'); return; }
    setSaving(true);
    try {
      const sectionData = {
        title, section_type: sectionType,
        description: description || null,
        sort_order: sortOrder, is_published: isPublished,
        page_slug: 'gioi-thieu',
      };

      let sectionId = id;
      if (isNew) {
        const { data, error } = await supabase.from('page_sections').insert(sectionData).select('id').single();
        if (error) throw error;
        sectionId = data.id;
      } else {
        const { error } = await supabase.from('page_sections').update(sectionData).eq('id', id);
        if (error) throw error;
        await supabase.from('section_media').delete().eq('section_id', id);
      }

      if (media.length > 0) {
        const mediaData = media.map((m, i) => ({
          section_id: sectionId,
          media_url: m.media_url,
          media_type: m.media_type,
          caption: m.caption || null,
          sort_order: i,
        }));
        const { error } = await supabase.from('section_media').insert(mediaData);
        if (error) throw error;
      }

      toast.success(isNew ? 'Tạo mục thành công!' : 'Cập nhật thành công!');
      router.push('/admin/sections');
    } catch {
      toast.error('Lưu thất bại');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-burgundy" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/sections"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <h1 className="text-2xl font-bold font-serif text-burgundy">{isNew ? 'Thêm mục' : 'Chỉnh sửa mục'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsPublished(!isPublished)}
            className={`gap-2 ${isPublished ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}>
            {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {isPublished ? 'Hiện' : 'Ẩn'}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-burgundy hover:bg-burgundy-light gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tiêu đề *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Nhà Máy Sản Xuất" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Loại mục</label>
              <select value={sectionType} onChange={(e) => setSectionType(e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm">
                <option value="nha-may">🏭 Nhà Máy</option>
                <option value="nha-yen">🏠 Nhà Yến</option>
                <option value="co-so-thuc-te">📸 Cơ Sở Thực Tế</option>
                <option value="other">📋 Khác</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Thứ tự</label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="max-w-[100px]" />
            <p className="text-xs text-muted-foreground mt-1">Số nhỏ hiện trước</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="Mô tả về mục này..." className="w-full rounded-md border border-input px-3 py-2 text-sm resize-none" />
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Ảnh & Video ({media.length})</h2>
            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-white text-sm font-medium hover:bg-secondary transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Đang upload...' : 'Thêm ảnh/video'}
              <input type="file" accept="image/*,video/*" multiple onChange={handleUploadFiles} className="hidden" />
            </label>
          </div>

          {media.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Chưa có ảnh/video. Click &quot;Thêm ảnh/video&quot; để upload.</p>
              <p className="text-xs mt-1 text-muted-foreground/60">Hỗ trợ: JPG, PNG, MP4, MOV (tối đa 50MB)</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((m, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-border/50">
                  {m.media_type === 'video' ? (
                    <div className="relative aspect-[4/3] bg-black">
                      <video src={m.media_url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Film className="w-10 h-10 text-white/60" />
                      </div>
                    </div>
                  ) : (
                    <img src={m.media_url} alt={m.caption || ''} className="w-full aspect-[4/3] object-cover" />
                  )}
                  <button type="button" onClick={() => removeMedia(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${m.media_type === 'video' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                      {m.media_type === 'video' ? '🎬 Video' : '📷 Ảnh'}
                    </span>
                  </div>
                  <div className="p-2">
                    <input type="text" value={m.caption} onChange={(e) => updateCaption(i, e.target.value)}
                      placeholder="Chú thích..." className="w-full text-xs border border-input rounded px-2 py-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
