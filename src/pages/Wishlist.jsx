import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';

export default function Wishlist() {
  const { wishlist, products, openCart } = useSiteStore();

  const wishlisted = wishlist
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Hero */}
      <div className="bg-[#1c1c18] py-20 px-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-3">
            YOUR COLLECTION
          </p>
          <h1 className="font-unica text-7xl md:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3]">
            WISHLIST
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-16">
        {wishlisted.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center gap-6">
            <Heart size={48} className="text-[#1c1c18]/10" />
            <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e]">YOUR WISHLIST IS EMPTY</p>
            <p className="font-plex text-sm text-[#5f5e5e]">Save pieces you love and they'll appear here.</p>
            <Link
              to="/shop"
              className="bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-[#4b0e1e] transition-colors"
            >
              EXPLORE THE SHOP
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-10">
              <p className="font-grotesk text-xs text-[#5f5e5e] uppercase tracking-widest">
                {wishlisted.length} {wishlisted.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
              {wishlisted.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
