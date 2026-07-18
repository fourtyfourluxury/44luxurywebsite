import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';

/**
 * CategoriesShowcase — 4-column editorial category tiles
 *
 * Layout language: YL Collectives
 * ─ Section: full-width, cream background (#fcf9f3)
 * ─ Generous top/bottom whitespace (py-20 md:py-28)
 * ─ Max-width container with symmetric horizontal padding
 * ─ 4-column (2 on mobile) grid; each tile is 4:5 portrait
 * ─ Tile: category name anchored bottom-center, red outline "SHOP NOW" button
 */
export default function CategoriesShowcase() {
  const { categories } = useSiteStore();

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

        {/* 4-column Category Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.label || i}
              to={cat.slug || '/shop'}
              className="relative group overflow-hidden aspect-[4/5] block bg-[#1c1c18]"
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
                <h3 className="font-unica text-3xl md:text-4xl uppercase tracking-wider text-[#fcf9f3] mb-4 drop-shadow-lg">
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
      </div>
    </section>
  );
}
