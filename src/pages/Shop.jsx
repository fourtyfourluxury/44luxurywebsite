import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';
import FilterBar from '../components/product/FilterBar';
import { searchProducts } from '../services/searchService';

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
      <div className="bg-[#1c1c18] py-12 px-6">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="font-unica text-3xl sm:text-4xl md:text-6xl uppercase tracking-tighter leading-[0.9] text-[#fcf9f3] break-words">
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
