'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

declare global {
  interface Window {
    __lenis?: Lenis;
    __lenisRaf?: number;
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function createLenisInstance() {
  // Clean up any existing instance
  if (window.__lenisRaf) cancelAnimationFrame(window.__lenisRaf);
  if (window.__lenis) window.__lenis.destroy();

  // Smooth scroll làm cuộn trôi thêm ~1,2s sau khi ngừng thao tác — mất phản hồi 1:1,
  // đúng kiểu gây triệu chứng tiền đình. Người đã bật "Giảm chuyển động" thì cuộn gốc.
  if (prefersReducedMotion()) return;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
  });
  window.__lenis = lenis;

  function raf(time: number) {
    lenis.raf(time);
    window.__lenisRaf = requestAnimationFrame(raf);
  }
  window.__lenisRaf = requestAnimationFrame(raf);
}

export function destroyLenis() {
  if (window.__lenisRaf) {
    cancelAnimationFrame(window.__lenisRaf);
    window.__lenisRaf = undefined;
  }
  if (window.__lenis) {
    window.__lenis.destroy();
    window.__lenis = undefined;
  }
}

export function restoreLenis() {
  createLenisInstance();
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    createLenisInstance();
    return () => destroyLenis();
  }, []);

  return <>{children}</>;
}
