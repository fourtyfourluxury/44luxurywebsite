import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';

/**
 * CategoriesShowcase — horizontally scrollable editorial category tiles
 *
 * Layout language: YL Collectives
 * ─ Section: full-width, cream background (#fcf9f3)
 * ─ Generous top/bottom whitespace (py-20 md:py-28)
 * ─ Tiles are fixed-width and scroll horizontally so any number of
 *   categories can be added without breaking the layout — arrow buttons
 *   (desktop) or a swipe (mobile) reveal the rest.
 * ─ Tile: category name anchored bottom-center, red outline "SHOP NOW" button
 */
export default function CategoriesShowcase() {
  const { categories } = useSiteStore();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [categories]);

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const tile = el.querySelector('[data-tile]');
    const amount = tile ? tile.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full bg-[#fcf9f3] py-20 md:py-28">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14">

        {/* Section Header — centred, matches YL style */}
        <div className="mb-10 md:mb-14 text-center">
          <h2 className="font-unica text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter text-[#1c1c18] leading-none">
            44 LUXURY
          </h2>
        </div>

        {/* Scrollable Category Tiles */}
        <div className="relative">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollByAmount(-1)}
              aria-label="Show previous categories"
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-11 h-11 items-center justify-center bg-[#fcf9f3] border border-[#1c1c18]/15 shadow-lg hover:bg-[#1c1c18] hover:text-[#fcf9f3] text-[#1c1c18] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
          >
            {categories.map((cat, i) => (
              <Link
                key={cat.label || i}
                to={cat.slug || '/shop'}
                data-tile
                className="relative group overflow-hidden aspect-[4/5] block bg-[#1c1c18] shrink-0 snap-start w-[46%] sm:w-[31%] md:w-[calc(25%-12px)]"
              >
                {/* Background Image — subtle zoom on hover */}
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover object-center
                               transition-transform duration-[1600ms] ease-out
                               group-hover:scale-105 opacity-85 group-hover:opacity-70"
                    loading="lazy"
                  />
                )}

                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                {/* Category Name + SHOP NOW — anchored bottom-centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-7 px-4 text-center">
                  <h3 className="font-unica text-2xl md:text-4xl uppercase tracking-wider text-[#fcf9f3] mb-4 drop-shadow-lg">
                    {cat.label}
                  </h3>
                  <span className="inline-block border-2 border-[#4b0e1e] text-[#4b0e1e] bg-white/95
                                   font-grotesk font-bold text-[10px] uppercase tracking-[0.18em]
                                   px-5 py-2 transition-all duration-300
                                   group-hover:bg-[#4b0e1e] group-hover:text-white">
                    SHOP NOW
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollByAmount(1)}
              aria-label="Show more categories"
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-11 h-11 items-center justify-center bg-[#fcf9f3] border border-[#1c1c18]/15 shadow-lg hover:bg-[#1c1c18] hover:text-[#fcf9f3] text-[#1c1c18] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
