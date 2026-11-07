import React from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = ({ children }) => {
  const isDevBypass = useAuthStore((state) => state.isDevBypass);
  const signOut = useAuthStore((state) => state.signOut);

  const handleExitBypass = async () => {
    localStorage.removeItem('dev_admin');
    localStorage.removeItem('login_intent');
    await signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-screen bg-[#0f0f0c] overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {import.meta.env.DEV && isDevBypass && (
          <div
            role="alert"
            className="bg-amber-500/15 border-b border-amber-500/40 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0"
          >
            <p className="text-[12px] font-semibold text-amber-300">
              Dev bypass active: no real session. Database writes will be blocked.
            </p>
            <button
              type="button"
              onClick={handleExitBypass}
              className="px-3 py-1 rounded-lg bg-amber-400 text-[#0a0a08] text-[11px] font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors shrink-0"
            >
              Sign in with real account
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto bg-[#0f0f0c]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
