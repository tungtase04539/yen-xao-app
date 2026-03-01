import { Suspense } from 'react';
import type { Metadata } from 'next';
import AllProductsClient from './AllProductsClient';

export const metadata: Metadata = {
  title: 'Tất Cả Sản Phẩm',
  description: 'Khám phá toàn bộ bộ sưu tập yến sào cao cấp — từ yến thô, yến tinh chế đến nước yến và quà tặng.',
};

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <AllProductsClient />
    </Suspense>
  );
}
