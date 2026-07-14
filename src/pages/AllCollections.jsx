import { Link } from 'react-router-dom';
import { useSiteStore } from '../store/useSiteStore';

// Category type display order & icons
const CATEGORY_ORDER = [
  'new-arrivals', 't-shirts', 'polos', 'hoodies-sweatshirts',
  'tracksuits', 'denim', 'crop-tops', 'tank-tops', 'caps', 'socks', 'accessories',
];

const CATEGORY_LABELS = {
  'new-arrivals':        'New Arrivals',
  't-shirts':            'T-Shirts',
  'polos':               'Polos',
  'hoodies-sweatshirts': 'Hoodies & Sweatshirts',
  'tracksuits':          'Tracksuits',
  'denim':               'Denim',
  'crop-tops':           'Crop Tops',
  'tank-tops':           'Tank Tops',
  'caps':                'Caps',
  'socks':               'Socks',
  'accessories':         'Accessories',
};

export default function AllCollections() {
  const { collections } = useSiteStore();

  const active = collections.filter(c => c.status === 'ACTIVE');

  // Sort: known category_types first (in defined order), then alphabetically
  const sorted = [...active].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category_type || '');
    const bi = CATEGORY_ORDER.indexOf(b.category_type || '');
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Featured (has hero image) vs. others
  const featured  = sorted.filter(c => c.hero_image);
  const secondary = sorted.filter(c => !c.hero_image);

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* ── Hero Banner ─────────────────────────── */}
      <div className="bg-[#1c1c18] py-24 px-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-3">
            CURATED EDITS · {active.length} COLLECTIONS
          </p>
          <h1 className="font-unica text-7xl md:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3]">
            THE COLLECTIONS
          </h1>
          <p className="font-plex text-base text-[#fcf9f3]/60 max-w-lg mt-4 leading-relaxed">
            Explore our curated categories — designed with purpose, crafted without compromise.
          </p>
        </div>
      </div>

      {/* ── Category Quick Nav (pill strip) ─────── */}
      {active.length > 0 && (
        <div className="sticky top-[72px] z-10 bg-[#fcf9f3]/95 backdrop-blur-md border-b border-[#1c1c18]/8">
          <div className="max-w-[1440px] mx-auto px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {sorted.map(col => (
              <a
                key={col.id}
                href={`#col-${col.slug}`}
                className="shrink-0 font-grotesk font-semibold text-[10px] uppercase tracking-widest text-[#5f5e5e] hover:text-[#1c1c18] border border-[#1c1c18]/15 hover:border-[#1c1c18]/40 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
              >
                {CATEGORY_LABELS[col.category_type] || col.name}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-6 py-16 md:py-24">
        {active.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e] mb-6">NO COLLECTIONS YET</p>
            <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5">
              BROWSE SHOP
            </Link>
          </div>
        ) : (
          <>
            {/* ── Featured (with images) ─────────── */}
            {featured.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-20">
                {featured.map((col) => (
                  <CollectionCard key={col.id} col={col} />
                ))}
              </div>
            )}

            {/* ── Secondary (no image) ───────────── */}
            {secondary.length > 0 && (
              <>
                {featured.length > 0 && (
                  <div className="border-t border-[#1c1c18]/8 pt-16 mb-10">
                    <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-8">MORE CATEGORIES</p>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {secondary.map(col => (
                    <Link
                      key={col.id}
                      id={`col-${col.slug}`}
                      to={`/collections/${col.slug}`}
                      className="group border border-[#1c1c18]/10 hover:border-[#1c1c18]/30 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-[#1c1c18]/[0.02] transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#1c1c18]/5 flex items-center justify-center mb-4 group-hover:bg-[#4b0e1e]/10 transition-colors">
                        <span className="font-unica text-xl uppercase text-[#1c1c18]/40 group-hover:text-[#4b0e1e]/60 transition-colors">
                          {col.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="font-grotesk font-bold text-[11px] uppercase tracking-widest text-[#1c1c18] group-hover:text-[#4b0e1e] transition-colors">
                        {col.name}
                      </h3>
                      {col.description && (
                        <p className="font-plex text-xs text-[#5f5e5e] mt-2 line-clamp-2 leading-relaxed">{col.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CollectionCard({ col }) {
  return (
    <Link
      id={`col-${col.slug}`}
      to={`/collections/${col.slug}`}
      className="group flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] bg-[#f1eee7] overflow-hidden mb-6 rounded-sm">
        <img
          src={col.hero_image}
          alt={col.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {/* Badge */}
        {col.category_type === 'new-arrivals' && (
          <div className="absolute top-4 left-4 bg-[#D4AF37] text-[#1c1c18] font-grotesk font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-sm">
            NEW
          </div>
        )}
        {/* Hover CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
          <span className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#fcf9f3] border-b border-[#fcf9f3]">
            EXPLORE COLLECTION
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e]">
            {col.category_type
              ? col.category_type.replace(/-/g, ' ').toUpperCase()
              : (col.category || 'COLLECTION').toUpperCase()}
          </p>
          <span className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18]/0 group-hover:border-[#1c1c18] pb-0.5 transition-all duration-300">
            EXPLORE →
          </span>
        </div>
        <h2 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18] group-hover:text-[#D4AF37] transition-colors duration-300">
          {col.name}
        </h2>
        {col.description && (
          <p className="font-plex text-sm text-[#5f5e5e] mt-3 line-clamp-2 leading-relaxed">
            {col.description}
          </p>
        )}
      </div>
    </Link>
  );
}
