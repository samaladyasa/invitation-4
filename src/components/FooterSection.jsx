import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FireworksBackground } from './FireworksBackground';
import { siteData } from '../siteConfig';

gsap.registerPlugin(ScrollTrigger);

export function FooterSection() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const footer = siteData.footer;

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={containerRef}
      className="relative w-full py-20 px-4 text-center overflow-hidden bg-gradient-to-br from-[#faf7f2] via-[#fbf3ee] to-[#f4e2ce] paper-texture"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#fff9f4] to-transparent pointer-events-none" />
      <FireworksBackground population={8} color="multi" className="absolute inset-0 pointer-events-none z-0 opacity-35" />

      <div ref={contentRef} className="relative z-20 mt-8 max-w-2xl mx-auto flex flex-col items-center gap-7 sm:gap-10">
        <div className="space-y-3 px-4 sm:px-0">
          <h3 className="text-3xl md:text-4xl font-serif-display text-[#24160f] font-semibold tracking-tight">
            {footer.title}
          </h3>
          <p className="font-serif-italic text-base md:text-lg text-[#3e2d24] leading-relaxed font-semibold max-w-xl mx-auto">
            {footer.description}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-sans uppercase tracking-[0.3em] text-[#2d2218] font-bold">
            {footer.names}
          </p>
          <p className="text-sm font-sans text-[#3b291f] tracking-wider font-semibold">
            {footer.dateLocation}
          </p>
        </div>

        <div className="pt-4 text-xs text-[#5a4639] tracking-wide uppercase font-medium">
          {footer.creditText}{' '}
          <a
            href={footer.creditLink}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[#c86d51] hover:text-[#b58d55] transition-colors"
          >
            {footer.creditName}
          </a>
        </div>
      </div>
    </footer>
  );
}

