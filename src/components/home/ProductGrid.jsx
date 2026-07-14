import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';
import ProductCard from '../product/ProductCard';

export default function ProductGrid() {
  const { products, featuredClothes, _hasHydrated } = useSiteStore();

  if (!_hasHydrated) return null;

  // Use featured product IDs from homepage config if set, otherwise fallback to newest active products
  const featuredIds = featuredClothes?.productIds || [];

  let displayProducts;
  if (featuredIds.length > 0) {
    // Show featured products in the CMS-defined order
    const featuredMap = Object.fromEntries(products.map(p => [p.id, p]));
    displayProducts = featuredIds
      .map(id => featuredMap[id])
      .filter(p => p && p.status !== 'DRAFT')
      .slice(0, 12);
  } else {
    // Fallback: active products sorted by sort_order then created_at
    displayProducts = [...products]
      .filter(p => p.status === 'ACTIVE')
      .slice(0, 12);
  }

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-5 md:px-8 lg:px-14 max-w-[1440px] mx-auto">

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 mb-10 pb-8 border-b border-[#1c1c18]/10">
        <div>
          <p className="font-grotesk text-[10px] font-bold uppercase tracking-[0.3em] text-[#a8a8a0] mb-2">
            SUMMER SALES
          </p>
          <h2 className="font-unica text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter text-[#1c1c18] leading-none">
            NEW ARRIVALS
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-3 border-2 border-[#1c1c18] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-[10px] px-7 py-3 hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-all duration-300 group shrink-0"
        >
          VIEW ALL
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </Link>
      </div>

      {/* 4-column Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 md:gap-x-4 gap-y-10 md:gap-y-14">
        {displayProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
