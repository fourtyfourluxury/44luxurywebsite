import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';
import { searchProducts } from '../services/searchService';

// ── Inline filter bar (matches reference image style) ──────────────────────────
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
          Availability{availability !== 'all' && <span className="w-1.5 h-1.5 bg-[#1c1c18] inline-block" />}
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
          Price{(priceRange[0] > 0 || priceRange[1] < maxPrice) && <span className="w-1.5 h-1.5 bg-[#1c1c18] inline-block" />}
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
              type="range"
              min={0}
              max={maxPrice}
              step={1000}
              value={priceRange[0]}
              onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1000), priceRange[1]])}
              className="w-full accent-[#1c1c18] mb-2"
            />
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={1000}
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

      {/* Sort By — right side */}
      <div className="ml-auto flex items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.18em] text-[#5f5e5e]">
        Sort by: <span className="text-[#1c1c18] font-bold">Featured</span>
      </div>

      {/* Reset all */}
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

// ── Main Shop page ─────────────────────────────────────────────────────────────
export default function Shop() {
  const [searchParams] = useSearchParams();
  const { products, _hasHydrated } = useSiteStore();
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Filter state
  const [availability, setAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState([0, Infinity]);

  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';

  // Search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery && searchQuery.trim().length >= 2) {
        setSearchLoading(true);
        const { data } = await searchProducts(searchQuery, { limit: 50 });
        setSearchResults(data || []);
        setSearchLoading(false);
      } else {
        setSearchResults(null);
      }
    };
    performSearch();
  }, [searchQuery]);

  // Compute max price from products for range slider
  const maxPrice = useMemo(() => {
    const prices = products.map(p => p.price || 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 500000;
  }, [products]);

  // Initialise price range once max is known
  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === Infinity) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  // Base product list
  let base = searchResults !== null
    ? searchResults
    : products.filter(p => p.status !== 'DRAFT');

  // Fallback search
  if (searchQuery && searchResults === null) {
    const q = searchQuery.toLowerCase();
    base = base.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }

  // Apply availability filter
  let filtered = base;
  if (availability === 'in_stock') filtered = filtered.filter(p => (p.stock ?? 1) > 0);
  if (availability === 'out_of_stock') filtered = filtered.filter(p => (p.stock ?? 1) <= 0);

  // Apply price filter
  if (priceRange[1] !== Infinity) {
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
  }

  const pageTitle = searchQuery ? `"${searchQuery}"` : 'ALL PRODUCTS';
  const effectiveMax = maxPrice > 0 ? maxPrice : 500000;
  const effectivePriceRange = priceRange[1] === Infinity ? [0, effectiveMax] : priceRange;

  const resetFilters = () => {
    setAvailability('all');
    setPriceRange([0, effectiveMax]);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* ── Dark hero header ─────────────────────────────── */}
      <div className="bg-[#1c1c18] py-20 px-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-3">
            SHOP
          </p>
          <h1 className="font-unica text-5xl sm:text-7xl md:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3] break-words">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Filter bar */}
        {!searchLoading && _hasHydrated && (
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

        {/* Grid */}
        {searchLoading ? (
          <div className="py-32 text-center">
            <div className="inline-block w-10 h-10 border-2 border-[#5f5e5e] border-t-[#1c1c18] animate-spin mb-4" />
            <p className="font-grotesk text-sm text-[#5f5e5e] uppercase tracking-widest">Searching...</p>
          </div>
        ) : !_hasHydrated ? (
          <div className="py-32 text-center">
            <div className="inline-block w-10 h-10 border-2 border-[#5f5e5e] border-t-[#1c1c18] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e] mb-6">NO PRODUCTS FOUND</p>
            <button onClick={resetFilters} className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5">
              CLEAR FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
            {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {searchQuery && (
          <div className="mt-8 text-center">
            <Link to="/shop" className="font-grotesk text-xs text-[#5f5e5e] hover:text-[#1c1c18] uppercase tracking-widest border-b border-[#5f5e5e]/40 pb-0.5">
              ← Back to all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
