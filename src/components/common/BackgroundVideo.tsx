'use client';

import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  src: string;
  className?: string;
}

export default function BackgroundVideo({ src, className = '' }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // iOS Safari requires muted to be set as a DOM attribute, not just React prop
    video.setAttribute('muted', '');
    video.muted = true;

    const playVideo = () => {
      video.play().catch(() => {});
    };

    // Attempt 1: immediate
    playVideo();

    // Attempt 2: short delay (helps with some Android)
    const t1 = setTimeout(playVideo, 300);

    // Attempt 3: after metadata loaded
    video.addEventListener('loadedmetadata', playVideo, { once: true });

    // Attempt 4: IntersectionObserver — play when visible in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          playVideo();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(video);

    // Attempt 5: on first user interaction (fallback for strict browsers)
    const onInteraction = () => {
      playVideo();
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
    };
    document.addEventListener('touchstart', onInteraction, { passive: true });
    document.addEventListener('click', onInteraction);

    return () => {
      clearTimeout(t1);
      video.removeEventListener('loadedmetadata', playVideo);
      observer.disconnect();
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
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
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
