import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';
import { useDebounce } from '../../hooks/useDebounce';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { products } = useSiteStore();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const results = debouncedQuery.trim() === '' ? [] : products.filter(p => {
    const term = debouncedQuery.toLowerCase();
    return p.name.toLowerCase().includes(term) || 
           p.category.toLowerCase().includes(term) || 
           p.description.toLowerCase().includes(term);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0c]/90 backdrop-blur-md flex flex-col items-center pt-24 px-6 overflow-y-auto">
      <button onClick={onClose} className="absolute top-8 right-8 text-concrete hover:text-bone transition-colors">
        <X className="w-8 h-8" />
      </button>

      <div className="w-full max-w-4xl">
        <div className="relative border-b-2 border-matte-black/40 pb-4 mb-12">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-concrete" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH EDITIONS, CATEGORIES..."
            className="w-full bg-transparent pl-12 pr-4 py-4 font-unica text-5xl uppercase tracking-tighter text-bone outline-none placeholder:text-concrete"
          />
        </div>

        {debouncedQuery.length > 0 && (
          <div className="text-bone font-plex mb-6 text-sm uppercase tracking-widest text-concrete">
             {results.length} {results.length === 1 ? 'RESULT' : 'RESULTS'} FOUND FOR "{debouncedQuery}"
          </div>
        )}

        {debouncedQuery.length > 0 && results.length === 0 && (
           <div className="text-center py-24">
              <p className="font-unica text-4xl uppercase tracking-tighter text-concrete mb-4">NO EDITIONS FOUND</p>
              <p className="font-plex text-sm text-concrete/70 uppercase tracking-widest">Adjust your search terms and try again.</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
          {results.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} onClick={onClose} className="group flex items-center gap-6 p-4 border border-matte-black/50 hover:bg-[#1c1c18] transition-colors">
              <img src={product.images[0]} alt={product.name} className="w-20 h-24 object-cover" />
              <div>
                <p className="font-grotesk font-bold text-bone mb-1">{product.name}</p>
                <p className="font-plex text-concrete text-sm mb-2">₦{product.price.toLocaleString()}</p>
                <p className="text-xs uppercase tracking-widest text-concrete bg-matte-black inline-block px-2 py-1">{product.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
