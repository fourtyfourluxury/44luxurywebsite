import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, ExternalLink, Save, Upload, Star, Globe, Calendar, Package } from 'lucide-react';
import { getAllPartnerships, createPartnership, updatePartnership, deletePartnership } from '../../services/admin/partnershipAdminService';
import { uploadFile, BUCKETS } from '../../services/storageService';
import { toast } from '../../components/ui/ToastProvider';

const EMPTY = {
  name: '',
  slug: '',
  partner_name: '',
  description: '',
  launch_date: '',
  status: 'DRAFT',
  partner_website: '',
  logo_url: '',
  banner_url: '',
  is_featured: false,
  seo_title: '',
  seo_description: '',
};

const STATUS_CFG = {
  ACTIVE:   { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
  DRAFT:    { dot: 'bg-white/30',    text: 'text-white/40',    bg: 'bg-white/5',        label: 'Draft' },
  ARCHIVED: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Archived' },
};

export default function PartnershipsManager() {
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { partnerships: data, error } = await getAllPartnerships();
    if (error) toast(error, 'error');
    else setPartnerships(data || []);
    setLoading(false);
  };

  const setF = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === 'name' && !editing) {
        next.slug = v.toLowerCase().replace(/[^a-z0-9×]+/gi, '-').replace(/(^-|-$)/g, '');
        if (!next.seo_title) next.seo_title = `${v} | 44 Luxury`;
      }
      return next;
    });
    setErrors(e => ({ ...e, [k]: null }));
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setEditorOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      slug: p.slug || '',
      partner_name: p.partner_name || '',
      description: p.description || '',
      launch_date: p.launch_date || '',
      status: p.status || 'DRAFT',
      partner_website: p.partner_website || '',
      logo_url: p.logo_url || '',
      banner_url: p.banner_url || '',
      is_featured: p.is_featured || false,
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
    });
    setErrors({});
    setEditorOpen(true);
  };

  const handleUpload = async (key, file, bucket = BUCKETS.GENERAL, folder = 'partnerships') => {
    setUploading(u => ({ ...u, [key]: true }));
    const { url, error } = await uploadFile(file, { bucket, folder });
    setUploading(u => ({ ...u, [key]: false }));
    if (error) toast('Upload failed: ' + error, 'error');
    else setF(key, url);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Partnership name is required';
    if (!form.partner_name.trim()) e.partner_name = 'Partner name is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const result = editing
      ? await updatePartnership(editing.id, form)
      : await createPartnership(form);
    setSaving(false);
    if (result.error) { toast(result.error, 'error'); return; }
    toast(editing ? 'Partnership updated!' : 'Partnership created!', 'success');
    setEditorOpen(false);
    load();
  };

  const handleDelete = async () => {
    const { success, error } = await deletePartnership(deleteTarget.id);
    if (error) toast(error, 'error');
    else { toast('Partnership deleted', 'success'); setDeleteTarget(null); load(); }
  };

  const filtered = partnerships.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.partner_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Brand</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Partnerships</h1>
          <p className="text-[11px] text-white/25 mt-1">44 Luxury × [Partner] — each generates a dedicated storefront page.</p>
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
                <div className="h-32 bg-[#1c1c18] relative overflow-hidden">
                  {p.banner_url
                    ? <img src={p.banner_url} alt={p.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    : <div className="flex items-center justify-center h-full"><Globe size={28} className="text-white/10" /></div>
                  }
                  {p.logo_url && (
                    <div className="absolute bottom-3 left-3 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm overflow-hidden border border-white/10">
                      <img src={p.logo_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1 h-1 rounded-full ${sc.dot}`} />{sc.label}
                    </span>
                  </div>
                  {p.is_featured && (
                    <div className="absolute top-3 left-3">
                      <Star size={14} className="text-[#c9a96e] fill-[#c9a96e]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-[10px] font-bold text-[#c9a96e] uppercase tracking-widest mb-1">44 LUXURY × {p.partner_name}</p>
                  <p className="text-[14px] font-bold text-white/80 truncate">{p.name}</p>
                  {p.launch_date && (
                    <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                      <Calendar size={10} /> Launch: {new Date(p.launch_date).toLocaleDateString()}
                    </p>
                  )}
                  {p.description && (
                    <p className="text-[11px] text-white/40 mt-2 line-clamp-2">{p.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 py-1.5 text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                    >
                      <Edit2 size={12} className="inline mr-1" /> Edit
                    </button>
                    {p.status === 'ACTIVE' && (
                      <a
                        href={`/partnerships/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 text-[11px] font-semibold text-white/30 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                        title="View Live"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="py-1.5 px-3 text-[11px] font-semibold text-white/20 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#10100d] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-[15px] font-bold text-white">{editing ? 'Edit Partnership' : 'New Partnership'}</h3>
                <p className="text-[10px] text-white/30 mt-0.5">Creates a dedicated storefront page at /partnerships/{form.slug || 'slug'}</p>
              </div>
              <button onClick={() => setEditorOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Partnership Name</label>
                  <input
                    value={form.name}
                    onChange={e => setF('name', e.target.value)}
                    placeholder="44 Luxury × Starkkicks"
                    className="input"
                  />
                  {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="label">Partner Name</label>
                  <input
                    value={form.partner_name}
                    onChange={e => setF('partner_name', e.target.value)}
                    placeholder="Starkkicks"
                    className="input"
                  />
                  {errors.partner_name && <p className="text-red-400 text-[10px] mt-1">{errors.partner_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">URL Slug</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-[12px]">/partnerships/</span>
                    <input
                      value={form.slug}
                      onChange={e => setF('slug', e.target.value)}
                      className="input pl-28"
                    />
                  </div>
                  {errors.slug && <p className="text-red-400 text-[10px] mt-1">{errors.slug}</p>}
                </div>
                <div>
                  <label className="label">Launch Date</label>
                  <input type="date" value={form.launch_date} onChange={e => setF('launch_date', e.target.value)} className="input" />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setF('description', e.target.value)}
                  placeholder="Describe the collaboration..."
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="label">Partner Website</label>
                <input
                  value={form.partner_website}
                  onChange={e => setF('partner_website', e.target.value)}
                  placeholder="https://starkkicks.com"
                  className="input"
                />
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Partner Logo</label>
                  <div
                    onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = e => handleUpload('logo_url', e.target.files[0]); i.click(); }}
                    className="border-2 border-dashed border-white/10 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a96e]/30 transition-colors"
                  >
                    {form.logo_url
                      ? <img src={form.logo_url} alt="" className="h-full w-full object-contain rounded-xl p-2" />
                      : uploading.logo_url
                      ? <div className="w-5 h-5 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
                      : <><Upload size={16} className="text-white/20 mb-1" /><span className="text-[10px] text-white/30">Upload Logo</span></>
                    }
                  </div>
                </div>
                <div>
                  <label className="label">Partnership Banner</label>
                  <div
                    onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = e => handleUpload('banner_url', e.target.files[0]); i.click(); }}
                    className="border-2 border-dashed border-white/10 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a96e]/30 transition-colors overflow-hidden"
                  >
                    {form.banner_url
                      ? <img src={form.banner_url} alt="" className="h-full w-full object-cover" />
                      : uploading.banner_url
                      ? <div className="w-5 h-5 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
                      : <><Upload size={16} className="text-white/20 mb-1" /><span className="text-[10px] text-white/30">Upload Banner</span></>
                    }
                  </div>
                </div>
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select value={form.status} onChange={e => setF('status', e.target.value)} className="input">
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setF('is_featured', !form.is_featured)}
                      className={`w-10 h-6 rounded-full relative transition-colors ${form.is_featured ? 'bg-[#c9a96e]' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_featured ? 'left-5' : 'left-1'}`} />
                    </button>
                    <div>
                      <p className="text-[12px] font-semibold text-white/70">Featured</p>
                      <p className="text-[10px] text-white/30">Show on homepage</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* SEO */}
              <div className="border-t border-white/[0.04] pt-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">SEO</p>
                <input value={form.seo_title} onChange={e => setF('seo_title', e.target.value)} placeholder="SEO Title" className="input" />
                <textarea rows={2} value={form.seo_description} onChange={e => setF('seo_description', e.target.value)} placeholder="SEO Description" className="input resize-none" />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-[#141410] flex justify-end gap-3 shrink-0">
              <button onClick={() => setEditorOpen(false)} className="px-5 py-2.5 border border-white/10 rounded-xl text-[12px] font-semibold text-white/50 hover:text-white transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-5 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[#d4b87e] transition-colors disabled:opacity-50">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Partnership'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#10100d] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <Trash2 size={28} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-[14px] font-bold text-white text-center mb-2">Delete Partnership?</h3>
            <p className="text-[11px] text-white/40 text-center mb-6">"{deleteTarget.name}" will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-[11px] font-semibold text-white/50 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 rounded-xl text-[11px] font-bold text-white hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .label { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
        .input { width: 100%; background: #161612; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 14px; font-size: 12px; color: white; outline: none; transition: border-color 0.15s; }
        .input:focus { border-color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
