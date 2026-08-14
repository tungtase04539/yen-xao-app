import DOMPurify from 'isomorphic-dompurify';

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

const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'src', 'alt', 'title', 'width', 'height', 'loading',
  'class', 'style',
  'colspan', 'rowspan',
];

/**
 * @param html HTML thô lấy từ database
 * @returns HTML đã loại bỏ script, event handler và các URI nguy hiểm
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Chặn javascript:, data: (trừ ảnh), vbscript:
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    // Không cho phép <form>, <input>… kể cả khi lọt whitelist qua namespace lạ
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'formaction', 'srcdoc'],
    // Giữ nội dung text của thẻ bị loại thay vì xoá trắng cả đoạn
    KEEP_CONTENT: true,
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
