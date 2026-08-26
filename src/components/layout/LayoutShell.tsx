'use client';

import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import Header from '@/components/layout/Header';
import SideCart from '@/components/layout/SideCart';
import FloatingActions from '@/components/layout/FloatingActions';
import PromotionModal from '@/components/common/PromotionModal';
import { useCartHydration } from '@/store/cart';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // Nạp giỏ hàng sau khi hydrate xong, tránh lệch server/client ở badge giỏ
  useCartHydration();

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    // reducedMotion="user": framer-motion bỏ qua animate của transform/opacity
    // khi hệ điều hành đã bật "Giảm chuyển động" (CSS @media không chạm tới được).
    <MotionConfig reducedMotion="user">
      <Header />
      <main className="flex-1">{children}</main>
      <SideCart />
      <FloatingActions />
      <PromotionModal />
    </MotionConfig>
  );
}

