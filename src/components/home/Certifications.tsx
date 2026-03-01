'use client';

import { motion } from 'framer-motion';

const certs = [
  { name: 'ISO 22000', desc: 'Hệ thống quản lý ATTP' },
  { name: 'HACCP', desc: 'Tiêu chuẩn an toàn thực phẩm' },
  { name: 'GMP', desc: 'Thực hành sản xuất tốt' },
  { name: 'ATVSTP', desc: 'An toàn vệ sinh thực phẩm' },
  { name: 'FDA', desc: 'Chứng nhận FDA Hoa Kỳ' },
  { name: 'ORGANIC', desc: 'Sản phẩm hữu cơ' },
];

export default function Certifications() {
  return (
    <section className="py-12 md:py-16 bg-cream border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-2">
            Chứng Nhận Chất Lượng
          </h2>
          <p className="text-muted-foreground text-sm">
            Sản phẩm đạt các tiêu chuẩn quốc tế về an toàn & chất lượng
          </p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-white border border-border/50 hover:border-gold/50 hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="text-burgundy font-bold text-xs">{cert.name}</span>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground">{cert.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
