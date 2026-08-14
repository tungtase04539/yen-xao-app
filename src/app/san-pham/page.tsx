import { Suspense } from 'react';
import type { Metadata } from 'next';
import AllProductsClient from './AllProductsClient';
import { ogImage } from '@/lib/og';

const OG_PAGE = ogImage('/zalo-banner.jpg', 'Tất Cả Sản Phẩm - QiQi Yến Sào');

export const metadata: Metadata = {
  title: 'Tất Cả Sản Phẩm',
  description: 'Khám phá toàn bộ bộ sưu tập yến sào cao cấp — từ yến thô, yến tinh chế đến nước yến chưng sẵn và quà tặng sức khỏe.',
  openGraph: {
    title: 'Tất Cả Sản Phẩm | QiQi Yến Sào',
    description: 'Khám phá toàn bộ bộ sưu tập yến sào cao cấp — từ yến thô, yến tinh chế đến nước yến chưng sẵn và quà tặng sức khỏe.',
    type: 'website',
    url: 'https://qiqiyensao.com/san-pham',
    images: [OG_PAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tất Cả Sản Phẩm | QiQi Yến Sào',
    description: 'Khám phá toàn bộ bộ sưu tập yến sào cao cấp — từ yến thô, yến tinh chế đến nước yến chưng sẵn và quà tặng sức khỏe.',
    images: [OG_PAGE.url],
  },
};

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <AllProductsClient />
    </Suspense>
  );
}
