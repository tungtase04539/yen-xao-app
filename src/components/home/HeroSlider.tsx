'use client';

import { useState, useEffect, useCallback } from 'react';
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

// Fallback slides if DB is empty or fetch fails
const fallbackSlides: Slide[] = [
  {
    id: '1',
    title: 'Yến Sào Tinh Chế\nNguyên Chất 100%',
    subtitle: 'Từ đảo yến thiên nhiên Khánh Hòa',
    button_text: 'Khám Phá Ngay',
    button_link: '/danh-muc/yen-tinh-che',
    background_image: null,
    gradient: 'from-burgundy-dark via-burgundy to-burgundy-light',
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchSlides() {
      const { data } = await supabase
        .from('hero_slides')
        .select('id, title, subtitle, button_text, button_link, background_image, gradient')
        .eq('is_active', true)
        .order('sort_order');
      if (data && data.length > 0) {
        setSlides(data);
      }
    }
    fetchSlides();
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
        >
          {/* Background Image */}
          {slide.background_image && (
            <img
              src={slide.background_image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Overlay for readability when image is present */}
          {slide.background_image && (
            <div className="absolute inset-0 bg-black/40" />
          )}

          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gold blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gold blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-gold text-sm mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                Yến Sào Cao Cấp
              </motion.div>

              <motion.h2
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-serif text-white leading-tight mb-4 whitespace-pre-line"
              >
                {slide.title}
              </motion.h2>

              <motion.p
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-white/80 mb-8 max-w-lg"
              >
                {slide.subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href={slide.button_link}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-gold text-burgundy font-semibold rounded-full hover:shadow-lg hover:shadow-gold/30 transition-all hover:scale-105"
                >
                  {slide.button_text}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Decorative Bird Nest Icon */}
            {!slide.background_image && (
              <div className="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 rounded-full border-2 border-gold/20 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-gold/30 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-gold/10 flex items-center justify-center text-6xl">
                        🕊️
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold animate-pulse" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-gold/60 animate-pulse delay-700" />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows — hidden on mobile */}
      <button
        onClick={prev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white items-center justify-center hover:bg-white/20 transition-colors z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white items-center justify-center hover:bg-white/20 transition-colors z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 bg-gold'
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
