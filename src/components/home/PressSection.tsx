'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Tv, Play, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PressVideo {
  id: string;
  title: string;
  channel_name: string;
  video_url: string;
  thumbnail_url: string | null;
}

interface Newspaper {
  name: string;
  logo: string;
  href: string;
  desc: string;
}

const newspapers: Newspaper[] = [
  {
    name: 'Thương Hiệu Vàng',
    logo: 'https://thuonghieuvang.net.vn/Data/upload/files/thuonghieuvanglogo-724x110.jpg',
    href: 'https://thuonghieuvang.net.vn/Thuong-hieu-Yen-Sao-QiQi-Yen-Chat-Luong-Vuot-Troi-Suc-Khoe-Ben-Lau.aspx',
    desc: 'Thương hiệu Yến Sào QiQi Yến – Chất Lượng Vượt Trội, Sức Khỏe Bền Lâu',
  },
  {
    name: 'Văn Hóa Doanh Nhân Việt Nam',
    logo: 'https://vanhoadoanhnhanvietnam.vn/wp-content/uploads/2025/07/Van-hoa-Doanh-nhan_logo-01-e1751864241797.png',
    href: 'https://vanhoadoanhnhanvietnam.vn/doanh-nghiep/thuong-hieu/yen-sao-qiqi-yen-chat-luong-vuot-troi-suc-khoe-ben-lau.html',
    desc: 'Yến Sào QiQi Yến – Chất Lượng Vượt Trội, Sức Khỏe Bền Lâu',
  },
];

const GOLD = '#C9A55A';
const BURGUNDY = '#6E1222';

function Overlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    />
  );
}

