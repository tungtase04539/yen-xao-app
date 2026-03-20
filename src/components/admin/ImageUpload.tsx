'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2, ImagePlus, Film } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  accept?: string;        // e.g. "image/*,video/mp4,video/webm"
  maxSizeMB?: number;     // default 5
}

export default function ImageUpload({
  value,
  onChange,
  bucket = 'products',
  folder = 'thumbnails',
  label = 'Ảnh đại diện',
  accept = 'image/*',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

  // Compress image client-side: resize to max 1200px, convert to WebP
  const compressImage = (file: File, maxWidth = 1200, quality = 0.82): Promise<File> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' }));
            } else {
              resolve(file); // Keep original if compression didn't help
            }
          },
          'image/webp',
          quality
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowsVideo = accept.includes('video') || accept === '*';
    const allowsImage = accept.includes('image') || accept === '*';

    const isFileVideo = file.type.startsWith('video/');
    const isFileImage = file.type.startsWith('image/');

    if (!isFileVideo && !isFileImage) {
      toast.error('Định dạng file không hợp lệ');
      return;
    }
    if (isFileImage && !allowsImage) {
      toast.error('Chỉ chấp nhận file video');
      return;
    }
    if (isFileVideo && !allowsVideo) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File phải nhỏ hơn ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    try {
      // Compress images before upload (resize + WebP)
      const uploadFile = isFileImage ? await compressImage(file) : file;
      const ext = uploadFile.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, uploadFile, { cacheControl: '2592000', upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onChange(publicUrl);
      toast.success('Upload thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Upload thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => onChange('');

  const acceptedLabel = accept.includes('video')
    ? 'PNG, JPG, WebP, MP4, WebM'
    : 'PNG, JPG, WebP';

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="flex items-start gap-3">
        {/* Preview */}
        <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
          {value ? (
            <>
              {isVideo(value) ? (
                <video src={value} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            accept.includes('video')
              ? <Film className="w-8 h-8 text-muted-foreground/40" />
              : <ImagePlus className="w-8 h-8 text-muted-foreground/40" />
          )}
        </div>

        {/* Upload button + URL input */}
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-white text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Đang upload...' : 'Chọn file'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleUpload}
            className="hidden"
          />
          <p className="text-[11px] text-muted-foreground">{acceptedLabel}. Tối đa {maxSizeMB}MB</p>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="hoặc nhập URL..."
            className="w-full h-8 rounded-md border border-input px-2.5 text-xs bg-white"
          />
        </div>
      </div>
    </div>
  );
}
