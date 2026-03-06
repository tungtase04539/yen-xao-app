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

    video.muted = true;
    video.playsInline = true;

    const tryPlay = () => {
      video.play().catch(() => {
        // Nếu autoplay bị chặn, thử lại sau tương tác đầu tiên
        const handleInteraction = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', handleInteraction);
          document.removeEventListener('click', handleInteraction);
        };
        document.addEventListener('touchstart', handleInteraction, { once: true });
        document.addEventListener('click', handleInteraction, { once: true });
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
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
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
