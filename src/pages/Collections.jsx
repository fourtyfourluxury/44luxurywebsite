import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';

export default function Collections() {
  const { slug } = useParams();
  const { collections, products } = useSiteStore();

  const collection = collections.find(c => c.slug === slug);

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f3]">
        <div className="text-center px-6">
          <p className="font-unica text-[12vw] uppercase tracking-tighter text-[#1c1c18]/10 leading-none mb-6">
            404
          </p>
          <p className="font-unica text-3xl uppercase tracking-tighter text-[#5f5e5e] mb-8">
            COLLECTION NOT FOUND
          </p>
          <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5 hover:text-[#4b0e1e] hover:border-[#4b0e1e] transition-colors">
            BROWSE ALL
          </Link>
        </div>
      </div>
    );
  }

  const collectionProducts = products.filter(p =>
    p.status !== 'DRAFT' && (
      p.collectionId === collection.id ||
      p.collection === collection.slug ||
      p.collections?.includes(collection.id)
    )
  );

  const displayProducts = collectionProducts.length > 0
    ? collectionProducts
    : products.filter(p =>
        p.status !== 'DRAFT' &&
        (p.category === collection.category || collection.category === 'unisex')
      );

  return (
    <div>
      {/* ── Hero ─────────────────────────────── */}
      <div className="relative h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden bg-[#1c1c18]">
        {collection.heroImage && (
          <img
            src={collection.heroImage}
            alt={collection.name}
            className="w-full h-full object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/90 via-[#1c1c18]/30 to-transparent" />

        <Link
          to="/shop"
          className="absolute top-8 left-8 flex items-center gap-2 text-[#fcf9f3]/70 hover:text-[#fcf9f3] transition-colors font-grotesk font-semibold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> ALL COLLECTIONS
        </Link>

        <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-16 max-w-[1440px] mx-auto w-full">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/50 mb-4">
            {collection.category?.toUpperCase()} · {displayProducts.length} PIECES
          </p>
          <h1 className="font-unica text-7xl md:text-[9rem] lg:text-[11rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3] mb-6">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="font-plex text-base text-[#fcf9f3]/65 max-w-md leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* ── Gallery ─────────────────────────── */}
      {collection.gallery && collection.gallery.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {collection.gallery.slice(0, 4).map((img, i) => (
              <div key={i} className={`overflow-hidden bg-[#f1eee7] ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/5]'}`}>
                <img src={img} alt="" className="w-full h-full object-cover img-zoom" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Products Grid ─────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-12">
          <h2 className="font-unica text-4xl md:text-6xl uppercase tracking-tighter text-[#1c1c18] leading-none">
            THE EDIT
          </h2>
          <span className="font-plex text-sm text-[#5f5e5e]">
            {displayProducts.length} {displayProducts.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>

        {displayProducts.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e]/40 mb-8">
              COMING SOON
            </p>
            <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5">
              BROWSE ALL PRODUCTS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* ── Newsletter Strip ─────────────── */}
      <div className="bg-[#4b0e1e] py-20 px-6">
        <div className="max-w-[640px] mx-auto text-center">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.2em] text-[#fcf9f3]/50 mb-4">
            THE COLLECTIVE
          </p>
          <h3 className="font-unica text-4xl md:text-5xl uppercase tracking-tighter text-[#fcf9f3] mb-6">
            GET EARLY ACCESS
          </h3>
          <form className="flex gap-0 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="YOUR EMAIL"
              className="flex-1 bg-[#fcf9f3]/10 border border-[#fcf9f3]/20 text-[#fcf9f3] font-plex text-sm px-4 py-3.5 outline-none placeholder:text-[#fcf9f3]/40 focus:border-[#fcf9f3]/50 transition-colors"
            />
            <button
              type="submit"
              className="bg-[#D4AF37] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs px-6 py-3.5 hover:bg-[#c9a02d] transition-colors shrink-0"
            >
              JOIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
