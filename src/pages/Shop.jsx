import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSiteStore } from '../store/useSiteStore';
import ProductCard from '../components/product/ProductCard';
import SearchBar from '../components/common/SearchBar';
import { searchProducts } from '../services/searchService';

export default function Shop() {
  const { collectionSlug, branchSlug } = useParams();
  const [searchParams] = useSearchParams();
  const { products, collections, _hasHydrated } = useSiteStore();
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';
  const filterParam = searchParams.get('filter') || '';

  // Perform search when search query changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery && searchQuery.trim().length >= 2) {
        setSearchLoading(true);
        const { data } = await searchProducts(searchQuery, {
          category: collectionSlug === 'men' || collectionSlug === 'women' ? collectionSlug : null,
          limit: 50
        });
        setSearchResults(data || []);
        setSearchLoading(false);
      } else {
        setSearchResults(null);
      }
    };

    performSearch();
  }, [searchQuery, collectionSlug]);

  // Determine active collection and category from URL
  const activeCollection = collectionSlug
    ? collections.find(c => c.slug === collectionSlug)
    : null;

  // Use search results if available, otherwise use products from store
  let filtered = searchResults !== null ? searchResults : products.filter(p => p.status !== 'DRAFT');

  // Filter by collection slug (only if not using search results)
  if (collectionSlug && searchResults === null) {
    if (['men', 'women'].includes(collectionSlug)) {
      filtered = filtered.filter(p => p.category === collectionSlug);
    } else if (activeCollection) {
      filtered = filtered.filter(p =>
        p.collectionId === activeCollection.id ||
        p.collection === activeCollection.slug ||
        p.collections?.includes(activeCollection.id)
      );
    }
  }

  // Further filter by branch slug (only if not using search results)
  if (branchSlug && searchResults === null) {
    filtered = filtered.filter(p =>
      p.subcategory === branchSlug ||
      p.branch === branchSlug ||
      (branchSlug === 'tops' && ['tee', 'top', 'shirt', 'TEE'].some(k => p.name.toLowerCase().includes(k))) ||
      (branchSlug === 'outerwear' && ['jacket', 'coat', 'bomber'].some(k => p.name.toLowerCase().includes(k))) ||
      (branchSlug === 'trousers' && ['trouser', 'pant', 'denim', 'jean'].some(k => p.name.toLowerCase().includes(k)))
    );
  }

  // Filter by search query (fallback for basic search if full-text search not available)
  if (searchQuery && searchResults === null) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.collection?.toLowerCase().includes(q)
    );
  }

  // Filter by "new" (only if not using search results)
  if (filterParam === 'new' && searchResults === null) {
    filtered = filtered.filter(p => p.isNew);
  }

  // Build page title
  let pageTitle = 'ALL PRODUCTS';
  if (searchQuery) pageTitle = `"${searchQuery}"`;
  else if (activeCollection) pageTitle = activeCollection.name;
  else if (collectionSlug === 'men') pageTitle = 'MEN';
  else if (collectionSlug === 'women') pageTitle = 'WOMEN';
  else if (filterParam === 'new') pageTitle = 'NEW ARRIVALS';

  // Named collections for sidebar/filter
  const namedCollections = collections.filter(c =>
    c.status === 'ACTIVE' && !['men', 'women'].includes(c.slug)
  );

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* ── Hero Banner ─────────────────────────────── */}
      <div className="bg-[#1c1c18] py-20 px-6">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.25em] text-[#fcf9f3]/40 mb-3">
            {activeCollection?.category?.toUpperCase() || 'SHOP'}
          </p>
          <h1 className="font-unica text-7xl md:text-[9rem] uppercase tracking-tighter leading-[0.88] text-[#fcf9f3]">
            {pageTitle}
          </h1>
          {activeCollection?.description && (
            <p className="font-plex text-base text-[#fcf9f3]/60 max-w-lg mt-4 leading-relaxed">
              {activeCollection.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-10">
          {/* ── Sidebar ─────────────────────────────── */}
          <aside className="md:w-56 shrink-0">
            <div className="sticky top-24 flex flex-col gap-8">
              {/* Categories */}
              <div>
                <h3 className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] mb-4">Category</h3>
                <div className="flex flex-col gap-1">
                  <Link to="/shop"
                    className={`font-plex text-sm py-1.5 transition-colors ${!collectionSlug && !filterParam ? 'text-[#1c1c18] font-semibold' : 'text-[#5f5e5e] hover:text-[#1c1c18]'}`}>
                    All Products
                  </Link>
                  <Link to="/shop/men"
                    className={`font-plex text-sm py-1.5 transition-colors ${collectionSlug === 'men' ? 'text-[#1c1c18] font-semibold' : 'text-[#5f5e5e] hover:text-[#1c1c18]'}`}>
                    Men
                  </Link>
                  <Link to="/shop/women"
                    className={`font-plex text-sm py-1.5 transition-colors ${collectionSlug === 'women' ? 'text-[#1c1c18] font-semibold' : 'text-[#5f5e5e] hover:text-[#1c1c18]'}`}>
                    Women
                  </Link>
                  <Link to="/shop?filter=new"
                    className={`font-plex text-sm py-1.5 transition-colors ${filterParam === 'new' ? 'text-[#1c1c18] font-semibold' : 'text-[#5f5e5e] hover:text-[#1c1c18]'}`}>
                    New Arrivals
                  </Link>
                </div>
              </div>

              {/* Collections */}
              <div>
                <h3 className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] mb-4">Collections</h3>
                <div className="flex flex-col gap-1">
                  {namedCollections.map(col => (
                    <Link key={col.id} to={`/collections/${col.slug}`}
                      className="font-plex text-sm text-[#5f5e5e] hover:text-[#1c1c18] py-1.5 transition-colors">
                      {col.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ─────────────────────────── */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar className="max-w-2xl" />
            </div>

            {/* Results count + search tags */}
            <div className="flex items-center justify-between mb-8">
              <p className="font-grotesk text-xs text-[#5f5e5e] uppercase tracking-widest">
                {searchLoading ? 'Searching...' : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`}
              </p>
              {searchQuery && (
                <Link to="/shop" className="font-grotesk text-xs text-[#5f5e5e] hover:text-[#1c1c18] uppercase tracking-widest border-b border-[#5f5e5e]/40 pb-0.5">
                  Clear search
                </Link>
              )}
            </div>

            {/* Grid */}
            {searchLoading ? (
              <div className="py-32 text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#5f5e5e] border-t-[#1c1c18] rounded-full animate-spin mb-4" />
                <p className="font-grotesk text-sm text-[#5f5e5e] uppercase tracking-widest">Searching products...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-32 text-center">
                <p className="font-unica text-5xl uppercase tracking-tighter text-[#5f5e5e] mb-6">NO PRODUCTS FOUND</p>
                <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5">
                  BROWSE ALL
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
                {filtered.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
