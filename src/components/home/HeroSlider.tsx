'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { imgHero } from '@/lib/imageUtils';

interface Slide {
  id: string;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  background_image: string | null;
  gradient: string;
}

const fallbackSlides: Slide[] = [
  {
    id: '1',
    title: 'Yến Sào Thượng Hạng\nTinh Hoa Thiên Nhiên',
    subtitle: 'Từ đảo yến thiên nhiên Khánh Hòa — Nguyên chất 100%',
    button_text: 'Khám Phá Bộ Sưu Tập',
    button_link: '/danh-muc/yen-tinh-che',
    background_image: null,
    gradient: 'from-burgundy-dark via-burgundy to-burgundy-light',
  },
];

// ─── Decorative animated elements (shared) ────────────────────────────────────
function SlideDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[5%] right-[0%] w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }}
      />
      {[
        { top: '15%', left: '20%', size: 6, delay: 0 },
        { top: '30%', left: '80%', size: 4, delay: 1 },
        { top: '60%', left: '10%', size: 3, delay: 2 },
        { top: '75%', left: '70%', size: 5, delay: 0.5 },
        { top: '45%', left: '90%', size: 3, delay: 1.5 },
        { top: '20%', left: '60%', size: 4, delay: 3 },
        { top: '80%', left: '40%', size: 3, delay: 2.5 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          animate={{ y: [-15, 15, -15], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: dot.delay }}
          className="absolute rounded-full bg-gold/50"
          style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </div>
  );
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchSlides() {
      const { data } = await supabase
        .from('hero_slides')
        .select('id, title, subtitle, button_text, button_link, background_image, gradient')
        .eq('is_active', true)
        .order('sort_order');
      setSlides(data && data.length > 0 ? data : fallbackSlides);
      setCurrent(0);
      setLoaded(true);
    }
    fetchSlides();
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
  }, [slides.length]);

  const next = useCallback(() => { setCurrent((prev) => (prev + 1) % slides.length); resetTimer(); }, [slides.length, resetTimer]);
  const prev = useCallback(() => { setCurrent((prev) => (prev - 1 + slides.length) % slides.length); resetTimer(); }, [slides.length, resetTimer]);
  const goTo = useCallback((index: number) => { setCurrent(index); resetTimer(); }, [resetTimer]);

  useEffect(() => {
    if (!loaded) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loaded, resetTimer]);

  const slide = slides[current];

  if (!loaded || !slide) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="md:hidden bg-burgundy-dark animate-pulse">
          <div className="w-full aspect-square bg-burgundy/60" />
          <div className="h-32 bg-burgundy-dark" />
        </div>
        {/* Desktop skeleton */}
        <section className="hidden md:block relative min-h-[750px] lg:min-h-[100vh] lg:max-h-[950px] overflow-hidden bg-burgundy-dark" />
      </>
    );
  }

  // Dot indicators (shared)
  const DotIndicators = ({ dark = false }: { dark?: boolean }) => (
    <div className={`flex gap-3 ${dark ? '' : ''}`}>
      {slides.map((_, i) => (
        <button
          key={i}
          onClick={() => goTo(i)}
          className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
          style={{ width: i === current ? '48px' : '20px' }}
          aria-label={`Go to slide ${i + 1}`}
        >
          <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
            i === current
              ? 'bg-gold'
              : dark ? 'bg-burgundy/30 hover:bg-burgundy/50' : 'bg-white/30 hover:bg-white/50'
          }`} />
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* ══════════════════════════════════════════════
          MOBILE LAYOUT — ảnh vuông 1:1 + text bên dưới
          ══════════════════════════════════════════════ */}
      <section className="md:hidden overflow-hidden bg-burgundy-dark">
        {/* Square image area */}
        <div className="relative w-full aspect-square overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`mob-${current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
            >
              {slide.background_image ? (
                <Image
                  src={slide.background_image}
                  alt={slide.title ?? ''}
                  fill
                  className="object-cover object-center"
                  priority={current === 0}
                  sizes="100vw"
                />
              ) : (
                /* Fallback: show hero-birds centered */
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="/hero-birds.png" alt="" className="w-48 h-48 object-contain opacity-70" />
                </div>
              )}

              {/* Light gradient overlay at bottom for text bleed */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-burgundy-dark/60 to-transparent" />

              <SlideDecorations />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text + CTA below image */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`mob-text-${current}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className="px-5 pt-5 pb-8 bg-burgundy-dark"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-[10px] font-medium tracking-[0.15em] uppercase mb-4">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              Yến Sào Cao Cấp
            </span>

            {slide.title && (
              <h2
                className="text-[1.9rem] font-bold font-serif text-white leading-[1.1] mb-3 whitespace-pre-line"
                style={{ textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
              >
                {slide.title}
              </h2>
            )}

            {slide.subtitle && (
              <div className="flex items-start gap-3 mb-5">
                <div className="w-[2px] h-10 bg-gradient-to-b from-gold to-gold/20 rounded-full shrink-0 mt-0.5" />
                <p className="text-sm text-white/70 leading-relaxed">{slide.subtitle}</p>
              </div>
            )}

            {/* CTA */}
            {slide.button_text && slide.button_link && (
              <Link
                href={slide.button_link}
                className="bg-metallic-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm"
                style={{
                  color: '#6E1222',
                  boxShadow: '0 6px 24px rgba(212,175,55,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {slide.button_text}
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}

            {/* Dots */}
            <div className="mt-6">
              <DotIndicators dark />
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ══════════════════════════════════════════════
          DESKTOP LAYOUT — giữ nguyên như cũ
          ══════════════════════════════════════════════ */}
      <section className="hidden md:block relative min-h-[750px] lg:min-h-[100vh] lg:max-h-[950px] overflow-hidden bg-burgundy-dark">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
          >
            {slide.background_image && (
              <Image
                src={slide.background_image}
                alt=""
                fill
                className="object-cover"
                priority={current === 0}
                sizes="100vw"
              />
            )}

            <SlideDecorations />

            {/* Content */}
            {(slide.title || (slide.button_text && slide.button_link)) && (
              <div className="relative container mx-auto px-4 h-full flex items-center min-h-[750px] lg:min-h-[100vh] lg:max-h-[950px]">
                {slide.title && (
                  <div className="max-w-2xl">
                    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-sm text-gold text-xs font-medium tracking-[0.2em] uppercase mb-8">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        Yến Sào Cao Cấp
                      </span>
                    </motion.div>

                    <motion.h2
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.7 }}
                      className="text-[3.2rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold font-serif text-white leading-[1.05] mb-6 whitespace-pre-line"
                      style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
                    >
                      {slide.title}
                    </motion.h2>

                    {slide.subtitle && (
                      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="flex items-start gap-4">
                        <div className="w-[3px] h-14 bg-gradient-to-b from-gold to-gold/20 rounded-full shrink-0 mt-1" />
                        <p className="text-lg md:text-xl text-white/70 max-w-md leading-relaxed">{slide.subtitle}</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {slide.button_text && slide.button_link && (
                  <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: slide.title ? 0.65 : 0.3, duration: 0.6 }}
                    className="absolute bottom-52 left-4 md:left-8"
                  >
                    <Link
                      href={slide.button_link}
                      className="bg-metallic-gold group relative inline-flex items-center gap-3 px-12 py-5 rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-[1.03]"
                      style={{
                        color: '#6E1222',
                        boxShadow: '0 8px 32px rgba(212,175,55,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                      }}
                    >
                      <span className="relative z-10">{slide.button_text}</span>
                      <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </Link>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Decorative bird (no background image only) */}
        {!slide.background_image && (
          <div className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 z-[5] pointer-events-none">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="relative w-[380px] h-[380px]">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 380">
                <circle cx="190" cy="190" r="185" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="1" strokeDasharray="8 8" />
                <circle cx="190" cy="190" r="155" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="1" />
                <circle cx="190" cy="190" r="120" fill="none" stroke="rgba(212,175,55,0.18)" strokeWidth="1" strokeDasharray="4 12" />
              </svg>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-12, 12, -12] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-60 h-60 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 60%, transparent 100%)', boxShadow: '0 0 80px rgba(212,175,55,0.1)' }}
              >
                <img src="/hero-birds.png" alt="" className="w-72 h-72 object-contain opacity-80" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Desktop dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          <DotIndicators />
        </div>
      </section>
    </>
  );
}
