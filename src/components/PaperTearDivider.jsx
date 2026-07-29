import React, { useId, useMemo } from 'react';


function createPRNG(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}


export function generateTornPath({
  width = 1200,
  baseHeight = 24,
  seed = 42,
  segments = 48,
  roughness = 10,
}) {
  const prng = createPRNG(seed);
  const points = [[0, 0], [0, Math.round(baseHeight + (prng() - 0.5) * 8)]];
  const dx = width / segments;

  for (let i = 1; i <= segments; i++) {
    const x = Math.min(width, i * dx);
    
    const macroWave = Math.sin((i / segments) * Math.PI * 3.5) * 7 + Math.cos((i / segments) * Math.PI * 1.8) * 5;
    const microNoise = (prng() - 0.5) * roughness * 1.8;
    const y = Math.max(6, Math.min(44, baseHeight + macroWave + microNoise));

    
    if (prng() > 0.8) {
      const toothX = x - dx * (0.3 + prng() * 0.4);
      const toothOffset = (prng() > 0.5 ? 1 : -1) * (4 + prng() * 5);
      const toothY = Math.max(4, Math.min(46, y + toothOffset));
      points.push([Number(toothX.toFixed(1)), Number(toothY.toFixed(1))]);
    }

    points.push([Number(x.toFixed(1)), Number(y.toFixed(1))]);
  }

  points.push([width, 0]);

  return points.reduce((acc, [px, py], index) => {
    if (index === 0) return `M ${px},${py}`;
    return `${acc} L ${px},${py}`;
  }, '') + ' Z';
}


export function PaperTearDivider({
  position = 'bottom', 
  fillColor = 'var(--palette-surface)', 
  shadowColor = 'rgba(28, 18, 10, 0.25)',
  variant = 1,
  seed,
  roughness = 10,
  segments = 48,
  className = '',
  hasShadow = true,
  hasFibers = true,
  weatheredTexture = true,
}) {
  const filterId = useId().replace(/:/g, '');

  
  const variantSeeds = [42, 188, 305, 912];
  const activeSeed = seed !== undefined ? seed : (variantSeeds[(variant - 1) % variantSeeds.length] || 42);

  
  const activePath = useMemo(() => {
    return generateTornPath({
      width: 1200,
      baseHeight: 24,
      seed: activeSeed,
      segments: segments,
      roughness: roughness,
    });
  }, [activeSeed, segments, roughness]);

  return (
    <div
      className={`relative w-full overflow-hidden leading-none z-20 pointer-events-none select-none ${className} ${
        position === 'top' ? 'rotate-180 -mb-2' : '-mt-2'
      }`}
    >
      <svg
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        className="w-full h-8 sm:h-11 md:h-14 text-current block"
      >
        <defs>
          {}
          <filter id={`paperShadow-${filterId}`} x="-5%" y="-10%" width="110%" height="150%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#1e150d" floodOpacity="0.2" />
          </filter>

          {}
          {weatheredTexture && (
            <pattern id={`paperFiberPattern-${filterId}`} width="12" height="12" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="12" y2="12" stroke="#8a7259" strokeWidth="0.5" strokeOpacity="0.12" />
              <circle cx="6" cy="6" r="0.6" fill="#b58d55" opacity="0.1" />
            </pattern>
          )}
        </defs>

        <g>
          {}
          {hasShadow && (
            <path
              d={activePath}
              fill={shadowColor}
              transform="translate(0, 2)"
              opacity="0.4"
            />
          )}

          {}
          {hasFibers && (
            <path
              d={activePath}
              fill="#fffdfa"
              transform="translate(0, 1)"
              opacity="0.95"
            />
          )}

          {}
          {hasFibers && (
            <path
              d={activePath}
              fill="#ebdcc8"
              transform="translate(0, 0.5)"
              opacity="0.75"
            />
          )}

          {}
          <path
            d={activePath}
            fill={fillColor}
            filter={hasShadow ? `url(#paperShadow-${filterId})` : undefined}
          />

          {}
          {weatheredTexture && (
            <path
              d={activePath}
              fill={`url(#paperFiberPattern-${filterId})`}
              opacity="0.6"
            />
          )}
        </g>
      </svg>
    </div>
  );
}


export const TornPaperDivider = PaperTearDivider;
export default PaperTearDivider;
