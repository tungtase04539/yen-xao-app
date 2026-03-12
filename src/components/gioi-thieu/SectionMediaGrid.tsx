'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface MediaItem {
  id: string;
  media_url: string;
  media_type: string;
  caption: string;
  sort_order?: number;
}

interface SectionMediaGridProps {
  media: MediaItem[];
  sectionTitle: string;
  isDark: boolean;
  initialCount?: number;
}

/** Lazy-load a video: only set src once it enters viewport */
function LazyVideo({ src, caption }: { src: string; caption?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loaded) {
          video.src = src;
          video.load();
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, loaded]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      preload="none"
      className="w-full aspect-video object-cover"
      aria-label={caption || 'Video'}
    />
  );
}

export default function SectionMediaGrid({
  media,
  sectionTitle,
  isDark,
  initialCount = 6,
}: SectionMediaGridProps) {
  const [showAll, setShowAll] = useState(false);

  const sortedMedia = [...media].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  const visibleMedia = showAll ? sortedMedia : sortedMedia.slice(0, initialCount);
  const hasMore = sortedMedia.length > initialCount;

  return (
    <div>
      <div
        className={`grid gap-4 ${
          sortedMedia.length === 1
            ? 'grid-cols-1 max-w-3xl mx-auto'
            : sortedMedia.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {visibleMedia.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl overflow-hidden border border-gold/10 shadow-lg group"
          >
            {m.media_type === 'video' ? (
              <LazyVideo src={m.media_url} caption={m.caption} />
            ) : (
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={m.media_url}
                  alt={m.caption || sectionTitle}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading="lazy"
                />
              </div>
            )}
            {m.caption && (
              <div
                className={`px-4 py-3 text-sm ${
                  isDark ? 'text-white/60' : 'text-muted-foreground'
                }`}
              >
                {m.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`
              inline-flex items-center gap-2 px-8 py-3 rounded-full
              font-medium text-sm tracking-wide
              transition-all duration-300 ease-in-out
              cursor-pointer
              ${
                isDark
                  ? 'bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 hover:border-gold/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                  : 'bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 hover:border-gold/50 hover:shadow-lg'
              }
            `}
          >
            {showAll ? (
              <>
                Thu gọn
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </>
            ) : (
              <>
                Xem thêm ({sortedMedia.length - initialCount} ảnh/video)
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
