import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroSection } from './components/HeroSection';
import { HeartPetalReveal } from './components/HeartPetalReveal';
import { EventDetails } from './components/EventDetails';
import { CountdownTimer } from './components/CountdownTimer';
import { GallerySection } from './components/GallerySection';
import { StorySection } from './components/StorySection';
import { FooterSection } from './components/FooterSection';
import { TornPaperDivider } from './components/TornPaperDivider';
import { FloatingParticleScene } from './components/FloatingParticleScene';
import OpeningAnimation from './components/OpeningAnimation';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const siteRef = useRef(null);
  const [showOpening, setShowOpening] = useState(true);
  
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false,
    });

    
    lenis.on('scroll', ScrollTrigger.update);

    const updateGSAP = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateGSAP);
    gsap.ticker.lagSmoothing(0);

    
    const titles = gsap.utils.toArray('.title-reveal');
    titles.forEach((title) => {
      gsap.fromTo(
        title,
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      gsap.ticker.remove(updateGSAP);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full section-base text-[var(--palette-text)] selection:bg-[var(--palette-soft-pink)] selection:text-[var(--palette-contrast)]">
      <FloatingParticleScene />
      {showOpening && (
        <OpeningAnimation
          onComplete={() => {
            
            try {
              const heroEl = document.querySelector('.hero-background');
              if (heroEl && typeof heroEl.scrollIntoView === 'function') {
                heroEl.scrollIntoView({ behavior: 'auto', block: 'start' });
              } else {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
              }
            } catch (e) {
              
              window.scrollTo(0, 0);
            }

            
            if (siteRef.current) {
              gsap.fromTo(siteRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: 'power2.out' });
            }

            setShowOpening(false);
          }}
        />
      )}
      {}
      <div ref={siteRef} className="scroll-section section-surface" style={{ opacity: showOpening ? 0 : 1 }}>
        <HeroSection />
      </div>

      {}
      <div className="scroll-section section-soft relative">
        <TornPaperDivider variant={1} position="bottom" fillColor="var(--palette-surface)" />
        <HeartPetalReveal />
      </div>

      {}
      <div className="scroll-section section-base relative">
        <TornPaperDivider variant={2} position="bottom" fillColor="var(--palette-surface-soft)" />
        <EventDetails />
      </div>

      {}
      <div className="scroll-section section-rose relative">
        <TornPaperDivider variant={3} position="bottom" fillColor="var(--palette-bg)" />
        <CountdownTimer />
      </div>

      {}
      <div className="scroll-section section-blush-gradient relative">
        <TornPaperDivider variant={1} position="bottom" fillColor="var(--palette-soft-pink)" />
        <GallerySection />
      </div>

      {}
      <div className="scroll-section section-soft relative">
        <TornPaperDivider variant={2} position="bottom" fillColor="var(--palette-blush-deep)" hasFibers={false} />
        <StorySection />
      </div>

      {}
      <div className="scroll-section section-base relative">
        <TornPaperDivider variant={3} position="bottom" fillColor="var(--palette-surface-soft)" />
        <FooterSection />
      </div>
    </div>
  );
}
