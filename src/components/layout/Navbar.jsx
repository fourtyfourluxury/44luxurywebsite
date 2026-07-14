import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';
import { useAuthStore } from '../../store/authStore';

export default function Navbar({ isTransparent = false }) {
  const navigate = useNavigate();
  const { collections, getCartCount, openCart } = useSiteStore();
  const { isAuthenticated, profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';
  const cartCount = getCartCount();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const searchRef = useRef(null);

  const namedCollections = collections.filter(c =>
    c.status === 'ACTIVE' && !['men', 'women'].includes(c.slug)
  );

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Escape key closes overlays
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        if (drawerOpen) {
          setIsDrawerClosing(true);
          setTimeout(() => {
            setDrawerOpen(false);
            setIsDrawerClosing(false);
            setExpandedSection(null);
          }, 350);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = (drawerOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen, searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const closeDrawer = () => {
    setIsDrawerClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setIsDrawerClosing(false);
      setExpandedSection(null);
    }, 350);
  };

  const DRAWER_LINKS = [
    { label: 'HOME', href: '/' },
    {
      label: 'SHOP', children: [
        { label: 'Men', href: '/shop/men' },
        { label: 'Women', href: '/shop/women' },
        { label: 'Collections', href: '/collections' },
        { label: 'Accessories', href: collections.some(c => c.slug === 'accessories' && c.status === 'ACTIVE') ? '/collections/accessories' : '/shop?q=accessories' },
        { label: 'New Arrivals', href: collections.some(c => c.slug === 'new-arrivals' && c.status === 'ACTIVE') ? '/collections/new-arrivals' : '/shop?filter=new' },
        { label: 'Sale', href: '/shop?filter=sale' },
      ]
    },
    {
      label: 'MEN', children: [
        { label: 'T-Shirts', slug: 't-shirts', fallback: '/shop/men?q=t-shirt' },
        { label: 'Polos', slug: 'polos', fallback: '/shop/men?q=polo' },
        { label: 'Hoodies', slug: 'hoodies-sweatshirts', fallback: '/shop/men?q=hoodie' },
        { label: 'Tracksuits', slug: 'tracksuits', fallback: '/shop/men?q=tracksuit' },
        { label: 'Denim', slug: 'denim', fallback: '/shop/men?q=denim' },
        { label: 'Shorts', slug: 'shorts', fallback: '/shop/men?q=shorts' },
        { label: 'Caps', slug: 'caps', fallback: '/shop/men?q=caps' },
        { label: 'Socks', slug: 'socks', fallback: '/shop/men?q=socks' },
      ].map(def => {
        const found = collections.find(c => c.slug === def.slug && c.status === 'ACTIVE');
        return {
          label: found ? found.name : def.label,
          href: found ? `/collections/${def.slug}` : def.fallback
        };
      })
    },
    {
      label: 'WOMEN', children: [
        { label: 'Crop Tops', slug: 'crop-tops', fallback: '/shop/women?q=crop-top' },
        { label: 'T-Shirts', slug: 't-shirts', fallback: '/shop/women?q=t-shirt' },
        { label: 'Tank Tops', slug: 'tank-tops', fallback: '/shop/women?q=tank-top' },
        { label: 'Tracksuits', slug: 'tracksuits', fallback: '/shop/women?q=tracksuit' },
        { label: 'Denim', slug: 'denim', fallback: '/shop/women?q=denim' },
        { label: 'Shorts', slug: 'shorts', fallback: '/shop/women?q=shorts' },
        { label: 'Caps', slug: 'caps', fallback: '/shop/women?q=caps' },
      ].map(def => {
        const found = collections.find(c => c.slug === def.slug && c.status === 'ACTIVE');
        return {
          label: found ? found.name : def.label,
          href: found ? `/collections/${def.slug}` : def.fallback
        };
      })
    },
    {
      label: 'COLLECTIONS', children: [
        { label: 'Summer Collection', slug: 'summer-collection' },
        { label: 'Essentials', slug: 'essentials' },
        { label: 'Signature Collection', slug: 'signature-collection' },
        { label: 'Limited Edition', slug: 'limited-edition' },
        { label: 'Seasonal Drops', slug: 'seasonal-drops' },
        { label: 'New Arrivals', slug: 'new-arrivals' }
      ].map(def => {
        const found = collections.find(c => c.slug === def.slug && c.status === 'ACTIVE');
        return {
          label: found ? found.name : def.label,
          href: `/collections/${def.slug}`
        };
      })
    },
    { label: 'ABOUT', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'SHIPPING', href: '/shipping' },
    { label: 'CONTACT', href: '/contact' },
  ];

  return (
    <>
      {/* ── Main Navbar ─────────────────────────────── */}
      <nav className={`w-full text-[#fcf9f3] transition-colors duration-300 ${
        isTransparent
          ? 'bg-transparent border-b-0'
          : 'bg-[#1c1c18] border-b border-[#fcf9f3]/5'
      }`}>
        <div className="max-w-[1440px] mx-auto px-5 h-[70px] flex items-center justify-between">

          {/* Left: Hamburger (always visible) */}
          <button
            id="nav-menu-btn"
            aria-label="Open menu"
            className="w-10 h-10 flex items-center justify-center text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Center: Logo */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
            aria-label="44 LUXURY Home"
          >
            <img
              src="/logo-white-main.png"
              alt="44 LUXURY"
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search */}
            <button
              id="nav-search-btn"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Account */}
            <Link
              to={isAuthenticated ? '/account' : '/auth'}
              aria-label="Account"
              className="text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors"
            >
              <User size={20} />
            </Link>

            {/* Admin CMS shortcut */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:block text-[#D4AF37] font-grotesk text-[10px] font-bold uppercase tracking-widest hover:text-[#fcf9f3] transition-colors"
              >
                CMS
              </Link>
            )}

            {/* Cart */}
            <button
              id="nav-cart-btn"
              aria-label="Open cart"
              onClick={openCart}
              className="relative text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#4b0e1e] text-[#fcf9f3] text-[9px] font-grotesk font-bold w-4 h-4 flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Left-Side Drawer ────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Drawer Panel */}
          <div className={`w-full max-w-[340px] bg-[#4b0e1e] h-full flex flex-col overflow-y-auto shadow-2xl ${isDrawerClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}>
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-6 border-b border-[#fcf9f3]/8">
              <Link to="/" onClick={closeDrawer} className="flex items-center hover:opacity-80 transition-opacity">
                <img src="/logo-white-main.png" alt="44 LUXURY" className="h-7 w-auto object-contain" />
              </Link>
              <button onClick={closeDrawer} className="text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors p-1">
                <X size={22} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 py-6 overflow-y-auto">
              {DRAWER_LINKS.map(link => (
                <div key={link.label}>
                  {link.children ? (
                    <>
                      <button
                        onClick={() => setExpandedSection(expandedSection === link.label ? null : link.label)}
                        className="w-full flex items-center justify-between px-6 py-4 font-unica text-2xl uppercase tracking-tight text-[#fcf9f3] hover:text-[#D4AF37] transition-colors border-b border-[#fcf9f3]/5"
                      >
                        {link.label}
                        <ChevronDown
                          size={18}
                          className={`text-[#5f5e5e] transition-transform duration-300 ${expandedSection === link.label ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {expandedSection === link.label && (
                        <div className="bg-[#2c000b] py-2">
                          {link.children.map(child => (
                            <Link
                              key={child.href}
                              to={child.href}
                              onClick={closeDrawer}
                              className="block px-10 py-3 font-grotesk text-sm uppercase tracking-[0.12em] text-[#a8a8a0] hover:text-[#fcf9f3] hover:pl-12 transition-all duration-200 border-b border-[#fcf9f3]/3"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={closeDrawer}
                      className="block px-6 py-4 font-unica text-2xl uppercase tracking-tight text-[#fcf9f3] hover:text-[#D4AF37] transition-colors border-b border-[#fcf9f3]/5"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className="border-t border-[#fcf9f3]/8 py-5 px-6 flex flex-col gap-1">
              <Link
                to={isAuthenticated ? '/account' : '/auth'}
                onClick={closeDrawer}
                className="py-3 font-grotesk text-xs uppercase tracking-widest text-[#5f5e5e] hover:text-[#fcf9f3] transition-colors"
              >
                {isAuthenticated ? 'My Account' : 'Sign In / Register'}
              </Link>
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="py-3 font-grotesk text-xs uppercase tracking-widest text-[#5f5e5e] hover:text-[#fcf9f3] transition-colors"
              >
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={closeDrawer}
                  className="py-3 font-grotesk text-xs uppercase tracking-widest text-[#D4AF37]">
                  CMS Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Backdrop */}
          <div
            className={`flex-1 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isDrawerClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={closeDrawer}
          />
        </div>
      )}

      {/* ── Full-screen Search Overlay ───────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#1c1c18]/96 backdrop-blur-sm flex flex-col animate-slide-down">
          <div className="flex items-center justify-between px-6 md:px-12 pt-6 pb-4 border-b border-[#fcf9f3]/10">
            <span className="font-unica text-2xl tracking-tighter text-[#fcf9f3] uppercase">Search</span>
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-2xl">
              <div className="flex items-center border-b-2 border-[#fcf9f3]/30 focus-within:border-[#fcf9f3] transition-colors pb-3">
                <Search size={22} className="text-[#5f5e5e] mr-4 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, collections..."
                  className="flex-1 bg-transparent font-unica text-4xl md:text-5xl text-[#fcf9f3] tracking-tighter uppercase outline-none placeholder:text-[#3a3a36] caret-[#D4AF37]"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-[#5f5e5e] hover:text-[#fcf9f3] ml-3">
                    <X size={18} />
                  </button>
                )}
              </div>
              <p className="font-plex text-xs text-[#5f5e5e] mt-4 tracking-wide">Press Enter to search · Esc to close</p>
            </div>

            {/* Quick links */}
            <div className="mt-16 flex flex-wrap gap-3 justify-center">
              {['New Arrivals', 'Men', 'Women', 'Jackets', 'Accessories', 'Sale'].map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    navigate(`/shop?q=${encodeURIComponent(term)}`);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="px-5 py-2 border border-[#fcf9f3]/15 font-grotesk text-xs uppercase tracking-widest text-[#a8a8a0] hover:text-[#fcf9f3] hover:border-[#fcf9f3]/40 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
