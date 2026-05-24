import { useState, useEffect, useRef } from 'react';
import { X, Check, ChevronRight, Upload, Trash2, ArrowLeft, ArrowRight, ImageIcon } from 'lucide-react';
import { createProduct, updateProduct, generateSKU, validateProductData } from '../../services/admin/productAdminService';
import { uploadFile, BUCKETS } from '../../services/storageService';
import { getAllCollections } from '../../services/admin/collectionAdminService';

const STEPS = [
  { id: 1, label: 'Basic Info',  desc: 'Name, category, collection' },
  { id: 2, label: 'Images',      desc: 'Upload product photos' },
  { id: 3, label: 'Variants',    desc: 'Sizes and colors' },
  { id: 4, label: 'Pricing',     desc: 'Price, stock, tags' },
  { id: 5, label: 'Publish',     desc: 'Review and go live' },
];

const SIZES = ['XS','S','M','L','XL','XXL','XXXL'];
const PRESET_COLORS = ['Black','White','Navy','Beige','Grey','Brown','Olive','Burgundy','Cream'];

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full bg-[#0f0f0c] border rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none transition-colors
      ${error ? 'border-red-500/50 focus:border-red-400' : 'border-white/[0.08] focus:border-white/25'}`}
  />
);

const Textarea = ({ rows = 4, ...props }) => (
  <textarea
    rows={rows}
    {...props}
    className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none resize-none transition-colors"
  />
);

export default function ProductEditor({ product, onClose, onSave }) {
  const [step, setStep]         = useState(1);
  const [collections, setCollections] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [customColor, setCustomColor] = useState('');
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    name: '',  sku: '',  category: 'men',  collection_id: '',
    short_description: '',  description: '',
    images: [],
    sizes: [],  colors: [],
    price: '',  compare_price: '',  stock: '',
    is_new: false,  is_featured: false,  status: 'DRAFT',
  });

  useEffect(() => {
    getAllCollections().then(({ data }) => setCollections(data || []));
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || 'men',
        collection_id: product.collection_id || '',
        short_description: product.short_description || '',
        description: product.description || '',
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        price: product.price || '',
        compare_price: product.compare_price || '',
        stock: product.stock || '',
        is_new: product.is_new || false,
        is_featured: product.is_featured || false,
        status: product.status || 'DRAFT',
      });
    }
  }, [product]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };
  const toggle = (k, val, arr) => set(k, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of Array.from(files)) {
      const { url, error } = await uploadFile(file, { bucket: BUCKETS.PRODUCTS, folder: 'products' });
      if (url) uploaded.push(url);
    }
    set('images', [...form.images, ...uploaded]);
    setUploading(false);
  };

  const removeImage = (idx) => set('images', form.images.filter((_, i) => i !== idx));

  const addColor = (c) => { if (c && !form.colors.includes(c)) { set('colors', [...form.colors, c]); setCustomColor(''); } };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = 'Product name is required';
      if (!form.category)    e.category = 'Category is required';
    }
    if (step === 2 && form.images.length === 0) e.images = 'At least one image is required';
    if (step === 4) {
      if (!form.price || form.price <= 0) e.price = 'Valid price is required';
      if (form.stock === '' || form.stock < 0) e.stock = 'Stock quantity is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 5)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = async (publish = false) => {
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock) || 0,
      collection_id: form.collection_id || null,
      status: publish ? 'ACTIVE' : form.status,
    };
    const result = product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload);
    setSaving(false);
    if (result.error) { setErrors({ submit: result.error }); return; }
    onSave();
  };

  const stepDone = (s) => {
    if (s === 1) return !!form.name && !!form.category;
    if (s === 2) return form.images.length > 0;
    if (s === 3) return true;
    if (s === 4) return !!form.price && form.stock !== '';
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex">
      {/* Step Sidebar */}
      <div className="w-64 bg-[#0a0a08] border-r border-white/[0.06] flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">{product ? 'Edit' : 'New'} Product</p>
          <h2 className="text-[15px] font-bold text-white mt-0.5 truncate">{form.name || 'Untitled'}</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {STEPS.map(s => {
            const done = stepDone(s.id);
            const active = step === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${active ? 'bg-[#c9a96e]/10' : 'hover:bg-white/[0.03]'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-all
                  ${active ? 'bg-[#c9a96e] text-[#0a0a08]' : done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/25'}`}>
                  {done && !active ? <Check size={11} /> : s.id}
                </div>
                <div>
                  <p className={`text-[12px] font-semibold ${active ? 'text-[#c9a96e]' : 'text-white/50'}`}>{s.label}</p>
                  <p className="text-[10px] text-white/25">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex items-center gap-2 text-[11px] text-white/30 hover:text-white/60 transition-colors">
            <X size={13} /> Close without saving
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0f0f0c]">
        <div className="flex-1 overflow-y-auto px-10 py-8">

          {/* STEP 1 — Basic Info */}
          {step === 1 && (
            <div className="max-w-2xl space-y-6">
              <div><h3 className="text-xl font-bold text-white">Basic Information</h3><p className="text-white/30 text-sm mt-1">Start with the product name and category.</p></div>
              <Field label="Product Name" required error={errors.name}>
                <Input value={form.name} onChange={e => { set('name', e.target.value); if (!form.sku) set('sku', generateSKU(e.target.value, form.category)); }} placeholder="e.g. Signature Cargo Trousers" error={errors.name} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category" required error={errors.category}>
                  <div className="flex gap-2">
                    {['men','women','unisex'].map(c => (
                      <button key={c} type="button" onClick={() => set('category', c)}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border
                          ${form.category === c ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]' : 'border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/70'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="SKU (optional)">
                  <Input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="Auto-generated" />
                </Field>
              </div>
              <Field label="Collection">
                <select value={form.collection_id} onChange={e => set('collection_id', e.target.value)}
                  className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors">
                  <option value="">— No Collection —</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Short Description">
                <Textarea rows={2} value={form.short_description} onChange={e => set('short_description', e.target.value)} placeholder="One or two lines shown on product cards..." />
              </Field>
              <Field label="Full Description">
                <Textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Detailed product description shown on product page..." />
              </Field>
            </div>
          )}

          {/* STEP 2 — Images */}
          {step === 2 && (
            <div className="max-w-2xl space-y-6">
              <div><h3 className="text-xl font-bold text-white">Product Images</h3><p className="text-white/30 text-sm mt-1">First image is the cover photo shown on product cards.</p></div>
              {errors.images && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">{errors.images}</p>}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer hover:border-[#c9a96e]/30 hover:bg-[#c9a96e]/[0.02] transition-all group"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#c9a96e]/10 transition-colors">
                  <Upload size={20} className="text-white/30 group-hover:text-[#c9a96e] transition-colors" />
                </div>
                <p className="text-[13px] font-semibold text-white/50">
                  {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
                </p>
                <p className="text-[11px] text-white/25 mt-1">JPG, PNG, WEBP — up to 30MB each</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(e.target.files)} />
              </div>
              {form.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-white/5">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute top-2 left-2 bg-[#c9a96e] text-[#0a0a08] text-[9px] font-bold px-2 py-0.5 rounded-full">COVER</span>}
                      <button onClick={() => removeImage(i)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <Trash2 size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Variants */}
          {step === 3 && (
            <div className="max-w-2xl space-y-8">
              <div><h3 className="text-xl font-bold text-white">Sizes & Colors</h3><p className="text-white/30 text-sm mt-1">Select all that apply. Leave blank if not applicable.</p></div>
              <Field label="Available Sizes">
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggle('sizes', s, form.sizes)}
                      className={`px-4 py-2.5 rounded-xl text-[12px] font-bold border transition-all
                        ${form.sizes.includes(s) ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]' : 'border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/70'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Available Colors">
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => toggle('colors', c, form.colors)}
                      className={`px-3 py-2 rounded-xl text-[12px] font-medium border transition-all
                        ${form.colors.includes(c) ? 'bg-white/10 text-white border-white/30' : 'border-white/[0.06] text-white/40 hover:border-white/15'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={customColor} onChange={e => setCustomColor(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addColor(customColor)}
                    placeholder="Add custom color..." className="flex-1 bg-[#0f0f0c] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none" />
                  <button type="button" onClick={() => addColor(customColor)} className="px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-[12px] text-white/50 hover:text-white hover:border-white/15 transition-colors">Add</button>
                </div>
                {form.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.colors.map(c => (
                      <span key={c} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-white/70">
                        {c} <button onClick={() => toggle('colors', c, form.colors)} className="text-white/30 hover:text-red-400 transition-colors"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          )}

          {/* STEP 4 — Pricing */}
          {step === 4 && (
            <div className="max-w-2xl space-y-6">
              <div><h3 className="text-xl font-bold text-white">Pricing & Stock</h3><p className="text-white/30 text-sm mt-1">Set the price, compare price for sale display, and stock level.</p></div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₦)" required error={errors.price}>
                  <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" error={errors.price} />
                </Field>
                <Field label="Compare Price (₦)" >
                  <Input type="number" value={form.compare_price} onChange={e => set('compare_price', e.target.value)} placeholder="Shown as strikethrough" />
                </Field>
              </div>
              <Field label="Stock Quantity" required error={errors.stock}>
                <Input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" error={errors.stock} />
              </Field>
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Tags</p>
                {[{ k: 'is_new', label: 'New Arrival', desc: 'Shows "NEW" badge and appears in New Arrivals section' }, { k: 'is_featured', label: 'Featured', desc: 'Appears in the Featured Products section on homepage' }].map(t => (
                  <label key={t.k} className="flex items-start gap-4 p-4 bg-[#141410] border border-white/[0.06] rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                    <div onClick={() => set(t.k, !form[t.k])} className={`w-10 h-6 rounded-full relative transition-colors shrink-0 mt-0.5 cursor-pointer ${form[t.k] ? 'bg-[#c9a96e]' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form[t.k] ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white/70">{t.label}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Field label="Status">
                <div className="flex gap-2">
                  {[['DRAFT', 'Draft — not visible on storefront'], ['ACTIVE', 'Active — live on storefront'], ['SOLD_OUT', 'Sold Out']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => set('status', v)}
                      className={`flex-1 py-3 px-3 rounded-xl text-[11px] font-semibold border transition-all text-center
                        ${form.status === v ? 'bg-white/10 text-white border-white/20' : 'border-white/[0.06] text-white/30 hover:border-white/15'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 5 — Preview */}
          {step === 5 && (
            <div className="max-w-2xl space-y-6">
              <div><h3 className="text-xl font-bold text-white">Review & Publish</h3><p className="text-white/30 text-sm mt-1">Check everything looks right, then publish.</p></div>
              {errors.submit && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">{errors.submit}</p>}
              <div className="flex gap-6">
                <div className="w-40 h-52 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                  {form.images[0] ? <img src={form.images[0]} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={28} className="text-white/15 m-auto mt-20" />}
                </div>
                <div className="space-y-3 flex-1">
                  {form.is_new && <span className="inline-block bg-[#c9a96e]/20 text-[#c9a96e] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">New Arrival</span>}
                  <p className="text-xl font-bold text-white">{form.name || '—'}</p>
                  <p className="text-[12px] text-white/40">{form.category?.toUpperCase()} {form.collection_id ? `· ${collections.find(c=>c.id===form.collection_id)?.name}` : ''}</p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-xl font-bold text-white">₦{form.price ? parseFloat(form.price).toLocaleString() : '0'}</p>
                    {form.compare_price && <p className="text-[13px] text-white/30 line-through">₦{parseFloat(form.compare_price).toLocaleString()}</p>}
                  </div>
                  <p className="text-[12px] text-white/40">Stock: {form.stock || 0} · {form.images.length} image{form.images.length !== 1 ? 's' : ''}</p>
                  {form.sizes.length > 0 && <p className="text-[11px] text-white/30">Sizes: {form.sizes.join(', ')}</p>}
                  {form.colors.length > 0 && <p className="text-[11px] text-white/30">Colors: {form.colors.join(', ')}</p>}
                </div>
              </div>
              <div className="border-t border-white/[0.06] pt-6 flex gap-3">
                <button onClick={() => handleSave(false)} disabled={saving}
                  className="flex-1 py-3.5 border border-white/10 rounded-xl text-[13px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40">
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button onClick={() => handleSave(true)} disabled={saving}
                  className="flex-1 py-3.5 bg-[#c9a96e] rounded-xl text-[13px] font-bold text-[#0a0a08] hover:bg-[#d4b87e] transition-colors disabled:opacity-40">
                  {saving ? 'Publishing...' : '🚀 Publish Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Nav */}
        <div className="border-t border-white/[0.06] px-10 py-4 flex items-center justify-between bg-[#0a0a08]">
          <button onClick={back} disabled={step === 1}
            className="flex items-center gap-2 text-[12px] font-semibold text-white/30 hover:text-white/70 transition-colors disabled:opacity-20">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex gap-1.5">
            {STEPS.map(s => <div key={s.id} className={`h-1.5 rounded-full transition-all ${s.id === step ? 'w-6 bg-[#c9a96e]' : stepDone(s.id) ? 'w-3 bg-emerald-500/50' : 'w-3 bg-white/10'}`} />)}
          </div>
          {step < 5 ? (
            <button onClick={next}
              className="flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-5 py-2.5 rounded-xl text-[12px] font-bold hover:bg-[#d4b87e] transition-colors">
              Next <ArrowRight size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
