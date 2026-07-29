import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ImageTrail from './ImageTrail';
import { FireworksBackground } from './FireworksBackground';
import { siteData, images } from '../siteConfig';

gsap.registerPlugin(ScrollTrigger);

const GALLERY_PHOTOS = siteData.gallery.images.map((photo) => ({
  ...photo,
  src: images[photo.imageKey],
}));

export function GallerySection() {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [activeView, setActiveView] = useState('spotlight'); 
  const [trailVariant, setTrailVariant] = useState(7);
  const [stackedTopIndex, setStackedTopIndex] = useState(0);
  const [isPeeling, setIsPeeling] = useState(false);
  const [peelDirection, setPeelDirection] = useState('right');
  const [activeSpotlightIndex, setActiveSpotlightIndex] = useState(0);
  const autoplayPausedRef = useRef(false);
  const [active3dIndex, setActive3dIndex] = useState(0);
  const [cylinderAngle, setCylinderAngle] = useState(0);
  const [cubeAngleY, setCubeAngleY] = useState(0);
  const [cubeAngleX, setCubeAngleX] = useState(-5);
  const [journalPageIndex, setJournalPageIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(() => typeof window !== 'undefined' ? window.innerWidth : 1024);
  const touchStartXRef = useRef(null);
  const mainImageRef = useRef(null);
  const containerWidthRef = useRef(null);
  const [aspectRatios, setAspectRatios] = useState([]);
  const [rows, setRows] = useState([]);

  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  useEffect(() => {
    let mounted = true;
    Promise.all(
      GALLERY_PHOTOS.map(
        (p) =>
          new Promise((resolve) => {
            const img = new Image();
            img.src = p.src;
            img.onload = () => resolve(img.naturalWidth / img.naturalHeight || 1.5);
            img.onerror = () => resolve(1.5);
          })
      )
    ).then((ratios) => {
      if (mounted) setAspectRatios(ratios);
    });
    return () => (mounted = false);
  }, []);

  
  useEffect(() => {
    if (!aspectRatios.length) return;
    const compute = () => {
      const containerEl = containerRef.current;
      const containerPadding = 0; 
      const cw = containerEl ? Math.floor(containerEl.clientWidth - containerPadding) : Math.floor((window.innerWidth * 6) / 8);
      containerWidthRef.current = cw;

      const targetRowHeight = windowWidth < 640 ? 140 : windowWidth < 1024 ? 180 : 220;
      const spacing = 12; 

      const newRows = [];
      let currentRow = [];
      let currentRowWidth = 0; 

      aspectRatios.forEach((ar, idx) => {
        const w = ar * targetRowHeight;
        if (currentRowWidth + w + currentRow.length * spacing <= cw || currentRow.length === 0) {
          currentRow.push({ idx, ar });
          currentRowWidth += w;
        } else {
          
          const rowScale = (cw - currentRow.length * spacing) / currentRowWidth;
          const rowHeight = Math.max(80, Math.round(targetRowHeight * rowScale));
          newRows.push({ items: currentRow.slice(), height: rowHeight });
          
          currentRow = [{ idx, ar }];
          currentRowWidth = w;
        }
      });

      
      if (currentRow.length > 0) {
        newRows.push({ items: currentRow.slice(), height: targetRowHeight });
      }

      setRows(newRows);
    };

    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [aspectRatios, windowWidth]);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleNextStackedCard = () => {
    if (isPeeling) return;
    setIsPeeling(true);
    setPeelDirection('right');
    setTimeout(() => {
      setStackedTopIndex((prev) => (prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : 0));
      setIsPeeling(false);
    }, 350);
  };

  const handlePrevStackedCard = () => {
    if (isPeeling) return;
    setIsPeeling(true);
    setPeelDirection('left');
    setTimeout(() => {
      setStackedTopIndex((prev) => (prev > 0 ? prev - 1 : GALLERY_PHOTOS.length - 1));
      setIsPeeling(false);
    }, 350);
  };

  const handleShuffleStack = () => {
    if (isPeeling) return;
    setIsPeeling(true);
    setStackedTopIndex((prev) => (prev + 2) % GALLERY_PHOTOS.length);
    setTimeout(() => setIsPeeling(false), 400);
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0]?.clientX || 0;
    const diffX = touchStartXRef.current - touchEndX;

    if (Math.abs(diffX) > 35) { 
      if (diffX > 0) {
        
        setActive3dIndex((prev) => (prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : 0));
      } else {
        
        setActive3dIndex((prev) => (prev > 0 ? prev - 1 : GALLERY_PHOTOS.length - 1));
      }
    }
    touchStartXRef.current = null;
  };

  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const validItems = itemsRef.current.filter(Boolean);
      if (validItems.length > 0) {
        gsap.fromTo(
          validItems,
          {
            opacity: 0,
            y: 60,
            scale: 0.9,
            rotateX: 15,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 1.0,
            ease: 'power3.out',
            stagger: 0.2,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeView]);

  
  const handleMouseMove = (e, cardEl) => {
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    gsap.to(cardEl, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.4,
      ease: 'power1.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = (cardEl) => {
    if (!cardEl) return;
    gsap.to(cardEl, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  };

  
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : GALLERY_PHOTOS.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  
  useEffect(() => {
    if (activeView !== 'spotlight') return;
    const tick = () => {
      if (selectedImageIndex !== null) return; 
      if (autoplayPausedRef.current) return;
      setActiveSpotlightIndex((prev) => (prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : 0));
    };

    const id = setInterval(tick, 4000);
    return () => clearInterval(id);
  }, [activeView, selectedImageIndex]);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 md:px-8 paper-texture overflow-hidden"
    >
      {}
      <FireworksBackground population={10} color="multi" className="absolute inset-0 pointer-events-none z-0 opacity-50" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {}
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs uppercase font-sans tracking-[0.3em] text-[#b58d55] mb-2 font-bold">
            {siteData.gallery.tag}
          </p>
          <h2 className="title-reveal text-3xl md:text-5xl font-serif-display text-[#2d2218] font-normal">
            {siteData.gallery.headline}
          </h2>
          <div className="w-16 h-[1px] bg-[#b58d55]/50 mx-auto my-3" />
          <p className="text-sm font-sans text-[#7a6755] italic">
            {siteData.gallery.description}
          </p>
        </div>

        {}
        {activeView === 'justified' && (
          <div className="relative w-full max-w-6xl mx-auto py-6">
            <div className="w-full" ref={containerRef}>
              {rows.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center gap-3 mb-3" style={{ height: `${row.height}px` }}>
                  {row.items.map((it) => {
                    const photo = GALLERY_PHOTOS[it.idx];
                    const width = Math.max(80, Math.round(it.ar * row.height));
                    return (
                      <div
                        key={photo.id}
                        style={{ width: `${width}px`, height: `${row.height}px`, overflow: 'hidden', flex: '0 0 auto' }}
                        className="rounded-md bg-[#faf7f2] cursor-pointer shadow-sm"
                        onClick={() => setSelectedImageIndex(it.idx)}
                        ref={(el) => (itemsRef.current[it.idx] = el)}
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {activeView === 'image-trail' && (
          <div className="relative w-full max-w-4xl mx-auto py-4 sm:py-6 animate-fade-in flex flex-col items-center">
            {}
            <div className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] western-frame bg-[#faf7f2] rounded-2xl shadow-inner border-2 border-[#b58d55]/40 overflow-hidden cursor-crosshair group">
              <ImageTrail
                key={trailVariant}
                items={GALLERY_PHOTOS.map((photo) => photo.src)}
                variant={trailVariant}
              />
            </div>
          </div>
        )}

        {}
        {activeView === 'stacked-deck' && (
          <div className="relative w-full max-w-3xl mx-auto py-6 sm:py-8 px-2 animate-fade-in flex flex-col items-center">
            {}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => {
                if (touchStartXRef.current === null) return;
                const touchEndX = e.changedTouches[0]?.clientX || 0;
                const diffX = touchStartXRef.current - touchEndX;
                if (Math.abs(diffX) > 35) {
                  if (diffX > 0) handleNextStackedCard();
                  else handlePrevStackedCard();
                }
                touchStartXRef.current = null;
              }}
              className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] flex items-center justify-center my-4 select-none cursor-grab active:cursor-grabbing"
              style={{ perspective: '1200px' }}
            >
              {GALLERY_PHOTOS.map((photo, index) => {
                const total = GALLERY_PHOTOS.length;
                let depth = (index - stackedTopIndex + total) % total;
                const isTop = depth === 0;

                const stackOffsets = [
                  { translateY: 0, translateX: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 40 },
                  { translateY: 14, translateX: 10, scale: 0.94, rotate: 4, opacity: 0.92, zIndex: 30 },
                  { translateY: 28, translateX: -12, scale: 0.88, rotate: -5, opacity: 0.8, zIndex: 20 },
                  { translateY: 40, translateX: 14, scale: 0.82, rotate: 3, opacity: 0.65, zIndex: 10 },
                ];

                const stylePreset = stackOffsets[depth] || stackOffsets[3];

                let peelTransformClass = '';
                if (isTop && isPeeling) {
                  peelTransformClass =
                    peelDirection === 'right'
                      ? 'translate-x-[260px] -translate-y-[30px] rotate-[22deg] scale-90 opacity-0'
                      : '-translate-x-[260px] -translate-y-[30px] -rotate-[22deg] scale-90 opacity-0';
                }

                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (isTop) {
                        setSelectedImageIndex(index);
                      } else {
                        setStackedTopIndex(index);
                      }
                    }}
                    className={`absolute w-[240px] sm:w-[320px] md:w-[360px] western-frame bg-[#faf7f2] p-3.5 sm:p-5 rounded-3xl transition-all duration-500 ease-out flex flex-col items-center cursor-pointer border ${
                      isTop
                        ? 'border-[#c86d51] ring-2 ring-[#c86d51]/20 shadow-[0_25px_50px_-12px_rgba(45,34,24,0.35)]'
                        : 'border-[#b58d55]/30 shadow-lg'
                    } ${isTop && isPeeling ? peelTransformClass : ''}`}
                    style={{
                      transform:
                        isTop && isPeeling
                          ? undefined
                          : `translate3d(${stylePreset.translateX}px, ${stylePreset.translateY}px, 0) rotate(${stylePreset.rotate}deg) scale(${stylePreset.scale})`,
                      opacity: isTop && isPeeling ? 0 : stylePreset.opacity,
                      zIndex: stylePreset.zIndex,
                      transformOrigin: 'bottom center',
                    }}
                  >
                    {}
                    <div className="relative w-full h-52 sm:h-64 md:h-72 rounded-2xl overflow-hidden bg-[#e2d2b4]/30 shadow-inner group">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover object-center filter brightness-95 contrast-105 transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-[#2d2218]/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest text-[#faf7f2]">
                        Photo 0{index + 1}
                      </div>
                      {isTop && (
                        <div className="absolute top-3 right-3 bg-[#c86d51] text-white px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest shadow-md animate-pulse">
                          Top Photo
                        </div>
                      )}
                    </div>

                    {}
                    <div className="mt-3 text-center w-full">
                      <span className="text-[10px] font-sans uppercase font-bold tracking-[0.2em] text-[#b58d55]">
                        {photo.location}
                      </span>
                      <h4 className="text-base sm:text-lg font-serif-display text-[#2d2218] mt-0.5 truncate">
                        {photo.caption}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>

            {}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 z-50">
              <button
                onClick={handlePrevStackedCard}
                className="px-4 py-2 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-[#2d2218] text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Previous Photo</span>
              </button>

              <button
                onClick={handleNextStackedCard}
                className="px-5 py-2.5 rounded-full bg-[#c86d51] text-[#faf7f2] text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#b58d55] transition-all shadow-md flex items-center gap-2 transform hover:scale-105 active:scale-95"
              >
                <span>🃏 Peel Next Photo</span>
                <span>➔</span>
              </button>

              <button
                onClick={handleShuffleStack}
                className="px-4 py-2 rounded-full bg-[#f0e8d9] border border-[#b58d55]/40 text-[#2d2218] text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#2d2218] hover:text-white transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>🔀</span>
                <span>Shuffle Stack</span>
              </button>
            </div>

            {}
            <div className="flex items-center gap-3 mt-6">
              {GALLERY_PHOTOS.map((photo, idx) => {
                const isActive = idx === stackedTopIndex;
                return (
                  <button
                    key={photo.id}
                    onClick={() => setStackedTopIndex(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      isActive
                        ? 'border-[#c86d51] scale-110 shadow-md ring-2 ring-[#c86d51]/30'
                        : 'border-[#b58d55]/30 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img
                      src={photo.src}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] font-sans text-[#8a7259] italic mt-3 text-center">
              Tap top card or click &quot;Peel Next Photo&quot; to cycle through stacked cards • Click thumbnails to jump directly
            </p>
          </div>
        )}

        {}
        {activeView === '3d-depth' && (
          <div className="relative w-full max-w-4xl mx-auto py-6 sm:py-8 px-2 animate-fade-in flex flex-col items-center">
            {}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative w-full h-[360px] sm:h-[440px] md:h-[480px] flex items-center justify-center my-2 sm:my-4 select-none cursor-grab active:cursor-grabbing overflow-hidden sm:overflow-visible"
              style={{ perspective: windowWidth < 640 ? '800px' : '1200px' }}
            >
              {GALLERY_PHOTOS.map((photo, index) => {
                const total = GALLERY_PHOTOS.length;
                let offset = index - active3dIndex;
                if (offset < -Math.floor(total / 2)) offset += total;
                if (offset > Math.floor(total / 2)) offset -= total;

                const isActive = offset === 0;
                const isAbsOne = Math.abs(offset) === 1;

                const isMobile = windowWidth < 640;
                const isTablet = windowWidth >= 640 && windowWidth < 1024;

                
                const stepX = isMobile ? 105 : isTablet ? 160 : 220;
                const translateX = offset * stepX;
                const translateZ = isActive ? 0 : isAbsOne ? (isMobile ? -100 : -150) : (isMobile ? -220 : -300);
                const rotateY = offset * (isMobile ? -18 : -25);
                const scale = isActive ? 1 : isAbsOne ? (isMobile ? 0.82 : 0.85) : (isMobile ? 0.65 : 0.7);
                const opacity = isActive ? 1 : isAbsOne ? (isMobile ? 0.65 : 0.75) : (isMobile ? 0 : 0.3);
                const zIndex = 30 - Math.abs(offset) * 10;

                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (isActive) {
                        setSelectedImageIndex(index);
                      } else {
                        setActive3dIndex(index);
                      }
                    }}
                    className={`absolute ${
                      isMobile ? 'w-[230px]' : 'w-[280px] sm:w-[340px]'
                    } western-frame bg-[#faf7f2] p-3 sm:p-4 rounded-2xl shadow-xl transition-all duration-700 ease-out flex flex-col items-center cursor-pointer`}
                    style={{
                      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      opacity,
                      zIndex,
                      transformStyle: 'preserve-3d',
                      filter: isActive ? 'drop-shadow(0 15px 25px rgba(45,34,24,0.22))' : 'blur(0.5px)',
                    }}
                  >
                    <div className="relative w-full h-52 sm:h-64 md:h-72 rounded-xl overflow-hidden bg-[#e2d2b4]/30">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="w-full h-full object-cover object-center filter brightness-95 contrast-105 pointer-events-none"
                        referrerPolicy="no-referrer"
                      />
                      {isActive && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#faf7f2]/90 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-widest text-[#2d2218] border border-[#b58d55]/40 shadow-xs">
                          Expand 🔍
                        </div>
                      )}
                    </div>
                    <div className="mt-2 sm:mt-3 text-center">
                      <p className="text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] text-[#b58d55] font-bold">
                        {photo.location}
                      </p>
                      <h4 className="text-sm sm:text-base md:text-lg font-serif-display text-[#2d2218] mt-0.5 truncate max-w-[200px]">
                        {photo.caption}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>

            {}
            <div className="flex items-center justify-between w-full max-w-xs mt-3 sm:mt-4">
              <button
                onClick={() =>
                  setActive3dIndex((prev) => (prev > 0 ? prev - 1 : GALLERY_PHOTOS.length - 1))
                }
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-[#2d2218] font-bold text-sm hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm flex items-center justify-center"
                aria-label="Previous photo"
              >
                ←
              </button>

              {}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {GALLERY_PHOTOS.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setActive3dIndex(idx)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all ${
                      active3dIndex === idx
                        ? 'w-6 sm:w-7 bg-[#c86d51]'
                        : 'w-2 sm:w-2.5 bg-[#b58d55]/40 hover:bg-[#b58d55]'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setActive3dIndex((prev) => (prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : 0))
                }
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-[#2d2218] font-bold text-sm hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm flex items-center justify-center"
                aria-label="Next photo"
              >
                →
              </button>
            </div>
            <p className="text-[11px] font-sans text-[#8a7259] italic mt-2 text-center">
              Swipe left/right or tap arrows to navigate • Click active photo to expand
            </p>
          </div>
        )}

        {}
        {activeView === '3d-cylinder' && (
          <div className="relative w-full max-w-4xl mx-auto py-6 sm:py-8 animate-fade-in flex flex-col items-center">
            {}
            <div
              className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] flex items-center justify-center overflow-hidden"
              style={{ perspective: windowWidth < 640 ? '900px' : '1400px' }}
            >
              {}
              <div
                className="relative w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${cylinderAngle}deg)`,
                }}
              >
                {GALLERY_PHOTOS.map((photo, index) => {
                  const angle = (index * 360) / GALLERY_PHOTOS.length;
                  const radius = windowWidth < 640 ? 180 : windowWidth < 1024 ? 250 : 320;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className="absolute w-[200px] sm:w-[260px] md:w-[310px] western-frame bg-[#faf7f2] p-3 sm:p-4 rounded-2xl shadow-xl cursor-pointer hover:border-[#c86d51] transition-all"
                      style={{
                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'visible',
                      }}
                    >
                      <div className="relative w-full h-44 sm:h-60 md:h-68 rounded-xl overflow-hidden bg-[#e2d2b4]/30">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2 right-2 bg-[#faf7f2]/90 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider text-[#2d2218] border border-[#b58d55]/40 shadow-xs">
                          Expand 🔍
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3 text-center">
                        <span className="text-[9px] sm:text-[10px] font-sans uppercase tracking-widest text-[#b58d55] font-bold">
                          {photo.location}
                        </span>
                        <h4 className="text-xs sm:text-base font-serif-display text-[#2d2218] mt-0.5 truncate">
                          {photo.caption}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
              <button
                onClick={() => setCylinderAngle((prev) => prev + 90)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm"
              >
                ↺ Spin Left
              </button>
              <div className="text-[11px] sm:text-xs font-sans text-[#8a7259] font-semibold tracking-wider">
                3D Wheel Perspective
              </div>
              <button
                onClick={() => setCylinderAngle((prev) => prev - 90)}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm"
              >
                Spin Right ↻
              </button>
            </div>
          </div>
        )}

        {}
        {activeView === '3d-cube' && (
          <div className="relative w-full max-w-3xl mx-auto py-8 animate-fade-in flex flex-col items-center">
            {}
            <div
              className="relative w-full h-[360px] sm:h-[440px] flex items-center justify-center my-4"
              style={{ perspective: '1200px' }}
            >
              {}
              <div
                className="relative w-[240px] h-[280px] sm:w-[300px] sm:h-[350px] transition-transform duration-700 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${cubeAngleX}deg) rotateY(${cubeAngleY}deg)`,
                }}
              >
                {GALLERY_PHOTOS.slice(0, 4).map((photo, index) => {
                  const depthZ = windowWidth < 640 ? 100 : windowWidth < 1024 ? 130 : 150;
                  
                  const transforms = [
                    `rotateY(0deg) translateZ(${depthZ}px)`,
                    `rotateY(90deg) translateZ(${depthZ}px)`,
                    `rotateY(180deg) translateZ(${depthZ}px)`,
                    `rotateY(-90deg) translateZ(${depthZ}px)`,
                  ];

                  return (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className="absolute inset-0 western-frame bg-[#faf7f2] p-3.5 rounded-2xl shadow-2xl cursor-pointer hover:border-[#c86d51] transition-colors flex flex-col justify-between"
                      style={{
                        transform: transforms[index % 4],
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      <div className="relative w-full h-[75%] rounded-xl overflow-hidden bg-[#e2d2b4]/30">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-[#faf7f2]/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider text-[#2d2218] border border-[#b58d55]/40 shadow-xs">
                          Face 0{index + 1}
                        </div>
                      </div>
                      <div className="text-center pt-1">
                        <p className="text-[10px] font-sans uppercase tracking-widest text-[#b58d55] font-bold">
                          {photo.location}
                        </p>
                        <h4 className="text-xs sm:text-sm font-serif-display text-[#2d2218] truncate">
                          {photo.caption}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4">
              <button
                onClick={() => setCubeAngleY((prev) => prev - 90)}
                className="px-4 py-2 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm"
              >
                ↺ Rotate Left
              </button>
              <button
                onClick={() => setCubeAngleX((prev) => prev + 20)}
                className="px-3 py-2 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm"
              >
                ▲ Tilt Up
              </button>
              <button
                onClick={() => setCubeAngleX((prev) => prev - 20)}
                className="px-3 py-2 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm"
              >
                ▼ Tilt Down
              </button>
              <button
                onClick={() => setCubeAngleY((prev) => prev + 90)}
                className="px-4 py-2 rounded-full bg-[#f7f3e9] border border-[#b58d55]/40 text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-sm"
              >
                Rotate Right ↻
              </button>
            </div>
            <p className="text-[11px] font-sans text-[#8a7259] italic mt-2 text-center">
              Click any cube face to open high resolution photo
            </p>
          </div>
        )}

        {}
        {activeView === '3d-journal' && (
          <div className="relative w-full max-w-4xl mx-auto py-6 animate-fade-in flex flex-col items-center">
            {}
            <div className="relative w-full western-frame bg-[#f7f3e9] p-4 sm:p-8 rounded-3xl shadow-2xl border-2 border-[#b58d55]/50 paper-texture">
              {}
              <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#b58d55]/10 via-[#2d2218]/30 to-[#b58d55]/10 transform -translate-x-1/2 z-20 shadow-xs" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                {}
                {(() => {
                  const leftPhotoIdx = journalPageIndex * 2;
                  const photo = GALLERY_PHOTOS[leftPhotoIdx] || GALLERY_PHOTOS[0];
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedImageIndex(leftPhotoIdx)}
                      className="bg-[#faf7f2] p-4 rounded-2xl shadow-sm border border-[#b58d55]/30 cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="relative w-full h-60 sm:h-72 rounded-xl overflow-hidden bg-[#e2d2b4]/30">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-95 contrast-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-[#faf7f2]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-widest text-[#2d2218] border border-[#b58d55]/40 shadow-xs">
                          Page 0{journalPageIndex * 2 + 1}
                        </div>
                      </div>
                      <div className="mt-4 text-center space-y-1">
                        <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#b58d55]">
                          {photo.location}
                        </p>
                        <h3 className="text-lg font-serif-display text-[#2d2218]">
                          {photo.caption}
                        </h3>
                        <p className="text-xs font-serif-italic text-[#6b5847] pt-1">
                          “Captured along the quiet trails of Montana.”
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {}
                {(() => {
                  const rightPhotoIdx = journalPageIndex * 2 + 1;
                  const photo = GALLERY_PHOTOS[rightPhotoIdx] || GALLERY_PHOTOS[1];
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedImageIndex(rightPhotoIdx)}
                      className="bg-[#faf7f2] p-4 rounded-2xl shadow-sm border border-[#b58d55]/30 cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="relative w-full h-60 sm:h-72 rounded-xl overflow-hidden bg-[#e2d2b4]/30">
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-95 contrast-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-[#faf7f2]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-widest text-[#2d2218] border border-[#b58d55]/40 shadow-xs">
                          Page 0{journalPageIndex * 2 + 2}
                        </div>
                      </div>
                      <div className="mt-4 text-center space-y-1">
                        <p className="text-xs font-sans font-bold uppercase tracking-widest text-[#b58d55]">
                          {photo.location}
                        </p>
                        <h3 className="text-lg font-serif-display text-[#2d2218]">
                          {photo.caption}
                        </h3>
                        <p className="text-xs font-serif-italic text-[#6b5847] pt-1">
                          “Golden dusk light under the western sky.”
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {}
            <div className="flex items-center justify-between w-full max-w-md mt-6">
              <button
                disabled={journalPageIndex === 0}
                onClick={() => setJournalPageIndex(0)}
                className={`px-5 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider border transition-all ${
                  journalPageIndex === 0
                    ? 'opacity-40 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-[#f7f3e9] border-[#b58d55]/40 text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] shadow-sm'
                }`}
              >
                ◀ Previous Pages
              </button>

              <span className="text-xs font-sans font-bold text-[#b58d55] uppercase tracking-widest">
                Spread 0{journalPageIndex + 1} / 02
              </span>

              <button
                disabled={journalPageIndex === 1}
                onClick={() => setJournalPageIndex(1)}
                className={`px-5 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider border transition-all ${
                  journalPageIndex === 1
                    ? 'opacity-40 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-[#f7f3e9] border-[#b58d55]/40 text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] shadow-sm'
                }`}
              >
                Next Pages ▶
              </button>
            </div>
          </div>
        )}
        {activeView === 'grid' && (
          <div className="columns-1 sm:columns-2 lg:columns-2 gap-6 md:gap-8 space-y-6 md:space-y-8 transition-all">
            {GALLERY_PHOTOS.map((photo, index) => (
              <div
                key={photo.id}
                ref={(el) => (itemsRef.current[index] = el)}
                onClick={() => setSelectedImageIndex(index)}
                onMouseMove={(e) => handleMouseMove(e, itemsRef.current[index])}
                onMouseLeave={() => handleMouseLeave(itemsRef.current[index])}
                className={`break-inside-avoid relative group cursor-pointer western-frame bg-[#faf7f2] p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 transform ${photo.tilt} hover:rotate-0 hover:scale-[1.02]`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`relative w-full ${photo.aspect} rounded-xl overflow-hidden bg-[#e2d2b4]/30 shadow-inner`}>
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-95 contrast-105"
                    referrerPolicy="no-referrer"
                  />

                  {}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d2218]/80 via-[#2d2218]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <div className="flex items-end justify-between text-[#faf7f2]">
                      <div>
                        <p className="text-xs font-sans uppercase tracking-widest text-[#e2d2b4]">
                          {photo.location}
                        </p>
                        <p className="text-base font-serif-italic font-medium leading-snug">
                          {photo.caption}
                        </p>
                      </div>
                      <span className="text-[11px] font-sans uppercase font-bold tracking-widest bg-[#faf7f2]/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#faf7f2]/40 text-[#faf7f2]">
                        Expand
                      </span>
                    </div>
                  </div>
                </div>

                {}
                <div className="mt-3.5 px-1 flex items-center justify-between text-xs font-sans text-[#8a7259]">
                  <span className="font-semibold uppercase tracking-wider text-[#2d2218]">
                    {photo.caption}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#b58d55] font-mono">
                    0{photo.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {}
        {activeView === 'spotlight' && (
          <div className="relative w-full max-w-4xl mx-auto py-4 animate-fade-in">
            {}
            <div className="western-frame bg-[#faf7f2] p-4 md:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div
                className="w-full md:w-3/5 h-72 sm:h-96 rounded-2xl overflow-hidden bg-[#e2d2b4]/30 relative group cursor-pointer"
                onClick={() => setSelectedImageIndex(activeSpotlightIndex)}
                onMouseEnter={() => (autoplayPausedRef.current = true)}
                onMouseLeave={() => (autoplayPausedRef.current = false)}
              >
                <img
                  ref={mainImageRef}
                  src={GALLERY_PHOTOS[activeSpotlightIndex].src}
                  alt={GALLERY_PHOTOS[activeSpotlightIndex].alt}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105"
                  style={{ opacity: 0 }}
                  onLoad={() => {
                    const el = mainImageRef.current;
                    if (!el) return;
                    gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'power2.out' });
                  }}
                  referrerPolicy="no-referrer"
                />
                
              </div>

              <div className="w-full md:w-2/5 flex flex-col justify-between py-2 px-2 text-center md:text-left space-y-4">
                {}
                <div className="pt-2">
                  <div
                    className="mx-auto"
                    style={{ columnCount: 2, columnGap: '0.5rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}
                  >
                    {GALLERY_PHOTOS.map((photo, idx) => (
                      <button
                        key={photo.id}
                        onClick={() => setActiveSpotlightIndex(idx)}
                        className={`w-full mb-3 rounded-lg overflow-hidden block border-2 transition-all ${
                          activeSpotlightIndex === idx
                            ? 'border-[#c86d51] scale-105 shadow-md'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ breakInside: 'avoid', WebkitColumnBreakInside: 'avoid' }}
                      >
                        <img
                          src={photo.src}
                          alt={photo.alt}
                          className="w-full h-auto object-cover block"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() =>
                      setActiveSpotlightIndex((prev) => (prev > 0 ? prev - 1 : GALLERY_PHOTOS.length - 1))
                    }
                    className="flex-1 text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:text-[#c86d51] transition-colors py-2.5 rounded-xl bg-[#f7f3e9] border border-[#b58d55]/40 text-center"
                  >
                    ←
                  </button>
                  <button
                    onClick={() =>
                      setActiveSpotlightIndex((prev) => (prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : 0))
                    }
                    className="flex-1 text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:text-[#c86d51] transition-colors py-2.5 rounded-xl bg-[#f7f3e9] border border-[#b58d55]/40 text-center"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#1c150f]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setSelectedImageIndex(null)}
        >
          {}
          <div
            className="relative max-w-4xl w-full bg-[#faf7f2] rounded-2xl western-frame p-4 md:p-6 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-[#faf7f2] border border-[#b58d55]/60 text-xs font-sans font-bold tracking-widest text-[#2d2218] hover:bg-[#c86d51] hover:text-[#faf7f2] transition-colors shadow-md"
              aria-label="Close modal"
            >
              CLOSE
            </button>

            {}
            <div className="relative w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-[#2d2218]/5">
              <img
                src={GALLERY_PHOTOS[selectedImageIndex].src}
                alt={GALLERY_PHOTOS[selectedImageIndex].alt}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            {}
            <div className="w-full mt-4 flex items-center justify-between px-2">
              <button
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev > 0 ? prev - 1 : GALLERY_PHOTOS.length - 1
                  )
                }
                className="text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:text-[#c86d51] transition-colors px-4 py-2 rounded-lg bg-[#f7f3e9] border border-[#b58d55]/40"
              >
                ← Previous
              </button>

              <div className="text-center px-4">
                <p className="text-base font-serif-display text-[#2d2218]">
                  {GALLERY_PHOTOS[selectedImageIndex].caption}
                </p>
                <p className="text-xs font-sans text-[#8a7259] mt-0.5">
                  {selectedImageIndex + 1} of {GALLERY_PHOTOS.length}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev < GALLERY_PHOTOS.length - 1 ? prev + 1 : 0
                  )
                }
                className="text-xs font-sans font-bold uppercase tracking-wider text-[#2d2218] hover:text-[#c86d51] transition-colors px-4 py-2 rounded-lg bg-[#f7f3e9] border border-[#b58d55]/40"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

