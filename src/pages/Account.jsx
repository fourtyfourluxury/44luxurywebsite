import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSiteStore } from '../store/useSiteStore';
import { toast } from '../components/ui/ToastProvider';
import * as accountService from '../services/accountService';
import * as complaintService from '../services/complaintService';
import { subscribeToUserOrders, subscribeToUserComplaints, unsubscribeAll } from '../services/realtimeService';
import {
  User, MapPin, Bell, ShoppingBag, Heart, Shield,
  HeadphonesIcon, LogOut, ChevronRight, ChevronDown,
  Plus, X, Check, Eye, EyeOff, MessageSquare, Mail
} from 'lucide-react';

// ── Status config ─────────────────────────────────────────────
const ORDER_STATUS = {
  ORDERED:    'bg-[#5f5e5e] text-white',
  DISPATCHED: 'bg-[#4b0e1e] text-white',
  DELIVERED:  'bg-[#1a4a2e] text-white',
};
const COMPLAINT_STATUS = {
  OPEN:       'bg-[#D4AF37] text-[#1c1c18]',
  'IN REVIEW':'bg-[#4b0e1e] text-white',
  RESOLVED:   'bg-[#1a4a2e] text-white',
};

// ── Sidebar nav ───────────────────────────────────────────────
const NAV = [
  {
    group: 'MY ACCOUNT',
    items: [
      { id: 'details',      label: 'Account Details',     icon: User },
      { id: 'addresses',    label: 'Addresses',            icon: MapPin },
      { id: 'preferences',  label: 'Contact Preferences', icon: Bell },
    ],
  },
  {
    group: 'ORDER INFORMATION',
    items: [
      { id: 'orders', label: 'Order History', icon: ShoppingBag },
    ],
  },
  {
    group: 'SUPPORT',
    items: [
      { id: 'complaints', label: 'My Complaints', icon: MessageSquare },
    ],
  },
  {
    group: 'WISHLIST',
    items: [
      { id: 'wishlist', label: 'My Wishlist', icon: Heart },
    ],
  },
];

// ── Small helpers ─────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e]">{label}</label>
    {children}
    {hint && <p className="font-plex text-[11px] text-[#5f5e5e]/60">{hint}</p>}
  </div>
);
const Inp = ({ readOnly, ...props }) => (
  <input readOnly={readOnly} {...props}
    className={`font-plex text-sm px-4 py-3 border outline-none transition-colors w-full
      ${readOnly ? 'bg-[#f1eee7] border-[#1c1c18]/10 text-[#5f5e5e] cursor-not-allowed'
                 : 'bg-white border-[#1c1c18]/20 text-[#1c1c18] focus:border-[#1c1c18]'}`} />
);
const Avatar = ({ name }) => {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-[#1c1c18] text-[#fcf9f3] flex items-center justify-center font-unica text-sm uppercase tracking-widest shrink-0">
      {initials}
    </div>
  );
};
const StatusPill = ({ status, map }) => (
  <span className={`inline-block font-grotesk font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 ${(map || ORDER_STATUS)[status] || 'bg-gray-200 text-gray-700'}`}>
    {status}
  </span>
);

// ══════════════════════════════════════════════════════════════
// PANELS
// ══════════════════════════════════════════════════════════════

