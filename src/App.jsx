import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useSiteStore } from './store/useSiteStore';
import { useAuthStore } from './store/authStore';

// ── Storefront Pages ─────────────────────────────────────────
import Home from './pages/Home';
import Shop from './pages/Shop';
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
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';

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

function App() {
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

  return (
    <ErrorBoundary>
      <Router>
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
              <Route path="/collections/:slug" element={<Collections />} />

              {/* Products */}
              <Route path="/product/:id" element={<ProductDetail />} />

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
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

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
