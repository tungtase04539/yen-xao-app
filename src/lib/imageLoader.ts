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
  // Resize + WebP on edge CDN, massively reduces bandwidth
  if (src.includes('supabase.co/storage/v1/object/public/')) {
    const transformed = src.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    // Cap width to reasonable max — no need to serve 4000px images
    const w = Math.min(width, 1920);
    return `${transformed}?width=${w}&quality=${quality || 75}&format=webp`;
  }

  return src;
}
