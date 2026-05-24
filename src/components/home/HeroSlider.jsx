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
    <section className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-[#1c1c18]">
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
          const position = slide.objectPosition || 'top';
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
              {/* Overlay */}
              <div className={`absolute inset-0 ${hasText ? 'bg-black/40' : 'bg-black/10'}`} />

              {/* Text Content */}
              {hasText && (
                <div className="absolute inset-0 flex items-center justify-center text-center px-6 pointer-events-none">
                  <div className="max-w-4xl mx-auto">
                    {slide.subheadline && (
                      <p className="font-grotesk font-semibold text-xs md:text-sm uppercase tracking-[0.2em] text-[#fcf9f3]/80 mb-4 animate-fade-in">
                        {slide.subheadline}
                      </p>
                    )}
                    {slide.headline && (
                      <h1 className="font-unica text-5xl md:text-7xl lg:text-9xl uppercase tracking-tighter leading-[0.9] text-[#fcf9f3] mb-8 animate-fade-in drop-shadow-2xl">
                        {slide.headline}
                      </h1>
                    )}
                    {slide.ctaLabel && (
                      <Link
                        to={slide.ctaLink || '/shop'}
                        className="inline-block bg-[#fcf9f3] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs md:text-sm px-8 py-4 hover:bg-[#D4AF37] transition-colors pointer-events-auto shadow-xl"
                      >
                        {slide.ctaLabel}
                      </Link>
                    )}
                  </div>
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
