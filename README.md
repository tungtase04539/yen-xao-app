# QiQi Yến Sào

Website thương mại điện tử bán yến sào (https://qiqiyensao.com): danh mục sản phẩm,
trang chi tiết có biến thể, giỏ hàng, checkout COD, blog, và một panel quản trị ở `/admin`.

## Công nghệ

- **Next.js 16 (App Router)** + **React 19** + **TypeScript strict**
- **Tailwind CSS v4** với primitive UI theo chuẩn shadcn ở `src/components/ui/`
- **Supabase** là toàn bộ tầng dữ liệu — Postgres (sản phẩm, đơn hàng, bài viết, trang CMS),
  Storage (ảnh bài viết) và Auth (đăng nhập admin). Client khởi tạo ở `src/lib/supabase.ts`.
- **Cloudinary** để lưu và biến đổi ảnh sản phẩm. `next.config.ts` đặt `images.loader = 'custom'`
  trỏ tới `src/lib/imageLoader.ts` — loader này thêm transform Cloudinary cho URL Cloudinary
  và trả nguyên xi đường dẫn `/...` trong `public/`. Ảnh upload từ panel admin đi qua một
  **unsigned upload preset** của Cloudinary, cấu hình ở `src/lib/cloudinary.ts`.
- **Zustand** giữ giỏ hàng (persist vào localStorage), **react-hook-form + zod** cho form checkout.

## Yêu cầu môi trường

- Node.js 20.6 trở lên (các script trong `scripts/` dùng cờ `--env-file`; máy đang dev chạy Node 24)
- npm

## Biến môi trường

Sao chép `.env.example` thành `.env.local` rồi điền giá trị thật:

```bash
cp .env.example .env.local
```

Hai biến **bắt buộc** để app chạy được — thiếu là mọi route chết ngay lúc nạp module với lỗi
`supabaseUrl is required.`:

| Biến | Lấy ở đâu |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |

`NEXT_PUBLIC_SITE_URL` (canonical URL + ảnh Open Graph) và cặp `NEXT_PUBLIC_CLOUDINARY_*`
là tuỳ chọn — bỏ trống thì dùng giá trị mặc định trong code. Các biến còn lại trong
`.env.example` chỉ phục vụ script trong `scripts/`, không cần để chạy app.

> `.env.local` bị gitignore và phải giữ nguyên như vậy. Không hardcode khoá vào mã nguồn —
> `SUPABASE_SERVICE_ROLE_KEY` bypass toàn bộ RLS.

## Chạy dự án

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # bản production
npm start       # chạy bản đã build
npm run lint
```

## Cấu trúc chính

```
src/app/                 route công khai (App Router)
src/app/admin/           panel quản trị: sản phẩm, đơn hàng, mã giảm giá, bài viết, trang, slide
src/app/checkout/        giỏ hàng → đặt hàng (server action trong actions.ts)
src/components/          layout, khối trang chủ, primitive UI
src/lib/                 supabase client, image loader, helper Open Graph, sanitize HTML
src/store/               state giỏ hàng (zustand)
scripts/                 script vận hành chạy một lần bằng node, KHÔNG phải một phần bản build
```

## Script vận hành

Các script trong `scripts/` chạy trực tiếp bằng `node`, không đi qua Next.js nên không tự nạp
`.env.local` — phải truyền cờ `--env-file`:

```bash
node --env-file=.env.local scripts/test_db_query.mjs
```

`scripts/migrate_supabase.mjs` là job một lần và **có tính phá huỷ**: nó DROP CASCADE 16 bảng
trên project đích trước khi dựng lại. Mặc định script chạy dry-run — chỉ in ra target ref cùng
danh sách bảng sắp xoá. Muốn chạy thật phải có cả cờ `--yes` lẫn biến `MIGRATE_CONFIRM_DROP_REF`
đúng bằng ref của project đích. Backup trước khi chạy.
