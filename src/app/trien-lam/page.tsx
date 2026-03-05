'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { destroyLenis, restoreLenis } from '@/components/layout/SmoothScroll';

interface ExhibitionImage {
  id: string;
  image_url: string;
  media_type: string;
  caption: string;
}

interface Exhibition {
  id: string;
  title: string;
  location: string;
  event_date: string;
  description: string;
  thumbnail: string;
  exhibition_images: ExhibitionImage[];
}

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeYear, setActiveYear] = useState<string>('all');

  // Extract unique years
  const years = useMemo(() => {
    const yrs = [...new Set(exhibitions.map(ex => new Date(ex.event_date).getFullYear().toString()))];
    return yrs.sort();
  }, [exhibitions]);

  const scrollToYear = (year: string) => {
    setActiveYear(year);
    if (year === 'all') {
      document.getElementById('timeline-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const el = document.getElementById(`year-${year}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('exhibitions')
        .select('*, exhibition_images(*)')
        .eq('is_published', true)
        .order('event_date', { ascending: true });
      if (data) setExhibitions(data as Exhibition[]);
      setLoading(false);
    })();
  }, []);

  const openGallery = (ex: Exhibition) => {
    setSelectedExhibition(ex);
    setLightboxIndex(null);
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const closeGallery = () => { setSelectedExhibition(null); setLightboxIndex(null); };
  const galleryRef = useRef<HTMLDivElement>(null);

  // Destroy Lenis entirely when gallery is open + attach mini smooth scroll
  useEffect(() => {
    if (!selectedExhibition) return;
    destroyLenis();
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Mini smooth scroll engine for gallery card
    const el = galleryRef.current;
    if (!el) return;
    let targetScroll = el.scrollTop;
    let animating = false;

    function animate() {
      if (!el) return;
      const diff = targetScroll - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = targetScroll;
        animating = false;
        return;
      }
      el.scrollTop += diff * 0.12;
      requestAnimationFrame(animate);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation();
      const maxScroll = el!.scrollHeight - el!.clientHeight;
      targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY));
      if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      restoreLenis();
    };
  }, [selectedExhibition]);

  const prevImage = () => {
    if (lightboxIndex === null || !selectedExhibition) return;
    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : selectedExhibition.exhibition_images.length - 1);
  };
  const nextImage = () => {
    if (lightboxIndex === null || !selectedExhibition) return;
    setLightboxIndex(lightboxIndex < selectedExhibition.exhibition_images.length - 1 ? lightboxIndex + 1 : 0);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-dark-luxury text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="ornament-divider mb-8">
            <span className="text-gold text-lg">✦</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-5 tracking-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            Hành Trình Triển Lãm
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Dấu chân QiQi Yến qua các sự kiện triển lãm trên khắp cả nước
          </p>
          <div className="flex justify-center items-center gap-3 mt-8 text-sm text-white/30">
            <a href="/" className="hover:text-gold transition-colors">Trang chủ</a>
            <span className="text-gold/30">✦</span>
            <span className="text-gold/70">Triển Lãm</span>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="pt-6 pb-16 md:pt-8 md:pb-24 bg-gradient-luxury">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : exhibitions.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>Hành trình triển lãm đang được cập nhật...</p>
            </div>
          ) : (
            <div className="relative max-w-5xl mx-auto">
              {/* Year Filter */}
              {years.length > 1 && (
                <div className="sticky top-[6.4rem] z-20 flex justify-center mb-12">
                  <div className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg border border-border/50">
                    <button
                      onClick={() => scrollToYear('all')}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        activeYear === 'all' ? 'bg-gold text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      Tất cả
                    </button>
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => scrollToYear(year)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          activeYear === year ? 'bg-gold text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div id="timeline-top" />
              {/* Vertical line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/40 via-gold/20 to-gold/40 md:-translate-x-px" />

              {exhibitions.map((ex, i) => {
                const isLeft = i % 2 === 0;
                const date = new Date(ex.event_date);
                const year = date.getFullYear().toString();
                const dateStr = date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
                // Check if this is the first exhibition of its year
                const isFirstOfYear = i === 0 || new Date(exhibitions[i - 1].event_date).getFullYear().toString() !== year;

                return (
                  <motion.div
                    key={ex.id}
                    id={isFirstOfYear ? `year-${year}` : undefined}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.1, 0.5) }}
                    className={`relative flex flex-col md:flex-row items-start md:items-center mb-16 last:mb-0 scroll-mt-32 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* Dot on timeline */}
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full border-2 border-gold bg-white z-10 shadow-lg shadow-gold/20" />

                    {/* Date badge (mobile: inline, desktop: opposite side) */}
                    <div className={`hidden md:block w-[calc(50%-2rem)] ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <span className="text-base font-semibold text-gold uppercase tracking-widest">{dateStr}</span>
                    </div>

                    {/* Card */}
                    <div className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] ${isLeft ? 'md:pl-8' : 'md:pr-8'}`}>
                      <span className="md:hidden text-sm font-semibold text-gold uppercase tracking-widest mb-2 block">{dateStr}</span>
                      <div
                        onClick={() => openGallery(ex)}
                        className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:shadow-gold/10 hover:border-gold/30 transition-all duration-300 cursor-pointer group"
                      >
                        {/* Preview image */}
                        {(ex.thumbnail || ex.exhibition_images?.[0]) && (
                          <div className="rounded-xl overflow-hidden mb-4 -mt-2 -mx-2">
                            <img
                              src={ex.thumbnail || ex.exhibition_images[0].image_url}
                              alt={ex.title}
                              className="w-full aspect-[16/9] object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">{ex.title}</h3>
                        <div className="flex items-center gap-3 text-base text-muted-foreground mb-3">
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold" />{ex.location}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gold" />{date.toLocaleDateString('vi-VN')}</span>
                        </div>
                        {ex.description && <p className="text-base text-muted-foreground line-clamp-2">{ex.description}</p>}
                        {ex.exhibition_images?.length > 0 && (
                          <p className="text-sm text-gold mt-3 font-medium">📸 {ex.exhibition_images.length} ảnh — Click để xem</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Modal */}
      {selectedExhibition && (
        <div
          id="gallery-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeGallery}
        >
            <div
              ref={galleryRef}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedExhibition.title}</h2>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedExhibition.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(selectedExhibition.event_date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <button onClick={closeGallery} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedExhibition.description && (
                <p className="px-6 pt-4 text-sm text-muted-foreground">{selectedExhibition.description}</p>
              )}

              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedExhibition.exhibition_images?.map((img, idx) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => openLightbox(idx)}
                  >
                    {img.media_type === 'video' ? (
                      <div className="relative aspect-[4/3] bg-black">
                        <video src={img.image_url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-2xl">▶</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={img.image_url}
                        alt={img.caption || ''}
                        className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {img.caption && <p className="text-xs text-center text-muted-foreground mt-1 px-1">{img.caption}</p>}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && selectedExhibition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/60 hover:text-white z-10">
              <X className="w-7 h-7" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 text-white/60 hover:text-white z-10">
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 text-white/60 hover:text-white z-10">
              <ChevronRight className="w-10 h-10" />
            </button>

            {selectedExhibition.exhibition_images[lightboxIndex].media_type === 'video' ? (
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-[90vw] max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <video
                  src={selectedExhibition.exhibition_images[lightboxIndex].image_url}
                  controls
                  autoPlay
                  className="max-w-[90vw] max-h-[85vh] rounded-lg"
                />
              </motion.div>
            ) : (
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                src={selectedExhibition.exhibition_images[lightboxIndex].image_url}
                alt=""
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {lightboxIndex + 1} / {selectedExhibition.exhibition_images.length}
              {selectedExhibition.exhibition_images[lightboxIndex].caption && (
                <span className="ml-3">{selectedExhibition.exhibition_images[lightboxIndex].caption}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
