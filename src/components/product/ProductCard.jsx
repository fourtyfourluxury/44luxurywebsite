import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';
import { toast } from '../ui/ToastProvider';

export default function ProductCard({ product }) {
  const { addToCart } = useSiteStore();
  const [hovered, setHovered] = useState(false);

  const mainImage  = product.images?.[0] || '';
  const hoverImage = product.images?.[1] || mainImage;

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
      {/* Image */}
      <div
        className="relative aspect-[4/5] overflow-hidden bg-[#f1eee7] mb-4"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Badge */}
        {product.isNew && (
          <div className="absolute top-3 left-3 z-10 bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold text-[10px] uppercase tracking-widest px-2.5 py-1">
            NEW IN
          </div>
        )}
        {product.status === 'SOLD OUT' && (
          <div className="absolute top-3 left-3 z-10 bg-[#5f5e5e] text-[#fcf9f3] font-grotesk font-bold text-[10px] uppercase tracking-widest px-2.5 py-1">
            SOLD OUT
          </div>
        )}

        {/* Images */}
        <img
          src={mainImage}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hovered && hoverImage !== mainImage ? 'opacity-0' : 'opacity-100'}`}
        />
        {hoverImage !== mainImage && (
          <img
            src={hoverImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Quick Add */}
        {product.status !== 'SOLD OUT' && (
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <button
              onClick={handleQuickAdd}
              className="w-full bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs py-4 hover:bg-[#4b0e1e] transition-colors"
            >
              QUICK ADD
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-grotesk font-semibold text-sm text-[#1c1c18] leading-tight uppercase tracking-wide">
              {product.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <p className="font-grotesk font-bold text-sm text-[#1c1c18]">
              ₦{product.price?.toLocaleString()}
            </p>
            {product.comparePrice && (
              <p className="font-plex text-xs text-[#5f5e5e] line-through">
                ₦{product.comparePrice?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
