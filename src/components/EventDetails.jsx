import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, ArrowUpRight } from 'lucide-react';
import ChromaGrid from './ChromaGrid';
import { siteData, images } from '../siteConfig';

gsap.registerPlugin(ScrollTrigger);

const EVENT_CARDS = siteData.eventDetails.cards.map((card) => ({
  ...card,
  image: images[card.imageKey],
}));

export function EventDetails() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }
      );

      tl.fromTo(
        mapContainerRef.current,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.3'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-16 md:py-24 px-4 flex flex-col items-center justify-center paper-texture"
    >
      <div className="w-full max-w-5xl mx-auto">
        {}
        <div className="text-center mb-10">
          <p className="text-xs uppercase font-sans tracking-[0.3em] text-[#b58d55] mb-2 font-medium">
            {siteData.eventDetails.tag}
          </p>
          <h2 className="title-reveal text-3xl md:text-5xl font-serif-display text-[#2d2218]">
            {siteData.eventDetails.headline}
          </h2>
          <div className="w-12 h-[1px] bg-[#b58d55]/40 mx-auto my-4" />
        </div>

        {}
        <div ref={cardRef} className="w-full mb-12">
          <ChromaGrid items={EVENT_CARDS} radius={260} columns={3} />
        </div>

        {}
        <div
          ref={mapContainerRef}
          className="relative w-full western-frame rounded-2xl overflow-hidden bg-[#faf7f2]/90 backdrop-blur-sm shadow-md"
        >
          {}
          <div className="relative w-full h-64 sm:h-80 md:h-96 group overflow-hidden">
            <img
                src={images[siteData.eventDetails.mapImageKey]}
                alt={siteData.eventDetails.mapAlt}
              referrerPolicy="no-referrer"
            />

            {}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2d2218]/80 via-transparent to-[#2d2218]/20 pointer-events-none" />

            {}
            <div className="absolute top-5 left-5 z-20 bg-[#1e150e]/75 backdrop-blur-md px-3 py-2 rounded-full border border-[#b58d55]/40 shadow-sm flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#f7f3e9]" />
            </div>

            {}
            <div className="absolute bottom-0 inset-x-0 z-20 p-6 md:p-8 flex justify-end">
              <a
                href={siteData.eventDetails.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#faf7f2] hover:bg-[#f3e5ab] text-[#2d2218] w-11 h-11 rounded-full border-2 border-[#b58d55] shadow-lg hover:shadow-xl transition-all group/btn transform hover:-translate-y-0.5"
                aria-label="Open Willow Creek Ranch in Google Maps (opens in a new tab)"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="sr-only">Get Directions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


