'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function NewsletterCTA() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #fffdf8 0%, #f5f0e8 50%, #fffdf8 100%)',
    }}>
      {/* Decorative gold elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        {/* Corner ornaments */}
        <svg className="absolute top-6 left-6 w-16 h-16 text-gold/10" viewBox="0 0 64 64">
          <path d="M0 0L64 0L64 8L8 8L8 64L0 64Z" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-6 right-6 w-16 h-16 text-gold/10 rotate-180" viewBox="0 0 64 64">
          <path d="M0 0L64 0L64 8L8 8L8 64L0 64Z" fill="currentColor" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
            <span className="text-gold text-xl">✦</span>
            <div className="w-12 h-[1px]" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-burgundy mb-5 tracking-tight">
            Nhận Ưu Đãi Đặc Biệt
          </h2>
          <p className="text-muted-foreground mb-10 text-sm md:text-base max-w-md mx-auto">
            Đăng ký để nhận thông tin khuyến mãi và ưu đãi độc quyền từ Yến Sào Cao Cấp
          </p>

          {/* Email Form */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              className="flex-1 px-6 py-4 rounded-full border-2 text-sm bg-white focus:outline-none focus:ring-0 transition-colors"
              style={{ borderColor: 'rgba(212,175,55,0.2)', }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#d4af37'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'}
            />
            <button className="group px-8 py-4 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #e8d48b, #d4af37)',
                color: '#7c000a',
                boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
              }}
            >
              Đăng Ký
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <p className="text-muted-foreground/50 text-xs mt-5">
            Chúng tôi tôn trọng quyền riêng tư của bạn. Hủy đăng ký bất kỳ lúc nào.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
