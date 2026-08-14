/**
 * Helper dùng chung cho ảnh Open Graph (link preview trên Facebook / Zalo / Messenger).
 *
 * Vì sao cần file này:
 * - Facebook & Zalo chỉ render thẻ ảnh LỚN (summary_large_image) khi ảnh đạt tối thiểu
 *   600x315 px và tỉ lệ gần 1.91:1. Ảnh nhỏ hoặc gần vuông sẽ bị hạ cấp thành thẻ nhỏ
 *   (icon vuông bên trái) — đúng lỗi đã gặp ở trang /blog khi dùng /logo.png (328x362).
 * - og:image:width / og:image:height phải khớp kích thước THẬT của ảnh, nếu không
 *   trình thu thập sẽ dựng khung sai tỉ lệ.
 * - Zalo không đọc được webp/avif ⇒ ảnh Cloudinary phải ép về f_jpg, không dùng f_auto.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://qiqiyensao.com'
).replace(/\/+$/, '');

/** Kích thước chuẩn Facebook khuyến nghị cho ảnh chia sẻ. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Ảnh mặc định khi nội dung không có thumbnail riêng. */
export const OG_FALLBACK = '/zalo-banner.jpg';

/**
 * Kích thước THẬT của các ảnh tĩnh trong /public được dùng làm ảnh OG.
 * Cập nhật bảng này nếu thay file ảnh.
 */
const STATIC_OG_SIZES: Record<string, { width: number; height: number }> = {
  '/zalo-banner.jpg': { width: 1312, height: 738 },
  '/tri-an-khach-hang.jpg': { width: 1024, height: 576 },
  '/logo.jpg': { width: 1024, height: 576 },
};

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

/**
 * Chuẩn hoá một ảnh bất kỳ (Cloudinary, ảnh tĩnh /public, URL ngoài, hoặc rỗng)
 * thành ảnh OG hợp lệ để Facebook/Zalo luôn hiển thị thẻ preview lớn.
 */
export function ogImage(src: string | null | undefined, alt: string): OgImage {
  const raw = (src || '').trim();

  // 1) Cloudinary — ép crop đúng 1200x630, xuất jpg để Zalo đọc được.
  if (raw.includes('res.cloudinary.com') && raw.includes('/image/upload/')) {
    const t = `c_fill,g_auto,w_${OG_WIDTH},h_${OG_HEIGHT},q_auto,f_jpg`;

    // Thumbnail lưu trong DB thường ĐÃ kèm sẵn transform (vd `c_fill,h_576,w_1024`
    // và overlay `l_text:...`). Cloudinary chạy các transform tuần tự trái→phải,
    // nên phải chèn transform của mình vào CUỐI chuỗi — tức ngay trước `/v<version>/`.
    // Nếu chèn ngay sau `/image/upload/` thì transform cũ sẽ ghi đè, ảnh ra 1024x576
    // trong khi ta vẫn khai báo og:image:width=1200 ⇒ sai kích thước.
    const url = /\/v\d+\//.test(raw)
      ? raw.replace(/\/(v\d+)\//, `/${t}/$1/`)
      : raw.replace('/image/upload/', `/image/upload/${t}/`);

    return { url, width: OG_WIDTH, height: OG_HEIGHT, alt };
  }

  // 2) Ảnh tĩnh trong /public đã biết kích thước thật.
  const known = STATIC_OG_SIZES[raw];
  if (known) {
    return { url: `${SITE_URL}${raw}`, ...known, alt };
  }

  // 3) URL ngoài không rõ kích thước — vẫn dùng, nhưng KHÔNG khai báo width/height sai.
  if (/^https?:\/\//.test(raw)) {
    return { url: raw, alt };
  }

  // 4) Không có ảnh (hoặc ảnh tĩnh lạ) — dùng banner mặc định.
  return {
    url: `${SITE_URL}${OG_FALLBACK}`,
    ...STATIC_OG_SIZES[OG_FALLBACK],
    alt,
  };
}

/** Chỉ lấy URL — dùng cho trường `twitter.images` (không nhận width/height). */
export function ogImageUrl(src: string | null | undefined): string {
  return ogImage(src, '').url;
}
