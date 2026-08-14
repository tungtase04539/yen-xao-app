import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/og';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /admin lộ dữ liệu khách hàng, /checkout và /thank-you là trang phễu
      // theo phiên — không có giá trị tìm kiếm và không được phép index.
      disallow: ['/admin', '/checkout', '/thank-you'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
