import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function OpeningAnimation({ onComplete }) {
  const overlayRef = useRef(null);
  const videoRef = useRef(null);

  const videoSrc =
    'https://res.cloudinary.com/xzimezus/video/upload/v1785346890/TensorPix_-_Wedding_invitation_opening_anima__202607292256_online-video-cutter_lusyjk.mp4';

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    
    v.play().catch(() => {});

    
    gsap.set(v, { autoAlpha: 1, display: 'block' });

    const onEnded = () => {
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 1.2,
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });
    };

    v.addEventListener('ended', onEnded);
    return () => v.removeEventListener('ended', onEnded);
  }, [onComplete]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        autoPlay
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
