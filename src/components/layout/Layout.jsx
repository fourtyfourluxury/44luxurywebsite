import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AnnouncementBar from './AnnouncementBar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ToastProvider from '../ui/ToastProvider';
import BackToTop from '../ui/BackToTop';
import ProgressBar from '../ui/ProgressBar';

export default function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';
  
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(false);
      return;
    }
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    // Check scroll position immediately
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  if (isAdmin) {
    return <>{children}</>;
  }

  const headerClass = 'sticky top-0 z-[2000] w-full bg-[#1c1c18] border-b border-[#fcf9f3]/5';

  return (
    <div className="flex flex-col min-h-screen">
      {/* SVG filter to make white background of logo JPGs transparent */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="remove-white">
            <feColorMatrix type="matrix" values="
              1   0   0   0   0
              0   1   0   0   0
              0   0   1   0   0
              -1  -1  -1  3   0
            " />
          </filter>
        </defs>
      </svg>
      <ProgressBar />
      
      <header className={headerClass}>
        <AnnouncementBar />
        <Navbar isTransparent={false} />
      </header>

      <CartDrawer />
      <ToastProvider />
      <BackToTop />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
