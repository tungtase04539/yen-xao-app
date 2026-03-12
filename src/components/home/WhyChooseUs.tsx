'use client';

import { motion } from 'framer-motion';
import { Shield, Leaf, Award, Gem, Truck, Heart } from 'lucide-react';

const reasons = [
  {
    icon: Gem,
    title: '100% Nguyên Chất',
    desc: 'Yến sào thượng hạng, không pha trộn, không chất phụ gia',
    color: '#d4af37',
  },
  {
    icon: Leaf,
    title: 'Yến Sào QiQi Yến',
    desc: 'Thu hoạch từ hang yến tự nhiên nguyên chất, đạt chuẩn QiQi Yến',
    color: '#2a8a4a',
  },
  {
    icon: Heart,
    title: '20+ Năm Kinh Nghiệm',
    desc: 'Đội ngũ nghệ nhân giàu kinh nghiệm & tâm huyết',
    color: '#c44569',
  },
  {
    icon: Award,
    title: 'Chứng Nhận Quốc Tế',
    desc: 'Đạt ISO 22000, HACCP, GMP, FDA & ATVSTP',
    color: '#3c6e71',
  },
  {
    icon: Shield,
    title: 'Cam Kết Chính Hãng',
    desc: 'Đổi trả 100% nếu phát hiện hàng giả, hàng nhái',
    color: '#7c000a',
  },
  {
    icon: Truck,
    title: 'Giao Hàng Toàn Quốc',
    desc: 'Miễn phí ship từ 1 triệu, giao nhanh trong 24h',
    color: '#e17055',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1a0003 0%, #3a0005 30%, #550005 55%, #7c000a 100%)',
    }}>
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 60%)' }}
        />
        {/* Gold lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        {/* Corner ornaments */}
        <svg className="absolute top-8 left-8 w-20 h-20 text-gold/10" viewBox="0 0 80 80">
          <path d="M0 0L80 0L80 10L10 10L10 80L0 80Z" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-8 right-8 w-20 h-20 text-gold/10 rotate-180" viewBox="0 0 80 80">
          <path d="M0 0L80 0L80 10L10 10L10 80L0 80Z" fill="currentColor" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#d4af37">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <div className="w-16 h-[1px]" style={{ background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-5 tracking-tight leading-tight">
            Vì Sao Chọn{' '}
            <span className="bg-clip-text text-transparent" style={{
              backgroundImage: 'linear-gradient(135deg, #d4af37, #e8d48b, #d4af37)',
            }}>
              Chúng Tôi
            </span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-sm md:text-base">
            Cam kết mang đến sản phẩm yến sào cao cấp nhất với chất lượng vượt trội
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative p-6 md:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-gold/20 hover:bg-white/[0.06]"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${reason.color}15, transparent 70%)` }}
              />

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${reason.color}15`, border: `1px solid ${reason.color}25` }}
              >
                <reason.icon className="w-6 h-6" style={{ color: reason.color }} />
              </div>

              {/* Text */}
              <h3 className="text-white font-bold text-base md:text-lg mb-2 font-serif">{reason.title}</h3>
              <p className="text-white/40 text-xs md:text-sm leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto"
        >
          {[
            { num: '15+', label: 'Năm Kinh Nghiệm' },
            { num: '50K+', label: 'Khách Hàng' },
            { num: '100%', label: 'Nguyên Chất' },
            { num: '6+', label: 'Chứng Nhận' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #e8d48b, #d4af37)', fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                {stat.num}
              </p>
              <p className="text-white/40 text-sm md:text-base uppercase tracking-[0.15em] font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
