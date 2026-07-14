import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';
import { toast } from '../ui/ToastProvider';

export default function ProductCard({ product }) {
  const { addToCart } = useSiteStore();
  const [hovered, setHovered] = useState(false);

  const mainImage  = product.images?.[0] || '';
  const hoverImage = product.images?.[1] || mainImage;

  // Support both camelCase (legacy) and snake_case (DB)
  const hasSale      = (product.compare_price || product.comparePrice) > product.price;
  const isNew        = product.is_new || product.isNew;
  const isBestSeller = product.is_best_seller;
  const isLimited    = product.is_limited_edition;
  const isSoldOut    = product.status === 'SOLD OUT';
  const isPreOrder   = product.status === 'PRE-ORDER';

  // Badge priority: SOLD OUT > LIMITED > SALE > BEST SELLER > NEW IN
  const badge = isSoldOut    ? { label: 'SOLD OUT',   cls: 'bg-[#5f5e5e] text-[#fcf9f3]' }
    : isLimited    ? { label: 'LIMITED',    cls: 'bg-[#4b0e1e] text-[#fcf9f3]' }
    : hasSale      ? { label: 'SALE',       cls: 'bg-[#5f5e5e] text-[#fcf9f3]' }
    : isBestSeller ? { label: 'BEST SELLER',cls: 'bg-[#1c1c18] text-[#c9a96e]' }
    : isNew        ? { label: 'NEW IN',     cls: 'bg-[#1c1c18] text-[#fcf9f3]' }
    : isPreOrder   ? { label: 'PRE-ORDER',  cls: 'bg-blue-900 text-blue-200' }
    : null;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const size = product.sizes?.[0] || '';
    const color = product.colors?.[0] || '';
    addToCart(product, size, color);
    toast(`${product.name} added to bag`, 'cart');
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      {/* Image Container */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-[#f1eee7] mb-3"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Badge */}
        {badge && (
          <div className={`absolute top-3 left-3 z-10 font-grotesk font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 ${badge.cls}`}>
            {badge.label}
          </div>
        )}

        {/* Main Image */}
        <img
          src={mainImage}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered && hoverImage !== mainImage ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* Hover Image */}
        {hoverImage !== mainImage && (
          <img
            src={hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Quick Add / Pre-Order overlay */}
        {!isSoldOut && (
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            <button
              onClick={handleQuickAdd}
              className="w-full bg-white/95 text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-[10px] py-3.5 hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-colors border-t border-[#1c1c18]/10"
            >
              {isPreOrder ? 'PRE-ORDER' : 'CHOOSE OPTIONS'}
            </button>
          </div>
        )}

        {/* Sold Out overlay */}
        {isSoldOut && (
          <div className={`absolute bottom-0 left-0 right-0 bg-[#1c1c18]/80 py-3 transition-all duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-center font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#fcf9f3]">OUT OF STOCK</p>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-unica text-base md:text-lg uppercase tracking-tight text-[#1c1c18] leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className={`font-grotesk font-bold text-sm ${hasSale ? 'text-[#1c6b5a]' : 'text-[#1c1c18]'}`}>
            ₦{product.price?.toLocaleString()}
          </p>
          {hasSale && (
            <p className="font-plex text-xs text-[#5f5e5e] line-through">
              ₦{(product.compare_price || product.comparePrice)?.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
