import { Suspense } from 'react';
import type { Metadata } from 'next';
import AllProductsClient from './AllProductsClient';

export const metadata: Metadata = {
  title: 'Tất Cả Sản Phẩm',
  description: 'Khám phá toàn bộ bộ sưu tập yến sào cao cấp — từ yến thô, yến tinh chế đến nước yến chưng sẵn và quà tặng sức khỏe.',
  openGraph: {
    title: 'Tất Cả Sản Phẩm | QiQi Yến Sào',
    description: 'Khám phá toàn bộ bộ sưu tập yến sào cao cấp — từ yến thô, yến tinh chế đến nước yến chưng sẵn và quà tặng sức khỏe.',
    type: 'website',
    url: 'https://qiqiyensao.com/san-pham',
    images: [
      {
        url: '/zalo-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Tất Cả Sản Phẩm - QiQi Yến Sào',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tất Cả Sản Phẩm | QiQi Yến Sào',
    description: 'Khám phá toàn bộ bộ sưu tập yến sào cao cấp — từ yến thô, yến tinh chế đến nước yến chưng sẵn và quà tặng sức khỏe.',
    images: ['/zalo-banner.jpg'],
  },
};

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <AllProductsClient />
    </Suspense>
  );
}
