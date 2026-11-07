import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';
import { getEffectivePrice } from '../../utils/pricing';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const storeSale = useSiteStore(state => state.storeSale);

  const mainImage  = product.images?.[0] || '';
  const hoverImage = product.images?.[1] || mainImage;

  const { originalPrice, finalPrice, discountPercent, isOnSale } = getEffectivePrice(product, storeSale);
  const hasSale      = isOnSale;
  const isNew        = product.is_new || product.isNew;
  const isBestSeller = product.is_best_seller;
  const isLimited    = product.is_limited_edition;
  const isSoldOut    = product.status === 'SOLD OUT';
  const isPreOrder   = product.status === 'PRE-ORDER';
  const outOfStock   = isSoldOut || (product.stock ?? 1) <= 0;

  // Badge priority: SOLD OUT > SALE (-X%) > LIMITED > BEST SELLER > NEW IN > PRE-ORDER
  const badge = isSoldOut    ? { label: 'SOLD OUT',              cls: 'bg-[#5f5e5e] text-[#fcf9f3]' }
    : hasSale      ? { label: `-${discountPercent}%`,  cls: 'bg-[#4b0e1e] text-[#fcf9f3]' }
    : isLimited    ? { label: 'LIMITED',               cls: 'bg-[#4b0e1e] text-[#fcf9f3]' }
    : isBestSeller ? { label: 'BEST SELLER',           cls: 'bg-[#1c1c18] text-[#c9a96e]' }
    : isNew        ? { label: 'NEW IN',                cls: 'bg-[#1c1c18] text-[#fcf9f3]' }
    : isPreOrder   ? { label: 'PRE-ORDER',             cls: 'bg-blue-900 text-blue-200' }
    : null;

  return (
    <Link to={`/product/${product.id}`} className="group block">
      {/* Image Container */}
      <div
        className="relative aspect-[4/5] overflow-hidden mb-3"
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
      </div>

      {/* Product Info */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h3 className="font-unica text-base md:text-lg uppercase tracking-tight text-[#1c1c18] leading-tight">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2">
          <p className={`font-grotesk font-bold text-sm ${hasSale ? 'text-[#1c6b5a]' : 'text-[#1c1c18]'}`}>
            ₦{finalPrice.toLocaleString()}
          </p>
          {hasSale && originalPrice > finalPrice && (
            <p className="font-plex text-xs text-[#5f5e5e] line-through">
              ₦{originalPrice.toLocaleString()}
            </p>
          )}
        </div>
        <p className={`font-grotesk font-bold text-[10px] uppercase tracking-widest ${outOfStock ? 'text-[#b3261e]' : 'text-[#1c6b5a]'}`}>
          {outOfStock ? 'Out of Stock' : 'In Stock'}
        </p>
      </div>
    </Link>
  );
}
