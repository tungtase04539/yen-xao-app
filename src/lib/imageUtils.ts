/**
 * Image URL helper — pass-through (Supabase Transform API requires Pro plan)
 * All functions return the original URL unchanged.
 */
export const getOptimizedImageUrl = (url: string | null | undefined): string => url ?? '';
export const imgHero  = (url: string | null | undefined) => url ?? '';
export const imgCard  = (url: string | null | undefined) => url ?? '';
export const imgThumb = (url: string | null | undefined) => url ?? '';
export const imgCert  = (url: string | null | undefined) => url ?? '';

export const isCloudinary = (url: string) =>
  url.includes('res.cloudinary.com') && url.includes('/image/upload/');

/**
 * Dựng URL Cloudinary kèm transform resize/nén.
 *
 * Ảnh lưu trong DB thường ĐÃ kèm sẵn transform (vd `c_fill,h_576,w_1024` cộng
 * overlay `l_text:...`). Cloudinary chạy các transform tuần tự trái→phải, nên
 * transform của mình phải nằm ở CUỐI chuỗi — tức ngay trước `/v<version>/`.
 * Nếu chèn ngay sau `/image/upload/` thì transform lưu sẵn sẽ ghi đè, và mọi ảnh
 * tải về đúng kích thước cũ bất kể `sizes` yêu cầu bao nhiêu. (Cùng quy tắc với
 * src/lib/og.ts.)
 */
export function cloudinaryUrl(
  src: string,
  width: number,
  quality: number | string = 'auto',
): string {
  const t = `w_${width},q_${quality},f_auto`;
  return /\/v\d+\//.test(src)
    ? src.replace(/\/(v\d+)\//, `/${t}/$1/`)
    : src.replace('/image/upload/', `/image/upload/${t}/`);
}

/** srcset nhiều bề rộng cho ảnh Cloudinary; ảnh nguồn khác trả về undefined. */
export function cloudinarySrcSet(
  src: string,
  widths: number[],
  quality: number | string = 'auto',
): string | undefined {
  if (!isCloudinary(src)) return undefined;
  return widths.map((w) => `${cloudinaryUrl(src, w, quality)} ${w}w`).join(', ');
}
