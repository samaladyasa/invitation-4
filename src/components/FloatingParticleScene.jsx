import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const PARTICLE_COLORS = [
  new THREE.Color('#f8c6d6'),
  new THREE.Color('#f29cac'),
  new THREE.Color('#ffd98c'),
  new THREE.Color('#f7a9b8'),
  new THREE.Color('#ffdd99'),
];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

export function FloatingParticleScene() {
  const containerRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 800);
    camera.position.set(0, 0, 260);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const particleCount = 420;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = [];

    for (let i = 0; i < particleCount; i += 1) {
      const x = randomBetween(-220, 220);
      const y = randomBetween(-120, 120);
      const z = randomBetween(-80, 80);
      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      const size = randomBetween(2.4, 6.8);
      const speedY = randomBetween(0.1, 0.35);
      const driftX = randomBetween(-0.12, 0.12);
      const driftZ = randomBetween(-0.08, 0.08);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = size;
      velocities.push({ speedY, driftX, driftZ, phase: randomBetween(0, Math.PI * 2) });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const heartCanvas = document.createElement('canvas');
    heartCanvas.width = 64;
    heartCanvas.height = 64;
    const heartCtx = heartCanvas.getContext('2d');
    const hw = heartCanvas.width;
    const hh = heartCanvas.height;
    heartCtx.clearRect(0, 0, hw, hh);
    heartCtx.fillStyle = '#d93d5c';
    heartCtx.beginPath();
    heartCtx.moveTo(hw * 0.5, hh * 0.22);
    heartCtx.bezierCurveTo(hw * 0.15, hh * 0.0, 0, hh * 0.35, hw * 0.5, hh * 0.78);
    heartCtx.bezierCurveTo(hw, hh * 0.35, hw * 0.85, 0, hw * 0.5, hh * 0.22);
    heartCtx.closePath();
    heartCtx.fill();
    heartCtx.globalCompositeOperation = 'destination-out';
    heartCtx.fillStyle = 'rgba(255,255,255,0.18)';
    heartCtx.beginPath();
    heartCtx.arc(hw * 0.32, hh * 0.28, hw * 0.09, 0, Math.PI * 2);
    heartCtx.fill();
    heartCtx.beginPath();
    heartCtx.arc(hw * 0.68, hh * 0.28, hw * 0.09, 0, Math.PI * 2);
    heartCtx.fill();

    const heartTexture = new THREE.CanvasTexture(heartCanvas);
    heartTexture.minFilter = THREE.LinearFilter;
    heartTexture.magFilter = THREE.LinearFilter;
    heartTexture.needsUpdate = true;

    const material = new THREE.PointsMaterial({
      size: 2.2,
      map: heartTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      alphaTest: 0.1,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const butterflyCount = 90;
    const butterflyPositions = new Float32Array(butterflyCount * 3);
    const butterflyVelocities = [];

    for (let i = 0; i < butterflyCount; i += 1) {
      butterflyPositions[i * 3] = randomBetween(-240, 240);
      butterflyPositions[i * 3 + 1] = randomBetween(-140, 140);
      butterflyPositions[i * 3 + 2] = randomBetween(-100, 100);
      butterflyVelocities.push({
        speedY: randomBetween(0.08, 0.18),
        driftX: randomBetween(-0.08, 0.08),
        driftZ: randomBetween(-0.04, 0.04),
        phase: randomBetween(0, Math.PI * 2),
      });
    }

    const butterflyGeometry = new THREE.BufferGeometry();
    butterflyGeometry.setAttribute('position', new THREE.BufferAttribute(butterflyPositions, 3));

    const butterflyCanvas = document.createElement('canvas');
    butterflyCanvas.width = 64;
    butterflyCanvas.height = 64;
    const butterflyCtx = butterflyCanvas.getContext('2d');
    butterflyCtx.clearRect(0, 0, 64, 64);
    butterflyCtx.fillStyle = '#f9aac2';
    butterflyCtx.strokeStyle = '#f16c9a';
    butterflyCtx.lineWidth = 2;
    butterflyCtx.beginPath();
    butterflyCtx.ellipse(28, 32, 10, 12, -0.4, 0, Math.PI * 2);
    butterflyCtx.fill();
    butterflyCtx.stroke();
    butterflyCtx.beginPath();
    butterflyCtx.ellipse(36, 32, 10, 12, 0.4, 0, Math.PI * 2);
    butterflyCtx.fill();
    butterflyCtx.stroke();
    butterflyCtx.fillStyle = '#f16c9a';
    butterflyCtx.fillRect(31, 26, 2, 12);

    const butterflyTexture = new THREE.CanvasTexture(butterflyCanvas);
    butterflyTexture.minFilter = THREE.LinearFilter;
    butterflyTexture.magFilter = THREE.LinearFilter;
    butterflyTexture.needsUpdate = true;

    const butterflyMaterial = new THREE.PointsMaterial({
      size: 3.2,
      map: butterflyTexture,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      alphaTest: 0.1,
    });

    const butterflies = new THREE.Points(butterflyGeometry, butterflyMaterial);
    scene.add(butterflies);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight, false);
    };

    window.addEventListener('resize', onResize);

    const animate = () => {
      const positionAttribute = geometry.attributes.position;
      for (let i = 0; i < particleCount; i += 1) {
        const idx = i * 3;
        const velocity = velocities[i];
        positionAttribute.array[idx] += velocity.driftX;
        positionAttribute.array[idx + 1] += velocity.speedY;
        positionAttribute.array[idx + 2] += Math.sin(velocity.phase + performance.now() * 0.0003) * velocity.driftZ;

        if (positionAttribute.array[idx + 1] > 140) {
          positionAttribute.array[idx + 1] = -130;
        }
        if (positionAttribute.array[idx] < -235) {
          positionAttribute.array[idx] = 235;
        }
        if (positionAttribute.array[idx] > 235) {
          positionAttribute.array[idx] = -235;
        }
      }
      positionAttribute.needsUpdate = true;

      const butterflyPosAttr = butterflies.geometry.attributes.position;
      for (let i = 0; i < butterflyCount; i += 1) {
        const idx = i * 3;
        const velocity = butterflyVelocities[i];
        butterflyPosAttr.array[idx] += velocity.driftX;
        butterflyPosAttr.array[idx + 1] += velocity.speedY;
        butterflyPosAttr.array[idx + 2] += Math.sin(velocity.phase + performance.now() * 0.0004) * velocity.driftZ;

        if (butterflyPosAttr.array[idx + 1] > 140) {
          butterflyPosAttr.array[idx + 1] = -130;
        }
        if (butterflyPosAttr.array[idx] < -235) {
          butterflyPosAttr.array[idx] = 235;
        }
        if (butterflyPosAttr.array[idx] > 235) {
          butterflyPosAttr.array[idx] = -235;
        }
      }
      butterflyPosAttr.needsUpdate = true;

      points.rotation.y += 0.0009;
      points.rotation.x += 0.0004;
      butterflies.rotation.y += 0.0006;
      butterflies.rotation.x += 0.0002;
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      butterflyGeometry.dispose();
      butterflyMaterial.dispose();
      heartTexture.dispose();
      butterflyTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="floating-particle-scene" aria-hidden="true" />;
}
