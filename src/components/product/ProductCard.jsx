import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
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
  const outOfStock   = isSoldOut || (product.stock ?? 1) <= 0;

  // Badge priority: SOLD OUT > LIMITED > SALE > BEST SELLER > NEW IN
  const badge = isSoldOut    ? { label: 'SOLD OUT',   cls: 'bg-[#5f5e5e] text-[#fcf9f3]' }
    : isLimited    ? { label: 'LIMITED',    cls: 'bg-[#4b0e1e] text-[#fcf9f3]' }
    : hasSale      ? { label: 'SALE',       cls: 'bg-[#5f5e5e] text-[#fcf9f3]' }
    : isBestSeller ? { label: 'BEST SELLER',cls: 'bg-[#1c1c18] text-[#c9a96e]' }
    : isNew        ? { label: 'NEW IN',     cls: 'bg-[#1c1c18] text-[#fcf9f3]' }
    : isPreOrder   ? { label: 'PRE-ORDER',  cls: 'bg-blue-900 text-blue-200' }
    : null;

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
        <p className={`font-grotesk font-bold text-[10px] uppercase tracking-widest ${outOfStock ? 'text-[#b3261e]' : 'text-[#1c6b5a]'}`}>
          {outOfStock ? 'Out of Stock' : 'In Stock'}
        </p>
      </div>
    </Link>
  );
}
