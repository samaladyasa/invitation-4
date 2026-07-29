import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ChromaGrid.css';

export const ChromaGrid = ({
  items = [],
  className = '',
  radius = 300,
  columns = 3,
  rows = 1,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out'
}) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = (e) => {
    if (!rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    if (fadeRef.current) {
      gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    }
  };

  const handleLeave = () => {
    if (fadeRef.current) {
      gsap.to(fadeRef.current, {
        opacity: 1,
        duration: fadeOut,
        overwrite: true
      });
    }
  };

  const handleCardClick = (url, onClick) => {
    if (onClick) {
      onClick();
    } else if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={{
        '--r': `${radius}px`,
        '--cols': columns,
        '--rows': rows
      }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items.map((c, i) => (
        <article
          key={i}
          className="chroma-card group"
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url, c.onClick)}
          style={{
            '--card-border': c.borderColor || '#b58d55',
            '--card-gradient': c.gradient || 'linear-gradient(145deg, #2d2218, #1a130d)',
            cursor: c.url || c.onClick ? 'pointer' : 'default'
          }}
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" referrerPolicy="no-referrer" />
            {c.handle && (
              <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#18110b]/85 backdrop-blur-md border border-[#b58d55]/60 text-[#e2d2b4] text-[11px] font-mono font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <span>{c.handle}</span>
              </div>
            )}
          </div>
          <footer className="chroma-info">
            <div>
              <h3 className="name mt-0.5">{c.title}</h3>
              {c.subtitle && (
                <p className="role font-sans text-xs font-semibold mt-1">
                  {c.subtitle}
                </p>
              )}
            </div>
            {c.location && (
              <div className="location pt-2.5 mt-2 border-t border-[#b58d55]/25 text-xs text-[#d4c3a3] font-sans font-normal leading-relaxed">
                {c.location}
              </div>
            )}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid;
