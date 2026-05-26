import { Link } from 'react-router-dom';
import { useSiteStore } from '../store/useSiteStore';

export default function AllCollections() {
  const { collections } = useSiteStore();

  // Filter out men/women core categories if they are treated as collections,
  // or just show everything that's active.
  const activeCollections = collections.filter(c => 
    c.status === 'ACTIVE' && !['men', 'women'].includes(c.slug)
  );

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Hero Banner */}
      <div className="bg-[#1c1c18] py-20 px-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-3">
            CURATED EDITS
          </p>
          <h1 className="font-unica text-7xl md:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3]">
            THE COLLECTIONS
          </h1>
          <p className="font-plex text-base text-[#fcf9f3]/60 max-w-lg mt-4 leading-relaxed">
            Explore our curated collections, designed with purpose and crafted without compromise.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-16 md:py-24">
        {activeCollections.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e] mb-6">NO COLLECTIONS FOUND</p>
            <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5">
              BROWSE SHOP
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {activeCollections.map((collection) => (
              <Link 
                key={collection.id} 
                to={`/collections/${collection.slug}`}
                className="group flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-[#f1eee7] overflow-hidden mb-6">
                  {collection.hero_image ? (
                    <img 
                      src={collection.hero_image} 
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5f5e5e]/30 font-unica text-2xl uppercase">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e]">
                      {collection.category || 'COLLECTION'}
                    </p>
                    <span className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18]/0 group-hover:border-[#1c1c18] pb-0.5 transition-all duration-300">
                      EXPLORE
                    </span>
                  </div>
                  <h2 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18] group-hover:text-[#D4AF37] transition-colors duration-300">
                    {collection.name}
                  </h2>
                  {collection.description && (
                    <p className="font-plex text-sm text-[#5f5e5e] mt-3 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
