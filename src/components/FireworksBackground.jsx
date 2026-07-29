import React, { useEffect, useRef } from 'react';


export function FireworksBackground({
  className = 'absolute inset-0 pointer-events-none',
  color = 'multi',
  population = 10,
  interactive = true,
}) {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const fireworksRef = useRef([]);
  const particlesRef = useRef([]);

  
  const PALETTES = {
    white: ['#ffffff', '#fdfbf7', '#f3e8d3', '#ebd8b2', '#fce8a6'],
    black: ['#2d2218', '#c86d51', '#b58d55', '#3d2b1f', '#8a7259'],
    multi: ['#c86d51', '#b58d55', '#d4c3a3', '#e07a5f', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a'],
  };

  const getColors = () => {
    if (Array.isArray(color)) return color;
    if (PALETTES[color]) return PALETTES[color];
    if (color && color !== 'black' && color !== 'white') return [color, '#b58d55', '#c86d51'];
    return PALETTES.multi;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const resizeObserver = new ResizeObserver(() => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    
    const launchFirework = (targetX, targetY) => {
      const startX = Math.random() * (width * 0.8) + width * 0.1;
      const startY = height;
      const tx = targetX !== undefined ? targetX : Math.random() * (width * 0.8) + width * 0.1;
      const ty = targetY !== undefined ? targetY : Math.random() * (height * 0.4) + height * 0.1;

      const angle = Math.atan2(ty - startY, tx - startX);
      const speed = Math.random() * 3 + 8;

      fireworksRef.current.push({
        x: startX,
        y: startY,
        tx,
        ty,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        colors: getColors(),
        trail: [],
      });
    };

    
    const explode = (x, y, colors) => {
      const particleCount = Math.floor((population * 4) + Math.random() * 20);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 5 + 1.5;
        const choiceColor = colors[Math.floor(Math.random() * colors.length)];

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.012,
          gravity: 0.06,
          friction: 0.96,
          color: choiceColor,
          size: Math.random() * 2.5 + 1.2,
        });
      }
    };

    let frameCount = 0;

    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId.current) {
          render();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    const render = () => {
      if (!isVisible) {
        animationFrameId.current = null;
        return;
      }

      
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      
      frameCount++;
      const launchInterval = Math.max(12, Math.floor(80 / (population / 5)));
      if (frameCount % launchInterval === 0) {
        launchFirework();
      }

      
      for (let i = fireworksRef.current.length - 1; i >= 0; i--) {
        const fw = fireworksRef.current[i];
        fw.x += fw.vx;
        fw.y += fw.vy;

        
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff4d6';
        ctx.fill();

        
        const distToTarget = Math.hypot(fw.tx - fw.x, fw.ty - fw.y);
        if (distToTarget < 12 || fw.vy >= 0) {
          explode(fw.x, fw.y, fw.colors);
          fireworksRef.current.splice(i, 1);
        }
      }

      
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    
    const handleCanvasClick = (e) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      launchFirework(x, y);
    };

    const parent = canvas.parentElement;
    if (interactive && parent) {
      parent.addEventListener('click', handleCanvasClick);
    }

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      if (interactive && parent) {
        parent.removeEventListener('click', handleCanvasClick);
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [color, population, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`${className} pointer-events-none z-0`}
    />
  );
}

export default FireworksBackground;
