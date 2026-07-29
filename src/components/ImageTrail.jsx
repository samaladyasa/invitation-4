import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './ImageTrail.css';

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(e, rect) {
  let clientX = 0,
    clientY = 0;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function getMouseDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

class ImageItem {
  DOM = { el: null, inner: null };
  defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
  rect = null;

  constructor(DOM_el) {
    if (!DOM_el) return;
    this.DOM.el = DOM_el;
    this.DOM.inner = this.DOM.el.querySelector('.content__img-inner');
    this.getRect();
    this.initEvents();
  }

  initEvents() {
    this.resize = () => {
      if (this.DOM.el) {
        gsap.set(this.DOM.el, this.defaultStyle);
        this.getRect();
      }
    };
    window.addEventListener('resize', this.resize);
  }

  getRect() {
    if (this.DOM.el) {
      this.rect = this.DOM.el.getBoundingClientRect();
    }
  }

  destroy() {
    window.removeEventListener('resize', this.resize);
  }
}

class ImageTrailVariant1 {
  constructor(container) {
    if (!container) return;
    this.container = container;
    this.DOM = { el: container };
    this.images = [...(this.DOM.el ? this.DOM.el.querySelectorAll('.content__img') : [])].map(
      (img) => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 70;
    this.isDestroyed = false;
    this.rafId = null;

    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    this.handlePointerMove = (ev) => {
      if (this.isDestroyed || !this.container) return;
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener('mousemove', this.handlePointerMove);
    container.addEventListener('touchmove', this.handlePointerMove, { passive: true });

    this.initRender = (ev) => {
      if (this.isDestroyed || !this.container) return;
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };

      this.rafId = requestAnimationFrame(() => this.render());

      container.removeEventListener('mousemove', this.initRender);
      container.removeEventListener('touchmove', this.initRender);
    };
    container.addEventListener('mousemove', this.initRender);
    container.addEventListener('touchmove', this.initRender, { passive: true });
  }

  render() {
    if (this.isDestroyed) return;
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
    this.rafId = requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    if (this.imagesTotal === 0) return;
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    if (!img || !img.DOM.el || !img.rect) return;

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: 'power1',
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power3',
          opacity: 0,
          scale: 0.2,
        },
        0.4
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) {
      this.isIdle = true;
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.handlePointerMove);
      this.container.removeEventListener('touchmove', this.handlePointerMove);
      this.container.removeEventListener('mousemove', this.initRender);
      this.container.removeEventListener('touchmove', this.initRender);
    }
    this.images.forEach((img) => img.destroy());
  }
}

class ImageTrailVariant2 {
  constructor(container) {
    if (!container) return;
    this.container = container;
    this.DOM = { el: container };
    this.images = [...(container ? container.querySelectorAll('.content__img') : [])].map(
      (img) => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 70;
    this.isDestroyed = false;
    this.rafId = null;

    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    this.handlePointerMove = (ev) => {
      if (this.isDestroyed || !this.container) return;
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener('mousemove', this.handlePointerMove);
    container.addEventListener('touchmove', this.handlePointerMove, { passive: true });

    this.initRender = (ev) => {
      if (this.isDestroyed || !this.container) return;
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };

      this.rafId = requestAnimationFrame(() => this.render());

      container.removeEventListener('mousemove', this.initRender);
      container.removeEventListener('touchmove', this.initRender);
    };
    container.addEventListener('mousemove', this.initRender);
    container.addEventListener('touchmove', this.initRender, { passive: true });
  }

  render() {
    if (this.isDestroyed) return;
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }
    this.rafId = requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    if (this.imagesTotal === 0) return;
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    if (!img || !img.DOM.el || !img.rect) return;

    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2.8,
          filter: 'brightness(250%)',
        },
        {
          duration: 0.4,
          ease: 'power1',
          scale: 1,
          filter: 'brightness(100%)',
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.4,
          ease: 'power2',
          opacity: 0,
          scale: 0.2,
        },
        0.45
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }

  destroy() {
    this.isDestroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.handlePointerMove);
      this.container.removeEventListener('touchmove', this.handlePointerMove);
      this.container.removeEventListener('mousemove', this.initRender);
      this.container.removeEventListener('touchmove', this.initRender);
    }
    this.images.forEach((img) => img.destroy());
  }
}

