import sanitize from 'sanitize-html';

/**
 * Làm sạch HTML trước khi đưa vào `dangerouslySetInnerHTML`.
 *
 * Vì sao bắt buộc: nội dung bài viết / trang tĩnh / mô tả sản phẩm được soạn
 * bằng TipTap rồi lưu thẳng vào Supabase dưới dạng HTML thô. Bảng `posts`,
 * `pages`, `products` hiện chưa bật RLS nên bất kỳ ai có anon key (khoá này
 * nằm sẵn trong bundle JS phía client) cũng ghi được vào đó. Nếu render thẳng
 * thì đây là stored XSS: kẻ tấn công chèn <script> hoặc <img onerror=...>,
 * chiếm session của admin đang đăng nhập rồi thao tác trên toàn bộ CMS.
 *
 * Dùng `sanitize-html` chứ không dùng DOMPurify: DOMPurify phía server kéo theo
 * jsdom, mà jsdom 30 gọi `webidl.util.markAsUncloneable` — API chỉ có từ Node 22.
 * Server production đang chạy Node 20 nên build sẽ chết. sanitize-html là thuần
 * JavaScript, không cần DOM giả lập, chạy được từ Node 18.
 *
 * Whitelist dưới đây phủ đúng những thẻ TipTap có thể sinh ra (StarterKit +
 * Image + Link + TextAlign + Underline), không hơn.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark', 'sub', 'sup',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
];

/**
 * @param html HTML thô lấy từ database
 * @returns HTML đã loại bỏ script, event handler và các URI nguy hiểm
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      '*': ['class', 'style', 'title'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    // Chặn javascript:, vbscript:, data: (trừ ảnh inline)
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    // Link ra ngoài luôn kèm rel an toàn, tránh tabnabbing
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.target === '_blank'
          ? { ...attribs, rel: 'noopener noreferrer' }
          : attribs,
      }),
    },
    // Bỏ hẳn nội dung bên trong các thẻ nguy hiểm thay vì giữ lại text
    nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'iframe'],
  });
}

/**
 * Escape chuỗi trước khi nhúng vào <script type="application/ld+json">.
 *
 * `JSON.stringify` KHÔNG escape `<`, nên một tiêu đề bài viết chứa
 * `</script><script>...` sẽ thoát ra khỏi thẻ script và chạy được — đúng
 * đường ghi ẩn danh nói trên. Escape `<`, `>`, `&` về dạng unicode để chuỗi
 * vẫn là JSON hợp lệ nhưng không thể đóng thẻ.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
