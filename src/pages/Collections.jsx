import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';
import FilterBar from '../components/product/FilterBar';

// Inject / update <head> SEO tags
function useSEO({ title, description, keywords }) {
  useEffect(() => {
    if (title)       document.title = title;
    const setMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', description);
    setMeta('keywords', keywords);
  }, [title, description, keywords]);
}

export default function Collections() {
  const { slug } = useParams();
  const { collections, products } = useSiteStore();

  const collection = collections.find(c => c.slug === slug);

  useSEO({
    title:       collection?.seo_title       || (collection ? `${collection.name} | 44 Luxury` : '44 Luxury'),
    description: collection?.seo_description || collection?.description,
    keywords:    collection?.seo_keywords,
  });

  // Filter state
  const [availability, setAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState([0, Infinity]);

  // Products explicitly tied to this collection — no gender/category fallback,
  // so a product only ever shows here because it's actually assigned to it.
  const collectionProducts = useMemo(() => {
    if (!collection) return [];
    return products.filter(p => {
      if (p.status === 'DRAFT') return false;
      if (p.collection_id === collection.id)              return true;
      if (p.collection === collection.slug)               return true;
      if (p.collections?.includes(collection.id))         return true;
      if (collection.category_type && p.category_type === collection.category_type) return true;
      return false;
    });
  }, [products, collection]);

  const maxPrice = useMemo(() => {
    const prices = collectionProducts.map(p => p.price || 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 500000;
  }, [collectionProducts]);

  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === Infinity) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  const effectiveMax = maxPrice > 0 ? maxPrice : 500000;
  const effectivePriceRange = priceRange[1] === Infinity ? [0, effectiveMax] : priceRange;

  let filteredProducts = collectionProducts;
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

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f3]">
        <div className="text-center px-6">
          <p className="font-unica text-[12vw] uppercase tracking-tighter text-[#1c1c18]/10 leading-none mb-6">404</p>
          <p className="font-unica text-3xl uppercase tracking-tighter text-[#5f5e5e] mb-8">COLLECTION NOT FOUND</p>
          <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5 hover:text-[#4b0e1e] hover:border-[#4b0e1e] transition-colors">
            BROWSE ALL
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero Banner ──────────────────────────────── */}
      <div className="relative h-[60vh] min-h-[420px] max-h-[620px] overflow-hidden bg-[#1c1c18]">
        {collection.hero_image && (
          <img
            src={collection.hero_image}
            alt={collection.name}
            className="w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/90 via-[#1c1c18]/30 to-transparent" />

        <Link
          to="/collections"
          className="absolute top-8 left-8 flex items-center gap-2 text-[#fcf9f3]/70 hover:text-[#fcf9f3] transition-colors font-grotesk font-semibold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> ALL COLLECTIONS
        </Link>

        <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-14 max-w-[1440px] mx-auto w-full">
          <h1 className="font-unica text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.9] text-[#fcf9f3] mb-5 break-words">
            {collection.hero_headline || collection.name}
          </h1>
          {(collection.hero_subheadline || collection.description) && (
            <p className="font-plex text-base text-[#fcf9f3]/65 max-w-md leading-relaxed">
              {collection.hero_subheadline || collection.description}
            </p>
          )}
        </div>
      </div>

      {/* ── CTA strip (only when a custom CTA is set) ─── */}
      {collection.cta_label && collection.cta_link && (
        <div className="bg-[#f7f4ed] border-b border-[#1c1c18]/8">
          <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-6 flex justify-end">
            <Link
              to={collection.cta_link}
              className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5 hover:text-[#4b0e1e] hover:border-[#4b0e1e] transition-colors"
            >
              {collection.cta_label}
            </Link>
          </div>
        </div>
      )}

      {/* ── Gallery ──────────────────────────────────── */}
      {collection.gallery && collection.gallery.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {collection.gallery.slice(0, 4).map((img, i) => (
              <div key={i} className={`overflow-hidden bg-[#f1eee7] ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/5]'}`}>
                <img src={img} alt="" className="w-full h-full object-cover img-zoom" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Products Grid ─────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#a8a8a0] mb-2">
          THE EDIT
        </p>
        <h2 className="font-unica text-3xl md:text-4xl uppercase tracking-tighter text-[#1c1c18] leading-none mb-8">
          {collection.name}
        </h2>

        {collectionProducts.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e]/40 mb-8">
              COMING SOON
            </p>
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

      {/* ── Closing nav strip ─────────────────────────── */}
      <div className="border-t border-[#1c1c18]/10 py-16 px-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link
            to="/collections"
            className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5 hover:text-[#4b0e1e] hover:border-[#4b0e1e] transition-colors"
          >
            BROWSE ALL COLLECTIONS
          </Link>
          <Link
            to="/shop"
            className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#5f5e5e] border-b border-[#5f5e5e]/40 pb-0.5 hover:text-[#1c1c18] hover:border-[#1c1c18] transition-colors"
          >
            SHOP ALL PRODUCTS
          </Link>
        </div>
      </div>
    </div>
  );
}
