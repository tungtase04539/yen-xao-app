'use client';

import { useEffect, useRef } from 'react';

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
        // Add/remove class on body so Header can react via CSS
        if (entry.isIntersecting) {
          document.body.classList.add('video-hero-visible');
        } else {
          document.body.classList.remove('video-hero-visible');
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      document.body.classList.remove('video-hero-visible');
    };
  }, []);

  return (
    <div ref={sentinelRef} id="video-hero" className="w-full relative" style={{ aspectRatio: '16/9', maxHeight: '80vh' }}>
      <VideoPlayer src={src} />
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

    const play = () => { if (video.paused) video.play().catch(() => {}); };

    play();
    const t1 = setTimeout(play, 100);
    const t2 = setTimeout(play, 600);
    video.addEventListener('canplaythrough', play, { once: true });
    video.addEventListener('loadedmetadata', play, { once: true });

    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) play(); }, { threshold: 0.1 });
    io.observe(video);

    const onUser = () => play();
    document.addEventListener('touchstart', onUser, { passive: true, once: true });
    document.addEventListener('scroll', onUser, { passive: true, once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      video.removeEventListener('canplaythrough', play);
      video.removeEventListener('loadedmetadata', play);
      io.disconnect();
      document.removeEventListener('touchstart', onUser);
      document.removeEventListener('scroll', onUser);
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
