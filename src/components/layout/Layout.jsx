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

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ProgressBar />
      <AnnouncementBar />
      <Navbar />
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
