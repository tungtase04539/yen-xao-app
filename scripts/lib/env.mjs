/**
 * Đọc biến môi trường cho các script trong scripts/.
 *
 * Các script này chạy bằng `node`, không đi qua Next.js nên KHÔNG tự nạp .env.local.
 * Cách chạy: node --env-file=.env.local scripts/<tên script>.mjs
 */

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Thiếu biến môi trường ${name}. Xem .env.example, khai báo trong .env.local ` +
        `rồi chạy lại bằng: node --env-file=.env.local scripts/<script>.mjs`
    );
  }
  return value;
}
