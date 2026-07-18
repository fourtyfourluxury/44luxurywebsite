import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import { useSiteStore } from './store/useSiteStore';
import { useAuthStore } from './store/authStore';

// ── Storefront Pages ─────────────────────────────────────────
import Home from './pages/Home';
import Shop from './pages/Shop';
import AllCollections from './pages/AllCollections';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmed from './pages/OrderConfirmed';
import Auth from './pages/Auth';
import Account from './pages/Account';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ReturnPolicy from './pages/ReturnPolicy';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';
import CategoryPage from './pages/CategoryPage';

// ── Admin Pages ───────────────────────────────────────────────
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import HomepageManager from './pages/admin/HomepageManager';
import CollectionsManager from './pages/admin/CollectionsManager';
import ProductsManager from './pages/admin/ProductsManager';
import MediaLibrary from './pages/admin/MediaLibrary';
import VideoManager from './pages/admin/VideoManager';
import OrdersManager from './pages/admin/OrdersManager';
import AdminComplaints from './pages/admin/AdminComplaints';
import CustomersManager from './pages/admin/CustomersManager';
import SettingsManager from './pages/admin/SettingsManager';
import AdminCredentialsManager from './pages/admin/AdminCredentialsManager';
import PagesManager from './pages/admin/PagesManager';
import PartnershipsManager from './pages/admin/PartnershipsManager';

function App() {
  const siteLoading = useSiteStore(state => state.loading);
  const authLoading = useAuthStore(state => state.loading);
  const initialized = useSiteStore(state => state.initialized);
  const siteError = useSiteStore(state => state.error);

  // Initialize store on app mount
  useEffect(() => {
    console.log('App mounted - initializing stores...');
    
    // Initialize site store (products, collections, homepage)
    useSiteStore.getState().initializeStore();
    
    // Initialize auth store (check for existing session)
    useAuthStore.getState().initialize();
    
    // Subscribe to auth state changes
    const unsubscribeAuth = useAuthStore.getState().subscribeToAuthChanges();
    
    // Subscribe to homepage realtime updates
    const unsubscribeHomepage = useSiteStore.getState().subscribeToHomepageUpdates();
    
    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth.unsubscribe();
      }
      if (unsubscribeHomepage) {
        unsubscribeHomepage();
      }
    };
  }, []);

  const isLoading = (siteLoading || authLoading || !initialized) && !siteError;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#1c1c18] flex flex-col items-center justify-center z-50">
        <style>{`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
        <div className="text-center select-none">
          <img 
            src="/logo-white-main.png" 
            alt="44 LUXURY" 
            className="w-24 h-24 md:w-32 md:h-32 object-contain mx-auto mb-6 animate-pulse"
          />
          <div className="w-16 h-[1px] bg-[#fcf9f3]/10 mx-auto overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full w-1/2 bg-[#fcf9f3]"
              style={{
                animation: 'loading-bar 1.5s infinite linear'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* ── Admin Login — unprotected ───── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ── Protected Admin Routes ──────── */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminLayout>
                <Routes>
                  <Route path="" element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="homepage" element={<HomepageManager />} />
                  <Route path="collections" element={<CollectionsManager />} />
                  <Route path="products" element={<ProductsManager />} />
                  <Route path="products/new" element={<ProductsManager />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="videos" element={<VideoManager />} />
                  <Route path="orders" element={<OrdersManager />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="customers" element={<CustomersManager />} />
                  <Route path="settings" element={<SettingsManager />} />
                  <Route path="pages" element={<PagesManager />} />
                  <Route path="partnerships" element={<PartnershipsManager />} />
                  <Route path="admin-credentials" element={<AdminCredentialsManager />} />
                  <Route path="*" element={<AdminDashboard />} />
                </Routes>
              </AdminLayout>
            </AdminRoute>
          } />

          {/* ── Storefront Routes ────────────── */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                {/* Core */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:collectionSlug" element={<Shop />} />
                <Route path="/shop/:collectionSlug/:branchSlug" element={<Shop />} />

                {/* Collections */}
                <Route path="/collections" element={<AllCollections />} />
                <Route path="/collections/:slug" element={<Collections />} />

              {/* Products */}
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* Category pages */}
              <Route path="/category/sweatshirts" element={<CategoryPage category="sweatshirts" />} />
              <Route path="/category/caps" element={<CategoryPage category="caps" />} />
              <Route path="/category/polo-shirts" element={<CategoryPage category="polo-shirts" />} />
              <Route path="/category/tank-tops" element={<CategoryPage category="tank-tops" />} />
              <Route path="/category/skirts" element={<CategoryPage category="skirts" />} />
              <Route path="/category/crop-tops" element={<CategoryPage category="crop-tops" />} />
              <Route path="/category/socks" element={<CategoryPage category="socks" />} />
              <Route path="/category/denim" element={<CategoryPage category="denim" />} />

              {/* Commerce */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmed" element={<OrderConfirmed />} />

              {/* Auth & Account */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/account" element={<Account />} />

              {/* Brand Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
