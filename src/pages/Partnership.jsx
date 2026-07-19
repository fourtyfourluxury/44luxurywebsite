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

export default function Partnership() {
  const { slug } = useParams();
  const { partnerships, products } = useSiteStore();

  const partnership = partnerships.find(p => p.slug === slug);

  useSEO({
    title:       partnership?.seo_title       || (partnership ? `${partnership.name} | 44 Luxury` : '44 Luxury'),
    description: partnership?.seo_description || partnership?.description,
  });

  // Filter state
  const [availability, setAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState([0, Infinity]);

  // Only products explicitly picked for this partnership
  const partnershipProducts = useMemo(() => {
    if (!partnership) return [];
    const ids = partnership.featured_product_ids || [];
    const map = Object.fromEntries(products.map(p => [p.id, p]));
    return ids.map(id => map[id]).filter(p => p && p.status !== 'DRAFT');
  }, [products, partnership]);

  const maxPrice = useMemo(() => {
    const prices = partnershipProducts.map(p => p.price || 0);
    return prices.length > 0 ? Math.ceil(Math.max(...prices) / 1000) * 1000 : 500000;
  }, [partnershipProducts]);

  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === Infinity) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  const effectiveMax = maxPrice > 0 ? maxPrice : 500000;
  const effectivePriceRange = priceRange[1] === Infinity ? [0, effectiveMax] : priceRange;

  let filteredProducts = partnershipProducts;
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

  if (!partnership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f3]">
        <div className="text-center px-6">
          <p className="font-unica text-[12vw] uppercase tracking-tighter text-[#1c1c18]/10 leading-none mb-6">404</p>
          <p className="font-unica text-3xl uppercase tracking-tighter text-[#5f5e5e] mb-8">PARTNERSHIP NOT FOUND</p>
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
        {partnership.banner_url && (
          <img
            src={partnership.banner_url}
            alt={partnership.name}
            className="w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/90 via-[#1c1c18]/30 to-transparent" />

        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-[#fcf9f3]/70 hover:text-[#fcf9f3] transition-colors font-grotesk font-semibold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> HOME
        </Link>

        <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-14 max-w-[1440px] mx-auto w-full">
          {partnership.logo_url && (
            <img src={partnership.logo_url} alt="" className="h-10 w-auto object-contain mb-5" />
          )}
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/50 mb-4">
            44 LUXURY × {partnership.partner_name} · {partnershipProducts.length} {partnershipProducts.length === 1 ? 'PIECE' : 'PIECES'}
          </p>
          <h1 className="font-unica text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tighter leading-[0.9] text-[#fcf9f3] mb-5 break-words">
            {partnership.name}
          </h1>
          {partnership.description && (
            <p className="font-plex text-base text-[#fcf9f3]/65 max-w-md leading-relaxed">
              {partnership.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Partner website CTA (only when set) ───────── */}
      {partnership.partner_website && (
        <div className="bg-[#f7f4ed] border-b border-[#1c1c18]/8">
          <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-6 flex justify-end">
            <a
              href={partnership.partner_website}
              target="_blank"
              rel="noreferrer"
              className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5 hover:text-[#4b0e1e] hover:border-[#4b0e1e] transition-colors"
            >
              VISIT {partnership.partner_name.toUpperCase()}
            </a>
          </div>
        </div>
      )}

      {/* ── Gallery ──────────────────────────────────── */}
      {partnership.gallery && partnership.gallery.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {partnership.gallery.slice(0, 4).map((img, i) => (
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
          THE COLLABORATION
        </p>
        <h2 className="font-unica text-3xl md:text-4xl uppercase tracking-tighter text-[#1c1c18] leading-none mb-8">
          {partnership.name}
        </h2>

        {partnershipProducts.length === 0 ? (
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
    </div>
  );
}
