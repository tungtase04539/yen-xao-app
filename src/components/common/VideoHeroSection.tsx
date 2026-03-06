'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoHeroSectionProps {
  src: string;
}

export default function VideoHeroSection({ src }: VideoHeroSectionProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) document.body.classList.add('video-hero-visible');
        else document.body.classList.remove('video-hero-visible');
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => { observer.disconnect(); document.body.classList.remove('video-hero-visible'); };
  }, []);

  return (
    <div ref={sentinelRef} id="video-hero" className="w-full relative bg-black" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>
      <VideoPlayer src={src} />
    </div>
  );
}

function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showTap, setShowTap] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.volume = 0;

    const play = () => {
      video.play()
        .then(() => setShowTap(false))
        .catch(() => setShowTap(true)); // show tap overlay if blocked
    };

    video.load();
    play();
    const t1 = setTimeout(play, 300);
    const t2 = setTimeout(play, 1000);
    const t3 = setTimeout(play, 2000);

    video.addEventListener('canplay', play, { once: true });
    video.addEventListener('canplaythrough', play, { once: true });
    video.addEventListener('loadedmetadata', play, { once: true });

    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); }, { threshold: 0.1 });
    io.observe(video);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      video.removeEventListener('canplay', play);
      video.removeEventListener('canplaythrough', play);
      video.removeEventListener('loadedmetadata', play);
      io.disconnect();
    };
  }, [src]);

  const handleTap = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => setShowTap(false)).catch(() => {});
  };

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover pointer-events-none"
        style={{ display: 'block' }}
      />
      {showTap && (
        <button
          onClick={handleTap}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10"
          aria-label="Nhấn để phát video"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center mb-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <span className="text-white text-sm font-medium drop-shadow">Nhấn để phát</span>
        </button>
      )}
    </>
  );
}

