'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ghi ra console để còn lần được stack ở production — Next chỉ gửi `digest`
    // xuống client, thông điệp lỗi thật bị che đi.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-warm-white flex items-center justify-center py-16">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <div className="ornament-divider mb-6">
          <span className="text-gold text-lg">✦</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-3">
          Đã có lỗi xảy ra
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Trang này không tải được. Bạn vui lòng thử lại, hoặc quay về trang chủ.
          Nếu lỗi vẫn tiếp diễn, hãy gọi hotline để chúng tôi hỗ trợ trực tiếp.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-burgundy text-white font-semibold rounded-xl hover:bg-burgundy-light transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-burgundy/30 text-burgundy font-semibold rounded-xl hover:bg-burgundy hover:text-white transition-colors"
          >
            Về trang chủ
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Cần hỗ trợ? Gọi hotline{' '}
          <a href="tel:0762936286" className="text-burgundy font-semibold hover:text-burgundy-light">
            0762.936.286
          </a>
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-muted-foreground/70">Mã lỗi: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
