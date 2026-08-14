import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
  // Compress responses
  compress: true,
  // Cache headers for static assets
  async headers() {
    return [
      {
        // Chặn clickjacking: không có gì ngăn trang lạ nhúng /admin vào iframe
        // trong suốt rồi lừa admin đang đăng nhập click xuyên qua.
        // Chỉ giới hạn việc site NÀY bị người khác nhúng — không ảnh hưởng
        // ảnh/video nhúng vào trong trang.
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
