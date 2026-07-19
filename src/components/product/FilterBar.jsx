import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

// ── Shared filter bar (Availability + Price) — used on Shop, Category, and Collection pages ──
export default function FilterBar({ total, availability, setAvailability, priceRange, setPriceRange, maxPrice, onReset }) {
  const [availOpen, setAvailOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const hasFilters = availability !== 'all' || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="flex flex-wrap items-center gap-0 border-b border-[#1c1c18]/10 py-4 mb-10">
      {/* Product count */}
      <span className="font-grotesk font-bold text-[11px] uppercase tracking-[0.22em] text-[#1c1c18] mr-6">
        {total} {total === 1 ? 'Product' : 'Products'}
      </span>

      <span className="font-grotesk font-bold text-[10px] uppercase tracking-[0.2em] text-[#5f5e5e] mr-5">
        Filter:
      </span>

      {/* Availability dropdown */}
      <div className="relative mr-3">
        <button
          onClick={() => { setAvailOpen(p => !p); setPriceOpen(false); }}
          className="flex items-center gap-1.5 font-grotesk font-bold text-[10px] uppercase tracking-[0.18em] text-[#1c1c18] border border-[#1c1c18]/20 px-3 py-1.5 hover:border-[#1c1c18]/60 transition-colors"
        >
          Availability{availability !== 'all' && <span className="w-1.5 h-1.5 bg-[#1c1c18] inline-block" />}
          <ChevronDown size={11} className={`transition-transform ${availOpen ? 'rotate-180' : ''}`} />
        </button>
        {availOpen && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-[#fcf9f3] border border-[#1c1c18]/15 shadow-lg z-30">
            {[
              { value: 'all', label: 'All' },
              { value: 'in_stock', label: 'In Stock' },
              { value: 'out_of_stock', label: 'Out of Stock' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setAvailability(opt.value); setAvailOpen(false); }}
                className={`w-full text-left px-4 py-2.5 font-grotesk text-[11px] uppercase tracking-[0.14em] transition-colors
                  ${availability === opt.value
                    ? 'bg-[#1c1c18] text-[#fcf9f3]'
                    : 'text-[#1c1c18] hover:bg-[#1c1c18]/6'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price dropdown */}
      <div className="relative mr-5">
        <button
          onClick={() => { setPriceOpen(p => !p); setAvailOpen(false); }}
          className="flex items-center gap-1.5 font-grotesk font-bold text-[10px] uppercase tracking-[0.18em] text-[#1c1c18] border border-[#1c1c18]/20 px-3 py-1.5 hover:border-[#1c1c18]/60 transition-colors"
        >
          Price{(priceRange[0] > 0 || priceRange[1] < maxPrice) && <span className="w-1.5 h-1.5 bg-[#1c1c18] inline-block" />}
          <ChevronDown size={11} className={`transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
        </button>
        {priceOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#fcf9f3] border border-[#1c1c18]/15 shadow-lg z-30 p-4">
            <p className="font-grotesk font-bold text-[9px] uppercase tracking-[0.2em] text-[#5f5e5e] mb-3">
              Price Range
            </p>
            <div className="flex items-center justify-between font-grotesk text-[11px] text-[#1c1c18] mb-3">
              <span>₦{priceRange[0].toLocaleString()}</span>
              <span>₦{priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={1000}
              value={priceRange[0]}
              onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 1000), priceRange[1]])}
              className="w-full accent-[#1c1c18] mb-2"
            />
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={1000}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 1000)])}
              className="w-full accent-[#1c1c18]"
            />
            <button
              onClick={() => { setPriceRange([0, maxPrice]); setPriceOpen(false); }}
              className="mt-3 w-full font-grotesk font-bold text-[9px] uppercase tracking-[0.2em] text-[#5f5e5e] hover:text-[#1c1c18] transition-colors text-left"
            >
              Reset price
            </button>
          </div>
        )}
      </div>

      {/* Sort By — right side */}
      <div className="ml-auto flex items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.18em] text-[#5f5e5e]">
        Sort by: <span className="text-[#1c1c18] font-bold">Featured</span>
      </div>

      {/* Reset all */}
      {hasFilters && (
        <button
          onClick={onReset}
          className="ml-4 flex items-center gap-1 font-grotesk text-[9px] uppercase tracking-[0.18em] text-[#5f5e5e] hover:text-[#1c1c18] transition-colors"
        >
          <X size={10} /> Clear
        </button>
      )}
    </div>
  );
}
