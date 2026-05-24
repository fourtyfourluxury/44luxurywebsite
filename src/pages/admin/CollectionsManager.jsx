import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Layers, Upload, Check } from 'lucide-react';
import { getAllCollections, createCollection, updateCollection, deleteCollection } from '../../services/admin/collectionAdminService';
import { uploadFile, BUCKETS } from '../../services/storageService';
import { toast } from '../../components/ui/ToastProvider';

const EMPTY = {
  name: '', slug: '', category: 'unisex', description: '',
  heroImage: '', heroHeadline: '', heroSubheadline: '',
  ctaLabel: 'EXPLORE', ctaLink: '/shop', status: 'DRAFT',
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none transition-colors" />
);

export default function CollectionsManager() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [panel, setPanel]             = useState(null); // null | {...collectionData}
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [uploading, setUploading]     = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await getAllCollections();
    if (error) toast(error, 'error');
    else setCollections(data || []);
    setLoading(false);
  };

  const set = (k, v) => setPanel(p => ({ ...p, [k]: v }));

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openNew  = () => setPanel({ ...EMPTY, id: null });
  const openEdit = (col) => setPanel({ ...col });

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const { url } = await uploadFile(files[0], { bucket: BUCKETS.COLLECTIONS, folder: 'collections' });
    if (url) set('heroImage', url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!panel.name?.trim()) { toast('Collection name is required', 'error'); return; }
    setSaving(true);
    const payload = { ...panel, slug: panel.slug || autoSlug(panel.name) };
    delete payload.products; // don't send nested data back
    const result = panel.id
      ? await updateCollection(panel.id, payload)
      : await createCollection(payload);
    setSaving(false);
    if (result.error) { toast(result.error, 'error'); return; }
    toast(panel.id ? 'Collection updated!' : 'Collection created!', 'success');
    setPanel(null);
    load();
  };

  const handleDelete = async () => {
    const { success, error } = await deleteCollection(deleteTarget.id);
    if (error) { toast(error, 'error'); return; }
    toast('Collection deleted', 'success');
    setDeleteTarget(null);
    load();
  };

  const filtered = collections.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Content</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Collections</h1>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#d4b87e] transition-colors">
          <Plus size={15} /> New Collection
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-6">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search collections..."
          className="w-full bg-[#141410] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none focus:border-white/15 transition-colors" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <Layers size={40} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">{search ? 'No collections match your search' : 'No collections yet'}</p>
          {!search && <button onClick={openNew} className="mt-4 text-[#c9a96e] text-[12px] font-semibold hover:underline">Create your first collection</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(col => (
            <div key={col.id} className="bg-[#141410] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/10 transition-colors group">
              {/* Hero image */}
              <div className="aspect-[16/7] bg-white/5 relative overflow-hidden">
                {col.heroImage
                  ? <img src={col.heroImage} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center"><Layers size={28} className="text-white/10" /></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="text-white font-bold text-[13px] uppercase tracking-wide">{col.name}</p>
                  <p className="text-white/50 text-[10px] mt-0.5">/{col.slug}</p>
                </div>
              </div>
              {/* Footer */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold
                    ${col.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${col.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    {col.status === 'ACTIVE' ? 'Active' : 'Draft'}
                  </span>
                  <span className="text-[11px] text-white/30">{col.product_count || 0} products</span>
                  <span className="text-[11px] text-white/20 capitalize">{col.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(col)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(col)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-in Panel */}
      {panel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setPanel(null)} />
          <div className="w-full max-w-md bg-[#0f0f0c] border-l border-white/[0.06] flex flex-col h-full overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">{panel.id ? 'Edit' : 'New'} Collection</p>
                <h2 className="text-[15px] font-bold text-white mt-0.5">{panel.name || 'Untitled'}</h2>
              </div>
              <button onClick={() => setPanel(null)} className="w-8 h-8 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <Field label="Collection Name *">
                <Input value={panel.name} onChange={e => { set('name', e.target.value); if (!panel.id) set('slug', autoSlug(e.target.value)); }} placeholder="e.g. Core Essentials SS25" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="URL Slug">
                  <Input value={panel.slug} onChange={e => set('slug', e.target.value)} placeholder="core-essentials-ss25" />
                </Field>
                <Field label="Category">
                  <select value={panel.category || 'unisex'} onChange={e => set('category', e.target.value)}
                    className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors">
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </Field>
              </div>
              <Field label="Description">
                <textarea value={panel.description || ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="What defines this collection..."
                  className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none resize-none transition-colors" />
              </Field>

              {/* Status */}
              <Field label="Status">
                <div className="flex gap-2">
                  {['ACTIVE','DRAFT'].map(s => (
                    <button key={s} type="button" onClick={() => set('status', s)}
                      className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5
                        ${panel.status === s ? (s === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white border-white/15') : 'border-white/[0.06] text-white/30 hover:border-white/15'}`}>
                      {panel.status === s && <Check size={10} />} {s}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Hero Image */}
              <div className="border-t border-white/[0.06] pt-5">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-3">Hero Banner</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/[0.08] rounded-xl p-5 text-center cursor-pointer hover:border-[#c9a96e]/30 hover:bg-[#c9a96e]/[0.02] transition-all"
                >
                  {panel.heroImage ? (
                    <div className="relative">
                      <img src={panel.heroImage} alt="" className="w-full h-32 object-cover rounded-lg" />
                      <p className="text-[10px] text-white/30 mt-2">Click to replace</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={18} className="text-white/20 mx-auto mb-2" />
                      <p className="text-[12px] text-white/30">{uploading ? 'Uploading...' : 'Click to upload hero image'}</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files)} />
                </div>
              </div>

              <Field label="Hero Headline">
                <Input value={panel.heroHeadline || ''} onChange={e => set('heroHeadline', e.target.value)} placeholder="THE EDIT" />
              </Field>
              <Field label="Hero Subheadline">
                <Input value={panel.heroSubheadline || ''} onChange={e => set('heroSubheadline', e.target.value)} placeholder="SS25 — Chapter II" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA Label">
                  <Input value={panel.ctaLabel || ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="EXPLORE" />
                </Field>
                <Field label="CTA Link">
                  <Input value={panel.ctaLink || ''} onChange={e => set('ctaLink', e.target.value)} placeholder="/shop" />
                </Field>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 shrink-0">
              <button onClick={() => setPanel(null)} className="flex-1 py-3 border border-white/[0.08] rounded-xl text-[12px] font-semibold text-white/40 hover:text-white hover:border-white/15 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-[#c9a96e] rounded-xl text-[12px] font-bold text-[#0a0a08] hover:bg-[#d4b87e] transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : panel.id ? 'Save Changes' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a16] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="text-[15px] font-bold text-white text-center mb-2">Delete Collection?</h3>
            <p className="text-[12px] text-white/40 text-center mb-6">
              "<span className="text-white/60">{deleteTarget.name}</span>" will be deleted. Products in this collection will remain.
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
