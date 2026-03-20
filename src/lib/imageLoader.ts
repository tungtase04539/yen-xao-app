'use client';

interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: ImageLoaderParams): string {
  // Local/static images — serve directly
  if (src.startsWith('/') || src.startsWith('data:')) {
    return src;
  }

  // Cloudinary — insert transform params into URL
  // e.g. res.cloudinary.com/xxx/image/upload/v123/file.jpg
  //   → res.cloudinary.com/xxx/image/upload/w_800,q_auto,f_auto/v123/file.jpg
  if (src.includes('res.cloudinary.com')) {
    const w = Math.min(width, 1200);
    const q = quality || 'auto';
    return src.replace('/image/upload/', `/image/upload/w_${w},q_${q},f_auto/`);
  }

  // Supabase Storage — use built-in image transformation (Pro plan)
  if (src.includes('supabase.co/storage/v1/object/public/')) {
    const transformed = src.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    const w = Math.min(width, 1920);
    return `${transformed}?width=${w}&quality=${quality || 75}&format=webp`;
  }

  return src;
}
