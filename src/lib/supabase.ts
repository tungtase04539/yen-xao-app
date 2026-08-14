import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const isBrowser = typeof window !== "undefined";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // `cache: 'no-store'` CHỈ được ép ở phía trình duyệt, nơi panel /admin cần
  // đọc lại ngay sau khi ghi và PostgREST không trả Cache-Control nên trình duyệt
  // có thể tự cache theo heuristic.
  //
  // Ở phía server thì KHÔNG ép: Next 16 coi `cache: 'no-store'` là tín hiệu
  // markCurrentScopeAsDynamic, khiến MỌI route (kể cả các trang tĩnh, vì Footer
  // trong root layout cũng query Supabase) bail khỏi static generation và biến
  // `export const revalidate` + generateStaticParams thành mã chết.
  // Fetch mặc định của Next 15+ vốn đã không cache, nên bỏ override vẫn tươi dữ liệu.
  global: isBrowser
    ? {
        fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
      }
    : {},
});
