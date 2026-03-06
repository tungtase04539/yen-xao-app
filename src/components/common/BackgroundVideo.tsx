'use client';

import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  src: string;
  className?: string;
}

// Detect Zalo at module level (client-only) — safe because this is a Client Component
const isZaloBrowser = () =>
  typeof window !== 'undefined' && /zalo/i.test(navigator.userAgent);

export default function BackgroundVideo({ src, className = '' }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Skip all play logic in Zalo WebView
    if (isZaloBrowser()) return;

    const video = videoRef.current;
    if (!video) return;

    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.muted = true;
    video.volume = 0;

    const playVideo = () => {
      if (video.paused) video.play().catch(() => {});
    };

    playVideo();
    const t1 = setTimeout(playVideo, 100);
    const t2 = setTimeout(playVideo, 500);

    video.addEventListener('canplaythrough', playVideo, { once: true });
    video.addEventListener('loadedmetadata', playVideo, { once: true });

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) playVideo(); },
      { threshold: 0.1 }
    );
    observer.observe(video);

    const onInteraction = () => playVideo();
    document.addEventListener('touchstart', onInteraction, { passive: true, once: true });
    document.addEventListener('click', onInteraction, { once: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      video.removeEventListener('canplaythrough', playVideo);
      video.removeEventListener('loadedmetadata', playVideo);
      observer.disconnect();
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
    };
  }, [src]);

  // In Zalo WebView, don't render the video element at all
  if (isZaloBrowser()) return null;

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
