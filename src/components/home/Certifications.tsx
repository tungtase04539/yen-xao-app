'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

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
    <section className="py-16 md:py-20 bg-gradient-luxury relative">
      {/* Top & Bottom ornamental lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="ornament-divider mb-5">
            <Shield className="w-4 h-4 text-gold" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-burgundy mb-3">
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
              className="group flex flex-col items-center text-center p-5 rounded-2xl luxury-card transition-all duration-300 hover:gold-glow"
            >
              {/* Shield badge */}
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {/* Gold ring */}
                <div className="absolute inset-0 rounded-full border-2 border-gold/30 group-hover:border-gold/60 transition-colors" />
                {/* Inner */}
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-burgundy font-bold text-[9px] leading-tight text-center">
                    {cert.name}
                  </span>
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">{cert.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
