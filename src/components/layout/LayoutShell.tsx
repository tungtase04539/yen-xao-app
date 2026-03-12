'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import SideCart from '@/components/layout/SideCart';
import FloatingActions from '@/components/layout/FloatingActions';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <SideCart />
      <FloatingActions />
    </>
  );
}

