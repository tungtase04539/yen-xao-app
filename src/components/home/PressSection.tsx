'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

const pressItems = [
  {
    name: 'Thương Hiệu Vàng',
    logo: 'https://thuonghieuvang.net.vn/Data/upload/files/thuonghieuvanglogo-724x110.jpg',
    href: 'https://thuonghieuvang.net.vn/Thuong-hieu-Yen-Sao-QiQi-Yen-Chat-Luong-Vuot-Troi-Suc-Khoe-Ben-Lau.aspx',
    category: 'Thương hiệu uy tín',
  },
  {
    name: 'Văn Hóa Doanh Nhân Việt Nam',
    logo: 'https://vanhoadoanhnhanvietnam.vn/wp-content/uploads/2025/07/Van-hoa-Doanh-nhan_logo-01-e1751864241797.png',
    href: 'https://vanhoadoanhnhanvietnam.vn/doanh-nghiep/thuong-hieu/yen-sao-qiqi-yen-chat-luong-vuot-troi-suc-khoe-ben-lau.html',
    category: 'Văn hóa doanh nhân',
  },
];

// Duplicate enough times for seamless marquee
const marqueeItems = [...pressItems, ...pressItems, ...pressItems, ...pressItems];

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
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex flex-col items-center justify-center gap-3 px-8 py-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: 'white',
                  border: '1px solid rgba(201,165,90,0.2)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  minWidth: 220,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(201,165,90,0.2)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,165,90,0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,165,90,0.2)';
                }}
              >
                {/* Logo */}
                <div className="h-10 flex items-center justify-center">
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="h-full w-auto object-contain max-w-[160px]"
                    loading="lazy"
                  />
                </div>
                {/* Category badge */}
                <span className="text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(110,18,34,0.06)', color: '#6E1222' }}>
                  {item.category}
                </span>
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
