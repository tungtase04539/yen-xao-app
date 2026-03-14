'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, Tv, Upload, Play } from 'lucide-react';
import { toast } from 'sonner';

interface PressVideo {
  id: string;
  title: string;
  channel_name: string;
  video_url: string;
  thumbnail_url: string | null;
  sort_order: number;
}

export default function PressVideosAdminPage() {
  const [videos, setVideos] = useState<PressVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumb, setSelectedThumb] = useState<File | null>(null);
  const [form, setForm] = useState({ title: '', channel_name: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('press_videos')
      .select('*')
      .order('sort_order');
    if (data) setVideos(data);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handlePickFile = () => fileRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxMB = 500;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File quá lớn (${(file.size/1024/1024).toFixed(0)}MB). Giới hạn ${maxMB}MB. Hãy nén video trước.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleSave = async () => {
    if (!form.title || !form.channel_name) {
      toast.error('Vui lòng nhập tiêu đề và tên kênh');
      return;
    }
    if (!selectedFile) {
      toast.error('Vui lòng chọn file video');
      return;
    }
    setSaving(true);

    const file = selectedFile;
    const ext = file.name.split('.').pop();
    const path = `press/${Date.now()}.${ext}`;

    // Upload video
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      toast.error('Upload thất bại: ' + uploadError.message);
      setSaving(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path);
    const video_url = urlData.publicUrl;

    // Upload thumbnail if provided
    let thumbnail_url: string | null = null;
    if (selectedThumb) {
      const tExt = selectedThumb.name.split('.').pop();
      const tPath = `press-thumbs/${Date.now()}.${tExt}`;
      const { error: tErr } = await supabase.storage
        .from('videos')
        .upload(tPath, selectedThumb, { contentType: selectedThumb.type, upsert: false });
      if (!tErr) {
        const { data: tUrl } = supabase.storage.from('videos').getPublicUrl(tPath);
        thumbnail_url = tUrl.publicUrl;
      }
    }

    const { error } = await supabase.from('press_videos').insert({
      title: form.title,
      channel_name: form.channel_name,
      video_url,
      thumbnail_url,
      sort_order: form.sort_order,
    });

    if (error) {
      toast.error('Lưu thất bại: ' + error.message);
    } else {
      toast.success('Đã thêm video!');
      setForm({ title: '', channel_name: '', sort_order: 0 });
      setSelectedFile(null);
      setSelectedThumb(null);
      if (fileRef.current) fileRef.current.value = '';
      if (thumbRef.current) thumbRef.current.value = '';
      fetchVideos();
    }
    setSaving(false);
  };

  const handleDelete = async (video: PressVideo) => {
    if (!confirm(`Xóa "${video.title}"?`)) return;

    // Extract storage path from URL
    const pathMatch = video.video_url.match(/\/videos\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from('videos').remove([pathMatch[1]]);
    }

    await supabase.from('press_videos').delete().eq('id', video.id);
    toast.success('Đã xóa');
    fetchVideos();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Tv className="w-6 h-6 text-burgundy" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Truyền Hình Đưa Tin</h1>
          <p className="text-sm text-muted-foreground">Upload clip truyền hình giới thiệu QiQi Yến</p>
        </div>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm clip mới
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tiêu đề clip *</label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="VD: QiQi Yến trên VTV1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tên kênh *</label>
            <Input
              value={form.channel_name}
              onChange={e => setForm({ ...form, channel_name: e.target.value })}
              placeholder="VD: VTV1, Hải Phòng TV..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Thứ tự hiển thị</label>
            <Input
              type="number"
              value={form.sort_order}
              onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* File picker */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">File video *</label>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {selectedFile ? (
            <div className="flex items-center gap-3 w-full border-2 border-green-200 bg-green-50 rounded-xl px-4 py-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <Tv className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{selectedFile.name}</p>
                <p className="text-xs text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button onClick={() => { setSelectedFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="shrink-0 text-xs text-red-500 hover:underline">
                Đổi file
              </button>
            </div>
          ) : (
            <button onClick={handlePickFile} className="flex items-center gap-2 w-full border-2 border-dashed border-border rounded-xl px-4 py-5 text-sm text-muted-foreground hover:border-burgundy hover:text-burgundy transition-colors">
              <Upload className="w-5 h-5" />
              <span>Chọn file video (.mp4, .webm, .mov...)</span>
            </button>
          )}
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Video sẽ upload lên Supabase Storage bucket <code className="bg-secondary px-1 rounded">videos</code>
          </p>
        </div>

        {/* Thumbnail picker */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ảnh preview (tuỳ chọn)</label>
          <input
            ref={thumbRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) setSelectedThumb(f); }}
          />
          {selectedThumb ? (
            <div className="flex items-center gap-3 w-full border-2 border-blue-200 bg-blue-50 rounded-xl px-4 py-3">
              <img
                src={URL.createObjectURL(selectedThumb)}
                alt="preview"
                className="w-16 h-10 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-800 truncate">{selectedThumb.name}</p>
              </div>
              <button onClick={() => { setSelectedThumb(null); if (thumbRef.current) thumbRef.current.value = ''; }} className="shrink-0 text-xs text-red-500 hover:underline">
                Đổi ảnh
              </button>
            </div>
          ) : (
            <button onClick={() => thumbRef.current?.click()} className="flex items-center gap-2 w-full border-2 border-dashed border-border rounded-xl px-4 py-4 text-sm text-muted-foreground hover:border-burgundy hover:text-burgundy transition-colors">
              <Upload className="w-4 h-4" />
              <span>Chọn ảnh thumbnail (.jpg, .png, .webp...)</span>
            </button>
          )}
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Video sẽ upload lên Supabase Storage bucket <code className="bg-secondary px-1 rounded">videos</code>
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-burgundy hover:bg-burgundy/90 text-white"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang upload...</> : 'Lưu clip'}
        </Button>
      </div>

      {/* Video list */}
      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">
          Danh sách clip ({videos.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-border p-12 text-center">
            <Tv className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Chưa có clip nào. Thêm clip đầu tiên ở trên.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((v) => (
              <div key={v.id} className="bg-white rounded-2xl border border-border p-4 flex gap-4 items-start">
                {/* Thumbnail / video preview */}
                <div className="shrink-0 w-40 rounded-xl overflow-hidden bg-gray-100 relative group" style={{ aspectRatio: '16/9' }}>
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <video src={v.video_url} className="w-full h-full object-cover" preload="none" />
                  )}
                  {/* Overlay: change thumb */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-semibold gap-1 flex-col">
                    <Upload className="w-4 h-4" />
                    <span>{v.thumbnail_url ? 'Đổi ảnh' : 'Thêm ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const tExt = file.name.split('.').pop();
                        const tPath = `press-thumbs/${Date.now()}.${tExt}`;
                        const { error: tErr } = await supabase.storage
                          .from('videos')
                          .upload(tPath, file, { contentType: file.type, upsert: false });
                        if (tErr) { toast.error('Upload ảnh thất bại: ' + tErr.message); return; }
                        const { data: tUrl } = supabase.storage.from('videos').getPublicUrl(tPath);
                        const { error } = await supabase.from('press_videos')
                          .update({ thumbnail_url: tUrl.publicUrl })
                          .eq('id', v.id);
                        if (error) { toast.error('Cập nhật thất bại'); } else { toast.success('Đã cập nhật ảnh preview!'); fetchVideos(); }
                      }}
                    />
                  </label>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.channel_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Thứ tự: {v.sort_order}</p>
                  {v.thumbnail_url
                    ? <p className="text-xs text-green-600 mt-1">✓ Có ảnh preview</p>
                    : <p className="text-xs text-amber-500 mt-1">⚠ Chưa có ảnh — hover vào video để thêm</p>
                  }
                  <a href={v.video_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-burgundy hover:underline mt-2">
                    <Play className="w-3 h-3" /> Xem video
                  </a>
                </div>

                {/* Delete */}
                <button onClick={() => handleDelete(v)} className="shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

