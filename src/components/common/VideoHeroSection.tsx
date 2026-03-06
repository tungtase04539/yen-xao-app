'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoHeroSectionProps {
  src: string;
}

export default function VideoHeroSection({ src }: VideoHeroSectionProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Detect Zalo WebView — Zalo hijacks <video> and opens native player
  const isZalo = typeof window !== 'undefined' && /zalo/i.test(navigator.userAgent);

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
      {/* Skip video in Zalo WebView to avoid native player hijacking */}
      {!isZalo && <VideoPlayer src={src} />}
    </div>
  );
}

function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.volume = 0;

    const play = () => { video.play().catch(() => {}); };

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

  return (
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
  );
}
