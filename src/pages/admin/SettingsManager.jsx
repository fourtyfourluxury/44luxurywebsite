import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Shield, Database, Mail, Store } from 'lucide-react';
import { getSettings, updateSettings, getSystemStats, toggleMaintenanceMode } from '../../services/admin/settingsAdminService';
import { toast } from '../../components/ui/ToastProvider';

const TABS = [
  { id: 'store',       label: 'Store Info',   icon: Store },
  { id: 'email',       label: 'Email',         icon: Mail },
  { id: 'system',      label: 'System',        icon: Database },
  { id: 'danger',      label: 'Danger Zone',   icon: AlertTriangle },
];

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">{label}</label>
    {children}
    {hint && <p className="mt-1.5 text-[10px] text-white/25">{hint}</p>}
  </div>
);

const Input = (props) => (
  <input {...props} className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none transition-colors" />
);

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState('store');
  const [settings, setSettings]   = useState(null);
  const [sysStats, setSysStats]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: stats }] = await Promise.all([
      getSettings(),
      getSystemStats(),
    ]);
    if (s) { setSettings(s); setMaintenance(s.maintenance_mode || false); }
    if (stats) setSysStats(stats);
    setLoading(false);
  };

  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  const save = async (fields) => {
    setSaving(true);
    const payload = {};
    fields.forEach(k => { payload[k] = settings?.[k] ?? null; });
    const { error } = await updateSettings(payload);
    setSaving(false);
    if (error) toast(error, 'error');
    else toast('Settings saved!', 'success');
  };

  const handleToggleMaintenance = async () => {
    const next = !maintenance;
    const { success, error } = await toggleMaintenanceMode(next);
    if (error) { toast(error, 'error'); return; }
    setMaintenance(next);
    toast(next ? '⚠️ Maintenance mode ON — storefront is hidden' : 'Storefront is live again!', next ? 'error' : 'success');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">System</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#141410] border border-white/[0.06] rounded-2xl p-1.5">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[11px] font-semibold transition-all
                ${activeTab === t.id
                  ? t.id === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-white'
                  : 'text-white/30 hover:text-white/60'}`}>
              <Icon size={13} />{t.label}
            </button>
          );
        })}
      </div>

      {/* STORE INFO */}
      {activeTab === 'store' && (
        <div className="space-y-5">
          <Field label="Store Name">
            <Input value={settings?.store_name || ''} onChange={e => set('store_name', e.target.value)} placeholder="44LUXURY" />
          </Field>
          <Field label="Contact Email" hint="Shown on storefront and used for customer communications">
            <Input type="email" value={settings?.contact_email || ''} onChange={e => set('contact_email', e.target.value)} placeholder="hello@44luxury.com" />
          </Field>
          <Field label="Contact Phone">
            <Input value={settings?.contact_phone || ''} onChange={e => set('contact_phone', e.target.value)} placeholder="+234 800 000 0044" />
          </Field>
          <Field label="Store Address">
            <Input value={settings?.store_address || ''} onChange={e => set('store_address', e.target.value)} placeholder="44 Bourdillon Road, Ikoyi, Lagos" />
          </Field>
          <Field label="Instagram Handle">
            <Input value={settings?.instagram || ''} onChange={e => set('instagram', e.target.value)} placeholder="@44luxury" />
          </Field>
          <Field label="WhatsApp Number" hint="Include country code, no spaces e.g. 2348012345678">
            <Input value={settings?.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="2348012345678" />
          </Field>
          <button onClick={() => save(['store_name','contact_email','contact_phone','store_address','instagram','whatsapp'])}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 bg-[#c9a96e] text-[#0a0a08] rounded-xl text-[12px] font-bold hover:bg-[#d4b87e] transition-colors disabled:opacity-50">
            <Save size={14} />{saving ? 'Saving...' : 'Save Store Info'}
          </button>
        </div>
      )}

      {/* EMAIL */}
      {activeTab === 'email' && (
        <div className="space-y-5">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <p className="text-[12px] text-blue-400 font-semibold mb-1">Email is powered by Resend</p>
            <p className="text-[11px] text-white/40">Transactional emails (order updates, complaint responses) are sent automatically when you update order statuses or respond to complaints.</p>
          </div>
          <Field label="From Email" hint="The sender address customers see">
            <Input type="email" value={settings?.email_from || ''} onChange={e => set('email_from', e.target.value)} placeholder="noreply@44luxury.com" />
          </Field>
          <Field label="Reply-To Email" hint="Where customer replies land">
            <Input type="email" value={settings?.email_reply_to || ''} onChange={e => set('email_reply_to', e.target.value)} placeholder="support@44luxury.com" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#141410] border border-white/[0.06] rounded-xl">
            <div onClick={() => set('email_notifications_enabled', !settings?.email_notifications_enabled)}
              className={`w-10 h-6 rounded-full relative transition-colors ${settings?.email_notifications_enabled ? 'bg-[#c9a96e]' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.email_notifications_enabled ? 'left-5' : 'left-1'}`} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white/70">Email Notifications</p>
              <p className="text-[11px] text-white/30 mt-0.5">Send automated emails for orders and complaints</p>
            </div>
          </label>
          <button onClick={() => save(['email_from','email_reply_to','email_notifications_enabled'])}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 bg-[#c9a96e] text-[#0a0a08] rounded-xl text-[12px] font-bold hover:bg-[#d4b87e] transition-colors disabled:opacity-50">
            <Save size={14} />{saving ? 'Saving...' : 'Save Email Settings'}
          </button>
        </div>
      )}

      {/* SYSTEM */}
      {activeTab === 'system' && sysStats && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Products',    sysStats.products],
              ['Orders',      sysStats.orders],
              ['Customers',   sysStats.customers],
              ['Collections', sysStats.collections],
            ].map(([l, v]) => (
              <div key={l} className="bg-[#141410] border border-white/[0.06] rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{v}</p>
                <p className="text-[11px] text-white/40 font-medium uppercase tracking-wider mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#141410] border border-white/[0.06] rounded-xl p-4 space-y-3">
            {[
              ['Framework',   sysStats.framework],
              ['CMS Version', sysStats.version],
              ['Environment', sysStats.environment?.toUpperCase()],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between items-center">
                <p className="text-[12px] text-white/40">{l}</p>
                <p className="text-[12px] font-semibold text-white/70">{v}</p>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#141410] border border-white/[0.06] rounded-xl hover:border-white/10 transition-colors">
            <div onClick={() => set('low_stock_threshold', settings?.low_stock_threshold)}
              className="flex-1">
              <p className="text-[13px] font-semibold text-white/70">Low Stock Threshold</p>
              <p className="text-[11px] text-white/30 mt-0.5">Alert when stock falls below this number</p>
            </div>
            <input type="number" min="1" max="100"
              value={settings?.low_stock_threshold || 10}
              onChange={e => set('low_stock_threshold', parseInt(e.target.value))}
              className="w-16 bg-[#0f0f0c] border border-white/[0.08] rounded-xl px-3 py-2 text-[13px] text-white text-center outline-none focus:border-white/25 transition-colors"
            />
          </label>
          <button onClick={() => save(['low_stock_threshold'])} disabled={saving}
            className="flex items-center gap-2 px-5 py-3 bg-[#c9a96e] text-[#0a0a08] rounded-xl text-[12px] font-bold hover:bg-[#d4b87e] transition-colors disabled:opacity-50">
            <Save size={14} />{saving ? 'Saving...' : 'Save System Settings'}
          </button>
        </div>
      )}

      {/* DANGER ZONE */}
      {activeTab === 'danger' && (
        <div className="space-y-4">
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <p className="text-[12px] text-red-400 font-semibold mb-1">⚠️ Danger Zone</p>
            <p className="text-[11px] text-white/40">Actions here are immediate and may affect your live storefront or permanently delete data.</p>
          </div>

          {/* Maintenance Mode */}
          <div className={`p-5 rounded-xl border ${maintenance ? 'bg-red-500/5 border-red-500/20' : 'bg-[#141410] border-white/[0.06]'}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-bold text-white">Maintenance Mode</p>
                <p className="text-[11px] text-white/40 mt-1">
                  {maintenance
                    ? '🔴 LIVE — Storefront is currently hidden from customers'
                    : 'Hides the storefront and shows a maintenance page to visitors'}
                </p>
              </div>
              <button onClick={handleToggleMaintenance}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-colors ${maintenance ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}>
                {maintenance ? 'Take Site Live' : 'Enable Maintenance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