class ImageTrailVariant7 {
  constructor(container) {
    if (!container) return;
    this.container = container;
    this.DOM = { el: container };
    this.images = [...(container ? container.querySelectorAll('.content__img') : [])].map(
      (img) => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 60;
    this.isDestroyed = false;
    this.rafId = null;

    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    this.visibleImagesCount = 0;
    this.visibleImagesTotal = 8;
    this.visibleImagesTotal = Math.min(this.visibleImagesTotal, this.imagesTotal - 1);

    this.handlePointerMove = (ev) => {
      if (this.isDestroyed || !this.container) return;
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener('mousemove', this.handlePointerMove);
    container.addEventListener('touchmove', this.handlePointerMove, { passive: true });

    this.initRender = (ev) => {
      if (this.isDestroyed || !this.container) return;
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      this.rafId = requestAnimationFrame(() => this.render());
      container.removeEventListener('mousemove', this.initRender);
      container.removeEventListener('touchmove', this.initRender);
    };
    container.addEventListener('mousemove', this.initRender);
    container.addEventListener('touchmove', this.initRender, { passive: true });
  }

  render() {
    if (this.isDestroyed) return;
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.3);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.3);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;

    this.rafId = requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    if (this.imagesTotal === 0) return;
    ++this.zIndexVal;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    if (!img || !img.DOM.el || !img.rect) return;
    ++this.visibleImagesCount;

    gsap.killTweensOf(img.DOM.el);
    const scaleValue = gsap.utils.random(0.7, 1.2);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          scale: scaleValue - Math.max(gsap.utils.random(0.2, 0.4), 0),
          rotationZ: 0,
          opacity: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: 'power3',
          scale: scaleValue,
          rotationZ: gsap.utils.random(-8, 8),
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0
      );

    if (this.visibleImagesCount >= this.visibleImagesTotal) {
      const realOffset = Math.abs(this.visibleImagesTotal) % this.images.length;
      const lastInQueue =
        this.imgPosition - realOffset >= 0
          ? this.imgPosition - realOffset
          : this.images.length - (realOffset - this.imgPosition);
      const oldImg = this.images[lastInQueue];
      if (oldImg && oldImg.DOM.el) {
        gsap.to(oldImg.DOM.el, {
          duration: 0.4,
          ease: 'power4',
          opacity: 0,
          scale: 1.2,
          onComplete: () => {
            if (this.activeImagesCount === 0) {
              this.isIdle = true;
            }
          },
        });
      }
    }
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
  }

  destroy() {
    this.isDestroyed = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.container) {
      this.container.removeEventListener('mousemove', this.handlePointerMove);
      this.container.removeEventListener('touchmove', this.handlePointerMove);
      this.container.removeEventListener('mousemove', this.initRender);
      this.container.removeEventListener('touchmove', this.initRender);
    }
    this.images.forEach((img) => img.destroy());
  }
}

const variantMap = {
  1: ImageTrailVariant1,
  2: ImageTrailVariant2,
  7: ImageTrailVariant7,
};

export default function ImageTrail({ items = [], variant = 7 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const Cls = variantMap[variant] || variantMap[7] || ImageTrailVariant1;
    const instance = new Cls(containerRef.current);

    return () => {
      if (instance && instance.destroy) {
        instance.destroy();
      }
      if (containerRef.current) {
        const els = containerRef.current.querySelectorAll('.content__img');
        if (els.length > 0) {
          gsap.killTweensOf(els);
        }
      }
    };
  }, [variant, items]);

  return (
    <div className="content-trail" ref={containerRef}>
      {items.map((url, i) => (
        <div className="content__img" key={i}>
          <div className="content__img-inner" style={{ backgroundImage: `url(${url})` }} />
        </div>
      ))}
    </div>
  );
}
