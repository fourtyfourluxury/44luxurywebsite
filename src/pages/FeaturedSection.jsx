import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';
import FilterBar from '../components/product/FilterBar';

/**
 * FeaturedSection — public page for a homepage product section that isn't
 * linked to a Collection or Partnership (e.g. a hand-picked "New Arrivals").
 * Shows exactly the products chosen for that section's homepage tile.
 */
export default function FeaturedSection() {
  const { slug } = useParams();
  const { homepageSections, products } = useSiteStore();

  const section = homepageSections.find(s => s.slug === slug);

  useEffect(() => {
    if (section) document.title = `${section.title} | 44 Luxury`;
  }, [section]);

  const [availability, setAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState([0, Infinity]);

  const sectionProducts = useMemo(() => {
    if (!section) return [];
    const map = Object.fromEntries(products.map(p => [p.id, p]));
    return (section.product_ids || []).map(id => map[id]).filter(p => p && p.status !== 'DRAFT');
  }, [products, section]);

  const maxPrice = useMemo(() => {
    const prices = sectionProducts.map(p => p.price || 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 500000;
  }, [sectionProducts]);

  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === Infinity) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  const effectiveMax = maxPrice > 0 ? maxPrice : 500000;
  const effectivePriceRange = priceRange[1] === Infinity ? [0, effectiveMax] : priceRange;

  let filteredProducts = sectionProducts;
  if (availability === 'in_stock') filteredProducts = filteredProducts.filter(p => (p.stock ?? 1) > 0);
  if (availability === 'out_of_stock') filteredProducts = filteredProducts.filter(p => (p.stock ?? 1) <= 0);
  if (effectivePriceRange[1] < effectiveMax || effectivePriceRange[0] > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const price = p.price || 0;
      return price >= effectivePriceRange[0] && price <= effectivePriceRange[1];
    });
  }

  const resetFilters = () => {
    setAvailability('all');
    setPriceRange([0, effectiveMax]);
  };

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f3]">
        <div className="text-center px-6">
          <p className="font-unica text-[12vw] uppercase tracking-tighter text-[#1c1c18]/10 leading-none mb-6">404</p>
          <p className="font-unica text-3xl uppercase tracking-tighter text-[#5f5e5e] mb-8">PAGE NOT FOUND</p>
          <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5 hover:text-[#4b0e1e] hover:border-[#4b0e1e] transition-colors">
            BROWSE ALL
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      <div className="bg-[#1c1c18] py-12 px-6">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="font-unica text-3xl sm:text-4xl md:text-6xl uppercase tracking-tighter leading-[0.9] text-[#fcf9f3] break-words">
            {section.title}
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {sectionProducts.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e]/40 mb-8">COMING SOON</p>
            <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5">
              BROWSE ALL PRODUCTS
            </Link>
          </div>
        ) : (
          <>
            <FilterBar
              total={filteredProducts.length}
              availability={availability}
              setAvailability={setAvailability}
              priceRange={effectivePriceRange}
              setPriceRange={setPriceRange}
              maxPrice={effectiveMax}
              onReset={resetFilters}
            />

            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-unica text-4xl uppercase tracking-tighter text-[#5f5e5e] mb-6">NO PRODUCTS FOUND</p>
                <button onClick={resetFilters} className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5">
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