export default function PressSection() {
  const [videos, setVideos] = useState<PressVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<PressVideo | null>(null);
  const [activeArticle, setActiveArticle] = useState<Newspaper | null>(null);

  useEffect(() => {
    supabase
      .from('press_videos')
      .select('id, title, channel_name, video_url, thumbnail_url')
      .order('sort_order')
      .then(({ data }) => { if (data) setVideos(data); });
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    if (activeVideo || activeArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeVideo, activeArticle]);

  return (
    <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: '#faf6f0' }}>
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)` }} />
      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)` }} />

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{ background: `${BURGUNDY}0d`, border: `1px solid ${BURGUNDY}1a` }}>
            <Newspaper className="w-3.5 h-3.5" style={{ color: BURGUNDY }} />
            <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ color: BURGUNDY }}>Truyền Thông Ghi Nhận</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-foreground">
            QiQi Yến Trên <span style={{ color: BURGUNDY }}>Báo Chí & Truyền Hình</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-10 max-w-5xl mx-auto">
          {/* ── ROW 1: Báo chí ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            {/* Row header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}35` }}>
                <Newspaper className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Báo Chí Đưa Tin</h3>
                <p className="text-xs text-muted-foreground">{newspapers.length} bài viết ghi nhận thương hiệu</p>
              </div>
              <div className="flex-1 h-px ml-4" style={{ background: `linear-gradient(90deg, ${GOLD}30, transparent)` }} />
            </div>
            {/* 2-col newspaper cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newspapers.map((paper) => (
                <button
                  key={paper.name}
                  onClick={() => setActiveArticle(paper)}
                  className="flex flex-col items-center justify-center gap-4 py-8 px-6 rounded-2xl transition-all duration-200 hover:-translate-y-1"
                  style={{ background: 'white', border: `1px solid ${GOLD}25`, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.boxShadow = `0 10px 32px ${GOLD}25`; el.style.borderColor = `${GOLD}70`; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.boxShadow = '0 2px 16px rgba(0,0,0,0.05)'; el.style.borderColor = `${GOLD}25`; }}
                >
                  <div className="h-12 flex items-center justify-center">
                    <img src={paper.logo} alt={paper.name} className="h-full w-auto object-contain max-w-[180px]" loading="lazy" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full"
                    style={{ background: `${BURGUNDY}08`, color: BURGUNDY }}>
                    Xem bài viết
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Divider */}
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}25, transparent)` }} />

          {/* ── ROW 2: Truyền hình ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            {/* Row header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BURGUNDY}12`, border: `1px solid ${BURGUNDY}30` }}>
                <Tv className="w-5 h-5" style={{ color: BURGUNDY }} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Truyền Hình Đưa Tin</h3>
                <p className="text-xs text-muted-foreground">{videos.length > 0 ? `${videos.length} đoạn clip` : 'Sắp cập nhật'}</p>
              </div>
              <div className="flex-1 h-px ml-4" style={{ background: `linear-gradient(90deg, ${BURGUNDY}20, transparent)` }} />
            </div>
            {/* 2-col video cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.length > 0 ? videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideo(v)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group w-full"
                  style={{ background: '#1a0003', border: `1px solid ${BURGUNDY}35`, aspectRatio: '16/9' }}
                >
                  {v.thumbnail_url
                    ? <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, #1a0003, ${BURGUNDY})` }} />
                  }
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: 'rgba(0,0,0,0.42)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ background: GOLD, boxShadow: `0 4px 20px ${GOLD}60` }}>
                      <Play className="w-5 h-5 fill-current" style={{ color: BURGUNDY, marginLeft: 2 }} />
                    </div>
                    <p className="text-white text-xs font-semibold px-4 line-clamp-2 text-center">{v.title}</p>
                    <p className="text-white/60 text-[11px]">{v.channel_name}</p>
                  </div>
                </button>
              )) : [1, 2].map(n => (
                <div key={n} className="rounded-2xl flex flex-col items-center justify-center gap-2 p-8"
                  style={{ background: 'white', border: `1px dashed ${BURGUNDY}20`, aspectRatio: '16/9' }}>
                  <Tv className="w-8 h-8 opacity-15" style={{ color: BURGUNDY }} />
                  <p className="text-xs text-muted-foreground">Clip sắp ra mắt</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── VIDEO MODAL ── */}
      <AnimatePresence>
        {activeVideo && (
          <>
            <Overlay onClose={() => setActiveVideo(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
            >
              <div className="relative w-full max-w-3xl pointer-events-auto rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: '#0a0003' }}>
                {/* Close */}
                <button
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(0,0,0,0.6)' }}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                {/* Video */}
                <div style={{ aspectRatio: '16/9' }}>
                  <video
                    src={activeVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    style={{ background: '#000' }}
                  />
                </div>
                {/* Info bar */}
                <div className="px-5 py-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
                  <p className="text-white font-semibold text-sm">{activeVideo.title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{activeVideo.channel_name}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── ARTICLE MODAL ── */}
      <AnimatePresence>
        {activeArticle && (
          <>
            <Overlay onClose={() => setActiveArticle(null)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="relative w-full max-w-md pointer-events-auto rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: 'white' }}>
                {/* Gold top bar */}
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${BURGUNDY}, ${GOLD}, ${BURGUNDY})` }} />

                <button onClick={() => setActiveArticle(null)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="p-8">
                  {/* Logo */}
                  <div className="h-10 mb-6">
                    <img src={activeArticle.logo} alt={activeArticle.name} className="h-full w-auto object-contain max-w-[200px]" />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: BURGUNDY }}>Bài viết nổi bật</p>
                  <h3 className="text-lg font-bold text-foreground leading-snug mb-4">{activeArticle.desc}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    QiQi Yến đã được <strong>{activeArticle.name}</strong> ghi nhận và giới thiệu đến độc giả trên toàn quốc.
                  </p>

                  <a
                    href={activeArticle.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
                    style={{ background: `linear-gradient(135deg, ${BURGUNDY}, #9b1a2c)`, color: 'white' }}
                    onClick={() => setActiveArticle(null)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Đọc bài viết đầy đủ
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
