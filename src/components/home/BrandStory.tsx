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
    desc: 'Thu hoạch từ những hang yến tự nhiên vùng biển Khánh Hòa.',
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
    <section className="py-16 md:py-20 bg-gradient-hero text-white relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-gold text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-gold" />
              Câu chuyện thương hiệu
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 leading-tight">
              Hơn 15 Năm
              <br />
              <span className="text-gradient-gold">Đồng Hành Cùng Sức Khỏe</span>
            </h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Từ những hang yến hoang sơ trên biển Khánh Hòa, chúng tôi mang đến bàn ăn
              của bạn những sợi yến sào tinh khiết nhất. Mỗi tổ yến là kết tinh của thiên nhiên,
              được thu hoạch và chế biến với sự trân trọng và tận tâm.
            </p>
            <p className="text-white/70 leading-relaxed">
              Với phương châm &quot;Chất lượng là uy tín&quot;, chúng tôi cam kết mang đến
              sản phẩm yến sào nguyên chất nhất, giúp nâng cao sức khỏe cho hàng triệu
              gia đình Việt.
            </p>
          </motion.div>

          {/* Values */}
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
                className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center mb-3">
                  <v.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{v.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
