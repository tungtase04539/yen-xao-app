'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, ArrowLeft, Eye, EyeOff, Upload, X, GripVertical, Film } from 'lucide-react';
import { toast } from 'sonner';
import { uploadToCloudinary } from '@/lib/cloudinary';
import ImageUpload from '@/components/admin/ImageUpload';

interface ExhibitionImage {
  id?: string;
  image_url: string;
  media_type: 'image' | 'video';
  caption: string;
  sort_order: number;
}

export default function ExhibitionFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [images, setImages] = useState<ExhibitionImage[]>([]);

  useEffect(() => {
    if (!isNew) {
      (async () => {
        const { data } = await supabase.from('exhibitions').select('*').eq('id', id).single();
        if (data) {
          setTitle(data.title);
          setLocation(data.location);
          setEventDate(data.event_date);
          setDescription(data.description || '');
          setThumbnail(data.thumbnail || '');
          setIsPublished(data.is_published ?? true);
        }
        const { data: imgs } = await supabase
          .from('exhibition_images')
          .select('*')
          .eq('exhibition_id', id)
          .order('sort_order');
        if (imgs) setImages(imgs.map((img: Record<string, unknown>) => ({ id: img.id as string, image_url: img.image_url as string, media_type: (img.media_type as 'image' | 'video') || 'image', caption: (img.caption as string) || '', sort_order: img.sort_order as number })));
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newItems: ExhibitionImage[] = [];

    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) continue;
      if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name} quá lớn (>50MB)`); continue; }

      try {
        const url = await uploadToCloudinary(file, 'qiqi-yen/exhibitions');
        newItems.push({ image_url: url, media_type: isVideo ? 'video' : 'image', caption: '', sort_order: images.length + newItems.length });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Upload ${file.name} thất bại: ${msg}`);
        console.error('Upload error:', err);
      }
    }

    setImages([...images, ...newItems]);
    setUploading(false);
    if (newItems.length > 0) toast.success(`Upload ${newItems.length} file thành công!`);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, caption: string) => {
    setImages(images.map((img, i) => i === index ? { ...img, caption } : img));
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Nhập tiêu đề'); return; }
    if (!location.trim()) { toast.error('Nhập địa điểm'); return; }
    if (!eventDate) { toast.error('Chọn ngày'); return; }

    setSaving(true);
    try {
      const exData = {
        title, location, event_date: eventDate,
        description: description || null,
        thumbnail: thumbnail || null,
        is_published: isPublished,
      };

      let exId = id;
      if (isNew) {
        const { data, error } = await supabase.from('exhibitions').insert(exData).select('id').single();
        if (error) throw error;
        exId = data.id;
      } else {
        const { error } = await supabase.from('exhibitions').update(exData).eq('id', id);
        if (error) throw error;
        // Delete old images
        await supabase.from('exhibition_images').delete().eq('exhibition_id', id);
      }

      // Insert images
      if (images.length > 0) {
        const imgData = images.map((img, i) => ({
          exhibition_id: exId,
          image_url: img.image_url,
          media_type: img.media_type || 'image',
          caption: img.caption || null,
          sort_order: i,
        }));
        const { error } = await supabase.from('exhibition_images').insert(imgData);
        if (error) throw error;
      }

      toast.success(isNew ? 'Tạo triển lãm thành công!' : 'Cập nhật thành công!');
      router.push('/admin/exhibitions');
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
          <Link href="/admin/exhibitions"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <h1 className="text-2xl font-bold font-serif text-burgundy">{isNew ? 'Thêm triển lãm' : 'Chỉnh sửa triển lãm'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline" size="sm"
            onClick={() => setIsPublished(!isPublished)}
            className={`gap-2 ${isPublished ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}
          >
            {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {isPublished ? 'Hiện' : 'Ẩn'}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-burgundy hover:bg-burgundy-light gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tiêu đề *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Triển lãm Yến Sào Quốc Tế" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Địa điểm *</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Hà Nội, Việt Nam" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Ngày diễn ra *</label>
            <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="max-w-xs" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Mô tả ngắn về sự kiện..."
              className="w-full rounded-md border border-input px-3 py-2 text-sm resize-none"
            />
          </div>
          <ImageUpload value={thumbnail} onChange={setThumbnail} bucket="products" folder="exhibitions" label="Ảnh đại diện mốc" />
        </div>

        {/* Media */}
        <div className="bg-white rounded-xl p-6 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Ảnh & Video ({images.length})</h2>
            <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-white text-sm font-medium hover:bg-secondary transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Đang upload...' : 'Thêm ảnh/video'}
              <input type="file" accept="image/*,video/*" multiple onChange={handleUploadFiles} className="hidden" />
            </label>
          </div>

          {images.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
              <GripVertical className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Chưa có ảnh/video. Click &quot;Thêm ảnh/video&quot; để upload.</p>
              <p className="text-xs mt-1 text-muted-foreground/60">Hỗ trợ: JPG, PNG, MP4, MOV (tối đa 50MB)</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-border/50">
                  {img.media_type === 'video' ? (
                    <div className="relative aspect-[4/3] bg-black">
                      <video src={img.image_url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center"><Film className="w-10 h-10 text-white/60" /></div>
                    </div>
                  ) : (
                    <img src={img.image_url} alt={img.caption || ''} className="w-full aspect-[4/3] object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${img.media_type === 'video' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                      {img.media_type === 'video' ? '🎬 Video' : '📷 Ảnh'}
                    </span>
                  </div>
                  <div className="p-2">
                    <input
                      type="text"
                      value={img.caption}
                      onChange={(e) => updateCaption(i, e.target.value)}
                      placeholder="Chú thích..."
                      className="w-full text-xs border border-input rounded px-2 py-1"
                    />
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
