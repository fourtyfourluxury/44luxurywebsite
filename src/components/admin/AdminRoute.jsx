import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, profile, loading } = useAuthStore();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  // Note: Auth initialization is handled globally in App.jsx
  // We just wait for the loading state to complete

  // Set timeout for loading state (20 seconds to match profile fetch timeout)
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('⚠️ AdminRoute: Auth check timeout after 20 seconds');
        setShowTimeout(true);
      }, 20000);

      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1c1c18] flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-[#fcf9f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="font-plex text-sm text-[#fcf9f3]/60">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show timeout error
  if (showTimeout) {
    return (
      <div className="min-h-screen bg-[#0f0f0c] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-900/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-unica text-2xl uppercase tracking-tighter text-[#fcf9f3] mb-3">
            Authentication Timeout
          </h1>
          <p className="font-plex text-sm text-[#fcf9f3]/60 mb-6">
            Unable to verify admin access. This might be due to:
          </p>
          <ul className="font-plex text-xs text-[#fcf9f3]/60 text-left mb-6 space-y-2">
            <li>• Database connection issues</li>
            <li>• Missing RLS policies</li>
            <li>• Profile not found in database</li>
          </ul>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowTimeout(false)}
              className="bg-[#fcf9f3] text-[#0f0f0c] font-grotesk font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-[#e5e2d8] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.href = '/admin/login'}
              className="border border-[#fcf9f3]/20 text-[#fcf9f3] font-grotesk font-bold uppercase text-xs tracking-widest px-6 py-3 hover:border-[#fcf9f3]/40 transition-colors"
            >
              Back to Login
            </button>
          </div>
          <p className="font-plex text-xs text-[#fcf9f3]/40 mt-6">
            Check browser console (F12) for detailed errors
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  console.log('🔐 AdminRoute: Auth check complete', { isAuthenticated, isAdmin, profile: profile?.email });

  if (!isAuthenticated || !isAdmin) {
    console.warn('⚠️ AdminRoute: Access denied, redirecting to login');
    return <Navigate to="/admin/login" state={{ redirect: location.pathname }} replace />;
  }

  return children;
};

export default AdminRoute;
