import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { FireworksBackground } from './FireworksBackground';
import { siteData } from '../siteConfig';


import rosePetalPng from '../assets/images/rosepetal.png';

const REAL_PETALS = [
  { img: rosePetalPng, name: 'Rose Petal' },
  { img: rosePetalPng, name: 'Rose Petal' },
  { img: rosePetalPng, name: 'Rose Petal' },
];

const NUM_PETALS = 90;

export function HeartPetalReveal() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const containerRef = useRef(null);
  const heartBoxRef = useRef(null);
  const petalsRef = useRef([]);
  const textContentRef = useRef(null);
  const glowRef = useRef(null);

  
  const petalData = useMemo(() => {
    const data = [];
    const cardSize = 340;
    const cols = 20;
    const rows = Math.ceil(NUM_PETALS / cols);
    const scaleX = 9.5;
    const scaleY = 9.0;

    for (let i = 0; i < NUM_PETALS; i++) {
      const t = (i / NUM_PETALS) * Math.PI * 2;
      const rawX = 16 * Math.pow(Math.sin(t), 3);
      const rawY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      const size = 32 + Math.random() * 12;

      
      
      const targetX = (rawX * scaleX) - (size / 2);
      const targetY = ((rawY - 6) * scaleY) - ((size * 1.1) / 2);

      const dxdt = 48 * Math.pow(Math.sin(t), 2) * Math.cos(t);
      const dydt = 13 * Math.sin(t) - 10 * Math.sin(2 * t) - 6 * Math.sin(3 * t) - 4 * Math.sin(4 * t);
      const angleRad = Math.atan2(dydt, dxdt);
      const targetRotation = (angleRad * 180) / Math.PI + (i % 2 === 0 ? 20 : -20);

      const col = i % cols;
      const row = Math.floor(i / cols);
      const xStep = cardSize / (cols - 1);
      const yStep = cardSize / (rows - 1);

      const gridX = col * xStep - cardSize / 2;
      const gridY = row * yStep - cardSize / 2;

      const jitterX = (Math.random() - 0.5) * (xStep * 2);
      const jitterY = (Math.random() - 0.5) * (yStep * 2);

      
      const initialX = gridX + jitterX - (size / 2);
      const initialY = gridY + jitterY - ((size * 1.1) / 2);

      const initialRotation = Math.random() * 360 - 180;

      const petalInfo = REAL_PETALS[i % REAL_PETALS.length];

      data.push({
        id: i,
        initialX,
        initialY,
        initialRotation,
        targetX,
        targetY,
        targetRotation,
        size,
        petalInfo,
        zIndex: Math.floor(Math.random() * NUM_PETALS) + 1,
      });
    }

    return data;
  }, []);

  
  const handleToggleReveal = () => {
    if (!hasInteracted) setHasInteracted(true);

    const validPetals = petalsRef.current.filter(Boolean);

    if (!isRevealed) {
      
      setIsRevealed(true);



      if (validPetals.length > 0) {
        
        gsap.to(validPetals, {
          x: (index) => petalData[index]?.targetX ?? 0,
          y: (index) => petalData[index]?.targetY ?? 0,
          rotation: (index) => petalData[index]?.targetRotation ?? 0,
          scale: 1,
          duration: 0.85,
          ease: 'back.out(1.2)',
          stagger: {
            each: 0.005,
            from: 'random',
          },
        });
      }

      
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { opacity: 0, scale: 0.7 },
          { opacity: 0.9, scale: 1.15, duration: 1.4, ease: 'power2.out', delay: 0.4 }
        );
      }

      
      if (textContentRef.current) {
        gsap.fromTo(
          textContentRef.current,
          { opacity: 0, y: 24, scale: 0.92 },
          { opacity: 1, y: -24, scale: 1, duration: 0.9, delay: 0.95, ease: 'power2.out' }
        );
      }
    } else {
      
      setIsRevealed(false);

      if (textContentRef.current) {
        gsap.to(textContentRef.current, { opacity: 0, y: 10, duration: 0.35 });
      }

      if (glowRef.current) {
        gsap.to(glowRef.current, { opacity: 0, duration: 0.4 });
      }

      if (validPetals.length > 0) {
        gsap.to(validPetals, {
          x: (index) => petalData[index]?.initialX ?? 0,
          y: (index) => petalData[index]?.initialY ?? 0,
          rotation: (index) => petalData[index]?.initialRotation ?? 0,
          duration: 0.75,
          ease: 'power2.inOut',
          stagger: {
            each: 0.005,
            from: 'center',
          },
        });
      }
    }
  };

  const heart = siteData.heartReveal;

  return (
    <section
      ref={containerRef}
      className="relative w-full py-16 md:py-24 px-4 flex flex-col items-center justify-center overflow-hidden"
    >
      {}
      <FireworksBackground population={10} color="multi" className="absolute inset-0 pointer-events-none z-0 opacity-40" />

      {}
      <div className="text-center max-w-xl mx-auto mb-8 px-4">
        <p className="text-xs uppercase font-sans tracking-[0.3em] text-[#b58d55] mb-2 font-medium">
          {heart.tag}
        </p>
        <h2 className="text-3xl md:text-4xl font-serif-display text-[#2d2218]">
          {heart.headline}
        </h2>
        <div className="w-12 h-[1px] bg-[#b58d55]/50 mx-auto my-3" />
        <p className="text-sm text-[#7a6755] max-w-md mx-auto">
          {heart.note}
        </p>
      </div>

      {}
      <div className="relative w-full max-w-xl flex flex-col items-center justify-center min-h-[420px] md:min-h-[460px]">
        {}
        <div
          ref={heartBoxRef}
          onClick={handleToggleReveal}
          className="relative w-full max-w-sm mx-auto p-6 md:p-10 text-center flex flex-col items-center justify-center cursor-pointer group touch-manipulation select-none aspect-square overflow-hidden"
          aria-label={heart.ariaLabel}
        >
          {}
          <div
            ref={glowRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-radial from-[#ebd0cd]/50 via-[#ebd0cd]/10 to-transparent pointer-events-none opacity-0 blur-2xl"
          />

          {}
          {petalData.map((petal, index) => (
            <div
              key={petal.id}
              ref={(el) => (petalsRef.current[index] = el)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-shadow"
              style={{
                transform: `translate3d(${petal.initialX}px, ${petal.initialY}px, 0px) rotate(${petal.initialRotation}deg)`,
                width: `${petal.size}px`,
                height: `${petal.size * 1.1}px`,
                zIndex: petal.zIndex,
              }}
            >
              {}
              <div className="w-full h-full transform hover:scale-110 transition-transform drop-shadow-md">
                <img
                  src={petal.petalInfo.img}
                  alt={petal.petalInfo.name}
                  className="w-full h-full object-contain filter contrast-105 brightness-95"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          ))}

          {}
          <div
            ref={textContentRef}
            className="absolute z-30 inset-0 flex flex-col items-center justify-center p-4 text-center opacity-0 pointer-events-none drop-shadow-md"
          >
            <p className="text-3xl sm:text-4xl font-serif-display font-medium text-[#3a2826] leading-tight my-2 -translate-y-2">
              {heart.date}
            </p>

            <div className="flex items-center gap-3 my-1 -translate-y-3">
              <div className="w-8 h-[1px] bg-[#c86d51]/60" />
              <span className="text-xl font-serif-italic font-semibold text-[#c86d51]">{heart.year}</span>
              <div className="w-8 h-[1px] bg-[#c86d51]/60" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
