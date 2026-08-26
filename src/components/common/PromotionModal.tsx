'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PromotionModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup in this session
    const hasSeenPromo = sessionStorage.getItem('qiqi_promo_seen');
    if (!hasSeenPromo) {
      // Show popup after a 1.5 seconds delay to create a premium flow
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('qiqi_promo_seen', 'true');
  };

  const handleRedirect = () => {
    sessionStorage.setItem('qiqi_promo_seen', 'true');
    setIsOpen(false);
    // Dẫn vào danh mục yến chưng sẵn thay vì Messenger: đơn đặt qua website mới
    // vào bảng orders và mới được server tính lại giá, kiểm tồn kho.
    router.push('/danh-muc/yen-chung-san');
  };

  return (
    // Dùng Radix Dialog thay cho overlay tự viết: có sẵn role/aria-modal, focus trap,
    // đóng bằng Escape, khóa cuộn nền và trả focus về nơi cũ.
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[100] bg-black/75 backdrop-blur-md"
        className="z-[100] w-full max-w-[calc(100%-2rem)] sm:max-w-[380px] p-0 gap-0 overflow-hidden max-h-[92dvh] overflow-y-auto rounded-[24px] border-[#C9A55A]/30 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] bg-gradient-to-b from-[#42060f] to-[#1a0205]"
      >
        <DialogTitle className="sr-only">
          Yến Tươi Chưng Sẵn — Mua 10 Tặng 1, chỉ 85.000₫ mỗi hũ
        </DialogTitle>
        <DialogDescription className="sr-only">
          Hũ 75ml chứa 8g tổ yến thật, chưng thủ công mỗi ngày. Sáu vị để chọn: đường phèn, táo đỏ, hạt sen, đông trùng, kỷ tử, hạt chia. Mua 10 tặng 1 áp dụng cho cả hũ 75ml và 150ml.
        </DialogDescription>

        {/* Popmake Overlapping Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg z-50 cursor-pointer border border-white/20"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clickable Image Banner */}
        <button
          type="button"
          onClick={handleRedirect}
          aria-label="Xem các vị Yến Tươi chưng sẵn"
          className="relative aspect-[2/3] max-h-[62dvh] w-full cursor-pointer overflow-hidden bg-[#8a0f18]"
        >
          <Image
            src="https://res.cloudinary.com/dmjrk2fov/image/upload/q_auto,f_auto,w_900/v1787742599/qiqi-yen/2026-moi/poster-bang-gia.jpg"
            alt="Yến Tươi QiQi chưng sẵn - 8g tổ yến thật mỗi hũ, mua 10 tặng 1"
            fill
            className="object-contain transition-transform duration-700 ease-out hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
          {/* Subtle overlay shine */}
          <span className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </button>

        {/* Bottom Call-To-Action (CTA) */}
        <div className="p-5 md:p-6 bg-gradient-to-b from-black/40 to-black/80 flex flex-col items-center">
          <button
            type="button"
            onClick={handleRedirect}
            className="group relative flex items-center justify-center gap-2.5 w-full py-3.5 md:py-4 rounded-xl font-bold text-sm md:text-base tracking-wider transition-all duration-300 hover:scale-[1.01] hover:brightness-110 active:scale-95 shadow-[0_4px_25px_rgba(201,165,90,0.35)]"
            style={{
              background: 'linear-gradient(135deg, #b8922a, #C9A55A 40%, #e8d48b 60%, #C9A55A 80%, #b8922a)',
              color: '#2e0810',
            }}
          >
            <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
            <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.51 3.71 7.24.19.15.31.38.31.62l.01 2.15c0 .49.52.81.96.58l2.4-1.28c.18-.1.38-.13.58-.08 1.25.32 2.6.5 4.03.5 5.52 0 10-4.14 10-9.25S17.52 2 12 2zm1.09 12.3L10.5 11.7l-4.5 3 4.91-5.22 2.59 2.6 4.5-3-4.91 5.22z"/>
            </svg>
            XEM CÁC VỊ YẾN TƯƠI — TỪ 85.000₫
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="mt-3 text-[10px] text-white/60 hover:text-[#C9A55A] tracking-widest transition-colors uppercase font-bold"
          >
            Bỏ qua ưu đãi này
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
