import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ZoomIn, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [carouselPaused, setCarouselPaused] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] || '');
      setSelectedImage(0);
      addRecentlyViewed(product.id);
    }
  }, [product?.id]);

  // Auto-advancing slideshow through the product's images. Reschedules
  // itself off `selectedImage`, so a manual thumbnail click naturally resets
  // the timer instead of jumping again right away. Pauses on hover so a
  // shopper can actually look at the photo they landed on.
  useEffect(() => {
    const images = product?.images || [];
    if (images.length <= 1 || carouselPaused) return;
    const timer = setTimeout(() => {
      setSelectedImage(i => (i + 1) % images.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [selectedImage, product?.id, product?.images?.length, carouselPaused]);

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
        <div className="flex flex-col lg:flex-row gap-12">
          {/* ── Image Gallery ─────────────────────────── */}
          <div className="lg:w-[48%] flex flex-col gap-3">
            {/* Main image — auto-advancing slideshow when the product has
                more than one photo; pauses on hover, resumes on mouse-leave. */}
            <div
              className="relative aspect-[4/5] bg-[#f1eee7] overflow-hidden group cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
            >
              {(product.images || []).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-[1.03] ${i === selectedImage ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              <button className="absolute top-4 right-4 w-9 h-9 bg-[#fcf9f3]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <ZoomIn size={15} className="text-[#1c1c18]" />
              </button>
              {product.isNew && (
                <div className="absolute top-4 left-4 bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 z-10">
                  NEW IN
                </div>
              )}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(i => (i - 1 + product.images.length) % product.images.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#1c1c18]/60 hover:text-[#1c1c18] transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={22} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(i => (i + 1) % product.images.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#1c1c18]/60 hover:text-[#1c1c18] transition-colors z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={22} strokeWidth={1.5} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {product.images.map((_, i) => (
                      <span key={i} className={`h-1.5 rounded-full transition-all ${i === selectedImage ? 'w-5 bg-[#fcf9f3]' : 'w-1.5 bg-[#fcf9f3]/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedImage(i); setCarouselPaused(false); }}
                    className={`w-16 h-20 shrink-0 overflow-hidden bg-[#f1eee7] transition-all ${selectedImage === i ? 'ring-1 ring-[#1c1c18]' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────── */}
          <div className="lg:w-[52%] flex flex-col pt-2">
            {/* Meta */}
            {collectionName && (
              <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.2em] text-[#5f5e5e] mb-2">
                {collectionName}
              </p>
            )}
            <h1 className="font-unica text-3xl md:text-4xl uppercase tracking-tighter text-[#1c1c18] leading-tight mb-3">
              {product.name}
            </h1>
            <p className="font-unica text-2xl tracking-tighter text-[#1c1c18] mb-1.5">
              ₦{product.price?.toLocaleString()}
            </p>
            {product.comparePrice && (
              <p className="font-plex text-sm text-[#5f5e5e] line-through mb-1.5">
                ₦{product.comparePrice?.toLocaleString()}
              </p>
            )}
            <p className="font-plex text-xs text-[#5f5e5e] mb-5">{product.shortDescription}</p>

            {/* Color picker — swatches only, no name label, so the admin's
                actual color choice always renders instead of drifting from
                a stale name-to-hex map. */}
            {product.colors?.length > 0 && (
              <div className="mb-5">
                <p className="font-grotesk font-semibold text-xs text-[#1c1c18] mb-2.5">Colour</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      aria-label={color}
                      className={`w-7 h-7 rounded-full transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-[#1c1c18]' : 'hover:ring-1 hover:ring-[#1c1c18]/40 ring-offset-1'} ${needsSwatchBorder(color) ? 'border border-[#ddd]' : ''}`}
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
              <div className="mb-5 border border-[#1c1c18]/15">
                <button
                  type="button"
                  onClick={() => setSizeAccordionOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <p className={`font-grotesk font-semibold text-xs ${sizeError ? 'text-red-600' : 'text-[#1c1c18]'}`}>
                    {sizeError
                      ? `Please select a ${sizeNoun.toLowerCase()}`
                      : `Select ${sizeNoun}`}
                    {selectedSize && <span className="font-normal text-[#5f5e5e]"> — {selectedSize}</span>}
                  </p>
                  <ChevronDown size={14} className={`text-[#1c1c18] transition-transform ${sizeAccordionOpen ? 'rotate-180' : ''}`} />
                </button>
                {sizeAccordionOpen && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 px-4 pb-3.5">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        className={`h-10 font-grotesk font-medium text-xs transition-all border
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
            <div className="mb-5">
              <p className="font-grotesk font-semibold text-xs text-[#1c1c18] mb-2.5">
                Quantity
              </p>
              <div className="flex items-center border border-[#1c1c18]/20 w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-colors text-base"
                >
                  −
                </button>
                <span className="font-grotesk font-bold text-sm text-[#1c1c18] min-w-[36px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#1c1c18] hover:bg-[#1c1c18]/5 transition-colors text-base"
                >
                  +
                </button>
              </div>
            </div>

            {/* ADD TO BAG + BUY IT NOW */}
            <div className="flex flex-col gap-2.5 mb-5">
              <button
                onClick={handleAddToCart}
                disabled={product.status === 'SOLD OUT'}
                className={`w-full h-[48px] font-grotesk font-bold uppercase tracking-widest text-sm transition-all duration-300
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
                  className="w-full h-[48px] font-grotesk font-bold uppercase tracking-widest text-sm bg-[#D4AF37] text-[#1c1c18] hover:bg-[#c9a02d] transition-all duration-300"
                >
                  BUY IT NOW
                </button>
              )}
            </div>

            {/* Product Description Only */}
            {product.description && (
              <div className="border-t border-[#1c1c18]/10 pt-6">
                <h3 className="font-grotesk font-semibold text-xs text-[#1c1c18] mb-3">Product Details</h3>
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
