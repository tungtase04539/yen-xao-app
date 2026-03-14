'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Tv, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PressVideo {
  id: string;
  title: string;
  channel_name: string;
  video_url: string;
  thumbnail_url: string | null;
}

const newspapers = [
  {
    name: 'Thương Hiệu Vàng',
    logo: 'https://thuonghieuvang.net.vn/Data/upload/files/thuonghieuvanglogo-724x110.jpg',
    href: 'https://thuonghieuvang.net.vn/Thuong-hieu-Yen-Sao-QiQi-Yen-Chat-Luong-Vuot-Troi-Suc-Khoe-Ben-Lau.aspx',
  },
  {
    name: 'Văn Hóa Doanh Nhân Việt Nam',
    logo: 'https://vanhoadoanhnhanvietnam.vn/wp-content/uploads/2025/07/Van-hoa-Doanh-nhan_logo-01-e1751864241797.png',
    href: 'https://vanhoadoanhnhanvietnam.vn/doanh-nghiep/thuong-hieu/yen-sao-qiqi-yen-chat-luong-vuot-troi-suc-khoe-ben-lau.html',
  },
];

const GOLD = '#C9A55A';
const BURGUNDY = '#6E1222';

export default function PressSection() {
  const [videos, setVideos] = useState<PressVideo[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('press_videos')
      .select('id, title, channel_name, video_url, thumbnail_url')
      .order('sort_order')
      .then(({ data }) => { if (data) setVideos(data); });
  }, []);

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: '#faf6f0' }}>
      {/* Top / bottom gold lines */}
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)` }} />
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)` }} />

      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: `${BURGUNDY}0d`, border: `1px solid ${BURGUNDY}1a` }}>
            <Newspaper className="w-3.5 h-3.5" style={{ color: BURGUNDY }} />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: BURGUNDY }}>
              Truyền Thông Ghi Nhận
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
            QiQi Yến Trên <span style={{ color: BURGUNDY }}>Báo Chí & Truyền Hình</span>
          </h2>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* ── LEFT: Báo chí ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
                <Newspaper className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Báo Chí Đưa Tin</h3>
                <p className="text-xs text-muted-foreground">{newspapers.length} bài viết</p>
              </div>
            </div>

            {/* 2-col logo grid */}
            <div className="grid grid-cols-2 gap-3">
              {newspapers.map((paper) => (
                <a
                  key={paper.name}
                  href={paper.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'white',
                    border: `1px solid ${GOLD}25`,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = `0 8px 24px ${GOLD}30`;
                    el.style.borderColor = `${GOLD}70`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
                    el.style.borderColor = `${GOLD}25`;
                  }}
                >
                  <div className="h-9 flex items-center justify-center">
                    <img src={paper.logo} alt={paper.name} className="h-full w-auto object-contain max-w-[130px]" loading="lazy" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase"
                    style={{ color: `${BURGUNDY}99` }}>
                    Đọc bài viết →
                  </span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* ── RIGHT: Truyền hình ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Column header */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${BURGUNDY}12`, border: `1px solid ${BURGUNDY}25` }}>
                <Tv className="w-4 h-4" style={{ color: BURGUNDY }} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Truyền Hình Đưa Tin</h3>
                <p className="text-xs text-muted-foreground">
                  {videos.length > 0 ? `${videos.length} đoạn clip` : 'Sắp cập nhật'}
                </p>
              </div>
            </div>

            {/* 2-col video grid */}
            {videos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    style={{
                      background: '#1a0003',
                      border: `1px solid ${BURGUNDY}30`,
                      aspectRatio: '16/9',
                    }}
                    onClick={() => setPlaying(playing === v.id ? null : v.id)}
                  >
                    {playing === v.id ? (
                      <video
                        src={v.video_url}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        {v.thumbnail_url ? (
                          <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, #1a0003, ${BURGUNDY})` }}>
                            <Tv className="w-8 h-8 opacity-30 text-white" />
                          </div>
                        )}
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                          style={{ background: 'rgba(0,0,0,0.35)' }}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                            style={{ background: GOLD, boxShadow: `0 4px 16px ${GOLD}60` }}>
                            <Play className="w-4 h-4 fill-current" style={{ color: BURGUNDY, marginLeft: 2 }} />
                          </div>
                          <div className="text-center px-2">
                            <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2">{v.title}</p>
                            <p className="text-white/60 text-[10px] mt-0.5">{v.channel_name}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty placeholder */
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((n) => (
                  <div key={n} className="rounded-2xl flex flex-col items-center justify-center gap-2 p-6"
                    style={{
                      background: 'white',
                      border: `1px dashed ${BURGUNDY}25`,
                      aspectRatio: '16/9',
                    }}>
                    <Tv className="w-7 h-7 opacity-20" style={{ color: BURGUNDY }} />
                    <p className="text-[10px] text-muted-foreground text-center">Clip sắp ra mắt</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
