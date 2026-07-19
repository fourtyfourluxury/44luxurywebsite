import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, ExternalLink, Save, Upload, Loader2, Globe, Check, Image as ImageIcon } from 'lucide-react';
import { getAllPartnerships, createPartnership, updatePartnership, deletePartnership } from '../../services/admin/partnershipAdminService';
import { uploadFile, BUCKETS } from '../../services/storageService';
import { toast } from '../../components/ui/ToastProvider';
import { useSiteStore } from '../../store/useSiteStore';

const EMPTY = {
  name: '',
  slug: '',
  description: '',
  banner_url: '',
  status: 'DRAFT',
  featured_product_ids: [],
  seo_title: '',
  seo_description: '',
};

const STATUS_CFG = {
  ACTIVE:   { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
  DRAFT:    { dot: 'bg-white/30',    text: 'text-white/40',    bg: 'bg-white/5',        label: 'Draft' },
  ARCHIVED: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Archived' },
};

export default function PartnershipsManager() {
  const { products } = useSiteStore();
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { partnerships: data, error } = await getAllPartnerships();
    if (error) toast(error, 'error');
    else setPartnerships(data || []);
    setLoading(false);
  };

  const set = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'name' && !editing) {
        next.slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return next;
    });
    setErrors(e => ({ ...e, [k]: null }));
  };

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setEditorOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      description: p.description || '',
      banner_url: p.banner_url || '',
      status: p.status || 'DRAFT',
      featured_product_ids: p.featured_product_ids || [],
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
    });
    setErrors({});
    setEditorOpen(true);
  };

  const handleUploadBanner = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const { url, error } = await uploadFile(files[0], { bucket: BUCKETS.GENERAL, folder: 'partnerships' });
    setUploading(false);
    if (error) toast('Upload failed: ' + error, 'error');
    else set('banner_url', url);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Partnership name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || autoSlug(form.name),
      // partner_name is a required DB column but no longer a separate field
      // in this simplified form — mirror the partnership name into it.
      partner_name: form.name,
    };
    const result = editing
      ? await updatePartnership(editing.id, payload)
      : await createPartnership(payload);
    setSaving(false);
    if (result.error) { toast(result.error, 'error'); return; }
    toast(editing ? 'Partnership updated!' : 'Partnership created!', 'success');
    setEditorOpen(false);
    load();
  };

  const handleDelete = async () => {
    const { error } = await deletePartnership(deleteTarget.id);
    if (error) toast(error, 'error');
    else { toast('Partnership deleted', 'success'); setDeleteTarget(null); load(); }
  };

  const filtered = partnerships.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Brand</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Partnerships</h1>
          <p className="text-[11px] text-white/25 mt-1">Each partnership gets its own storefront page.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#d4b87e] transition-colors"
        >
          <Plus size={15} /> New Partnership
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search partnerships..."
          className="w-full bg-[#141410] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#141410] border border-white/[0.06] rounded-xl">
          <Globe size={40} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 font-semibold">No partnerships yet</p>
          <p className="text-white/20 text-[11px] mt-1">Create your first collaboration</p>
          <button onClick={openCreate} className="mt-6 text-[#c9a96e] text-[12px] font-bold hover:underline">+ New Partnership</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const sc = STATUS_CFG[p.status] || STATUS_CFG.DRAFT;
            return (
              <div key={p.id} className="bg-[#141410] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
                {/* Banner */}
                <div className="aspect-[16/7] bg-[#1c1c18] relative overflow-hidden">
                  {p.banner_url
                    ? <img src={p.banner_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="flex items-center justify-center h-full"><Globe size={28} className="text-white/10" /></div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white font-bold text-[13px] uppercase tracking-wide">{p.name}</p>
                    <p className="text-white/50 text-[10px] mt-0.5">/partnerships/{p.slug}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                    </span>
                    <span className="text-[11px] text-white/30">{(p.featured_product_ids || []).length} products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
                      <Edit2 size={13} />
                    </button>
                    {p.status === 'ACTIVE' && (
                      <a href={`/partnerships/${p.slug}`} target="_blank" rel="noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all" title="View Live">
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button onClick={() => setDeleteTarget(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-in Panel — mirrors CollectionsManager's editor exactly */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setEditorOpen(false)} />
          <div className="w-full max-w-md bg-[#0f0f0c] border-l border-white/[0.06] flex flex-col h-full overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">{editing ? 'Edit' : 'New'} Partnership</p>
                <h2 className="text-[15px] font-bold text-white mt-0.5">{form.name || 'Untitled'}</h2>
              </div>
              <button onClick={() => setEditorOpen(false)} className="w-8 h-8 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <Field label="Partnership Name *">
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. 44 Luxury × Starkkicks" />
                {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
              </Field>

              <Field label="URL Slug">
                <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="44-luxury-x-starkkicks" />
                {errors.slug && <p className="text-red-400 text-[10px] mt-1">{errors.slug}</p>}
              </Field>

              <Field label="Description">
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="What defines this partnership..."
                  className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none resize-none transition-colors" />
              </Field>

              {/* Status */}
              <Field label="Status">
                <div className="flex gap-2">
                  {['ACTIVE', 'DRAFT'].map(s => (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5
                        ${form.status === s ? (s === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white border-white/15') : 'border-white/[0.06] text-white/30 hover:border-white/15'}`}>
                      {form.status === s && <Check size={10} />} {s}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Hero Banner */}
              <div className="border-t border-white/[0.06] pt-5">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-3">Hero Banner</p>
                <div
                  onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = e => handleUploadBanner(e.target.files); i.click(); }}
                  className="border-2 border-dashed border-white/[0.08] rounded-xl p-5 text-center cursor-pointer hover:border-[#c9a96e]/30 hover:bg-[#c9a96e]/[0.02] transition-all"
                >
                  {uploading ? (
                    <div className="py-6 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-white/50 mb-2" size={20} />
                      <p className="text-[12px] text-white/80">Uploading...</p>
                    </div>
                  ) : form.banner_url ? (
                    <div className="relative">
                      <img src={form.banner_url} alt="" className="w-full h-32 object-cover rounded-lg" />
                      <p className="text-[10px] text-white/30 mt-2">Click to replace</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={18} className="text-white/20 mx-auto mb-2" />
                      <p className="text-[12px] text-white/30">Click to upload hero image</p>
                    </>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className="border-t border-white/[0.06] pt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Products in this Partnership</p>
                  <button
                    type="button"
                    onClick={() => setProductPickerOpen(true)}
                    className="text-[11px] font-bold text-[#c9a96e] hover:text-[#d4b87e] transition-colors"
                  >
                    {form.featured_product_ids.length > 0 ? 'Edit Products' : '+ Select Products'}
                  </button>
                </div>
                {form.featured_product_ids.length === 0 ? (
                  <p className="text-[11px] text-amber-400/80">No products yet — this partnership's page will show "Coming Soon" until you add some.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {form.featured_product_ids.map(id => {
                      const product = products.find(pr => pr.id === id);
                      if (!product) return null;
                      return (
                        <div key={id} className="aspect-square bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            : <ImageIcon size={16} className="text-white/10" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SEO Section */}
              <div className="border-t border-white/[0.06] pt-5 space-y-4">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">SEO Metadata</p>
                <Field label="SEO Title">
                  <Input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} placeholder="44 Luxury × Starkkicks" />
                </Field>
                <Field label="Meta Description">
                  <textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)} rows={2} placeholder="Short description for search engines..."
                    className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none resize-none transition-colors" />
                </Field>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 shrink-0">
              <button onClick={() => setEditorOpen(false)} className="flex-1 py-3 border border-white/[0.08] rounded-xl text-[12px] font-semibold text-white/40 hover:text-white hover:border-white/15 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-[#c9a96e] rounded-xl text-[12px] font-bold text-[#0a0a08] hover:bg-[#d4b87e] transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Partnership'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Picker */}
      {productPickerOpen && (
        <ProductPickerModal
          products={products}
          selectedIds={form.featured_product_ids}
          onSave={(ids) => { set('featured_product_ids', ids); setProductPickerOpen(false); }}
          onClose={() => setProductPickerOpen(false)}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a16] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="text-[15px] font-bold text-white text-center mb-2">Delete Partnership?</h3>
            <p className="text-[12px] text-white/40 text-center mb-6">
              "<span className="text-white/60">{deleteTarget.name}</span>" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-[12px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 rounded-xl text-[12px] font-bold text-white hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared small form pieces (matches CollectionsManager's style) ────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none transition-colors" />
);

// ── Product Picker Modal ──────────────────────────────────────────────────────
function ProductPickerModal({ products, selectedIds, onSave, onClose }) {
  const [selected, setSelected] = useState(selectedIds || []);
  const [search, setSearch] = useState('');

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = products.filter(p =>
    p.status === 'ACTIVE' && p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10100d] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <h3 className="text-[14px] font-bold text-white">Select Products for this Partnership</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 pt-4 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-[#161612] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-[12px] text-white/30 text-center py-8">No products match your search.</p>
          ) : filtered.map(product => {
            const isSelected = selected.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => toggle(product.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-white/10 border-white/20' : 'bg-[#141410] border-transparent hover:border-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#c9a96e] bg-[#c9a96e]' : 'border-white/20'}`}>
                  {isSelected && <Check size={12} className="text-black" />}
                </div>
                <div className="w-10 h-10 rounded bg-white/5 overflow-hidden shrink-0">
                  {product.images?.[0]
                    ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon size={20} className="text-white/10 m-auto mt-2" />}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-[12px] font-semibold text-white/90 truncate">{product.name}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">₦{(product.price || 0).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 p-6 pt-0 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-[12px] font-semibold text-white/60 hover:text-white transition-colors">Cancel</button>
          <button onClick={() => onSave(selected)} className="flex-1 py-3 bg-white text-black rounded-xl text-[12px] font-bold hover:bg-white/90 transition-colors">
            Save Selection ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}
