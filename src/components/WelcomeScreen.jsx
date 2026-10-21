import { useState, useRef, useEffect, useCallback } from 'react';
import welcomeLandscapeVideo from '../assets/video/welcome-screen-landscape.mp4';
import welcomePortraitVideo from '../assets/video/welcome-screen-potrait.mp4';

export default function WelcomeScreen({ onComplete }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isExiting, setIsExiting] = useState(false);
  const hasFinishedRef = useRef(false);

  // Deteksi mode mobile (lebar layar <= 768px atau orientasi potret)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 768px), (orientation: portrait)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px), (orientation: portrait)');
    const handleChange = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const finishAndUnmount = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onComplete();
  }, [onComplete]);

  const handleFinish = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    // Kunci posisi di paling atas (0, 0)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Fallback timer jika onTransitionEnd tidak terpicu
    setTimeout(() => {
      finishAndUnmount();
    }, 900);
  }, [isExiting, finishAndUnmount]);

  // Transisi selesai 100% secara alami tanpa glitch/potong tiba-tiba
  const handleTransitionEnd = (e) => {
    if (e.target === containerRef.current && isExiting) {
      finishAndUnmount();
    }
  };

  // Pastikan posisi scroll berada di (0, 0) saat welcome screen aktif
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Cegah scroll latar belakang tanpa mengubah body overflow (agar tidak ada pergeseran scrollbar)
    const preventScroll = (e) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  // Pastikan autoplay berjalan saat mount / refresh
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback jika diblokir oleh browser
      });
    }
  }, [isMobile]);

  // Klik di mana saja atau tekan tombol apa saja untuk masuk langsung
  useEffect(() => {
    const handleKeyDown = () => {
      handleFinish();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish]);

  const currentVideoSrc = isMobile ? welcomePortraitVideo : welcomeLandscapeVideo;

  return (
    <div
      ref={containerRef}
      onClick={handleFinish}
      onTransitionEnd={handleTransitionEnd}
      className="fixed inset-0 z-[99999] w-screen h-screen bg-black overflow-hidden flex items-center justify-center select-none"
      style={{
        margin: 0,
        padding: 0,
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.02)' : 'scale(1)',
        pointerEvents: isExiting ? 'none' : 'auto',
        transition: 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
        backfaceVisibility: 'hidden',
      }}
      aria-label="Welcome Screen"
    >
      <video
        ref={videoRef}
        key={currentVideoSrc}
        src={currentVideoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleFinish}
        className="w-full h-full object-cover"
        style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
      />
    </div>
  );
}
