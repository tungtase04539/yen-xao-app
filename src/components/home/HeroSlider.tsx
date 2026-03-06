'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string;
  button_link: string;
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
      if (data && data.length > 0) {
        setSlides(data);
      } else {
        setSlides(fallbackSlides);
      }
      setCurrent(0);
      setLoaded(true);
    }
    fetchSlides();
  }, []);

  // Reset auto-play timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
  }, [slides.length]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
    resetTimer();
  }, [slides.length, resetTimer]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    resetTimer();
  }, [slides.length, resetTimer]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    resetTimer();
  }, [resetTimer]);

  // Only start auto-play after data is loaded
  useEffect(() => {
    if (!loaded) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loaded, resetTimer]);

  const slide = slides[current];

  if (!loaded || !slide) {
    return (
      <section className="relative min-h-[650px] md:min-h-[750px] lg:min-h-[100vh] lg:max-h-[950px] overflow-hidden bg-burgundy-dark" />
    );
  }

  return (
    <section className="relative min-h-[650px] md:min-h-[750px] lg:min-h-[100vh] lg:max-h-[950px] overflow-hidden bg-burgundy-dark">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
        >
          {slide.background_image && (
            <img src={slide.background_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {slide.background_image && (
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          )}

          {/* Animated gold decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large floating gold circles */}
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

            {/* Floating gold dots */}
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

            {/* Gold line accents */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 h-full flex items-center min-h-[650px] md:min-h-[750px] lg:min-h-[100vh] lg:max-h-[950px]">
            <div className="max-w-2xl">
              {/* Premium badge */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/10 backdrop-blur-sm text-gold text-xs font-medium tracking-[0.2em] uppercase mb-8">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  Yến Sào Cao Cấp
                </span>
              </motion.div>

              {/* Title — much bigger and bolder */}
              <motion.h2
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="text-[3.2rem] md:text-[4.5rem] lg:text-[5.5rem] font-bold font-serif text-white leading-[1.05] mb-6 whitespace-pre-line"
                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
              >
                {slide.title}
              </motion.h2>

              {/* Subtitle with gold accent bar */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-start gap-4 mb-10"
              >
                <div className="w-[3px] h-14 bg-gradient-to-b from-gold to-gold/20 rounded-full shrink-0 mt-1" />
                <p className="text-lg md:text-xl text-white/70 max-w-md leading-relaxed">
                  {slide.subtitle}
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href={slide.button_link}
                  className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full font-semibold text-base overflow-hidden transition-all hover:scale-[1.03]"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #e8d48b 50%, #d4af37 100%)',
                    color: '#7c000a',
                    boxShadow: '0 8px 32px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  <span className="relative z-10">{slide.button_text}</span>
                  <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </Link>
                <Link
                  href="/gioi-thieu"
                  className="inline-flex items-center gap-2 px-10 py-5 rounded-full font-medium text-base border-2 border-white/20 text-white/90 hover:border-gold/50 hover:text-gold transition-all backdrop-blur-sm"
                >
                  Câu Chuyện Của Chúng Tôi
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hero birds ornament — outside AnimatePresence so animation works on first load */}
      {!slide.background_image && (
        <div className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2 z-[5] pointer-events-none">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="relative w-[380px] h-[380px]"
          >
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
              style={{
                background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 60%, transparent 100%)',
                boxShadow: '0 0 80px rgba(212,175,55,0.1)',
              }}
            >
              <img src="/hero-birds.png" alt="" className="w-72 h-72 object-contain opacity-80" />
            </motion.div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-4 right-12 w-3 h-3 rounded-full bg-gold/70"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            className="absolute bottom-12 left-4 w-2 h-2 rounded-full bg-gold/50"
          />
        </div>
      )}

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-white/70 items-center justify-center hover:bg-gold/20 hover:border-gold/40 hover:text-gold transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-white/70 items-center justify-center hover:bg-gold/20 hover:border-gold/40 hover:text-gold transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Line Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative h-[3px] rounded-full overflow-hidden transition-all duration-500"
            style={{ width: i === current ? '48px' : '20px' }}
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
              i === current ? 'bg-gold' : 'bg-white/30 hover:bg-white/50'
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
}
