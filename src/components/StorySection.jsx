import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Mail, Sparkles } from 'lucide-react';
import GradualBlur from './GradualBlur';
import { siteData, images } from '../siteConfig';

const STORY_CHAPTERS = siteData.story.chapters.map((chapter) => ({
  ...chapter,
  image: images[chapter.imageKey],
}));

export function StorySection() {
  const [activeIdx, setActiveIdx] = useState(0);

  const current = STORY_CHAPTERS[activeIdx];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + STORY_CHAPTERS.length) % STORY_CHAPTERS.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % STORY_CHAPTERS.length);
  };

  return (
    <section className="relative w-full py-16 md:py-24 px-4 overflow-hidden bg-transparent paper-texture">
      {}
      <GradualBlur
        target="parent"
        position="top"
        height="5rem"
        strength={2}
        divCount={5}
        curve="bezier"
        opacity={0.9}
        zIndex={15}
      />
      <GradualBlur
        target="parent"
        position="bottom"
        height="5rem"
        strength={2}
        divCount={5}
        curve="bezier"
        opacity={0.9}
        zIndex={15}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {}
        <div className="text-center max-w-lg mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f5efe3] border border-[#b58d55]/40 text-[11px] uppercase font-sans tracking-[0.25em] text-[#b58d55] font-bold shadow-2xs mb-3">
            <Sparkles className="w-3 h-3 text-[#b58d55]" /> {siteData.story.tag}
          </div>
          <h2 className="title-reveal text-3xl md:text-5xl font-serif-display text-[#24160f] tracking-tight font-semibold">
            {siteData.story.headline}
          </h2>
          <div className="w-12 h-[1px] bg-[#b58d55]/40 mx-auto my-3" />
          <p className="text-sm font-sans text-[#4a3528] italic font-medium">
            {siteData.story.subtitle}
          </p>
        </div>

        {}
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-[#fcf8f7] p-6 sm:p-8 rounded-3xl border-2 border-[#ebd0cd]/60 shadow-md relative overflow-hidden">
            {}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(135deg,#c86d51_0,#c86d51_15px,#faf7f2_15px,#faf7f2_25px,#2d2218_25px,#2d2218_40px,#faf7f2_40px,#faf7f2_50px)]" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              <div className="md:col-span-6 relative">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xs border-4 border-white bg-[#f9efee]">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-full object-cover filter brightness-95 contrast-105 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />

                  <div className="absolute top-3 right-3 w-16 h-16 rounded-full border-2 border-dashed border-white/80 bg-[#ebd0cd]/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-1 text-white shadow-xs rotate-12 pointer-events-none">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-[#f9efee]">
                      MONTANA
                    </span>
                    <span className="text-[10px] font-mono font-bold leading-tight">
                      {current.postmarkDate}
                    </span>
                    <span className="text-[7px] font-mono tracking-tighter">
                      POSTAL
                    </span>
                  </div>
                </div>
              </div>

              {}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4 md:border-l md:border-dashed md:border-[#b58d55]/30 md:pl-6">
                {}
                <div className="flex items-center justify-between pb-2 border-b border-[#b58d55]/20">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#b58d55] uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 text-[#b58d55]" />
                    <span>{current.chapter} • {current.year}</span>
                  </div>

                  <div className="px-2 py-1 rounded bg-[#f0e8d9] border border-dashed border-[#b58d55] text-[10px] font-mono font-bold text-[#2d2218]">
                    USA {current.postmarkDate.slice(-4)}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-serif-display text-[#24160f] mb-2 font-semibold">
                    {current.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-[#2f2418] leading-relaxed italic">
                    “{current.description}”
                  </p>
                </div>

                {}
                <div className="pt-3 border-t border-[#b58d55]/20 text-[11px] font-mono text-[#7a5f4d] space-y-0.5">
                  <div className="flex items-center gap-1 font-bold text-[#24160f]">
                    <MapPin className="w-3 h-3 text-[#b58d55]" /> {current.location}
                  </div>
                  <div className="text-[10px] text-[#4a3b2f]">
                    To: Family & Friends • Willow Creek Ranch
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#ebd0cd]/50">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-full bg-[#f9efee] hover:bg-[#ebd0cd] text-[#2d2218] transition-colors border border-[#ebd0cd]/60 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95"
                aria-label="Previous Postcard"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-xs font-mono font-bold text-[#b58d55]">
                0{activeIdx + 1} / 0{STORY_CHAPTERS.length}
              </div>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-full bg-[#f9efee] hover:bg-[#ebd0cd] text-[#2d2218] transition-colors border border-[#ebd0cd]/60 flex items-center justify-center shadow-sm hover:scale-105 active:scale-95"
                aria-label="Next Postcard"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="mt-12 text-center">
          <p className="font-serif-italic text-base md:text-lg text-[#24160f] leading-relaxed max-w-2xl mx-auto font-semibold drop-shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
            “We can’t wait to celebrate the next chapter with you.”
          </p>
        </div>
      </div>
    </section>
  );
}
