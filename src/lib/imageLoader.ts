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

  // Supabase Storage — serve original image directly
  // (Image transformation only available on Pro plan)
  if (src.includes('supabase.co/storage/v1/object/public/')) {
    return src;
  }

  return src;
}
