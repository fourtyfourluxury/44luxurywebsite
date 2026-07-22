import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ZoomIn, ChevronDown } from 'lucide-react';
import { useSiteStore } from '../store/useSiteStore';
import { toast } from '../components/ui/ToastProvider';
import ProductCard from '../components/product/ProductCard';
import ImageLightbox from '../components/ui/ImageLightbox';
import { resolveSwatchColor, needsSwatchBorder } from '../utils/colors';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, addRecentlyViewed, loading, initialized } = useSiteStore();

  const product = products.find(p => p.id === id);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sizeAccordionOpen, setSizeAccordionOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] || '');
      addRecentlyViewed(product.id);
    }
  }, [product?.id]);

  // Show loading spinner while store is initializing
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f3]">
        <div className="w-10 h-10 border-2 border-[#1c1c18] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-grotesk text-xs uppercase tracking-widest text-[#5f5e5e]">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f3] px-6 text-center">
        <h1 className="font-unica text-7xl uppercase tracking-tighter text-[#1c1c18] mb-6">PRODUCT NOT FOUND</h1>
        <Link to="/shop" className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] pb-0.5">
          BROWSE ALL
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      setSizeAccordionOpen(true);
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    toast(`${product.name} added to bag`, 'cart');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      setSizeAccordionOpen(true);
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  // Recommended products: prioritize same product category (e.g. other
  // T-Shirts), then same collection, then fill any remaining slots with
  // other active products so something always shows even in a small catalog.
  const relatedPool = products.filter(p => p.id !== product.id && p.status !== 'DRAFT');
  const sameSubcategory = relatedPool.filter(p => product.subcategory && p.subcategory === product.subcategory);
  const sameCollection = relatedPool.filter(p =>
    product.collection_id && p.collection_id === product.collection_id &&
    !sameSubcategory.some(m => m.id === p.id)
  );
  const matchedIds = new Set([...sameSubcategory, ...sameCollection].map(p => p.id));
  const others = relatedPool.filter(p => !matchedIds.has(p.id));
  const related = [...sameSubcategory, ...sameCollection, ...others].slice(0, 4);

  const collectionName = (typeof product.collection === 'string' ? product.collection : product.collection?.name || '')?.replace(/-/g, ' ')?.toUpperCase();

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-6 pt-6 pb-0">
        <nav className="flex items-center gap-2 font-grotesk text-[10px] uppercase tracking-widest text-[#5f5e5e]">
          <Link to="/" className="hover:text-[#1c1c18] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1c1c18] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#1c1c18]">{product.name}</span>
        </nav>
      </div>

      {/* Main PDP */}
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* ── Image Gallery ─────────────────────────── */}
          <div className="lg:w-[55%] flex flex-col gap-4">
            {/* Main image */}
            <div
              className="relative aspect-[4/5] bg-[#f1eee7] overflow-hidden group cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={product.images?.[selectedImage] || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <button className="absolute top-4 right-4 w-9 h-9 bg-[#fcf9f3]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={15} className="text-[#1c1c18]" />
              </button>
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold text-[10px] uppercase tracking-widest px-2.5 py-1">
                  NEW IN
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-24 shrink-0 overflow-hidden bg-[#f1eee7] transition-all ${selectedImage === i ? 'ring-1 ring-[#1c1c18]' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────── */}
          <div className="lg:w-[45%] flex flex-col pt-2">
            {/* Meta */}
            {collectionName && (
              <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.2em] text-[#5f5e5e] mb-2">
                {collectionName}
              </p>
            )}
            <h1 className="font-unica text-4xl md:text-5xl uppercase tracking-tighter text-[#1c1c18] leading-tight mb-4">
              {product.name}
            </h1>
            <p className="font-unica text-3xl tracking-tighter text-[#1c1c18] mb-2">
              ₦{product.price?.toLocaleString()}
            </p>
            {product.comparePrice && (
              <p className="font-plex text-sm text-[#5f5e5e] line-through mb-2">
                ₦{product.comparePrice?.toLocaleString()}
              </p>
            )}
            <p className="font-plex text-xs text-[#5f5e5e] mb-6">{product.shortDescription}</p>

            {/* Color picker — swatches only, no name label, so the admin's
                actual color choice always renders instead of drifting from
                a stale name-to-hex map. */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] mb-3">Colour</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      aria-label={color}
                      className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-[#1c1c18]' : 'hover:ring-1 hover:ring-[#1c1c18]/40 ring-offset-1'} ${needsSwatchBorder(color) ? 'border border-[#ddd]' : ''}`}
                      style={{ backgroundColor: resolveSwatchColor(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size picker — accordion so longer measured ranges (e.g. Skirts'
                waist sizes) don't dump dozens of buttons onto the page. */}
            {product.sizes?.length > 0 && (() => {
              const sizeNoun = product.subcategory === 'Footwear' ? 'Shoe Size' : product.subcategory === 'Skirts' ? 'Waist Size' : 'Size';
              return (
              <div className="mb-6 border border-[#1c1c18]/15">
                <button
                  type="button"
                  onClick={() => setSizeAccordionOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <p className={`font-grotesk font-bold text-[10px] uppercase tracking-widest ${sizeError ? 'text-red-600' : 'text-[#1c1c18]'}`}>
                    {sizeError
                      ? `PLEASE SELECT A ${sizeNoun.toUpperCase()}`
                      : `Select ${sizeNoun}`}
                    {selectedSize && <span className="font-normal normal-case text-[#5f5e5e]"> — {selectedSize}</span>}
                  </p>
                  <ChevronDown size={15} className={`text-[#1c1c18] transition-transform ${sizeAccordionOpen ? 'rotate-180' : ''}`} />
                </button>
                {sizeAccordionOpen && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 px-4 pb-4">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        className={`h-11 font-grotesk font-semibold text-xs uppercase tracking-wide transition-all border
                          ${selectedSize === size
                            ? 'border-[#1c1c18] bg-[#1c1c18] text-[#fcf9f3]'
                            : sizeError
                            ? 'border-red-300 text-[#1c1c18] hover:border-[#1c1c18]'
                            : 'border-[#1c1c18]/20 text-[#1c1c18] hover:border-[#1c1c18]'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              );
            })()}

            {/* Quantity */}
            <div className="mb-6">
              <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] mb-3">
                Quantity
              </p>
              <div className="flex items-center border border-[#1c1c18]/20 w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-colors text-lg"
                >
                  −
                </button>
                <span className="font-grotesk font-bold text-sm text-[#1c1c18] min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* ADD TO BAG + BUY IT NOW */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.status === 'SOLD OUT'}
                className={`w-full h-[52px] font-grotesk font-bold uppercase tracking-widest text-sm transition-all duration-300
                  ${product.status === 'SOLD OUT'
                    ? 'bg-[#5f5e5e]/30 text-[#5f5e5e] cursor-not-allowed'
                    : added
                    ? 'bg-green-800 text-[#fcf9f3]'
                    : 'bg-[#1c1c18] text-[#fcf9f3] hover:bg-[#2a2a26]'
                  }`}
              >
                {product.status === 'SOLD OUT' ? 'SOLD OUT' : added ? '✓ ADDED TO BAG' : 'ADD TO BAG'}
              </button>
              {product.status !== 'SOLD OUT' && (
                <button
                  onClick={handleBuyNow}
                  className="w-full h-[52px] font-grotesk font-bold uppercase tracking-widest text-sm bg-[#D4AF37] text-[#1c1c18] hover:bg-[#c9a02d] transition-all duration-300"
                >
                  BUY IT NOW
                </button>
              )}
            </div>

            {/* Product Description Only */}
            {product.description && (
              <div className="border-t border-[#1c1c18]/10 pt-6">
                <h3 className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] mb-3">Product Details</h3>
                <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {related.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 py-16 border-t border-[#1c1c18]/10">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-unica text-4xl md:text-5xl uppercase tracking-tighter text-[#1c1c18]">
              YOU MAY ALSO LIKE
            </h2>
            <Link to="/shop" className="hidden md:block font-grotesk font-bold text-xs uppercase tracking-widest text-[#5f5e5e] hover:text-[#1c1c18] transition-colors border-b border-[#5f5e5e]/40 hover:border-[#1c1c18] pb-0.5">
              VIEW ALL
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxOpen && product.images?.length > 0 && (
        <ImageLightbox
          images={product.images}
          currentIndex={selectedImage}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setSelectedImage(i => (i - 1 + product.images.length) % product.images.length)}
          onNext={() => setSelectedImage(i => (i + 1) % product.images.length)}
        />
      )}
    </div>
  );
}
