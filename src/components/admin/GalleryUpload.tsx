'use client';

import { useState, useRef } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Upload, X, Loader2, Images, Film } from 'lucide-react';
import { toast } from 'sonner';

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;       // kept for backward compat, not used (images go to Cloudinary)
  folder?: string;
  max?: number;
}

export default function GalleryUpload({
  value,
  onChange,
  bucket: _bucket,
  folder = 'gallery',
  max = 8,
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.includes('/video/upload/');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = max - value.length;
    if (remaining <= 0) {
      toast.error(`Tối đa ${max} file`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      const filesToUpload = Array.from(files).slice(0, remaining);

      for (const file of filesToUpload) {
        const isImage = file.type.startsWith('image/');
        const isVid = file.type.startsWith('video/');
        if (!isImage && !isVid) continue;
        const maxSize = isVid ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          toast.error(`${file.name} quá lớn (tối đa ${isVid ? '50' : '5'}MB)`);
          continue;
        }

        try {
          const url = await uploadToCloudinary(file, `qiqi-yen/${folder}`);
          newUrls.push(url);
        } catch (err) {
          console.error(err);
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        toast.success(`Đã upload ${newUrls.length} file`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        Bộ sưu tập ảnh/video ({value.length}/{max})
      </label>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
            {isVideo(url) ? (
              <div className="w-full h-full bg-black/90 flex items-center justify-center relative">
                <video src={url} className="w-full h-full object-cover" muted playsInline />
                <Film className="absolute bottom-1 left-1 w-4 h-4 text-white/80" />
              </div>
            ) : (
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-burgundy/50 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Images className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Thêm ảnh/video</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      <p className="text-[10px] text-muted-foreground mt-1">Ảnh tối đa 5MB, video tối đa 50MB</p>
    </div>
  );
}
