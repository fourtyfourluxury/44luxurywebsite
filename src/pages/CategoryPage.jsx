import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';

// ── Category metadata ──────────────────────────────────────────────────────────
const CATEGORY_META = {
  sweatshirts: {
    title: 'SWEATSHIRTS',
    subtitle: 'Premium heavyweight comfort, refined to perfection.',
    keywords: ['sweatshirt', 'hoodie', 'crewneck', 'sweater', 'fleece'],
    bannerImage: '/banner-hoodies-sweatshirts.png',
  },
  caps: {
    title: 'CAPS',
    subtitle: 'Structured silhouettes. Uncompromising finish.',
    keywords: ['cap', 'hat', 'snapback', 'fitted', 'beanie'],
    bannerImage: null,
  },
  'polo-shirts': {
    title: 'POLO SHIRTS',
    subtitle: 'Elevated essentials built for the discerning.',
    keywords: ['polo', 'polo shirt'],
    bannerImage: '/banner-polos.png',
  },
  'tank-tops': {
    title: 'TANK TOPS',
    subtitle: 'Minimal form. Maximum impact.',
    keywords: ['tank', 'tank top', 'vest', 'sleeveless'],
    bannerImage: null,
  },
};

// ── Filter bar (same design as Shop) ──────────────────────────────────────────
function FilterBar({ total, availability, setAvailability, priceRange, setPriceRange, maxPrice, onReset }) {
  const [availOpen, setAvailOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const hasFilters = availability !== 'all' || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="flex flex-wrap items-center gap-0 border-b border-[#1c1c18]/10 py-4 mb-10">
      {/* Product count */}
      <span className="font-grotesk font-bold text-[11px] uppercase tracking-[0.22em] text-[#1c1c18] mr-6">
        {total} {total === 1 ? 'Product' : 'Products'}
      </span>

      <span className="font-grotesk font-bold text-[10px] uppercase tracking-[0.2em] text-[#5f5e5e] mr-5">
        Filter:
      </span>

      {/* Availability dropdown */}
      <div className="relative mr-3">
        <button
          onClick={() => { setAvailOpen(p => !p); setPriceOpen(false); }}
          className="flex items-center gap-1.5 font-grotesk font-bold text-[10px] uppercase tracking-[0.18em] text-[#1c1c18] border border-[#1c1c18]/20 px-3 py-1.5 hover:border-[#1c1c18]/60 transition-colors"
        >
          Availability
          {availability !== 'all' && <span className="w-1.5 h-1.5 bg-[#1c1c18] inline-block" />}
          <ChevronDown size={11} className={`transition-transform ${availOpen ? 'rotate-180' : ''}`} />
        </button>
        {availOpen && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-[#fcf9f3] border border-[#1c1c18]/15 shadow-lg z-30">
            {[
              { value: 'all', label: 'All' },
              { value: 'in_stock', label: 'In Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setAvailability(opt.value); setAvailOpen(false); }}
                className={`w-full text-left px-4 py-2.5 font-grotesk text-[11px] uppercase tracking-[0.14em] transition-colors
                  ${availability === opt.value
                    ? 'bg-[#1c1c18] text-[#fcf9f3]'
                    : 'text-[#1c1c18] hover:bg-[#1c1c18]/6'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price dropdown */}
      <div className="relative mr-5">
        <button
          onClick={() => { setPriceOpen(p => !p); setAvailOpen(false); }}
          className="flex items-center gap-1.5 font-grotesk font-bold text-[10px] uppercase tracking-[0.18em] text-[#1c1c18] border border-[#1c1c18]/20 px-3 py-1.5 hover:border-[#1c1c18]/60 transition-colors"
        >
          Price
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && <span className="w-1.5 h-1.5 bg-[#1c1c18] inline-block" />}
          <ChevronDown size={11} className={`transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
        </button>
        {priceOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#fcf9f3] border border-[#1c1c18]/15 shadow-lg z-30 p-4">
            <p className="font-grotesk font-bold text-[9px] uppercase tracking-[0.2em] text-[#5f5e5e] mb-3">
              Price Range
            </p>
            <div className="flex items-center justify-between font-grotesk text-[11px] text-[#1c1c18] mb-3">
              <span>₦{priceRange[0].toLocaleString()}</span>
              <span>₦{priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range" min={0} max={maxPrice} step={1000}
              value={priceRange[0]}
              onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1000), priceRange[1]])}
              className="w-full accent-[#1c1c18] mb-2"
            />
            <input
              type="range" min={0} max={maxPrice} step={1000}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 1000)])}
              className="w-full accent-[#1c1c18]"
            />
            <button
              onClick={() => { setPriceRange([0, maxPrice]); setPriceOpen(false); }}
              className="mt-3 w-full font-grotesk font-bold text-[9px] uppercase tracking-[0.2em] text-[#5f5e5e] hover:text-[#1c1c18] transition-colors text-left"
            >
              Reset price
            </button>
          </div>
        )}
      </div>

      {/* Sort by — right side */}
      <div className="ml-auto flex items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.18em] text-[#5f5e5e]">
        Sort by: <span className="text-[#1c1c18] font-bold">Featured</span>
      </div>

      {/* Reset all filters */}
      {hasFilters && (
        <button
          onClick={onReset}
          className="ml-4 flex items-center gap-1 font-grotesk text-[9px] uppercase tracking-[0.18em] text-[#5f5e5e] hover:text-[#1c1c18] transition-colors"
        >
          <X size={10} /> Clear
        </button>
      )}
    </div>
  );
}

// ── Category Page ─────────────────────────────────────────────────────────────
export default function CategoryPage({ category }) {
  const { products, _hasHydrated } = useSiteStore();
  const meta = CATEGORY_META[category] || { title: category.toUpperCase(), subtitle: '', keywords: [category], bannerImage: null };

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
        className="relative bg-[#1c1c18] py-24 px-6 overflow-hidden"
        style={meta.bannerImage ? {
          backgroundImage: `url(${meta.bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {/* Overlay so text stays readable over banner images */}
        {meta.bannerImage && (
          <div className="absolute inset-0 bg-[#1c1c18]/65" />
        )}
        <div className="relative max-w-[1440px] mx-auto">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-3">
            SHOP / {meta.title}
          </p>
          <h1 className="font-unica text-7xl md:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3]">
            {meta.title}
          </h1>
          {meta.subtitle && (
            <p className="font-plex text-base text-[#fcf9f3]/55 max-w-md mt-4 leading-relaxed">
              {meta.subtitle}
            </p>
          )}
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
