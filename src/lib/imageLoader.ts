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

  // Supabase Storage — use built-in image transformation (Pro plan)
  // Converts to WebP automatically, resizes on edge CDN
  if (src.includes('supabase.co/storage/v1/object/public/')) {
    const transformed = src.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    return `${transformed}?width=${width}&quality=${quality || 80}&format=origin`;
  }

  return src;
}
