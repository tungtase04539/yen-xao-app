import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Không tìm thấy trang',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-warm-white flex items-center justify-center py-16">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <div className="ornament-divider mb-6">
          <span className="text-gold text-lg">✦</span>
        </div>

        <p className="text-6xl md:text-7xl font-bold font-serif text-gradient-gold mb-4">404</p>

        <h1 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-3">
          Không tìm thấy trang
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Trang bạn tìm không tồn tại, đã được đổi đường dẫn hoặc đã ngừng hiển thị.
          Bạn có thể quay về trang chủ hoặc xem toàn bộ sản phẩm yến sào của QiQi.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-burgundy text-white font-semibold rounded-xl hover:bg-burgundy-light transition-colors"
          >
            Về trang chủ
          </Link>
          <Link
            href="/san-pham"
            className="px-6 py-3 border border-burgundy/30 text-burgundy font-semibold rounded-xl hover:bg-burgundy hover:text-white transition-colors"
          >
            Xem sản phẩm
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Cần hỗ trợ? Gọi hotline{' '}
          <a href="tel:0843623986" className="text-burgundy font-semibold hover:text-burgundy-light">
            0843.623986
          </a>
        </p>
      </div>
    </div>
  );
}
