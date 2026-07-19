import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';
import FilterBar from '../components/product/FilterBar';

// ── Category metadata ──────────────────────────────────────────────────────────
const CATEGORY_META = {
  sweatshirts: {
    title: 'SWEATSHIRTS',
    keywords: ['sweatshirt', 'hoodie', 'crewneck', 'sweater', 'fleece'],
    bannerImage: '/banner-hoodies-sweatshirts.png',
  },
  caps: {
    title: 'CAPS',
    keywords: ['cap', 'hat', 'snapback', 'fitted', 'beanie'],
    bannerImage: null,
  },
  'polo-shirts': {
    title: 'POLO SHIRTS',
    keywords: ['polo', 'polo shirt'],
    bannerImage: '/banner-polos.png',
  },
  'tank-tops': {
    title: 'TANK TOPS',
    keywords: ['tank', 'tank top', 'vest', 'sleeveless'],
    bannerImage: null,
  },
  skirts: {
    title: 'SKIRTS',
    keywords: ['skirt'],
    bannerImage: null,
  },
  'crop-tops': {
    title: 'CROP TOPS',
    keywords: ['crop', 'crop top'],
    bannerImage: null,
  },
  socks: {
    title: 'SOCKS',
    keywords: ['sock', 'socks'],
    bannerImage: null,
  },
  denim: {
    title: 'DENIM',
    keywords: ['denim', 'jean', 'jeans'],
    bannerImage: null,
  },
};

// ── Category Page ─────────────────────────────────────────────────────────────
export default function CategoryPage({ category }) {
  const { products, _hasHydrated, categoryBanners } = useSiteStore();
  const meta = CATEGORY_META[category] || { title: category.toUpperCase(), keywords: [category], bannerImage: null };
  const bannerImage = categoryBanners?.[category] ?? meta.bannerImage;

  // Filter state
  const [availability, setAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState([0, Infinity]);

  // Filter products by category keywords (name, category field, subcategory)
  const categoryProducts = useMemo(() => {
    return products.filter(p => {
      if (p.status === 'DRAFT') return false;
      const searchText = [p.name, p.category, p.subcategory].join(' ').toLowerCase();
      return meta.keywords.some(kw => searchText.includes(kw.toLowerCase()));
    });
  }, [products, meta.keywords]);

  // Compute max price
  const maxPrice = useMemo(() => {
    const prices = categoryProducts.map(p => p.price || 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 500000;
  }, [categoryProducts]);

  // Set price range once max known
  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === Infinity) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  const effectiveMax = maxPrice > 0 ? maxPrice : 500000;
  const effectivePriceRange = priceRange[1] === Infinity ? [0, effectiveMax] : priceRange;

  // Apply filters
  let filtered = categoryProducts;
  if (availability === 'in_stock') filtered = filtered.filter(p => (p.stock ?? 1) > 0);
  if (availability === 'out_of_stock') filtered = filtered.filter(p => (p.stock ?? 1) <= 0);
  if (effectivePriceRange[1] < effectiveMax || effectivePriceRange[0] > 0) {
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      return price >= effectivePriceRange[0] && price <= effectivePriceRange[1];
    });
  }

  const resetFilters = () => {
    setAvailability('all');
    setPriceRange([0, effectiveMax]);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* ── Dark hero banner ─────────────────────────────── */}
      <div
        className="relative bg-[#1c1c18] py-12 px-6 overflow-hidden"
        style={bannerImage ? {
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {/* Overlay so text stays readable over banner images */}
        {bannerImage && (
          <div className="absolute inset-0 bg-[#1c1c18]/65" />
        )}
        <div className="relative max-w-[1440px] mx-auto">
          <h1 className="font-unica text-3xl sm:text-4xl md:text-6xl uppercase tracking-tighter leading-[0.9] text-[#fcf9f3] break-words">
            {meta.title}
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Filter bar */}
        {_hasHydrated && (
          <FilterBar
            total={filtered.length}
            availability={availability}
            setAvailability={setAvailability}
            priceRange={effectivePriceRange}
            setPriceRange={setPriceRange}
            maxPrice={effectiveMax}
            onReset={resetFilters}
          />
        )}

        {/* Product grid */}
        {!_hasHydrated ? (
          <div className="py-32 text-center">
            <div className="inline-block w-10 h-10 border-2 border-[#5f5e5e] border-t-[#1c1c18] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e] mb-4">NO PRODUCTS FOUND</p>
            <p className="font-plex text-sm text-[#5f5e5e] mb-8">
              {categoryProducts.length > 0
                ? 'Try adjusting your filters.'
                : 'No items in this category yet — check back soon.'}
            </p>
            <div className="flex items-center justify-center gap-6">
              {categoryProducts.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5"
                >
                  CLEAR FILTERS
                </button>
              )}
              <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#5f5e5e] border-b border-[#5f5e5e] pb-0.5">
                BROWSE ALL
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
