import { useState, useEffect, useRef } from 'react';
import { X, Check, Upload, Trash2, ArrowLeft, ArrowRight, ImageIcon, Video, Wand2, Loader2 } from 'lucide-react';
import { createProduct, updateProduct, generateSKU, validateProductData } from '../../services/admin/productAdminService';
import { uploadFile, deleteFileByUrl, compressImage, BUCKETS } from '../../services/storageService';
import { removeImageBackground } from '../../services/backgroundRemoval';
import { getAllCollections } from '../../services/admin/collectionAdminService';
import { toast } from '../../components/ui/ToastProvider';
import { useSiteStore } from '../../store/useSiteStore';

const STEPS = [
  { id: 1, label: 'Basic Info',  desc: 'Name, category, collection' },
  { id: 2, label: 'Images',      desc: 'Upload product photos' },
  { id: 3, label: 'Variants',    desc: 'Sizes and colors' },
  { id: 4, label: 'Pricing',     desc: 'Price, stock, status' },
  { id: 5, label: 'Publish',     desc: 'Review and go live' },
];

const SIZES = ['XS','S','M','L','XL','XXL','XXXL'];
const SHOE_SIZES = ['36','37','38','39','40','41','42','43','44','45','46'];
const SOCK_SIZES = ['S','M','L','XL'];

