import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';
import ProductCard from '../product/ProductCard';

export default function FeaturedClothes() {
  const { products, featuredClothes, _hasHydrated } = useSiteStore();

  if (!_hasHydrated) return null;

  // Get exactly the selected items, or fallback to first 4 active items if none selected
  const displayProducts = featuredClothes?.productIds?.length > 0
    ? featuredClothes.productIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean)
    : [...products].filter(p => p.status === 'ACTIVE').slice(0, 4);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto border-t border-[#1c1c18]/10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <h2 className="font-unica text-5xl md:text-6xl uppercase tracking-tighter text-[#1c1c18] leading-none">
          FEATURED
        </h2>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs px-8 py-4 hover:bg-[#D4AF37] transition-colors"
        >
          SHOP NOW
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10">
        {displayProducts.slice(0, 5).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
