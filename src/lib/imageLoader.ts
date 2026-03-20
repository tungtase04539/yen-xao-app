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

  // Remote images — route through wsrv.nl CDN proxy
  // wsrv.nl fetches from Supabase once, caches globally, serves fast
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: (quality || 80).toString(),
    output: 'webp',
  });

  return `https://wsrv.nl/?${params.toString()}`;
}
