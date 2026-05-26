import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';
import { useAuthStore } from '../../store/authStore';

const NAV_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'SHOP', href: '/shop', dropdownKey: 'shop' },
  { label: 'COLLECTIONS', href: '/collections', dropdownKey: 'collections' },
  { label: 'ABOUT', href: '/about' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { collections, getCartCount, openCart } = useSiteStore();
  const { isAuthenticated, profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';
  const cartCount = getCartCount();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const searchRef = useRef(null);
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const getBranches = useCallback(() => {
    return [];
  }, [collections]);

  const shopSubLinks = [
    { label: 'All Products', href: '/shop' },
    { label: 'Men', href: '/shop/men' },
    { label: 'Women', href: '/shop/women' },
  ];

  const namedCollections = collections.filter(c =>
    c.status === 'ACTIVE' && !['men', 'women'].includes(c.slug)
  );

  const handleDropdownEnter = (key) => {
    clearTimeout(dropdownTimeout.current);
    setActiveDropdown(key);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 180);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* ── Main Navbar ─────────────────────────────── */}
      <nav className="sticky top-0 z-40 w-full bg-[#1c1c18] text-[#fcf9f3]">
        <div className="max-w-[1440px] mx-auto px-5 h-[68px] flex items-center justify-between gap-6">

          {/* Mobile: hamburger */}
          <button
            aria-label="Open menu"
            className="md:hidden text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="font-unica text-[1.75rem] md:text-[2rem] tracking-tighter uppercase text-[#fcf9f3] hover:text-[#D4AF37] transition-colors duration-300 shrink-0"
          >
            44 LUXURY
          </Link>

          {/* Desktop nav — centered */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              <div
                key={link.label}
                className="relative h-[68px] flex items-center"
                onMouseEnter={() => link.dropdownKey && handleDropdownEnter(link.dropdownKey)}
                onMouseLeave={handleDropdownLeave}
              >
                <Link
                  to={link.href}
                  className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.13em] text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors whitespace-nowrap py-1 border-b border-transparent hover:border-[#fcf9f3]/20"
                >
                  {link.label}
                </Link>

                {/* Dropdown */}
                {link.dropdownKey && activeDropdown === link.dropdownKey && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 bg-[#fcf9f3] min-w-[200px] shadow-2xl z-50 py-5"
                    onMouseEnter={() => handleDropdownEnter(link.dropdownKey)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {link.dropdownKey === 'shop' && shopSubLinks.map(sub => (
                      <Link
                        key={sub.label}
                        to={sub.href}
                        className="block px-6 py-2.5 font-plex text-sm text-[#5f5e5e] hover:text-[#1c1c18] hover:pl-8 transition-all duration-200"
                      >
                        {sub.label}
                      </Link>
                    ))}
                    {link.dropdownKey === 'collections' && namedCollections.map(col => (
                      <Link
                        key={col.id}
                        to={`/collections/${col.slug}`}
                        className="block px-6 py-2.5 font-plex text-sm text-[#5f5e5e] hover:text-[#1c1c18] hover:pl-8 transition-all duration-200"
                      >
                        {col.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            {/* Search */}
            <button
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
              className="text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors hidden md:block"
            >
              <User size={20} />
            </Link>

            {/* CMS shortcut — admin only */}
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

      {/* ── Full-screen Search Overlay ───────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#1c1c18]/95 backdrop-blur-sm flex flex-col animate-slide-down">
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

      {/* ── Mobile Drawer ────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-full max-w-[320px] bg-[#1c1c18] h-full flex flex-col overflow-y-auto animate-slide-in">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-5 border-b border-[#2a2a26]">
              <Link to="/" onClick={() => setMobileOpen(false)} className="font-unica text-2xl text-[#fcf9f3] uppercase tracking-tighter">
                44 LUXURY
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-[#a8a8a0] hover:text-[#fcf9f3] transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-4 overflow-y-auto">
              {NAV_LINKS.map(link => (
                <div key={link.label}>
                  {link.dropdownKey ? (
                    <>
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === link.dropdownKey ? null : link.dropdownKey)}
                        className="w-full flex items-center justify-between px-5 py-4 font-grotesk text-sm font-semibold uppercase tracking-[0.12em] text-[#fcf9f3] border-b border-[#2a2a26] hover:text-[#D4AF37] transition-colors"
                      >
                        {link.label}
                        <span className={`text-[#5f5e5e] transition-transform duration-200 ${mobileExpanded === link.dropdownKey ? 'rotate-45' : ''}`}>+</span>
                      </button>
                      {mobileExpanded === link.dropdownKey && (
                        <div className="bg-[#141412]">
                          {link.dropdownKey === 'collections' ? (
                            <>
                              <Link to="/shop" onClick={() => setMobileOpen(false)}
                                className="block px-8 py-3 font-grotesk text-xs font-bold uppercase tracking-widest text-[#5f5e5e] hover:text-[#fcf9f3] border-b border-[#2a2a26]/50 transition-colors">
                                All Collections
                              </Link>
                              {namedCollections.map(col => (
                                <Link key={col.id} to={`/collections/${col.slug}`} onClick={() => setMobileOpen(false)}
                                  className="block px-8 py-3 font-plex text-sm text-[#5f5e5e] hover:text-[#fcf9f3] border-b border-[#2a2a26]/30 transition-colors">
                                  {col.name}
                                </Link>
                              ))}
                            </>
                          ) : (
                            <>
                              <Link to={`/shop/${link.dropdownKey}`} onClick={() => setMobileOpen(false)}
                                className="block px-8 py-3 font-grotesk text-xs font-bold uppercase tracking-widest text-[#5f5e5e] hover:text-[#fcf9f3] border-b border-[#2a2a26]/50 transition-colors">
                                All {link.label}
                              </Link>
                              {getBranches(link.dropdownKey).map(branch => (
                                <Link key={branch.id} to={`/shop/${link.dropdownKey}/${branch.slug}`} onClick={() => setMobileOpen(false)}
                                  className="block px-8 py-3 font-plex text-sm text-[#5f5e5e] hover:text-[#fcf9f3] border-b border-[#2a2a26]/30 transition-colors">
                                  {branch.name}
                                </Link>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link to={link.href} onClick={() => setMobileOpen(false)}
                      className="block px-5 py-4 font-grotesk text-sm font-semibold uppercase tracking-[0.12em] text-[#fcf9f3] border-b border-[#2a2a26] hover:text-[#D4AF37] transition-colors">
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile bottom links */}
            <div className="border-t border-[#2a2a26] py-4 px-5 flex flex-col gap-1">
              <Link to={isAuthenticated ? '/account' : '/auth'} onClick={() => setMobileOpen(false)}
                className="py-3 font-grotesk text-sm uppercase tracking-widest text-[#5f5e5e] hover:text-[#fcf9f3] transition-colors">
                {isAuthenticated ? 'My Account' : 'Sign In / Register'}
              </Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)}
                className="py-3 font-grotesk text-sm uppercase tracking-widest text-[#5f5e5e] hover:text-[#fcf9f3] transition-colors">
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}
                  className="py-3 font-grotesk text-sm uppercase tracking-widest text-[#D4AF37]">
                  CMS Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
