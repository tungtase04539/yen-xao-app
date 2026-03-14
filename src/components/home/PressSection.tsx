'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

interface Paper {
  name: string;
  logo: string;
  href: string;
  desc: string;
}

const newspapers: Paper[] = [
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

// Portal wrapper – renders children at document.body
function PortalModal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function PressSection() {
  const [videos, setVideos] = useState<PressVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<PressVideo | null>(null);
  const [activeArticle, setActiveArticle] = useState<Paper | null>(null);

  useEffect(() => {
    supabase
      .from('press_videos')
      .select('id, title, channel_name, video_url, thumbnail_url')
      .order('sort_order')
      .then(({ data }) => { if (data) setVideos(data); });
  }, []);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = (activeVideo || activeArticle) ? 'hidden' : '';
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
                  <Tv className="w-8 h-8 opacity-20" style={{ color: BURGUNDY }} />
                  <p className="text-xs text-muted-foreground">Clip sắp ra mắt</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── VIDEO MODAL – rendered at document.body via portal ── */}
      <PortalModal>
        <AnimatePresence>
          {activeVideo && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveVideo(null)}
                style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
              />
              {/* Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}
              >
                <div style={{ position: 'relative', width: '100%', maxWidth: '768px', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', background: '#0a0003', pointerEvents: 'auto' }}>
                  <button
                    onClick={() => setActiveVideo(null)}
                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10, width: '2.25rem', height: '2.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                  <div style={{ aspectRatio: '16/9' }}>
                    <video src={activeVideo.video_url} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', display: 'block' }} />
                  </div>
                  <div style={{ padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.85)' }}>
                    <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{activeVideo.title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{activeVideo.channel_name}</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </PortalModal>

      {/* ── ARTICLE MODAL – rendered at document.body via portal ── */}
      <PortalModal>
        <AnimatePresence>
          {activeArticle && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveArticle(null)}
                style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              />
              {/* Dialog */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'none' }}
              >
                <div style={{ position: 'relative', width: '100%', maxWidth: '28rem', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', background: 'white', pointerEvents: 'auto' }}>
                  {/* Gold top bar */}
                  <div style={{ height: '6px', background: `linear-gradient(90deg, ${BURGUNDY}, ${GOLD}, ${BURGUNDY})` }} />
                  <button
                    onClick={() => setActiveArticle(null)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '0.25rem' }}
                  >
                    <X size={20} />
                  </button>
                  <div style={{ padding: '2rem' }}>
                    <div style={{ height: '2.5rem', marginBottom: '1.5rem' }}>
                      <img src={activeArticle.logo} alt={activeArticle.name} style={{ height: '100%', width: 'auto', objectFit: 'contain', maxWidth: '200px' }} />
                    </div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: BURGUNDY, marginBottom: '0.5rem' }}>Bài viết nổi bật</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.75rem', color: '#1a1a1a' }}>{activeArticle.desc}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                      QiQi Yến đã được <strong>{activeArticle.name}</strong> ghi nhận và giới thiệu đến độc giả trên toàn quốc.
                    </p>
                    <a
                      href={activeArticle.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setActiveArticle(null)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', background: `linear-gradient(135deg, ${BURGUNDY}, #9b1a2c)`, color: 'white' }}
                    >
                      <ExternalLink size={16} />
                      Đọc bài viết đầy đủ
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </PortalModal>
    </section>
  );
}
