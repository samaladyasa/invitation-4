import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FireworksBackground } from './FireworksBackground';
import { siteData } from '../siteConfig';

gsap.registerPlugin(ScrollTrigger);

const WEDDING_DATE = new Date(siteData.countdown.date);


function NeumorphicUnit({ unit, isDarkMode }) {
  const formattedVal = String(unit.value).padStart(2, '0');
  const dashRatio = unit.value / unit.max;
  const strokeDasharray = 220;
  const strokeDashoffset = strokeDasharray * (1 - dashRatio);

  const cardRef = useRef(null);
  const wellRef = useRef(null);
  const valRef = useRef(null);
  const ringRef = useRef(null);

  
  useEffect(() => {
    if (valRef.current) {
      gsap.fromTo(
        valRef.current,
        { scale: 0.76, y: -6, rotateX: 25 },
        { scale: 1, y: 0, rotateX: 0, duration: 0.5, ease: 'back.out(2.4)' }
      );
    }
    if (wellRef.current) {
      gsap.fromTo(
        wellRef.current,
        { scale: 1.06, rotateZ: unit.isHighlight ? 4 : -3 },
        { scale: 1, rotateZ: 0, duration: 0.65, ease: 'elastic.out(1.2, 0.45)' }
      );
    }
    if (ringRef.current) {
      gsap.fromTo(
        ringRef.current,
        { scale: 1.04 },
        { scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [unit.value]);

  
  const handlePressDown = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { scale: 0.94, y: 3, duration: 0.12, ease: 'power2.out' });
    }
    if (wellRef.current) {
      gsap.to(wellRef.current, { scale: 0.88, y: 4, duration: 0.12, ease: 'power2.out' });
    }
  };

  const handlePressRelease = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { scale: 1, y: 0, duration: 0.6, ease: 'back.out(2.5)' });
    }
    if (wellRef.current) {
      gsap.to(wellRef.current, { scale: 1, y: 0, duration: 0.75, ease: 'elastic.out(1.2, 0.4)' });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handlePressDown}
      onMouseUp={handlePressRelease}
      onMouseLeave={handlePressRelease}
      onTouchStart={handlePressDown}
      onTouchEnd={handlePressRelease}
      className={`group relative p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer active:cursor-grabbing ${
        isDarkMode
          ? 'neu-dark-flat hover:neu-dark-inset'
          : 'neu-convex hover:neu-pressed'
      }`}
    >
      {}
      <div
        ref={ringRef}
        className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mb-3 ${
          isDarkMode ? 'neu-dark-inset' : 'neu-circle-inset'
        }`}
      >
        {}
        <svg className="w-full h-full -rotate-90 p-1" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={isDarkMode ? '#2d2015' : '#e6decb'}
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={unit.color}
            strokeWidth="5"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {}
        <div
          ref={wellRef}
          className={`absolute inset-3 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md ${
            isDarkMode ? 'neu-dark-flat' : 'neu-circle'
          }`}
        >
          <span
            ref={valRef}
            className={`text-2xl sm:text-3xl font-serif-display font-extrabold inline-block ${
              unit.isHighlight
                ? 'text-[#c86d51]'
                : isDarkMode ? 'text-[#faf7f2]' : 'text-[#2d2218]'
            }`}
          >
            {formattedVal}
          </span>
        </div>
      </div>

      {}
      <span className={`text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.2em] font-extrabold ${
        unit.isHighlight ? 'text-[#c86d51]' : 'text-[#b58d55]'
      }`}>
        {unit.label}
      </span>
    </div>
  );
}


function NeumorphicClock({ timeLeft }) {
  const units = [
    { label: 'Days', value: timeLeft.days, max: 365, color: '#b58d55' },
    { label: 'Hours', value: timeLeft.hours, max: 24, color: '#976f3f' },
    { label: 'Minutes', value: timeLeft.minutes, max: 60, color: '#7a6755' },
    { label: 'Seconds', value: timeLeft.seconds, max: 60, color: '#c86d51', isHighlight: true },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto my-4 p-6 sm:p-8 md:p-10 rounded-3xl bg-[#f5f0e6] neu-flat border border-[#e8dfcf] transition-all duration-500">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {units.map((unit, idx) => (
          <NeumorphicUnit key={idx} unit={unit} isDarkMode={false} />
        ))}
      </div>
    </div>
  );
}


function FlipCard({ value, label, isPulse = false }) {
  const formattedVal = String(value).padStart(2, '0');
  const [currentVal, setCurrentVal] = useState(formattedVal);
  const [previousVal, setPreviousVal] = useState(formattedVal);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (formattedVal !== currentVal) {
      setPreviousVal(currentVal);
      setCurrentVal(formattedVal);
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [formattedVal, currentVal]);

  return (
    <div className="flex flex-col items-center">
      {}
      <div className="relative w-16 sm:w-24 md:w-28 h-20 sm:h-28 md:h-32 rounded-2xl bg-[#1e1610] border-2 border-[#b58d55]/80 shadow-xl overflow-hidden perspective-500 group">
        {}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d2218] via-[#1a120b] to-[#120c07]" />
        
        {}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-[#2d2218] border-b border-[#0f0905] overflow-hidden flex items-end justify-center rounded-t-xl">
          <span className="translate-y-1/2 text-3xl sm:text-5xl md:text-6xl font-serif-display font-extrabold text-[#faf7f2] tracking-wider select-none drop-shadow-md">
            {currentVal}
          </span>
        </div>

        {}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-[#1c140d] overflow-hidden flex items-start justify-center rounded-b-xl">
          <span className="-translate-y-1/2 text-3xl sm:text-5xl md:text-6xl font-serif-display font-extrabold text-[#faf7f2] tracking-wider select-none drop-shadow-md">
            {isFlipping ? previousVal : currentVal}
          </span>
        </div>

        {}
        {isFlipping && (
          <div className="absolute top-0 inset-x-0 h-1/2 bg-[#2a1f16] border-b border-[#0f0905] overflow-hidden flex items-end justify-center rounded-t-xl origin-bottom animate-flipDown z-20">
            <span className="translate-y-1/2 text-3xl sm:text-5xl md:text-6xl font-serif-display font-extrabold text-[#faf7f2] tracking-wider select-none">
              {previousVal}
            </span>
          </div>
        )}

        {}
        <div className="absolute top-1/2 inset-x-0 h-[2px] bg-[#0c0805] shadow-xs z-30" />
        <div className="absolute top-1/2 left-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#b58d55] border border-[#2d2218] z-40" />
        <div className="absolute top-1/2 right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#b58d55] border border-[#2d2218] z-40" />

        {}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-white/25 z-30" />
      </div>

      {}
      <span
        className={`text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.25em] font-extrabold mt-2.5 sm:mt-3 ${
          isPulse ? 'text-[#c86d51] animate-pulse' : 'text-[#b58d55]'
        }`}
      >
        {label}
      </span>
    </div>
  );
}


function MontanaHorizonClock({ timeLeft }) {
  const totalDays = 365;
  const daysLeft = Math.min(totalDays, Math.max(0, timeLeft.days));
  const progressRatio = (totalDays - daysLeft) / totalDays;
  const sunAngle = -70 + progressRatio * 140;

  return (
    <div className="relative w-full max-w-3xl mx-auto my-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1e1712] via-[#2a1d15] to-[#1a120b] border-2 border-[#b58d55]/60 shadow-2xl overflow-hidden text-[#faf7f2]">
      {}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#b58d55_1px,transparent_1px)] [background-size:16px_16px]" />

      {}
      <div className="relative w-full h-44 sm:h-52 md:h-60 flex items-center justify-center">
        <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="horizonSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5d77f" />
              <stop offset="100%" stopColor="#c86d51" />
            </linearGradient>
            <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d2c1f" />
              <stop offset="100%" stopColor="#18110b" />
            </linearGradient>
            <filter id="sunGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {}
          <path
            d="M 40 180 A 160 140 0 0 1 360 180"
            fill="none"
            stroke="#b58d55"
            strokeWidth="2"
            strokeDasharray="4 6"
            strokeOpacity="0.4"
          />

          {}
          <g transform={`translate(200, 180) rotate(${sunAngle}) translate(0, -140) rotate(${-sunAngle})`}>
            <circle cx="0" cy="0" r="14" fill="url(#horizonSunGrad)" filter="url(#sunGlow)" className="animate-pulse" />
            <circle cx="0" cy="0" r="8" fill="#faf7f2" />
          </g>

          {}
          <path
            d="M 0 190 L 30 165 L 60 175 L 100 135 L 130 155 L 170 120 L 200 140 L 240 110 L 280 150 L 320 130 L 360 160 L 400 145 L 400 200 L 0 200 Z"
            fill="url(#mountainGrad)"
            stroke="#b58d55"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {}
          <path
            d="M 20 190 L 25 175 L 30 190 M 45 190 L 50 170 L 55 190 M 340 190 L 345 168 L 350 190 M 370 190 L 375 172 L 380 190"
            stroke="#120c07"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {}
        <div className="absolute top-6 sm:top-8 text-center">
          <p className="text-[10px] sm:text-xs uppercase font-sans tracking-[0.3em] text-[#b58d55] font-bold">
            Gallatin Sunset Arc
          </p>
          <div className="text-3xl sm:text-5xl md:text-6xl font-serif-display font-extrabold text-[#faf7f2] tracking-tight drop-shadow-lg mt-1">
            {timeLeft.days} <span className="text-sm sm:text-lg font-sans font-normal text-[#b58d55]">DAYS</span>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-2 pt-4 border-t border-[#b58d55]/30">
        <div className="bg-[#120c07]/80 border border-[#b58d55]/40 p-3 rounded-2xl text-center shadow-inner">
          <span className="text-2xl sm:text-3xl font-serif-display font-bold text-[#faf7f2]">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <p className="text-[10px] font-sans uppercase tracking-widest text-[#b58d55] font-bold mt-0.5">
            Hours
          </p>
        </div>

        <div className="bg-[#120c07]/80 border border-[#b58d55]/40 p-3 rounded-2xl text-center shadow-inner">
          <span className="text-2xl sm:text-3xl font-serif-display font-bold text-[#faf7f2]">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <p className="text-[10px] font-sans uppercase tracking-widest text-[#b58d55] font-bold mt-0.5">
            Minutes
          </p>
        </div>

        <div className="bg-[#120c07]/80 border border-[#c86d51]/60 p-3 rounded-2xl text-center shadow-inner">
          <span className="text-2xl sm:text-3xl font-serif-display font-bold text-[#c86d51]">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <p className="text-[10px] font-sans uppercase tracking-widest text-[#c86d51] font-bold mt-0.5">
            Seconds
          </p>
        </div>
      </div>
    </div>
  );
}


function VintagePocketWatchGraphic({ timeLeft, hourAngle, minuteAngle, secondAngle }) {
  
  const daysAngle = ((365 - Math.min(365, timeLeft.days)) / 365) * 360;
  
  const subSecondAngle = (timeLeft.seconds / 60) * 360;

  
  const romanNumerals = [
    { num: 'XII', angle: 0 },
    { num: 'I', angle: 30 },
    { num: 'II', angle: 60 },
    { num: 'III', angle: 90 },
    { num: 'IV', angle: 120 },
    { num: 'V', angle: 150 },
    { num: 'VI', angle: 180 },
    { num: 'VII', angle: 210 },
    { num: 'VIII', angle: 240 },
    { num: 'IX', angle: 270 },
    { num: 'X', angle: 300 },
    { num: 'XI', angle: 330 },
  ];

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[400px] mx-auto my-2 drop-shadow-2xl flex flex-col items-center select-none">
      <svg
        viewBox="0 0 340 390"
        className="w-full h-auto overflow-visible"
        style={{ filter: 'drop-shadow(0px 18px 24px rgba(28, 18, 8, 0.35))' }}
      >
        <defs>
          {}
          <linearGradient id="outerCaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5d77f" />
            <stop offset="25%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#b58d55" />
            <stop offset="75%" stopColor="#8a6428" />
            <stop offset="100%" stopColor="#4a3411" />
          </linearGradient>

          <radialGradient id="innerBezelGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#2e200f" />
            <stop offset="92%" stopColor="#59411e" />
            <stop offset="100%" stopColor="#b58d55" />
          </radialGradient>

          <radialGradient id="parchmentDialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#f7f2e6" />
            <stop offset="90%" stopColor="#ebe1cc" />
            <stop offset="100%" stopColor="#d9c9a8" />
          </radialGradient>

          <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d2b17" />
            <stop offset="100%" stopColor="#1a1107" />
          </linearGradient>

          <linearGradient id="terracottaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e07a5f" />
            <stop offset="100%" stopColor="#ab4326" />
          </linearGradient>

          {}
          <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {}
        {}
        <circle
          cx="170"
          cy="26"
          r="22"
          fill="none"
          stroke="url(#outerCaseGrad)"
          strokeWidth="7"
        />
        <circle cx="170" cy="26" r="22" fill="none" stroke="#2e200f" strokeWidth="1" />

        {}
        <path
          d="M 158,45 L 182,45 L 180,62 L 160,62 Z"
          fill="url(#outerCaseGrad)"
          stroke="#4a3411"
          strokeWidth="1"
        />

        {}
        <rect x="156" y="38" width="28" height="10" rx="2" fill="url(#outerCaseGrad)" />
        {}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={i}
            x1={160 + i * 3.3}
            y1="38"
            x2={160 + i * 3.3}
            y2="48"
            stroke="#4a3411"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
        ))}

        {}
        {}
        <circle
          cx="170"
          cy="225"
          r="158"
          fill="url(#outerCaseGrad)"
          stroke="#38250b"
          strokeWidth="2"
        />

        {}
        <circle
          cx="170"
          cy="225"
          r="148"
          fill="url(#innerBezelGrad)"
          stroke="#b58d55"
          strokeWidth="1.5"
        />

        {}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const rx = 170 + 153 * Math.sin(a);
          const ry = 225 - 153 * Math.cos(a);
          return (
            <circle
              key={i}
              cx={rx}
              cy={ry}
              r="2"
              fill="#f5d77f"
              stroke="#4a3411"
              strokeWidth="0.75"
            />
          );
        })}

        {}
        <circle
          cx="170"
          cy="225"
          r="138"
          fill="url(#parchmentDialGrad)"
          stroke="#735323"
          strokeWidth="2.5"
        />

        {}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          const x2 = 170 + 135 * Math.sin(a);
          const y2 = 225 - 135 * Math.cos(a);
          return (
            <line
              key={i}
              x1="170"
              y1="225"
              x2={x2}
              y2={y2}
              stroke="#8a6428"
              strokeWidth="0.5"
              strokeOpacity="0.1"
            />
          );
        })}

        {}
        <circle
          cx="170"
          cy="225"
          r="132"
          fill="none"
          stroke="#6e5229"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
        <circle
          cx="170"
          cy="225"
          r="126"
          fill="none"
          stroke="#6e5229"
          strokeWidth="0.75"
          strokeOpacity="0.3"
        />

        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i * 6 * Math.PI) / 180;
          const isFive = i % 5 === 0;
          const rInner = isFive ? 124 : 127;
          const rOuter = 132;
          const x1 = 170 + rInner * Math.sin(a);
          const y1 = 225 - rInner * Math.cos(a);
          const x2 = 170 + rOuter * Math.sin(a);
          const y2 = 225 - rOuter * Math.cos(a);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#3d2b17"
              strokeWidth={isFive ? '1.8' : '0.8'}
              strokeOpacity={isFive ? '0.85' : '0.45'}
            />
          );
        })}

        {}
        {romanNumerals.map((r, i) => {
          const a = (r.angle * Math.PI) / 180;
          const rad = 111;
          const nx = 170 + rad * Math.sin(a);
          const ny = 225 - rad * Math.cos(a) + 4; 

          return (
            <text
              key={i}
              x={nx}
              y={ny}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#2d1f10"
              fontSize="14"
              fontWeight="bold"
              fontFamily="Playfair Display, Georgia, serif"
              letterSpacing="0.05em"
            >
              {r.num}
            </text>
          );
        })}

        {}
        <g transform="translate(118, 225)">
          <circle cx="0" cy="0" r="26" fill="#f2eada" stroke="#8a6428" strokeWidth="1.2" />
          <circle
            cx="0"
            cy="0"
            r="23"
            fill="none"
            stroke="#3d2b17"
            strokeWidth="0.5"
            strokeDasharray="1 3"
            strokeOpacity="0.5"
          />
          <text
            x="0"
            y="-13"
            textAnchor="middle"
            fontSize="7"
            fontFamily="sans-serif"
            fontWeight="bold"
            fill="#8a6428"
            letterSpacing="0.1em"
          >
            DAYS
          </text>
          <text
            x="0"
            y="17"
            textAnchor="middle"
            fontSize="8"
            fontFamily="Georgia, serif"
            fontWeight="bold"
            fill="#2d1f10"
          >
            {timeLeft.days}
          </text>
          {}
          <line
            x1="0"
            y1="0"
            x2={18 * Math.sin((daysAngle * Math.PI) / 180)}
            y2={-18 * Math.cos((daysAngle * Math.PI) / 180)}
            stroke="#ab4326"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="2" fill="#3d2b17" />
        </g>

        {}
        <g transform="translate(222, 225)">
          <circle cx="0" cy="0" r="26" fill="#f2eada" stroke="#8a6428" strokeWidth="1.2" />
          <circle
            cx="0"
            cy="0"
            r="23"
            fill="none"
            stroke="#3d2b17"
            strokeWidth="0.5"
            strokeDasharray="1 3"
            strokeOpacity="0.5"
          />
          <text
            x="0"
            y="-13"
            textAnchor="middle"
            fontSize="7"
            fontFamily="sans-serif"
            fontWeight="bold"
            fill="#8a6428"
            letterSpacing="0.1em"
          >
            SEC
          </text>
          <text
            x="0"
            y="17"
            textAnchor="middle"
            fontSize="8"
            fontFamily="Georgia, serif"
            fontWeight="bold"
            fill="#ab4326"
          >
            {String(timeLeft.seconds).padStart(2, '0')}
          </text>
          {}
          <line
            x1="0"
            y1="0"
            x2={18 * Math.sin((subSecondAngle * Math.PI) / 180)}
            y2={-18 * Math.cos((subSecondAngle * Math.PI) / 180)}
            stroke="#3d2b17"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="0" cy="0" r="2" fill="#3d2b17" />
        </g>

        {}
        <g transform="translate(170, 168)">
          <rect
            x="-42"
            y="-10"
            width="84"
            height="18"
            rx="4"
            fill="#eae0cc"
            stroke="#b58d55"
            strokeWidth="0.8"
          />
          <text
            x="0"
            y="2"
            textAnchor="middle"
            fontSize="8"
            fontFamily="Playfair Display, Georgia, serif"
            fontWeight="bold"
            fill="#4a3411"
            letterSpacing="0.1em"
          >
            OCT 24 • 2026
          </text>
        </g>

        {}
        <text
          x="170"
          y="282"
          textAnchor="middle"
          fontSize="8"
          fontFamily="Playfair Display, Georgia, serif"
          fontStyle="italic"
          fill="#6e5229"
          letterSpacing="0.12em"
        >
          Bozeman • Montana
        </text>

        {}
        <g filter="url(#handShadow)">
          {}
          <g transform={`translate(170, 225) rotate(${hourAngle})`}>
            <path
              d="M -3,10 L -2,-42 C -5,-46 -7,-52 0,-62 C 7,-52 5,-46 2,-42 L 3,10 Z"
              fill="url(#handGrad)"
            />
            {}
            <circle cx="0" cy="-52" r="3.5" fill="#f7f2e6" stroke="#2d1f10" strokeWidth="1" />
          </g>

          {}
          <g transform={`translate(170, 225) rotate(${minuteAngle})`}>
            <path
              d="M -2,12 L -1.5,-64 C -4,-68 -5,-76 0,-88 C 5,-76 4,-68 1.5,-64 L 2,12 Z"
              fill="url(#handGrad)"
            />
            {}
            <circle cx="0" cy="-74" r="3" fill="#f7f2e6" stroke="#2d1f10" strokeWidth="1" />
          </g>

          {}
          <g transform={`translate(170, 225) rotate(${secondAngle})`}>
            <line x1="0" y1="22" x2="0" y2="-98" stroke="url(#terracottaGrad)" strokeWidth="1.2" />
            {}
            <circle cx="0" cy="14" r="3.5" fill="url(#terracottaGrad)" />
          </g>

          {}
          <circle cx="170" cy="225" r="5" fill="url(#outerCaseGrad)" stroke="#2d1f10" strokeWidth="1" />
          <circle cx="170" cy="225" r="2" fill="#ab4326" />
        </g>
      </svg>
    </div>
  );
}
function SvgGsapRing({ value, maxVal, label, color = '#b58d55', isTerracotta = false }) {
  const numRef = useRef(null);
  const ringRef = useRef(null);
  const formattedVal = String(value).padStart(2, '0');

  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  
  useEffect(() => {
    if (numRef.current) {
      gsap.fromTo(
        numRef.current,
        { scale: 1.25, y: -2, opacity: 0.6 },
        { scale: 1, y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' }
      );
    }
  }, [formattedVal]);

  
  useEffect(() => {
    if (ringRef.current) {
      const progress = Math.min(1, Math.max(0, value / maxVal));
      const targetOffset = circumference * (1 - progress);
      gsap.to(ringRef.current, {
        strokeDashoffset: targetOffset,
        duration: 0.7,
        ease: 'power2.out',
      });
    }
  }, [value, maxVal, circumference]);

  return (
    <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 bg-[#f0e8d9]/70 border border-[#b58d55]/30 rounded-2xl shadow-xs hover:border-[#b58d55]/60 transition-all duration-300">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 120 120">
          <defs>
            <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isTerracotta ? '#d97d62' : '#d4af37'} />
              <stop offset="100%" stopColor={isTerracotta ? '#a84c32' : '#8a6428'} />
            </linearGradient>
            <filter id={`glow-${label}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e2d4bc"
            strokeWidth="5"
            className="opacity-70"
          />

          {}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 60 + 54 * Math.cos(angle);
            const y1 = 60 + 54 * Math.sin(angle);
            const x2 = 60 + 58 * Math.cos(angle);
            const y2 = 60 + 58 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#b58d55"
                strokeWidth={i % 3 === 0 ? '1.5' : '0.75'}
                strokeOpacity={i % 3 === 0 ? '0.8' : '0.4'}
              />
            );
          })}

          {}
          <circle
            ref={ringRef}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={`url(#grad-${label})`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            filter={`url(#glow-${label})`}
          />

          {}
          <circle
            cx="60"
            cy="60"
            r={radius - 8}
            fill="none"
            stroke="#b58d55"
            strokeWidth="1"
            strokeDasharray="2 4"
            strokeOpacity="0.4"
          />
        </svg>

        {}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span
            ref={numRef}
            className={`text-3xl sm:text-4xl md:text-5xl font-serif-display font-extrabold tracking-tight select-none ${
              isTerracotta ? 'text-[#c86d51]' : 'text-[#2d2218]'
            }`}
          >
            {formattedVal}
          </span>
          <span className="text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.2em] font-extrabold text-[#8a7259] mt-0.5">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CountdownTimer() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalHours: 0,
    sunsetsLeft: 0,
    weekendsLeft: 0,
    isPassed: false,
  });

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date();
      const difference = WEDDING_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalHours: 0,
          sunsetsLeft: 0,
          weekendsLeft: 0,
          isPassed: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const totalHours = Math.floor(difference / (1000 * 60 * 60));
      const sunsetsLeft = days;
      const weekendsLeft = Math.floor(days / 7);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalHours,
        sunsetsLeft,
        weekendsLeft,
        isPassed: false,
      });
    }

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  
  const secondAngle = (timeLeft.seconds / 60) * 360;
  const minuteAngle = (timeLeft.minutes / 60) * 360 + (timeLeft.seconds / 60) * 6;
  const hourAngle = ((timeLeft.hours % 12) / 12) * 360 + (timeLeft.minutes / 60) * 30;

  return (
    <section
      ref={containerRef}
      className="relative w-full py-16 md:py-24 px-4 flex flex-col items-center justify-center paper-texture overflow-hidden"
    >
      {}
      <FireworksBackground population={10} color="multi" className="absolute inset-0 pointer-events-none z-0 opacity-45" />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div
          ref={cardRef}
          className="relative western-frame bg-[#faf7f2]/95 backdrop-blur-sm rounded-3xl p-6 sm:p-10 md:p-12 text-center shadow-md border border-[#b58d55]/40"
        >
          <div className="max-w-md mx-auto mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-display text-[#2d2218]">
              {siteData.countdown.headline}
            </h2>
            <p className="text-xs sm:text-sm font-sans text-[#7a6755] italic mt-1">
              {siteData.countdown.location}
            </p>
          </div>

          <div className="transition-all duration-500 animate-fadeIn">
            <NeumorphicClock timeLeft={timeLeft} />
          </div>
        </div>
      </div>
    </section>
  );
}



