import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';

/**
 * CategoriesShowcase — responsive editorial category grid
 *
 * Layout language: YL Collectives
 * ─ Section: full-width, cream background (#fcf9f3)
 * ─ Generous top/bottom whitespace (py-20 md:py-28)
 * ─ Responsive CSS Grid (.category-showcase-grid in index.css):
 *   4 cols on desktop (>=1280px), 3 cols on laptop (>=1024px), 2 cols below 1024px.
 * ─ Tile: fixed aspect ratio, category name anchored bottom-center, red outline "SHOP NOW" button
 */
export default function CategoriesShowcase() {
  const { categories } = useSiteStore();
  const [failedImages, setFailedImages] = useState({});

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

        {/* Responsive Category Grid */}
        <div className="category-showcase-grid">
          {categories.map((cat, i) => {
            const key = cat.label || i;
            const hasValidImage = Boolean(cat.image && !failedImages[key]);

            return (
              <Link
                key={key}
                to={cat.slug || '/shop'}
                style={{ aspectRatio: 'var(--category-card-aspect, 4 / 5)' }}
                className="relative group overflow-hidden w-full aspect-[4/5] block bg-[#1c1c18]
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4b0e1e]"
              >
                {/* Background Image or subtle dark editorial placeholder */}
                {hasValidImage ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    onError={() => setFailedImages(prev => ({ ...prev, [key]: true }))}
                    style={{ objectPosition: 'center top' }}
                    className="absolute inset-0 w-full h-full object-cover object-top
                               transition-transform duration-[1600ms] ease-out
                               group-hover:scale-105 opacity-85 group-hover:opacity-70"
                    loading="lazy"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-br from-[#2a2a24] via-[#1c1c18] to-[#12120f]"
                  />
                )}

                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                {/* Category Name + SHOP NOW — anchored bottom-centre */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 md:pb-7 px-3 md:px-4 text-center">
                  <h3 className="font-unica text-[clamp(1.2rem,2.4vw,2.25rem)] leading-tight uppercase tracking-wider text-[#fcf9f3] mb-3 md:mb-4 drop-shadow-lg max-w-full break-words">
                    {cat.label}
                  </h3>
                  <span className="inline-block border-2 border-[#4b0e1e] text-[#4b0e1e] bg-white/95
                                   font-grotesk font-bold text-[10px] uppercase tracking-[0.18em]
                                   px-4 md:px-5 py-2 transition-all duration-300
                                   group-hover:bg-[#4b0e1e] group-hover:text-white
                                   group-focus-visible:bg-[#4b0e1e] group-focus-visible:text-white">
                    SHOP NOW
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
