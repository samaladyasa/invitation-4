import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { siteData } from '../siteConfig';

export function HeroSection() {
  const containerRef = useRef(null);

  
  const name1Ref = useRef(null);
  const ampersandRef = useRef(null);
  const name2Ref = useRef(null);
  const sublineRef = useRef(null);
  const locationTextRef = useRef(null);
  

  useEffect(() => {
    let removeEndedListener;

    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      
      const nameElements = [name1Ref.current, ampersandRef.current, name2Ref.current].filter(Boolean);
      if (nameElements.length > 0) {
        tl.fromTo(
          nameElements,
          { y: 30, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.15 },
          '-=0.4'
        );
      }

      
      tl.fromTo(
        sublineRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.3'
      );

      tl.fromTo(
        locationTextRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );
    }, containerRef);

    

    return () => {
      if (removeEndedListener) removeEndedListener();
      ctx.revert();
    };
  }, []);

  const hero = siteData.hero;

  return (
    <section
      ref={containerRef}
      className="hero-background relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-12 select-none"
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="relative z-10 w-full flex flex-col items-center justify-between">
        {}
        {}

      {}
      <h1 className="title-reveal relative z-10 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif-display font-medium text-white tracking-tight leading-[1.1] mb-6 mt-10 drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)]">
        <span ref={name1Ref} className="inline-block">
          {hero.names[0]}
        </span>{' '}
        <span
          ref={ampersandRef}
          className="inline-block font-serif-italic text-[#ffd8a2] text-3xl sm:text-5xl md:text-6xl px-1 md:px-3"
        >
          &
        </span>{' '}
        <span ref={name2Ref} className="inline-block">
          {hero.names[1]}
        </span>
      </h1>

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center px-6 py-6 md:py-8">

        {}
        <p
          ref={sublineRef}
          className="font-serif-italic text-lg sm:text-2xl text-white/85 tracking-wide font-normal drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]"
        >
          {hero.subtitle}
        </p>

        {}
        <p
          ref={locationTextRef}
          className="mt-4 text-xs md:text-sm font-sans tracking-[0.2em] text-white/80 uppercase font-semibold drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
        >
          {hero.location}
        </p>
      </div>
  </div>
    </section>
  );
}