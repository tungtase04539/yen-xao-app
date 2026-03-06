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

    // iOS Safari: muted must be DOM attribute
    // Chrome Android: also needs volume = 0 and autoplay attribute
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.volume = 0;

    const playVideo = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    // Attempt 1: immediate
    playVideo();

    // Attempt 2: 100ms delay
    const t1 = setTimeout(playVideo, 100);

    // Attempt 3: 500ms delay (Chrome Android timing)
    const t2 = setTimeout(playVideo, 500);

    // Attempt 4: canplaythrough (Chrome prefers this over loadedmetadata)
    video.addEventListener('canplaythrough', playVideo, { once: true });

    // Attempt 5: loadedmetadata (Safari)
    video.addEventListener('loadedmetadata', playVideo, { once: true });

    // Attempt 6: IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) playVideo();
      },
      { threshold: 0.1 }
    );
    observer.observe(video);

    // Attempt 7: first user interaction fallback
    const onInteraction = () => {
      playVideo();
    };
    document.addEventListener('touchstart', onInteraction, { passive: true, once: true });
    document.addEventListener('click', onInteraction, { once: true });
    document.addEventListener('scroll', onInteraction, { passive: true, once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      video.removeEventListener('canplaythrough', playVideo);
      video.removeEventListener('loadedmetadata', playVideo);
      observer.disconnect();
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
      document.removeEventListener('scroll', onInteraction);
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
      className={`pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '100%',
        minHeight: '100%',
        width: 'auto',
        height: 'auto',
        zIndex: 0,
      }}
    />
  );
}