// ── 1. ACCOUNT DETAILS ────────────────────────────────────────
const AccountDetails = ({ user, orders, onNavigate }) => {
  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName:  user?.name?.split(' ').slice(1).join(' ') || '',
    email:     user?.email || '', phone: user?.phone || '',
  });
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault(); setSaved(true); toast('Account details saved', 'success');
    setTimeout(() => setSaved(false), 2000);
  };
  const handlePwSave = (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    if (pwForm.newPw.length < 8) { toast('Min. 8 characters', 'error'); return; }
    toast('Password updated', 'success'); setShowPwForm(false); setPwForm({ current: '', newPw: '', confirm: '' });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-unica text-5xl md:text-6xl uppercase tracking-tighter text-[#1c1c18] leading-none mb-2">
          HI {(form.firstName || 'THERE').toUpperCase()},
        </h1>
        <p className="font-plex text-sm text-[#5f5e5e]">Welcome back. Use these links to manage your account.</p>
      </div>

      {/* Quick cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-[#1c1c18]/10 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1c1c18] flex items-center justify-center shrink-0">
              <ShoppingBag size={15} className="text-[#fcf9f3]" />
            </div>
            <p className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18]">ORDER HISTORY</p>
          </div>
          <p className="font-plex text-sm text-[#5f5e5e] flex-1">
            {orders.length === 0 ? 'You have no orders yet.' : `You have ${orders.length} order${orders.length !== 1 ? 's' : ''}.`}
          </p>
          <button onClick={() => onNavigate('orders')}
            className="self-start font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] border-b border-[#1c1c18] hover:text-[#4b0e1e] hover:border-[#4b0e1e] transition-colors pb-0.5">
            VIEW ORDERS →
          </button>
        </div>
        <div className="border border-[#1c1c18]/10 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4b0e1e] flex items-center justify-center shrink-0">
              <MessageSquare size={15} className="text-white" />
            </div>
            <p className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18]">NEED HELP?</p>
          </div>
          <p className="font-plex text-sm text-[#5f5e5e] flex-1">Submit a complaint or contact our support team.</p>
          <button onClick={() => onNavigate('complaints')}
            className="self-start font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#4b0e1e] border-b border-[#4b0e1e] hover:text-[#1c1c18] hover:border-[#1c1c18] transition-colors pb-0.5">
            MY COMPLAINTS →
          </button>
        </div>
      </div>

      {/* Details form */}
      <div className="border-t border-[#1c1c18]/10 pt-8">
        <h2 className="font-unica text-3xl uppercase tracking-tighter text-[#1c1c18] mb-6">ACCOUNT DETAILS</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name"><Inp value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Adewale" /></Field>
            <Field label="Last Name"><Inp value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Okafor" /></Field>
          </div>
          <Field label="Email Address" hint="Contact support to change your email address.">
            <Inp value={form.email} readOnly />
          </Field>
          <Field label="Phone Number">
            <Inp type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234 800 000 0000" />
          </Field>

          {/* Password */}
          <div className="border-t border-[#1c1c18]/10 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18]">PASSWORD</p>
                <p className="font-plex text-xs text-[#5f5e5e] mt-0.5">Keep your account secure</p>
              </div>
              <button type="button" onClick={() => setShowPwForm(!showPwForm)}
                className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] border border-[#1c1c18]/20 px-4 py-2 hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-colors">
                {showPwForm ? 'CANCEL' : 'CHANGE'}
              </button>
            </div>
            {showPwForm && (
              <form onSubmit={handlePwSave} className="flex flex-col gap-4 bg-[#f6f3ed] p-5">
                {[{ key: 'current', label: 'Current Password' }, { key: 'newPw', label: 'New Password' }, { key: 'confirm', label: 'Confirm New Password' }].map(f => (
                  <Field key={f.key} label={f.label}>
                    <div className="relative">
                      <input type={showPw[f.key] ? 'text' : 'password'} value={pwForm[f.key]}
                        onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} required
                        className="w-full font-plex text-sm px-4 py-3 pr-12 border border-[#1c1c18]/20 bg-white text-[#1c1c18] outline-none focus:border-[#1c1c18] transition-colors" />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f5e5e] hover:text-[#1c1c18]">
                        {showPw[f.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </Field>
                ))}
                <button type="submit" className="self-start bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-[10px] px-6 py-3 hover:bg-[#4b0e1e] transition-colors">
                  UPDATE PASSWORD
                </button>
              </form>
            )}
          </div>

          <button type="submit"
            className={`self-start flex items-center gap-2 font-grotesk font-bold uppercase tracking-widest text-xs px-8 py-3.5 transition-colors
              ${saved ? 'bg-green-700 text-white' : 'bg-[#1c1c18] text-[#fcf9f3] hover:bg-[#4b0e1e]'}`}>
            {saved ? <><Check size={13} /> SAVED</> : 'SAVE CHANGES'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── 2. ADDRESSES ──────────────────────────────────────────────
const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const EMPTY = { label: '', name: '', line1: '', line2: '', city: '', state: '', country: 'Nigeria', phone: '', is_default: false };

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    const { addresses: data, error } = await accountService.getAddresses();
    if (error) {
      toast(error, 'error');
    } else {
      setAddresses(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await accountService.updateAddress(editing.id, editing);
        if (error) throw new Error(error);
      } else {
        const { error } = await accountService.addAddress(editing);
        if (error) throw new Error(error);
      }
      toast('Address saved', 'success');
      setEditing(null);
      loadAddresses();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id) => {
    const { error } = await accountService.setDefaultAddress(id);
    if (error) {
      toast(error, 'error');
    } else {
      loadAddresses();
    }
  };

  const del = async (id) => {
    const { error } = await accountService.deleteAddress(id);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Address removed', 'success');
      loadAddresses();
    }
  };

  const s = (k, v) => setEditing(prev => ({ ...prev, [k]: v }));

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">ADDRESSES</h1>
        <div className="flex items-center justify-center py-20">
          <p className="font-plex text-sm text-[#5f5e5e]">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">ADDRESSES</h1>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-[10px] px-5 py-3 hover:bg-[#4b0e1e] transition-colors">
          <Plus size={13} /> ADD ADDRESS
        </button>
      </div>
      {addresses.length === 0 ? (
        <div className="border border-dashed border-[#1c1c18]/20 py-16 text-center">
          <MapPin size={32} className="text-[#1c1c18]/20 mx-auto mb-3" />
          <p className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18]/30">No addresses saved</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`border p-5 relative ${addr.is_default ? 'border-[#1c1c18]' : 'border-[#1c1c18]/15'}`}>
              {addr.is_default && <span className="absolute top-3 right-3 font-grotesk font-bold text-[8px] uppercase tracking-widest bg-[#1c1c18] text-[#fcf9f3] px-2 py-0.5">DEFAULT</span>}
              {addr.label && <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-2">{addr.label}</p>}
              <p className="font-plex text-sm text-[#1c1c18] font-semibold">{addr.name}</p>
              <p className="font-plex text-sm text-[#5f5e5e]">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
              <p className="font-plex text-sm text-[#5f5e5e]">{addr.city}, {addr.state}</p>
              <p className="font-plex text-sm text-[#5f5e5e]">{addr.country}</p>
              <p className="font-plex text-sm text-[#5f5e5e] mt-1">{addr.phone}</p>
              <div className="flex gap-3 mt-4 pt-4 border-t border-[#1c1c18]/10">
                <button onClick={() => setEditing({ ...addr })} className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] hover:text-[#4b0e1e] transition-colors">EDIT</button>
                {!addr.is_default && <button onClick={() => setDefault(addr.id)} className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] hover:text-[#1c1c18] transition-colors">SET DEFAULT</button>}
                <button onClick={() => del(addr.id)} className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] hover:text-red-600 transition-colors ml-auto">REMOVE</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1c18]/60 backdrop-blur-sm px-4">
          <div className="bg-[#fcf9f3] border border-[#1c1c18]/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#1c1c18]/10 sticky top-0 bg-[#fcf9f3]">
              <h3 className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18]">{editing.id ? 'EDIT ADDRESS' : 'ADD ADDRESS'}</h3>
              <button onClick={() => setEditing(null)}><X size={18} className="text-[#5f5e5e]" /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <Field label="Label"><Inp value={editing.label} onChange={e => s('label', e.target.value)} placeholder="Home" /></Field>
              <Field label="Full Name"><Inp value={editing.name} onChange={e => s('name', e.target.value)} required /></Field>
              <Field label="Street Address"><Inp value={editing.line1} onChange={e => s('line1', e.target.value)} required /></Field>
              <Field label="Apt / Suite (optional)"><Inp value={editing.line2 || ''} onChange={e => s('line2', e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City"><Inp value={editing.city} onChange={e => s('city', e.target.value)} /></Field>
                <Field label="State"><Inp value={editing.state} onChange={e => s('state', e.target.value)} /></Field>
              </div>
              <Field label="Phone"><Inp type="tel" value={editing.phone} onChange={e => s('phone', e.target.value)} /></Field>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editing.is_default} onChange={e => s('is_default', e.target.checked)} className="accent-[#1c1c18] w-4 h-4" />
                <span className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18]">Set as default address</span>
              </label>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs py-3.5 hover:bg-[#4b0e1e] transition-colors disabled:opacity-50">
                {saving ? 'SAVING...' : 'SAVE ADDRESS'}
              </button>
              <button onClick={() => setEditing(null)} disabled={saving} className="flex-1 border border-[#1c1c18]/20 text-[#5f5e5e] hover:text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs py-3.5 transition-colors disabled:opacity-50">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── 3. CONTACT PREFERENCES ────────────────────────────────────
const ContactPreferences = () => {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    const { preferences, error } = await accountService.getPreferences();
    if (error) {
      toast(error, 'error');
    } else {
      setPrefs(preferences);
    }
    setLoading(false);
  };

  const toggle = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await accountService.updatePreferences(prefs);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Preferences saved', 'success');
    }
    setSaving(false);
  };

  const items = [
    { key: 'order_updates',    label: 'Order Updates',         desc: 'Shipping confirmations and order status changes.' },
    { key: 'new_arrivals',     label: 'New Arrivals',           desc: 'Be the first to know when new pieces drop.' },
    { key: 'exclusive_offers', label: 'Exclusive Offers',       desc: 'Members-only access to private sales and early access.' },
    { key: 'lookbook_drops',   label: 'Lookbook & Editorials',  desc: 'Seasonal lookbooks and editorial content.' },
    { key: 'sms_updates',      label: 'SMS Notifications',      desc: 'Text alerts for orders and exclusive drops.' },
  ];

  if (loading || !prefs) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">CONTACT PREFERENCES</h1>
        <div className="flex items-center justify-center py-20">
          <p className="font-plex text-sm text-[#5f5e5e]">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">CONTACT PREFERENCES</h1>
      <div className="flex flex-col border border-[#1c1c18]/10">
        {items.map((item, i) => (
          <div key={item.key} className={`flex items-center justify-between px-6 py-5 ${i < items.length - 1 ? 'border-b border-[#1c1c18]/10' : ''}`}>
            <div className="flex-1 pr-8">
              <p className="font-grotesk font-bold text-sm text-[#1c1c18] uppercase tracking-wide">{item.label}</p>
              <p className="font-plex text-xs text-[#5f5e5e] mt-1 leading-relaxed">{item.desc}</p>
            </div>
            <button onClick={() => toggle(item.key)}
              className={`w-12 h-6 relative shrink-0 transition-colors ${prefs[item.key] ? 'bg-[#1c1c18]' : 'bg-[#1c1c18]/15'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white transition-all ${prefs[item.key] ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={handleSave} disabled={saving} className="self-start bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs px-8 py-3.5 hover:bg-[#4b0e1e] transition-colors disabled:opacity-50">
        {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
      </button>
    </div>
  );
};

// ── 4. ORDER HISTORY ─────────────────────────────────────────
const OrderHistory = () => {
  const { orders } = useSiteStore();
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">ORDER HISTORY</h1>
      {orders.length === 0 ? (
        <div className="border border-dashed border-[#1c1c18]/20 py-20 text-center">
          <ShoppingBag size={36} className="text-[#1c1c18]/20 mx-auto mb-4" />
          <p className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18]/30 mb-2">No orders yet</p>
        </div>
      ) : (
        <div className="border border-[#1c1c18]/10 overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0 bg-[#f6f3ed] border-b border-[#1c1c18]/10">
            {['Order #', 'Date', 'Items', 'Total (₦)', 'Status', 'Action'].map(h => (
              <div key={h} className="px-5 py-3 font-grotesk font-bold text-[9px] uppercase tracking-widest text-[#5f5e5e]">{h}</div>
            ))}
          </div>
          {orders.map((order, i) => (
            <div key={order.id} className={i < orders.length - 1 ? 'border-b border-[#1c1c18]/08' : ''}>
              {/* Row */}
              <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0 items-center hover:bg-[#f9f7f2] transition-colors">
                <div className="px-5 py-4 font-grotesk font-bold text-sm text-[#1c1c18]">#{order.id}</div>
                <div className="px-5 py-4 font-plex text-xs text-[#5f5e5e]">{order.date}</div>
                <div className="px-5 py-4 font-plex text-xs text-[#5f5e5e] hidden md:block">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                <div className="px-5 py-4 font-grotesk font-bold text-sm text-[#1c1c18] hidden md:block">₦{order.total.toLocaleString()}</div>
                <div className="px-5 py-4 hidden md:block"><StatusPill status={order.status} /></div>
                <div className="px-5 py-4">
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#4b0e1e] border border-[#4b0e1e] px-3 py-1.5 hover:bg-[#4b0e1e] hover:text-white transition-colors flex items-center gap-1">
                    VIEW <ChevronDown size={11} className={`transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
              {/* Expanded detail */}
              {expanded === order.id && (
                <div className="border-t border-[#1c1c18]/10 bg-[#f9f7f2] px-6 py-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-3">ITEMS</p>
                      <div className="flex flex-col gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 bg-white p-3 border border-[#1c1c18]/08">
                            {item.image && <img src={item.image} alt="" className="w-12 h-16 object-cover bg-[#f1eee7] shrink-0" />}
                            <div className="min-w-0">
                              <p className="font-grotesk font-bold text-xs uppercase tracking-wide text-[#1c1c18] leading-tight">{item.name}</p>
                              <p className="font-plex text-xs text-[#5f5e5e] mt-0.5">Size: {item.size} · Color: {item.color} · Qty: {item.qty}</p>
                              <p className="font-unica text-base tracking-tighter text-[#1c1c18] mt-1">₦{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Order info */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-1">SHIPPING ADDRESS</p>
                        <p className="font-plex text-sm text-[#1c1c18] leading-relaxed">{order.address}</p>
                      </div>
                      <div>
                        <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-1">PAYMENT</p>
                        <p className="font-plex text-sm text-[#1c1c18]">{order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#5f5e5e] mb-1">STATUS</p>
                        <StatusPill status={order.status} />
                      </div>
                      <div className="border-t border-[#1c1c18]/10 pt-3 flex justify-between">
                        <span className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#5f5e5e]">ORDER TOTAL</span>
                        <span className="font-unica text-xl tracking-tighter text-[#1c1c18]">₦{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── 5. MY COMPLAINTS ──────────────────────────────────────────
const COMPLAINT_SUBJECTS = ['Wrong Item Received', 'Damaged Item', 'Missing Item', 'Payment Issue', 'Late Delivery', 'Other'];

const MyComplaints = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', orderNumber: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    const { data, error } = await complaintService.getMyComplaints();
    if (error) {
      toast(error, 'error');
    } else {
      setComplaints(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.message.length < 20) {
      toast('Message must be at least 20 characters', 'error');
      return;
    }

    setSubmitting(true);
    const { error } = await complaintService.submitComplaint({
      subject: form.subject,
      message: form.message,
      orderNumber: form.orderNumber || null,
    });

    if (error) {
      toast(error, 'error');
    } else {
      toast('Complaint submitted', 'success');
      setForm({ subject: '', orderNumber: '', message: '' });
      setShowForm(false);
      loadComplaints();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">MY COMPLAINTS</h1>
        <div className="flex items-center justify-center py-20">
          <p className="font-plex text-sm text-[#5f5e5e]">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">MY COMPLAINTS</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#4b0e1e] text-white font-grotesk font-bold uppercase tracking-widest text-[10px] px-5 py-3 hover:bg-[#3a0b17] transition-colors">
          <Plus size={13} /> SUBMIT A COMPLAINT
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <div className="border border-[#4b0e1e]/20 bg-[#4b0e1e]/03 p-6">
          <h3 className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#4b0e1e] mb-4">NEW COMPLAINT</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Subject">
              <select value={form.subject} onChange={e => sf('subject', e.target.value)} required
                className="font-plex text-sm px-4 py-3 border border-[#1c1c18]/20 bg-white text-[#1c1c18] outline-none focus:border-[#4b0e1e]">
                <option value="">— Select a subject —</option>
                {COMPLAINT_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Order Number (optional)">
              <Inp value={form.orderNumber} onChange={e => sf('orderNumber', e.target.value)} placeholder="e.g. LUX-0001" />
            </Field>
            <Field label="Message (minimum 20 characters)">
              <textarea value={form.message} onChange={e => sf('message', e.target.value)} required rows={5}
                placeholder="Please describe your issue in detail..."
                className="font-plex text-sm px-4 py-3 border border-[#1c1c18]/20 bg-white text-[#1c1c18] outline-none focus:border-[#4b0e1e] resize-none" />
              <span className={`font-plex text-[10px] ${form.message.length < 20 ? 'text-[#5f5e5e]/50' : 'text-[#1a4a2e]'}`}>{form.message.length} / 20 min</span>
            </Field>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="bg-[#4b0e1e] text-white font-grotesk font-bold uppercase tracking-widest text-[10px] px-6 py-3 hover:bg-[#3a0b17] transition-colors disabled:opacity-50">
                {submitting ? 'SUBMITTING...' : 'SUBMIT COMPLAINT'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} disabled={submitting} className="border border-[#1c1c18]/20 text-[#5f5e5e] font-grotesk font-bold uppercase tracking-widest text-[10px] px-6 py-3 hover:text-[#1c1c18] transition-colors disabled:opacity-50">
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaints list */}
      {complaints.length === 0 ? (
        <div className="border border-dashed border-[#1c1c18]/20 py-16 text-center">
          <MessageSquare size={32} className="text-[#1c1c18]/20 mx-auto mb-3" />
          <p className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18]/30">No complaints yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {complaints.map(c => (
            <div key={c.id} className="border border-[#1c1c18]/10">
              {/* Card header */}
              <button onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f9f7f2] transition-colors text-left">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="font-grotesk font-bold text-xs text-[#1c1c18] shrink-0">{c.complaint_number || `C${c.id.slice(0, 4)}`}</span>
                  <span className="font-plex text-xs text-[#5f5e5e] truncate">{c.subject}</span>
                  <span className="font-plex text-xs text-[#5f5e5e] shrink-0 hidden sm:block">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <StatusPill status={c.status} map={COMPLAINT_STATUS} />
                  <ChevronDown size={14} className={`text-[#5f5e5e] transition-transform ${expanded === c.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expanded */}
              {expanded === c.id && (
                <div className="border-t border-[#1c1c18]/10 px-5 py-5 bg-[#f9f7f2] flex flex-col gap-4">
                  <div>
                    <p className="font-grotesk font-bold text-[9px] uppercase tracking-widest text-[#5f5e5e] mb-2">YOUR MESSAGE</p>
                    <p className="font-plex text-sm text-[#1c1c18] leading-relaxed">{c.message}</p>
                  </div>
                  {c.order_number && (
                    <div>
                      <p className="font-grotesk font-bold text-[9px] uppercase tracking-widest text-[#5f5e5e] mb-1">ORDER REFERENCE</p>
                      <p className="font-plex text-sm text-[#1c1c18]">#{c.order_number}</p>
                    </div>
                  )}
                  {/* Admin response */}
                  <div className="border-t border-[#1c1c18]/10 pt-4">
                    <p className="font-grotesk font-bold text-[9px] uppercase tracking-widest text-[#5f5e5e] mb-3">ADMIN RESPONSE</p>
                    {c.admin_response ? (
                      <div className="border-l-4 border-[#4b0e1e] bg-[#fcf9f3] px-4 py-4">
                        <p className="font-grotesk font-bold text-[9px] uppercase tracking-widest text-[#4b0e1e] mb-2">RESPONSE FROM 44LUXURY SUPPORT</p>
                        <p className="font-plex text-sm text-[#1c1c18] leading-relaxed">{c.admin_response}</p>
                      </div>
                    ) : (
                      <p className="font-plex text-sm text-[#5f5e5e] italic">Our team will respond within 24–48 hours.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── 6. CONTACT SUPPORT ────────────────────────────────────────
const ContactSupport = () => (
  <div className="flex flex-col gap-6">
    <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">CONTACT SUPPORT</h1>
    <p className="font-plex text-sm text-[#5f5e5e]">Reach our team directly. For complaints, use the My Complaints section.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
      {/* Email */}
      <div className="border border-[#1c1c18]/10 bg-white p-6 flex flex-col gap-4">
        <div className="w-10 h-10 bg-[#1c1c18] flex items-center justify-center">
          <Mail size={16} className="text-[#fcf9f3]" />
        </div>
        <div>
          <p className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] mb-1">EMAIL US</p>
          <p className="font-plex text-sm text-[#5f5e5e]">support@44luxury.com</p>
        </div>
        <a href="mailto:support@44luxury.com"
          className="self-start bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-[10px] px-5 py-2.5 hover:bg-[#4b0e1e] transition-colors">
          SEND EMAIL
        </a>
      </div>
      {/* WhatsApp */}
      <div className="border border-[#1c1c18]/10 bg-white p-6 flex flex-col gap-4">
        <div className="w-10 h-10 bg-[#1a4a2e] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </div>
        <div>
          <p className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] mb-1">WHATSAPP</p>
          <p className="font-plex text-sm text-[#5f5e5e]">Chat with us on WhatsApp</p>
        </div>
        <a href="https://www.whatsapp.com/catalog/2349067794779/" target="_blank" rel="noopener noreferrer"
          className="self-start bg-[#1a4a2e] text-white font-grotesk font-bold uppercase tracking-widest text-[10px] px-5 py-2.5 hover:bg-[#163d25] transition-colors">
          OPEN WHATSAPP
        </a>
      </div>
    </div>
  </div>
);

// ── 7. WISHLIST ───────────────────────────────────────────────
const MyWishlist = () => {
  const { wishlist, products, toggleWishlist, addToCart } = useSiteStore();
  const items = products.filter(p => wishlist.includes(p.id));
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">MY WISHLIST</h1>
      {items.length === 0 ? (
        <div className="border border-dashed border-[#1c1c18]/20 py-20 text-center">
          <Heart size={36} className="text-[#1c1c18]/20 mx-auto mb-4" />
          <p className="font-unica text-2xl uppercase tracking-tighter text-[#1c1c18]/30 mb-2">Your wishlist is empty</p>
          <p className="font-plex text-sm text-[#5f5e5e]">Save items you love by clicking the heart on any product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <div key={p.id} className="border border-[#1c1c18]/10 group">
              <div className="relative aspect-[3/4] bg-[#f1eee7] overflow-hidden">
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <button onClick={() => toggleWishlist(p.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center hover:bg-red-50 transition-colors">
                  <Heart size={14} className="text-[#4b0e1e] fill-[#4b0e1e]" />
                </button>
              </div>
              <div className="p-4">
                <p className="font-grotesk font-bold text-xs uppercase tracking-wide text-[#1c1c18] leading-tight mb-1">{p.name}</p>
                <p className="font-unica text-lg tracking-tighter text-[#1c1c18] mb-3">₦{p.price.toLocaleString()}</p>
                <button onClick={() => { addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Black'); toast('Added to bag', 'cart'); }}
                  className="w-full bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-[10px] py-2.5 hover:bg-[#4b0e1e] transition-colors">
                  ADD TO BAG
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── 8. PRIVACY ────────────────────────────────────────────────
const PrivacyNotice = () => (
  <div className="flex flex-col gap-5 max-w-2xl">
    <h1 className="font-unica text-4xl uppercase tracking-tighter text-[#1c1c18]">PRIVACY NOTICE</h1>
    {[
      { title: 'WHAT WE COLLECT', body: 'We collect information you provide when creating an account, placing orders, or contacting support — including name, email, phone, and delivery addresses.' },
      { title: 'HOW WE USE YOUR DATA', body: 'Your data is used to process orders, communicate with you, and (with your consent) send marketing communications.' },
      { title: 'DATA SHARING', body: 'We do not sell your personal data. We share information with trusted partners only where necessary to fulfil orders.' },
      { title: 'YOUR RIGHTS', body: 'You have the right to access, correct, or delete your personal data. Contact privacy@44luxury.com to exercise these rights.' },
      { title: 'CONTACT', body: '44LUXURY Nigeria Ltd, Shariff Plaza, Banex Wuse 2, Shop C426, Abuja, Nigeria. privacy@44luxury.com' },
    ].map(s => (
      <div key={s.title} className="border-b border-[#1c1c18]/10 pb-5">
        <p className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18] mb-2">{s.title}</p>
        <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed">{s.body}</p>
      </div>
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════════
// MAIN ACCOUNT PAGE
// ══════════════════════════════════════════════════════════════
export default function Account() {
  const { user, isAuthenticated, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('details');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);

  // Note: Realtime subscriptions temporarily disabled to prevent errors
  // They can be re-enabled once the subscription timing issue is resolved
  // useEffect(() => {
  //   if (!user?.id) return;
  //   const subscriptions = [];
  //   const orderSub = subscribeToUserOrders(user.id, (update) => {
  //     console.log('Order update:', update);
  //   });
  //   if (orderSub) subscriptions.push(orderSub);
  //   return () => {
  //     unsubscribeAll(subscriptions);
  //   };
  // }, [user?.id]);

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  const handleLogout = async () => {
    try {
      console.log('=== LOGOUT STARTED ===');
      console.log('Current user:', user);
      console.log('Is authenticated:', isAuthenticated);
      
      // Call signOut from authStore
      const { success, error } = await signOut();
      
      console.log('SignOut result:', { success, error });
      
      if (!success) {
        console.error('SignOut failed:', error);
        toast(error || 'Failed to log out', 'error');
        return;
      }
      
      console.log('SignOut successful, navigating to home');
      
      // Clear any local storage if needed
      localStorage.removeItem('44luxury-store');
      
      // Navigate to home
      navigate('/', { replace: true });
      
      // Show success message
      toast('You have been logged out', 'success');
      
      console.log('=== LOGOUT COMPLETED ===');
    } catch (error) {
      console.error('=== LOGOUT ERROR ===', error);
      toast('Failed to log out. Please try again.', 'error');
    }
  };
  const handleNavigate = (section) => { setActiveSection(section); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const activeLabel = NAV.flatMap(g => g.items).find(i => i.id === activeSection)?.label || 'Account';

  const renderPanel = () => {
    switch (activeSection) {
      case 'details':     return <AccountDetails user={user} orders={orders} onNavigate={handleNavigate} />;
      case 'addresses':   return <Addresses />;
      case 'preferences': return <ContactPreferences />;
      case 'orders':      return <OrderHistory />;
      case 'complaints':  return <MyComplaints user={user} />;
      case 'support':     return <ContactSupport />;
      case 'wishlist':    return <MyWishlist />;
      case 'privacy':     return <PrivacyNotice />;
      default:            return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f3]">
      {/* Mobile dropdown */}
      <div className="md:hidden border-b border-[#1c1c18]/10 bg-[#fcf9f3] sticky top-[48px] z-30">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-full flex items-center justify-between px-5 py-4">
          <span className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#1c1c18]">{activeLabel}</span>
          <ChevronDown size={16} className={`text-[#5f5e5e] transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        {mobileMenuOpen && (
          <div className="border-t border-[#1c1c18]/10 pb-3 max-h-80 overflow-y-auto">
            {NAV.map(group => (
              <div key={group.group}>
                <p className="font-grotesk font-bold text-[9px] uppercase tracking-widest text-[#5f5e5e] px-5 py-3">{group.group}</p>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button key={item.id} onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 transition-colors ${active ? 'bg-[#1c1c18] text-[#fcf9f3]' : 'text-[#1c1c18] hover:bg-[#f1eee7]'}`}>
                      <Icon size={14} /><span className="font-grotesk font-bold text-xs uppercase tracking-widest">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="px-5 pt-3 border-t border-[#1c1c18]/10 mt-2">
              <button onClick={handleLogout} className="flex items-center gap-2 font-grotesk font-bold text-xs uppercase tracking-widest text-red-600"><LogOut size={14} /> LOG OUT</button>
            </div>
          </div>
        )}
      </div>

      {/* Layout */}
      <div className="max-w-[1280px] mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-[#1c1c18]/10 sticky top-0 h-screen overflow-y-auto">
          <div className="p-6 border-b border-[#1c1c18]/10">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name || user?.email} />
              <div className="min-w-0">
                <p className="font-grotesk font-bold text-sm text-[#1c1c18] uppercase tracking-wide truncate">{user?.name || 'My Account'}</p>
                <p className="font-plex text-xs text-[#5f5e5e] truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 py-4">
            {NAV.map(group => (
              <div key={group.group} className="mb-4">
                <p className="font-unica text-[11px] uppercase tracking-widest text-[#5f5e5e]/60 px-6 py-2">{group.group}</p>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button key={item.id} onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all border-l-2
                        ${active ? 'border-[#4b0e1e] bg-[#4b0e1e]/5 text-[#1c1c18]' : 'border-transparent text-[#5f5e5e] hover:text-[#1c1c18] hover:bg-[#f1eee7]'}`}>
                      <Icon size={14} className={active ? 'text-[#4b0e1e]' : ''} />
                      <span className={`font-grotesk text-xs uppercase tracking-widest ${active ? 'font-bold text-[#1c1c18]' : 'font-medium'}`}>{item.label}</span>
                      {active && <ChevronRight size={12} className="ml-auto text-[#4b0e1e]" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="p-6 border-t border-[#1c1c18]/10">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 font-grotesk font-bold text-xs uppercase tracking-widest text-[#5f5e5e] hover:text-red-600 py-2 transition-colors">
              <LogOut size={14} /> LOG OUT
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-6 md:px-10 py-10">{renderPanel()}</main>
      </div>
    </div>
  );
}
