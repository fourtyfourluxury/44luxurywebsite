import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    label: 'Sweatshirts',
    slug: '/shop?q=sweatshirt',
    // Premium dark editorial image — urban streetwear aesthetic
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80&auto=format&fit=crop',
    accent: '#D4AF37',
  },
  {
    label: 'Jackets',
    slug: '/shop?q=jacket',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80&auto=format&fit=crop',
    accent: '#fcf9f3',
  },
  {
    label: 'Polo',
    slug: '/shop?q=polo',
    image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&q=80&auto=format&fit=crop',
    accent: '#D4AF37',
  },
  {
    label: 'Accessories',
    slug: '/shop?q=accessories',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80&auto=format&fit=crop',
    accent: '#fcf9f3',
  },
];

export default function CategoriesShowcase() {
  return (
    <section className="w-full py-20 bg-[#f7f5f0]">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.25em] text-[#a8a8a0] mb-3">
            CURATED FOR YOU
          </p>
          <h2 className="font-unica text-5xl md:text-6xl uppercase tracking-tighter text-[#1c1c18] leading-none">
            SHOP BY CATEGORY
          </h2>
        </div>

        {/* 4-column Category Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={cat.slug}
              className="relative group overflow-hidden aspect-[3/4] block bg-[#1c1c18]"
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1800ms] ease-out group-hover:scale-110 opacity-80 group-hover:opacity-90"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 text-center">
                <h3
                  className="font-unica text-3xl md:text-4xl uppercase tracking-tighter text-[#fcf9f3] mb-4 drop-shadow-lg group-hover:tracking-normal transition-all duration-500"
                >
                  {cat.label}
                </h3>
                <span
                  className="inline-block border font-grotesk font-bold text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 transition-all duration-300 group-hover:px-7"
                  style={{
                    borderColor: cat.accent,
                    color: cat.accent,
                  }}
                >
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
