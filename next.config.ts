import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Skip Vercel image optimization — Supabase CDN already fast
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dxrogturyjgaxyiqpxhs.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Compress responses
  compress: true,
  // Cache headers for static assets
  async headers() {
    return [
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
