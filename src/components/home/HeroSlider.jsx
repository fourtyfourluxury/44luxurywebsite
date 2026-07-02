import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';

export default function HeroSlider() {
  const { heroSlides, heroDisplayMode, heroSpeed, _hasHydrated } = useSiteStore();
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const slides = (_hasHydrated ? heroSlides : null) || [];
  const total = slides.length;
  const speed = (heroSpeed || 5) * 1000;
  const isSlide = heroDisplayMode === 'slide';

  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(() => goTo((prev) => (prev + 1) % total), speed);
    return () => clearInterval(interval);
  }, [total, speed]);

  const goTo = (indexOrFn) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(typeof indexOrFn === 'function' ? indexOrFn(current) : indexOrFn);
    setTimeout(() => {
      setTransitioning(false);
    }, 700); 
  };

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-[#1c1c18]" style={{ aspectRatio: '4/5', minHeight: '600px' }}>
      {/* Slides Container */}
      <div 
        className="relative w-full h-full flex"
        style={isSlide ? { 
          transform: `translateX(-${current * 100}%)`, 
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' 
        } : {}}
      >
        {slides.map((slide, index) => {
          let displayStyle = {};
          if (!isSlide) {
            displayStyle = {
              opacity: index === current ? 1 : 0,
              transition: 'opacity 0.7s ease-in-out',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: index === current ? 10 : 0
            };
          } else {
            displayStyle = {
              minWidth: '100%',
              height: '100%',
              position: 'relative'
            };
          }

          const hasText = slide.headline || slide.subheadline || slide.ctaLabel;
          // Support both objectFit (cover/contain) and objectPosition (top/center/bottom)
          const fit = slide.objectFit || 'cover';
          const position = slide.objectPosition || 'center';
          const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

          return (
            <div key={slide.id || index} style={displayStyle} className="bg-[#1c1c18]">
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.headline || 'Hero image'}
                className={`w-full h-full ${fitClass}`}
                style={{ objectPosition: position }}
              />
              {/* Subtle overlay — lightest possible to keep image clean like YL */}
              <div className={`absolute inset-0 ${hasText ? 'bg-black/35' : 'bg-black/5'}`} />

              {/* Text Content — anchored to bottom-center like YL Collectives */}
              {hasText && (
                <div className="absolute bottom-0 left-0 right-0 pb-12 md:pb-16 flex flex-col items-center text-center px-6 pointer-events-none">
                  {slide.subheadline && (
                    <p className="font-grotesk font-semibold text-xs md:text-sm uppercase tracking-[0.25em] text-[#fcf9f3]/90 mb-3 animate-fade-in">
                      {slide.subheadline}
                    </p>
                  )}
                  {slide.headline && (
                    <h1 className="font-unica text-6xl md:text-8xl lg:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3] mb-7 animate-fade-in drop-shadow-2xl">
                      {slide.headline}
                    </h1>
                  )}
                  {slide.ctaLabel && (
                    <Link
                      to={slide.ctaLink || '/shop'}
                      className="inline-block bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs md:text-sm px-10 py-4 hover:bg-[#4b0e1e] transition-colors pointer-events-auto shadow-2xl border border-[#fcf9f3]/10"
                    >
                      {slide.ctaLabel}
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      {total > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + total) % total)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#fcf9f3]/10 hover:bg-[#fcf9f3]/30 flex items-center justify-center transition-colors backdrop-blur-md rounded-full z-20 shadow-lg"
          >
            <ChevronLeft size={20} className="text-[#fcf9f3]" />
          </button>
          <button
            onClick={() => goTo((current + 1) % total)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#fcf9f3]/10 hover:bg-[#fcf9f3]/30 flex items-center justify-center transition-colors backdrop-blur-md rounded-full z-20 shadow-lg"
          >
            <ChevronRight size={20} className="text-[#fcf9f3]" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-12 h-1 transition-all duration-500 rounded-full ${i === current ? 'bg-[#fcf9f3] shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-[#fcf9f3]/30 hover:bg-[#fcf9f3]/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
