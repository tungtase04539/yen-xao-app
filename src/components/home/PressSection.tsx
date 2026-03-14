'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

const pressItems = [
  { name: 'VnExpress', category: 'Kinh tế' },
  { name: 'Tuổi Trẻ', category: 'Sức khỏe' },
  { name: 'Dân Trí', category: 'Thời sự' },
  { name: 'Báo Hải Phòng', category: 'Địa phương' },
  { name: 'VTV', category: 'Truyền hình' },
  { name: 'Zing News', category: 'Xu hướng' },
  { name: 'Nông Nghiệp VN', category: 'Thực phẩm' },
  { name: 'Nhân Dân', category: 'Chính luận' },
  { name: 'Người Lao Động', category: 'Tiêu dùng' },
  { name: 'Thanh Niên', category: 'Chăm sóc sức khỏe' },
];

// Duplicate for seamless marquee
const marqueeItems = [...pressItems, ...pressItems];

export default function PressSection() {
  return (
    <section className="py-16 md:py-20 overflow-hidden bg-[#faf6f0] relative">
      {/* Subtle top/bottom lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(110,18,34,0.06)', border: '1px solid rgba(110,18,34,0.1)' }}>
            <Newspaper className="w-3.5 h-3.5" style={{ color: '#6E1222' }} />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: '#6E1222' }}>
              Báo Chí Đưa Tin
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
            Được <span className="text-burgundy">Truyền Thông</span> Tin Tưởng
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            QiQi Yến được các cơ quan báo chí uy tín ghi nhận và giới thiệu
          </p>
        </motion.div>
      </div>

      {/* Marquee track */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #faf6f0, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #faf6f0, transparent)' }} />

        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-4 shrink-0"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {marqueeItems.map((item, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl"
                style={{
                  background: 'white',
                  border: '1px solid rgba(201,165,90,0.15)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  minWidth: 180,
                }}
              >
                {/* Gold ornament */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(201,165,90,0.15), rgba(201,165,90,0.05))', border: '1px solid rgba(201,165,90,0.2)' }}>
                  <Newspaper className="w-4 h-4" style={{ color: '#C9A55A' }} />
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground leading-none">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.category}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
