import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Package, Phone, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Đặt Hàng Thành Công',
  description: 'Cảm ơn bạn đã đặt hàng tại Yến Sào Cao Cấp.',
};

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderNumber = sp.order;

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-border/50 shadow-lg">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold font-serif text-burgundy mb-3">
            Đặt Hàng Thành Công!
          </h1>

          {orderNumber && (
            <p className="text-lg text-foreground mb-2">
              Mã đơn hàng: <span className="font-bold font-mono text-burgundy">{orderNumber}</span>
            </p>
          )}

          <p className="text-muted-foreground leading-relaxed mb-8">
            Cảm ơn bạn đã tin tưởng Yến Sào Cao Cấp. Đơn hàng của bạn đang được
            xử lý và chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-cream text-center">
              <Package className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Giao hàng dự kiến</p>
              <p className="text-sm font-semibold">2 - 5 ngày</p>
            </div>
            <div className="p-4 rounded-xl bg-cream text-center">
              <Phone className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Hotline hỗ trợ</p>
              <p className="text-sm font-semibold">0843.623986</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-burgundy text-white rounded-full font-semibold hover:bg-burgundy-light transition-colors"
            >
              Tiếp tục mua sắm
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
