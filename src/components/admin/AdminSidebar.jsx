import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Home, Layers, Package, Image,
  ShoppingCart, MessageSquare, Settings, Shield,
  LogOut, ChevronRight, Store, Users, Video,
  HelpCircle, Mail, Truck, Globe
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Website',
    items: [
      { label: 'Homepage', path: '/admin/homepage', icon: Home },
      { label: 'Collections', path: '/admin/collections', icon: Layers },
    ],
  },
  {
    label: 'Shop',
    items: [
      { label: 'Products', path: '/admin/products', icon: Package },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
      { label: 'Customers', path: '/admin/customers', icon: Users },
      { label: 'Complaints', path: '/admin/complaints', icon: MessageSquare },
    ],
  },
  {
    label: 'Media',
    items: [
      { label: 'Media Library', path: '/admin/media', icon: Image },
      { label: 'Video Manager', path: '/admin/videos', icon: Video },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', path: '/admin/settings', icon: Settings },
      { label: 'Admin Access', path: '/admin/admin-credentials', icon: Shield },
    ],
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path || location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(item.path);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      localStorage.removeItem('login_intent');
      await signOut();
      window.location.href = '/admin/login';
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <aside className="w-[220px] bg-[#0a0a08] border-r border-white/[0.06] flex flex-col shrink-0 overflow-y-auto">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#c9a96e] flex items-center justify-center">
            <span className="font-bold text-[#0a0a08] text-[10px]">44</span>
          </div>
          <div>
            <p className="font-bold text-[11px] uppercase tracking-[0.2em] text-white/90">44Luxury</p>
            <p className="text-[9px] text-white/30 tracking-widest uppercase">CMS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-6 mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg text-[12px] font-medium transition-all duration-150 group
                    ${active
                      ? 'bg-[#c9a96e]/10 text-[#c9a96e]'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                    }`}
                >
                  <Icon
                    size={15}
                    className={`shrink-0 transition-colors ${active ? 'text-[#c9a96e]' : 'text-white/30 group-hover:text-white/60'}`}
                  />
                  <span className="tracking-wide">{item.label}</span>
                  {active && <ChevronRight size={12} className="ml-auto text-[#c9a96e]/50" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + Sign Out */}
      <div className="border-t border-white/[0.06] p-4">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all mb-1"
        >
          <Store size={14} />
          <span className="text-[11px] font-medium tracking-wide">View Storefront</span>
        </Link>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={14} />
          <span className="text-[11px] font-medium tracking-wide">
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </span>
        </button>

        <div className="mt-3 px-3">
          <p className="text-[9px] text-white/20 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  );
}
