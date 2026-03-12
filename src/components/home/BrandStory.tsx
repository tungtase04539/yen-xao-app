'use client';

import { motion } from 'framer-motion';
import { Shield, Leaf, Heart, Award } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Cam Kết Chất Lượng',
    desc: '100% yến sào nguyên chất từ đảo yến thiên nhiên, không pha trộn.',
  },
  {
    icon: Leaf,
    title: 'Thiên Nhiên Thuần Khiết',
    desc: 'Thu hoạch từ những hang yến tự nhiên nguyên chất của QiQi Yến.',
  },
  {
    icon: Heart,
    title: 'Tâm Huyết Nghệ Nhân',
    desc: 'Chế biến thủ công bởi đội ngũ nghệ nhân trên 20 năm kinh nghiệm.',
  },
  {
    icon: Award,
    title: 'Chứng Nhận An Toàn',
    desc: 'Đạt tiêu chuẩn ATVSTP, ISO 22000, HACCP quốc tế.',
  },
];

export default function BrandStory() {
  return (
    <section className="py-20 md:py-28 bg-gradient-dark-luxury text-white relative overflow-hidden">
      {/* Decorative gold particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gold/[0.04] blur-[150px]" />
        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-gold text-gold text-xs font-medium uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Câu chuyện thương hiệu
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif mb-8 leading-[1.15]">
              Hơn 15 Năm
              <br />
              <span className="text-gradient-gold">Đồng Hành Cùng Sức Khỏe</span>
            </h2>
            <div className="space-y-5 text-white/65 leading-relaxed">
              <p>
                Từ những hang yến hoang sơ, chúng tôi — QiQi Yến — mang đến bàn ăn
                của bạn những sợi yến sào tinh khiết nhất. Mỗi tổ yến là kết tinh của thiên nhiên,
                được thu hoạch và chế biến với sự trân trọng và tận tâm.
              </p>
              <p>
                Với phương châm &quot;Chất lượng là uy tín&quot;, chúng tôi cam kết mang đến
                sản phẩm yến sào nguyên chất nhất, giúp nâng cao sức khỏe cho hàng triệu
                gia đình Việt.
              </p>
            </div>
            <div className="ornament-line mt-8 !bg-gradient-to-r !from-transparent !via-gold/30 !to-transparent" />
          </motion.div>

          {/* Values Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl glass-gold hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center mb-4 group-hover:bg-gold/25 transition-colors">
                  <v.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-semibold text-sm mb-2 text-white/90">{v.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