// Per-category sizing convention. Sweatshirts, Polo Shirts, Tank Tops, Crop
// Tops, Skirts, and Denim all use standard alpha sizing (the SIZES fallback
// below) — Skirts and Denim are streetwear-cut here, not tailored/numeric.
// Footwear and Socks get their own scales; Caps are snapback/adjustable, so
// there's no size to pick at all.
const SIZE_CONFIG = {
  Footwear: { options: SHOE_SIZES, label: 'Available Shoe Sizes' },
  Socks:    { options: SOCK_SIZES, label: 'Available Sizes', hint: 'S fits shoe 4–6 · M fits 6–9 · L fits 9–12 · XL fits 13+' },
  Caps:     { options: [], label: null, hint: 'One Size Fits All — snapback/adjustable, no size selection needed.' },
};
const getSizeConfig = (subcategory) => SIZE_CONFIG[subcategory] || { options: SIZES, label: 'Available Sizes' };
const PRESET_COLORS = ['Black','White','Navy','Beige','Grey','Brown','Olive','Burgundy','Cream'];
const PRODUCT_CATEGORIES = [
  'Sweatshirts',
  'Polo Shirts',
  'Tank Tops',
  'Caps',
  'Socks',
  'Skirts',
  'Crop Tops',
  'Denim',
  'Footwear',
  'Accessories',
];

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
  const [productId]             = useState(() => product?.id || crypto.randomUUID());
  const [removingBgIndex, setRemovingBgIndex] = useState(null);
  const [bgProgress, setBgProgress] = useState(0);
  const fileInputRef = useRef();

  const videoInputRef = useRef();

  // Clothing sizes (XS-XXXL) and shoe sizes (36-46) are two unrelated value
  // sets (see SIZE_CONFIG above). If a product switches category — e.g. was
  // tagged as a T-shirt with "XL" selected, then changed to Footwear —
  // "XL" has no button to un-select in the shoe-size picker and would
  // otherwise linger in form.sizes forever, showing up alongside the real
  // shoe size. Whenever the category changes, strip out sizes that don't
  // belong to the newly-active size system.

  const [form, setForm] = useState({
    name: '', sku: '', category: 'unisex', collection_id: '',
    subcategory: '', season: '',
    short_description: '', description: '',
    images: [], video_url: '',
    sizes: [], colors: [],
    price: '', compare_price: '', stock: '',
    is_new: false, is_featured: false, is_best_seller: false, is_limited_edition: false, status: 'ACTIVE',
  });

  useEffect(() => {
    getAllCollections().then(({ data }) => setCollections(data || []));
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        // Gender is no longer editable here — carry the existing value through unchanged
        category: product.category || 'unisex',
        collection_id: product.collection_id || '',
        subcategory: product.subcategory || '',
        // Season is no longer editable here — carry the existing value through unchanged
        season: product.season || '',
        short_description: product.short_description || '',
        description: product.description || '',
        images: product.images || [],
        video_url: product.video_url || '',
        sizes: product.sizes || [],
        colors: product.colors || [],
        price: product.price || '',
        compare_price: product.compare_price || '',
        stock: product.stock || '',
        // Tags/badges are no longer editable here — carry existing values through unchanged
        is_new: product.is_new || false,
        is_featured: product.is_featured || false,
        is_best_seller: product.is_best_seller || false,
        is_limited_edition: product.is_limited_edition || false,
        status: product.status || 'ACTIVE',
      });
    }
  }, [product]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })); };
  const toggle = (k, val, arr) => set(k, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  // Prune sizes that don't belong to the currently-active size system whenever
  // the category changes — covers both switching category in the UI and
  // loading an existing product whose sizes array already has a leftover
  // value from before it was tagged Footwear.
  useEffect(() => {
    const validSizes = getSizeConfig(form.subcategory).options;
    setForm(p => {
      const pruned = p.sizes.filter(s => validSizes.includes(s));
      return pruned.length === p.sizes.length ? p : { ...p, sizes: pruned };
    });
  }, [form.subcategory]);

  const handleImageUpload = async (files) => {
    if (!files?.length) return;
    
    // File validation (STEP 2: Allowed types: jpg, jpeg, png, webp, avif; size up to 30MB)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
    const maxSizeBytes = 30 * 1024 * 1024; // 30MB
    
    setUploading(true);
    setErrors(prev => ({ ...prev, images: null }));
    
    // Developer Logging (STEP 9)
    console.log('Uploading...');
    
    const uploaded = [];
    try {
      for (const file of Array.from(files)) {
        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
          throw new Error(`Invalid file format: .${extension}. Allowed formats: ${allowedExtensions.join(', ')}`);
        }
        if (file.size > maxSizeBytes) {
          throw new Error(`File is too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed: 30MB`);
        }
        
        // Custom filename & path format (STEP 5: product-images/{productId}/{timestamp}-{filename})
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const customFileName = `${timestamp}-${sanitizedName}`;
        
        const { url, error } = await uploadFile(file, {
          bucket: BUCKETS.PRODUCTS, // product-images
          folder: productId,
          fileName: customFileName
        });
        
        if (error) {
          throw new Error(error);
        }
        
        if (url) {
          // Developer Logging (STEP 9)
          console.log(`Image URL: ${url}`);
          uploaded.push(url);
        }
      }
      
      // Developer Logging (STEP 9)
      console.log('Upload complete');
      
      const newImages = [...form.images, ...uploaded];
      set('images', newImages);
    } catch (err) {
      console.error('Full error stack:', err);
      // STEP 8: If upload fails, display Upload Failed with actual Supabase error.
      toast(`Upload Failed: ${err.message}`, 'error');
      setErrors(prev => ({ ...prev, images: `Upload Failed: ${err.message}` }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => set('images', form.images.filter((_, i) => i !== idx));

  const moveImage = (fromIdx, toIdx) => {
    const updated = [...form.images];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    set('images', updated);
  };

  // Strips the background from an already-uploaded image (runs entirely in
  // the browser — no API key), then re-uploads the result as a transparent
  // PNG and swaps it into place.
  const handleRemoveBackground = async (idx) => {
    const sourceUrl = form.images[idx];
    setRemovingBgIndex(idx);
    setBgProgress(0);
    try {
      // Downscale before segmenting — source photos straight off a camera/
      // phone can be 40MP+, which makes in-browser background removal
      // extremely slow (or appear to hang) and memory-heavy. 1600px wide
      // is plenty for how these images are displayed on the site.
      const sourceResponse = await fetch(sourceUrl);
      const sourceBlob = await sourceResponse.blob();
      const sourceFile = new File([sourceBlob], 'source.jpg', { type: sourceBlob.type || 'image/jpeg' });
      const resized = await compressImage(sourceFile, 1600, 0.9);

      const resultBlob = await removeImageBackground(resized, setBgProgress);
      const file = new File([resultBlob], `bg-removed-${Date.now()}.png`, { type: 'image/png' });

      const { url, error } = await uploadFile(file, {
        bucket: BUCKETS.PRODUCTS,
        folder: productId,
        fileName: `${Date.now()}-no-bg.png`,
      });
      if (error) throw new Error(error);

      const updated = [...form.images];
      updated[idx] = url;
      set('images', updated);

      if (sourceUrl.includes('/storage/v1/object/public/')) {
        await deleteFileByUrl(sourceUrl);
      }

      toast('Background removed!', 'success');
    } catch (err) {
      console.error('Background removal failed:', err);
      toast(`Background removal failed: ${err.message}`, 'error');
    } finally {
      setRemovingBgIndex(null);
      setBgProgress(0);
    }
  };

  const handleVideoUpload = async (files) => {
    if (!files?.length) return;
    
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    setUploading(true);
    setErrors(prev => ({ ...prev, video: null }));
    
    // Developer Logging (STEP 9)
    console.log('Uploading...');
    
    try {
      const file = files[0];
      if (file.size > maxVideoSize) {
        throw new Error(`Video is too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Max size: 100MB`);
      }
      
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const customFileName = `${timestamp}-${sanitizedName}`;
      
      const { url, error } = await uploadFile(file, {
        bucket: BUCKETS.VIDEOS,
        folder: productId,
        fileName: customFileName
      });
      
      if (error) {
        throw new Error(error);
      }
      
      if (url) {
        // Developer Logging (STEP 9)
        console.log(`Video URL: ${url}`);
        set('video_url', url);
        // Developer Logging (STEP 9)
        console.log('Upload complete');
      }
    } catch (err) {
      console.error('Full error stack:', err);
      toast(`Upload Failed: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const addColor = (c) => { if (c && !form.colors.includes(c)) { set('colors', [...form.colors, c]); setCustomColor(''); } };

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = 'Product name is required';
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
      id: productId, // Align product ID with the generated folder ID
      price: parseFloat(form.price) || 0,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock) || 0,
      collection_id: form.collection_id || null,
      subcategory: form.subcategory || null,
      season: form.season || null,
      video_url: form.video_url || null,
      status: publish ? form.status : 'DRAFT',
    };
    
    const result = product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload);
      
    setSaving(false);
    
    if (result.error) {
      // Developer Logging (STEP 9)
      console.error('Full error stack:', result.error);
      setErrors({ submit: result.error });
      return;
    }
    
    // Developer Logging (STEP 9)
    console.log('Database updated');
    if (publish) {
      console.log('Product published');
    }
    
    // Refresh storefront state and cache instantly (STEP 7: 4. Refresh product cache, 5. Homepage updates instantly)
    try {
      await useSiteStore.getState().refreshProducts();
      await useSiteStore.getState().refreshHomepage();
    } catch (cacheErr) {
      console.warn('Cache refresh warning:', cacheErr);
    }
    
    onSave();
  };

  const stepDone = (s) => {
    if (s === 1) return !!form.name;
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
              <Field label="Product Category" error={errors.subcategory}>
                <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)}
                  className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors">
                  <option value="">— Select Category —</option>
                  {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Collection">
                <select value={form.collection_id} onChange={e => set('collection_id', e.target.value)}
                  className="w-full bg-[#0f0f0c] border border-white/[0.08] focus:border-white/25 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors">
                  <option value="">— No Collection —</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="SKU (optional)">
                <Input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="Auto-generated" />
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
              <div><h3 className="text-xl font-bold text-white">Product Images</h3><p className="text-white/30 text-sm mt-1">First image is the cover photo shown on product cards. Hover an uploaded image and click "Remove BG" to strip its background to transparent — takes a few seconds the first time while the tool loads.</p></div>
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

              {/* Video upload */}
              <div>
                <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Product Video (optional)</p>
                {form.video_url ? (
                  <div className="flex items-center gap-3 p-4 bg-[#141410] border border-white/[0.06] rounded-xl">
                    <Video size={18} className="text-blue-400 shrink-0" />
                    <p className="text-[12px] text-white/60 flex-1 truncate">{form.video_url}</p>
                    <button onClick={() => set('video_url', '')} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14} /></button>
                  </div>
                ) : (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400/30 hover:bg-blue-400/[0.02] transition-all"
                  >
                    <Video size={20} className="text-white/20 mx-auto mb-2" />
                    <p className="text-[12px] text-white/40">{uploading ? 'Uploading...' : 'Click to upload video'}</p>
                    <p className="text-[10px] text-white/20 mt-1">MP4, WEBM, MOV — up to 100MB</p>
                  </div>
                )}
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => handleVideoUpload(e.target.files)} />
              </div>
               {form.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/[0.04] hover:border-white/20 transition-all">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute top-2 left-2 bg-[#c9a96e] text-[#0a0a08] text-[9px] font-bold px-2 py-0.5 rounded-full">COVER</span>}

                      {/* Remove background */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveBackground(i); }}
                        disabled={removingBgIndex !== null}
                        title="Remove background"
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed"
                      >
                        {removingBgIndex === i ? (
                          <div className="flex flex-col items-center gap-1">
                            <Loader2 size={18} className="text-white animate-spin" />
                            <span className="text-[9px] text-white font-bold">{Math.round(bgProgress * 100)}%</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Wand2 size={16} className="text-white" />
                            <span className="text-[9px] text-white font-bold uppercase tracking-wide">Remove BG</span>
                          </div>
                        )}
                      </button>

                      {/* Delete button */}
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md">
                        <Trash2 size={12} className="text-white" />
                      </button>

                      {/* Reorder buttons */}
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); moveImage(i, i - 1); }}
                            className="w-6 h-6 bg-[#141410] border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-[#c9a96e] hover:text-[#0a0a08] transition-colors shadow-lg"
                          >
                            <ArrowLeft size={10} />
                          </button>
                        )}
                        {i < form.images.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); moveImage(i, i + 1); }}
                            className="w-6 h-6 bg-[#141410] border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-[#c9a96e] hover:text-[#0a0a08] transition-colors shadow-lg"
                          >
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Variants */}
          {step === 3 && (() => {
            const sizeConfig = getSizeConfig(form.subcategory);
            return (
            <div className="max-w-2xl space-y-8">
              <div><h3 className="text-xl font-bold text-white">Sizes & Colors</h3><p className="text-white/30 text-sm mt-1">Select all that apply. Leave blank if not applicable.</p></div>
              {sizeConfig.options.length === 0 ? (
                <Field label="Sizes">
                  <p className="text-white/40 text-[13px] bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3">{sizeConfig.hint}</p>
                </Field>
              ) : (
                <Field label={sizeConfig.label}>
                  <div className="flex flex-wrap gap-2">
                    {sizeConfig.options.map(s => (
                      <button key={s} type="button" onClick={() => toggle('sizes', s, form.sizes)}
                        className={`px-4 py-2.5 rounded-xl text-[12px] font-bold border transition-all
                          ${form.sizes.includes(s) ? 'bg-[#c9a96e] text-[#0a0a08] border-[#c9a96e]' : 'border-white/[0.08] text-white/40 hover:border-white/20 hover:text-white/70'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  {sizeConfig.hint && <p className="text-white/25 text-[11px] mt-2">{sizeConfig.hint}</p>}
                </Field>
              )}
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
            );
          })()}

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
              <Field label="Status">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['ACTIVE', 'In Stock'],
                    ['SOLD OUT', 'Out of Stock'],
                    ['PRE-ORDER', 'Pre-Order'],
                  ].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => set('status', v)}
                      className={`py-3 px-3 rounded-xl text-[11px] font-semibold border transition-all text-center
                        ${form.status === v ? 'bg-white/10 text-white border-white/20' : 'border-white/[0.06] text-white/30 hover:border-white/15'}`}>
                      {l}
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
                  <div className="flex flex-wrap gap-1.5 animate-pulse">
                    {form.is_new && <span className="inline-block bg-[#c9a96e]/20 text-[#c9a96e] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">New Arrival</span>}
                    {form.is_featured && <span className="inline-block bg-[#c9a96e]/20 text-[#c9a96e] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Featured</span>}
                    {form.is_best_seller && <span className="inline-block bg-[#c9a96e]/20 text-[#c9a96e] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Best Seller</span>}
                  </div>
                  <p className="text-xl font-bold text-white">{form.name || '—'}</p>
                  <p className="text-[12px] text-white/40">
                    {[
                      form.subcategory,
                      form.collection_id ? collections.find(c => c.id === form.collection_id)?.name : null,
                    ].filter(Boolean).join(' · ')}
                  </p>
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
