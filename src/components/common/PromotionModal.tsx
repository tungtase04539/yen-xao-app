'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Check } from 'lucide-react';
import Image from 'next/image';

export default function PromotionModal() {
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
    window.open('https://m.me/qiqiyensao', '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop Blur overlay - Popmake dark blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container - Premium Popmake Split-pane Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-3xl overflow-visible rounded-[32px] border-2 border-[#C9A55A]/40 text-white shadow-[0_25px_60px_rgba(201,165,90,0.15)] bg-gradient-to-br from-[#42060f] to-[#280308]"
          >
            {/* Popmake Overlapping Close Button */}
            <button
              onClick={handleClose}
              className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-gold border-2 border-[#42060f] text-[#42060f] hover:scale-105 active:scale-95 hover:brightness-110 transition-all flex items-center justify-center shadow-lg z-50 cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Split-pane Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[30px] h-full">
              
              {/* Left Column: Image Banner (Grid span 5 on desktop) */}
              <div className="relative md:col-span-5 h-52 md:h-full min-h-[200px] bg-burgundy-dark/50 overflow-hidden border-b md:border-b-0 md:border-r border-[#C9A55A]/20">
                <Image
                  src="https://res.cloudinary.com/dmjrk2fov/image/upload/v1780063820/qiqi-yen/posts/ibiy6gtfwj3zidwzco0t.jpg"
                  alt="Combo 6 Vị Yến Sào Tri Ân"
                  fill
                  className="object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 30vw"
                  priority
                />
                
                {/* Gold Shimmer overlay on the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/20 md:to-black/40" />
                
                {/* Floating Badge MUA 6 TẶNG 6 */}
                <div className="absolute top-4 left-4 flex flex-col items-center bg-gradient-gold text-burgundy px-3 py-1.5 rounded-xl border border-white/20 shadow-lg animate-bounce">
                  <span className="text-[10px] font-black uppercase tracking-wider leading-none">Ưu Đãi Sốc</span>
                  <span className="text-sm font-black tracking-tight leading-none mt-0.5">MUA 6 TẶNG 6</span>
                </div>
              </div>

              {/* Right Column: Promotional Details (Grid span 7 on desktop) */}
              <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between relative bg-gradient-to-b from-transparent to-black/30">
                
                {/* Gold Shimmer element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A55A]/5 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-gold/15 border border-[#C9A55A]/30 text-[#f0dc9a] text-[10px] md:text-xs font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#C9A55A]" />
                    Chương trình tri ân đặc biệt
                  </div>

                  {/* Header Title */}
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-black text-[#f0dc9a] tracking-tight leading-tight mb-1">
                    ĐẠI TIỆC MIX 6 VỊ
                  </h3>
                  
                  {/* Subtitle */}
                  <h4 className="text-white/80 text-xs md:text-sm font-semibold tracking-widest uppercase mb-4">
                    Mua 6 hũ tặng ngay 6 hũ
                  </h4>

                  {/* Price Comparison Tag */}
                  <div className="flex items-center gap-3.5 mb-5 bg-[#C9A55A]/5 px-4 py-2 rounded-2xl border border-[#C9A55A]/10 w-fit">
                    <span className="text-white/40 line-through text-xs md:text-sm">720.000₫</span>
                    <span className="text-gradient-gold font-extrabold text-xl md:text-2xl animate-pulse">360.000₫</span>
                    <span className="text-white/80 text-[10px] font-medium uppercase px-2 py-0.5 rounded-md bg-[#C9A55A]/20">Tiết kiệm 50%</span>
                  </div>

                  {/* Bullet points USPs */}
                  <div className="space-y-2.5 text-white/95 text-xs md:text-sm mb-6 pr-2">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C9A55A] mt-0.5 shrink-0" />
                      <span><strong>2g yến khô nguyên chất</strong> chưng sẵn trong mỗi hũ.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C9A55A] mt-0.5 shrink-0" />
                      <span><strong>Đủ 6 vị chưng sẵn thượng hạng:</strong> Đường Phèn, Đường Kiêng Isomalt Đức, Đông Trùng, Sâm Đông Trùng, Sâm Đông Trùng Đường Kiêng, Đông Trùng Hạ Thảo 50%.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C9A55A] mt-0.5 shrink-0" />
                      <span>Thích hợp cho cả gia đình, người già kiêng ngọt &amp; mẹ bầu.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C9A55A] mt-0.5 shrink-0" />
                      <span>Miễn phí giao hàng toàn quốc + hộp quà đỏ sang trọng.</span>
                    </div>
                  </div>
                </div>

                {/* Call-to-Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleRedirect}
                    className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm md:text-base tracking-wide transition-all duration-300 hover:scale-[1.01] shadow-lg shadow-[#C9A55A]/10"
                    style={{
                      background: 'linear-gradient(135deg, #b8922a, #C9A55A 40%, #e8d48b 60%, #C9A55A 80%, #b8922a)',
                      color: '#2e0810',
                    }}
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    NHẬN ƯU ĐÃI QUA MESSENGER
                  </button>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleClose}
                      className="text-[11px] text-white/40 hover:text-[#f0dc9a] tracking-widest transition-colors uppercase font-bold"
                    >
                      Bỏ qua ưu đãi này
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
