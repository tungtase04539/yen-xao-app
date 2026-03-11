/**
 * Supabase Image Transform Helper
 * Converts Supabase storage URLs to use the image transformation API
 * which serves WebP format with optimal sizes — much faster loading.
 *
 * Docs: https://supabase.com/docs/guides/storage/serving/image-transformations
 */

interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transforms a Supabase storage URL to use the render/image API.
 * Returns the original URL if it's not a Supabase storage URL.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: TransformOptions = {}
): string {
  if (!url) return '';

  // Only transform Supabase storage URLs
  if (!url.includes('.supabase.co/storage/v1/object/')) {
    return url;
  }

  const {
    width = 1920,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options;

  // Convert: /storage/v1/object/public/... → /storage/v1/render/image/public/...
  const transformedUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (quality) params.set('quality', String(quality));
  if (format) params.set('format', format);
  if (resize) params.set('resize', resize);

  return `${transformedUrl}?${params.toString()}`;
}

// Preset helpers for common use cases
export const imgHero = (url: string | null) =>
  getOptimizedImageUrl(url, { width: 1920, quality: 80, format: 'webp' });

export const imgCard = (url: string | null) =>
  getOptimizedImageUrl(url, { width: 600, quality: 80, format: 'webp' });

export const imgThumb = (url: string | null) =>
  getOptimizedImageUrl(url, { width: 300, quality: 75, format: 'webp' });

export const imgCert = (url: string | null) =>
  getOptimizedImageUrl(url, { width: 400, quality: 80, format: 'webp' });
