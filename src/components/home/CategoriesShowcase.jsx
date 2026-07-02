import { Link } from 'react-router-dom';

// YL Collectives-inspired categories — 4 tiles in a row
const CATEGORIES = [
  {
    label: 'Sweatshirts',
    slug: '/shop?q=sweatshirt',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&q=85&auto=format&fit=crop',
  },
  {
    label: 'Accessories',
    slug: '/shop?q=accessories',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&q=85&auto=format&fit=crop',
  },
  {
    label: 'Polo',
    slug: '/shop?q=polo',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=700&q=85&auto=format&fit=crop',
  },
  {
    label: 'Tank Tops',
    slug: '/shop?q=tank',
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=85&auto=format&fit=crop',
  },
];

export default function CategoriesShowcase() {
  return (
    <section className="w-full bg-[#fcf9f3] py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">

        {/* Section Header — matches YL style */}
        <div className="mb-10 text-center">
          <h2 className="font-unica text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter text-[#1c1c18] leading-none">
            44 LUXURY
          </h2>
          <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.25em] text-[#a8a8a0] mt-3">
            CURATED CATEGORIES
          </p>
        </div>

        {/* 4-column Category Tiles — exact YL layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={cat.slug}
              className="relative group overflow-hidden aspect-[3/4] block bg-[#1c1c18]"
            >
              {/* Background Image with zoom on hover */}
              <img
                src={cat.image}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1600ms] ease-out group-hover:scale-105 opacity-85 group-hover:opacity-70"
              />

              {/* Gradient Overlay — gradient from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Category Name + Shop Now — anchored to bottom center, like YL */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-7 px-4 text-center">
                <h3 className="font-creepster text-3xl md:text-4xl text-[#fcf9f3] mb-4 drop-shadow-lg">
                  {cat.label}
                </h3>
                {/* Red-border outline button exactly like YL */}
                <span className="inline-block border-2 border-[#c0392b] text-[#c0392b] bg-white/95 font-grotesk font-bold text-[10px] uppercase tracking-[0.18em] px-5 py-2 transition-all duration-300 group-hover:bg-[#c0392b] group-hover:text-white">
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
