import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';
import { toast } from '../ui/ToastProvider';

export default function ProductCard({ product }) {
  const { addToCart } = useSiteStore();
  const [hovered, setHovered] = useState(false);

  const mainImage  = product.images?.[0] || '';
  const hoverImage = product.images?.[1] || mainImage;

  // Determine if product has a sale price
  const hasSale = product.comparePrice && product.comparePrice > product.price;

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
        {/* ── Badges (top-left, like YL) ── */}
        {hasSale && (
          <div className="absolute top-3 left-3 z-10 bg-[#5f5e5e] text-[#fcf9f3] font-grotesk font-bold text-[9px] uppercase tracking-widest px-2.5 py-1">
            SALE
          </div>
        )}
        {product.isNew && !hasSale && (
          <div className="absolute top-3 left-3 z-10 bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold text-[9px] uppercase tracking-widest px-2.5 py-1">
            NEW IN
          </div>
        )}
        {product.status === 'SOLD OUT' && (
          <div className="absolute top-3 left-3 z-10 bg-[#5f5e5e] text-[#fcf9f3] font-grotesk font-bold text-[9px] uppercase tracking-widest px-2.5 py-1">
            SOLD OUT
          </div>
        )}

        {/* ── Main Image ── */}
        <img
          src={mainImage}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered && hoverImage !== mainImage ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* ── Hover Image (swap on hover, like YL) ── */}
        {hoverImage !== mainImage && (
          <img
            src={hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* ── "CHOOSE OPTIONS" overlay button at bottom — exact YL pattern ── */}
        {product.status !== 'SOLD OUT' && (
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            <button
              onClick={handleQuickAdd}
              className="w-full bg-white/95 text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-[10px] py-3.5 hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-colors border-t border-[#1c1c18]/10"
            >
              CHOOSE OPTIONS
            </button>
          </div>
        )}

        {/* ── Out of Stock label ── */}
        {product.status === 'SOLD OUT' && (
          <div className={`absolute bottom-0 left-0 right-0 bg-[#1c1c18]/80 py-3 transition-all duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-center font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#fcf9f3]">OUT OF STOCK</p>
          </div>
        )}
      </div>

      {/* ── Product Info ── */}
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
              ₦{product.comparePrice?.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
