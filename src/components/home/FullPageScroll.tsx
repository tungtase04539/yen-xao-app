'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FullPageScrollProps {
  children: React.ReactNode[];
  sectionNames?: string[];
}

export default function FullPageScroll({ children, sectionNames }: FullPageScrollProps) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartY = useRef(0);
  const total = children.length;

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= total || isAnimating) return;
    setIsAnimating(true);
    setCurrent(index);
    setTimeout(() => setIsAnimating(false), 800);
  }, [total, isAnimating]);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating) return;
      if (e.deltaY > 30) goNext();
      else if (e.deltaY < -30) goPrev();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [goNext, goPrev, isAnimating]);

  // Touch
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating) return;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (diff > 50) goNext();
      else if (diff < -50) goPrev();
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goNext, goPrev, isAnimating]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goPrev(); }
      if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, goTo, total]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Sections */}
      <motion.div
        className="w-full"
        animate={{ y: `${-current * 100}%` }}
        transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        style={{ height: `${total * 100}%` }}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className="w-full flex flex-col"
            style={{ height: `${100 / total}%` }}
          >
            {child}
          </div>
        ))}
      </motion.div>

      {/* Dot Navigation */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5">
        {children.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative flex items-center justify-end"
            title={sectionNames?.[i] || `Section ${i + 1}`}
          >
            {/* Tooltip */}
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium bg-burgundy text-white px-2.5 py-1 rounded-md whitespace-nowrap pointer-events-none">
              {sectionNames?.[i] || `Section ${i + 1}`}
            </span>
            {/* Dot */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-3 h-3 bg-burgundy shadow-lg shadow-burgundy/30'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll Down Arrow (first section only) */}
      <AnimatePresence>
        {current === 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={goNext}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xs font-medium">Cuộn xuống</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-lg"
            >
              ↓
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
