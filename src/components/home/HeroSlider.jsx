import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';

const isVideo = (url = '') => /\.(mp4|webm|mov)$/i.test(url) || url.includes('/video/');

/**
 * CampaignCarousel — Premium full-bleed editorial hero
 *
 * Design language: YL Collectives
 * ─ True edge-to-edge image (no horizontal padding, no max-width box)
 * ─ Portrait-first aspect ratio (4:5) capped at 92dvh on desktop
 * ─ Text anchored bottom-left with generous padding
 * ─ Thin progress-line dot navigation (bottom-right)
 * ─ Minimal prev/next arrows (hidden on mobile, shown on hover desktop)
 * ─ Auto-advances every 1–3 s, pauses on hover, loops infinitely
 * ─ Swipe gesture support on mobile
 * ─ Next slide preloaded for smooth transitions
 */
export default function CampaignCarousel() {
  const { heroSlides, heroSpeed, _hasHydrated } = useSiteStore();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Swipe states for mobile
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = (_hasHydrated ? heroSlides : null) || [];
  const total = slides.length;

  // Clamp configured speed to 1–3 s; default 2 s
  const rawSpeed = heroSpeed || 2;
  const speed = Math.min(Math.max(rawSpeed, 1), 3) * 1000;

  // ── Auto-advance + progress bar ─────────────────────────────────────────────
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    setProgress(0);
    const tick = 50;
    const step = 100 / (speed / tick);

    const progressId = setInterval(() => {
      setProgress(p => {
        if (p >= 99.5) return 0;
        return Math.min(p + step, 100);
      });
    }, tick);

    const slideId = setInterval(() => {
      setCurrent(c => (c + 1) % total);
      setProgress(0);
    }, speed);

    return () => {
      clearInterval(slideId);
      clearInterval(progressId);
    };
  }, [total, speed, isPaused, current]);

  // ── Navigation helpers ───────────────────────────────────────────────────────
  const goTo = (index) => {
    if (index === current || isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setProgress(0);
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  const nextSlide = () => goTo((current + 1) % total);
  const prevSlide = () => goTo((current - 1 + total) % total);

  // ── Swipe handlers ───────────────────────────────────────────────────────────
  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchMove  = (e) => { touchEndX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd   = () => {
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 48) delta > 0 ? nextSlide() : prevSlide();
  };

  if (slides.length === 0) return null;

  const nextIndex = (current + 1) % total;

  return (
    <section
      className="w-full bg-[#1c1c18] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Preload next slide ─────────────────────────────────── */}
      {slides[nextIndex] && !isVideo(slides[nextIndex].image) && (
        <link rel="preload" as="image" href={slides[nextIndex].image} />
      )}

      {/*
        Container sizing — matches YL proportions:
        ▸ Mobile:  aspect-[4/5], capped at 92svh (nearly full screen)
        ▸ Desktop: aspect-[4/5], capped at 92dvh
        No horizontal padding — image is fully edge-to-edge.
      */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 'clamp(420px, calc(100vw / 0.8), 92vh)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Slides ──────────────────────────────────────────────────────── */}
        {slides.map((s, i) => {
          const isCurrent = i === current;
          const objectFit = s.objectFit || 'cover';
          const objectPos  = s.objectPosition || 'center top';

          // Only render current + adjacent for performance
          if (!isCurrent && Math.abs(i - current) > 1 && i !== 0 && i !== total - 1) {
            return null;
          }

          return (
            <div
              key={s.id || i}
              className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
              style={{ opacity: isCurrent ? 1 : 0, zIndex: isCurrent ? 10 : 0 }}
            >
              {isVideo(s.image) ? (
                <video
                  src={s.image}
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover"
                  style={{ objectPosition: objectPos }}
                />
              ) : (
                <img
                  src={s.image}
                  alt={s.headline || '44LUXURY Campaign'}
                  className="w-full h-full"
                  style={{
                    objectFit,
                    objectPosition: objectPos,
                    display: 'block',
                  }}
                  loading={isCurrent ? 'eager' : 'lazy'}
                />
              )}

              {/* Gradient — heavy at bottom for text legibility, lighter top */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent z-10" />

              {/* ── Slide text — bottom-center, generous padding ──────────── */}
              {(s.headline || s.subheadline || s.ctaLabel) && (
                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center justify-end text-center px-6 pb-16 md:pb-24 lg:pb-28">
                  <div className="max-w-[75%] md:max-w-[600px] flex flex-col items-center">
                    {s.subheadline && (
                      <p className="font-grotesk font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#fcf9f3]/70 mb-3 md:mb-4">
                        {s.subheadline}
                      </p>
                    )}
                    {s.headline && (
                      <h2 className="font-unica text-[clamp(2.2rem,5vw,4.2rem)] uppercase tracking-[-0.01em] leading-[1.05] text-[#fcf9f3] mb-6 drop-shadow-2xl">
                        {s.headline}
                      </h2>
                    )}
                    {s.ctaLabel && (
                      <Link
                        to={s.ctaLink || '/shop'}
                        className="inline-block bg-[#fcf9f3] text-[#1c1c18] border border-[#fcf9f3] font-grotesk font-bold uppercase tracking-[0.18em] text-[10px] md:text-[11px] px-9 py-3.5 hover:bg-transparent hover:text-[#fcf9f3] transition-all duration-300"
                      >
                        {s.ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Prev / Next arrows — visible on hover (desktop) ─────────────── */}
        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-5 top-1/2 -translate-y-1/2 z-30
                         w-11 h-11 flex items-center justify-center
                         border border-white/25 text-white/60
                         hover:border-white/60 hover:text-white
                         bg-black/10 hover:bg-black/30
                         backdrop-blur-sm transition-all duration-300
                         opacity-0 md:group-hover:opacity-100
                         focus:opacity-100 outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft size={19} strokeWidth={1.5} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-5 top-1/2 -translate-y-1/2 z-30
                         w-11 h-11 flex items-center justify-center
                         border border-white/25 text-white/60
                         hover:border-white/60 hover:text-white
                         bg-black/10 hover:bg-black/30
                         backdrop-blur-sm transition-all duration-300
                         opacity-0 md:group-hover:opacity-100
                         focus:opacity-100 outline-none"
              aria-label="Next slide"
            >
              <ChevronRight size={19} strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* ── Slide counter + progress lines (bottom-right) ───────────────── */}
        {total > 1 && (
          <div className="absolute bottom-7 right-6 md:right-10 flex flex-col items-end gap-3 z-30">
            {/* nn / nn counter */}
            <span className="font-grotesk text-[9px] font-bold uppercase tracking-[0.2em] text-[#fcf9f3]/45 tabular-nums">
              {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>

            {/* Thin progress bars (one per slide) */}
            <div className="flex flex-col gap-[5px]">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative h-[1.5px] w-10 md:w-12 bg-[#fcf9f3]/20 overflow-hidden focus:outline-none"
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-[#fcf9f3]"
                    style={{
                      width: i === current ? `${progress}%` : i < current ? '100%' : '0%',
                      transition: i === current ? 'none' : 'width 0.3s ease',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Paused indicator ─────────────────────────────────────────────── */}
        {isPaused && total > 1 && (
          <div className="absolute top-5 right-5 z-30 pointer-events-none">
            <span className="font-grotesk text-[8px] uppercase tracking-[0.25em] text-[#fcf9f3]/25">
              PAUSED
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
