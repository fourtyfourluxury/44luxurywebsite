import { useState, useEffect, useRef } from 'react';
import {
  Upload, Trash2, Edit2, Plus, X, RefreshCw, GripVertical, Check, Image as ImageIcon,
  Settings, Type, Loader2
} from 'lucide-react';
import { getHomepageConfig, updateHomepageConfig, getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from '../../services/admin/homepageAdminService';
import { uploadFile, compressImage, BUCKETS } from '../../services/storageService';
import { toast } from '../../components/ui/ToastProvider';
import { useSiteStore } from '../../store/useSiteStore';

export default function HomepageManager() {
  const [config, setConfig] = useState(null);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { products } = useSiteStore(); 

  const [activeEditor, setActiveEditor] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const [{ data: cfg }, { data: sl }] = await Promise.all([
      getHomepageConfig(),
      getHeroSlides(),
    ]);
    setConfig(cfg || {});
    setSlides(sl || []);
    setLoading(false);
  };

  const saveConfig = async (key, data) => {
    const { error } = await updateHomepageConfig({ [key]: data });
    if (error) toast(error, 'error'); 
    else { 
      toast('Saved successfully!', 'success'); 
      setConfig(p => ({ ...p, [key]: data })); 
    }
    setActiveEditor(null);
  };

  const saveMultipleConfig = async (updates) => {
    const { error } = await updateHomepageConfig(updates);
    if (error) toast(error, 'error'); 
    else { 
      toast('Saved successfully!', 'success'); 
      setConfig(p => ({ ...p, ...updates })); 
    }
    setActiveEditor(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Helper to get featured products for preview
  const featuredProducts = (config?.featured_product_ids || [])
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Homepage Editor</h1>
          <p className="text-[12px] text-white/40 mt-1">Click any section to edit its content. Changes appear on the live site instantly.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-[11px] text-white/30 hover:text-white transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Visual WYSIWYG Editor Container */}
      <div className="border border-white/10 bg-[#0a0a08] overflow-hidden shadow-2xl flex flex-col" style={{ borderRadius: 0 }}>
        
        {/* ── Section 1: HERO — tall portrait like YL ── */}
        <div 
          onClick={() => setActiveEditor('hero')}
          className="relative w-full bg-[#1c1c18] cursor-pointer group flex items-center justify-center border-b border-white/10"
          style={{ aspectRatio: '4/5', maxHeight: '500px' }}
        >
          {slides.length > 0 ? (
            <img src={slides[0]?.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Hero" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col opacity-60">
              <ImageIcon size={40} className="text-white/20 mb-3" />
              <p className="text-xs text-white/30 uppercase tracking-widest">Upload Hero Image</p>
              <p className="text-[10px] text-white/20 mt-1">Tall portrait format — like YL Collectives</p>
            </div>
          )}
          {/* Section Label */}
          <div className="absolute top-4 left-4 bg-black/60 text-white/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 z-10">
            1. HERO CAROUSEL ({slides.length} images)
          </div>
          <div className="relative z-10 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300">
            <button className="bg-white text-black px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl">
              <Edit2 size={14} /> Edit Hero Carousel ({slides.length} slides)
            </button>
          </div>
        </div>

        {/* ── Section 2: PRODUCT GRID — 4×3 NEW ARRIVALS ── */}
        <div 
          onClick={() => setActiveEditor('featured')}
          className="relative w-full py-12 bg-[#0f0f0c] cursor-pointer group flex flex-col items-center justify-center border-b border-white/10"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
          {/* Header */}
          <div className="w-full px-8 mb-6 flex items-end justify-between">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">SUMMER SALES</p>
              <h2 className="font-unica text-3xl uppercase tracking-tighter text-white/70">NEW ARRIVALS</h2>
            </div>
            <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest border border-white/20 px-4 py-2">VIEW ALL →</span>
          </div>
          {/* 4-col grid preview */}
          <div className="grid grid-cols-4 gap-3 px-8 w-full opacity-60 group-hover:opacity-30 transition-opacity">
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 12).map(p => (
                <div key={p.id} className="aspect-[4/5] bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={16} className="text-white/10" />
                  )}
                </div>
              ))
            ) : (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-white/5 border border-white/10 flex items-center justify-center">
                  <ImageIcon size={14} className="text-white/10" />
                </div>
              ))
            )}
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-none">
            <p className="text-[10px] text-white/40 mb-3 uppercase tracking-widest">4 columns × 3 rows = 12 products</p>
            <button className="bg-white text-black px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl pointer-events-auto">
              <Edit2 size={14} /> Edit Featured Products ({config?.featured_product_ids?.length || 0}/12)
            </button>
          </div>
        </div>

        {/* ── Section 3: CATEGORIES SHOWCASE — 4 tiles ── */}
        <div
          onClick={() => setActiveEditor('categories')}
          className="relative w-full py-12 bg-[#0a0a08] cursor-pointer group flex flex-col items-center border-b border-white/10"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
          {/* Header */}
          <div className="w-full px-8 mb-6 text-center">
            <h2 className="font-unica text-3xl uppercase tracking-tighter text-white/70">YOUNG &amp; LIMITLESS</h2>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">CURATED CATEGORIES</p>
          </div>
          {/* 4 category tiles */}
          <div className="grid grid-cols-4 gap-3 px-8 w-full opacity-60 group-hover:opacity-30 transition-opacity">
            {['Sweatshirts', 'Accessories', 'Polo', 'Tank Tops'].map((cat, i) => (
              <div key={cat} className="aspect-[3/4] bg-white/5 border border-white/10 flex flex-col items-center justify-end pb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="relative z-10 text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">{cat}</span>
                <span className="relative z-10 text-[8px] border border-red-500/60 text-red-400/70 px-3 py-1 font-bold uppercase tracking-widest">SHOP NOW</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-none">
            <button className="bg-white text-black px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl pointer-events-auto">
              <Edit2 size={14} /> Edit Category Images &amp; Labels
            </button>
          </div>
        </div>
      </div>

      {/* Editor Modals */}
      {activeEditor === 'hero' && (
        <HeroEditorModal 
          slides={slides} 
          config={config}
          setSlides={setSlides} 
          reload={load} 
          onSaveConfig={saveMultipleConfig}
          onClose={() => setActiveEditor(null)} 
        />
      )}
      {activeEditor === 'featured' && (
        <FeaturedClothesModal 
          config={config?.featured_product_ids || []} 
          products={products}
          onSave={(data) => saveConfig('featured_product_ids', data)} 
          onClose={() => setActiveEditor(null)} 
        />
      )}
      {activeEditor === 'categories' && (
        <CategoriesInfoModal
          onClose={() => setActiveEditor(null)}
        />
      )}
      {(activeEditor === 'collections' || activeEditor === 'new_arrivals') && (
        <SplitContentModal 
          type={activeEditor}
          config={config || {}} 
          onSave={saveMultipleConfig} 
          onClose={() => setActiveEditor(null)} 
        />
      )}
    </div>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function ModalWrapper({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0f0f0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141410]">
          <h2 className="text-[14px] font-bold text-white uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

function HeroEditorModal({ slides, config, setSlides, reload, onSaveConfig, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('slides'); 
  const fileRef = useRef();

  const [slideDraft, setSlideDraft] = useState(null);
  const [savingSlide, setSavingSlide] = useState(false);

  const [settings, setSettings] = useState({
    hero_display_mode: config?.hero_display_mode || 'fade',
    hero_speed: config?.hero_speed || 5,
  });

  const uploadImg = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    toast('Compressing and uploading image...', 'info');
    
    try {
      // Compress the image before uploading to speed things up
      const compressedFile = await compressImage(files[0], 1920, 0.8);
      
      const { url } = await uploadFile(compressedFile, { bucket: BUCKETS.HERO_SLIDES, folder: 'hero' });
      if (url) {
        if (slideDraft) {
          setSlideDraft({ ...slideDraft, image: url });
        } else {
          setSlideDraft({ image: url, headline: '', subheadline: '', ctaLabel: '', ctaLink: '', textPosition: 'center', objectFit: 'cover' });
        }
      }
    } catch (err) {
      toast('Upload failed.', 'error');
    }
    
    setUploading(false);
  };

  const saveSlide = async () => {
    setSavingSlide(true);
    if (slideDraft.id) {
      await updateHeroSlide(slideDraft.id, slideDraft);
      toast('Slide updated!', 'success');
    } else {
      await createHeroSlide(slideDraft);
      toast('Slide added!', 'success');
    }
    setSavingSlide(false);
    setSlideDraft(null);
    reload();
  };

  const removeSlide = async (id) => {
    await deleteHeroSlide(id);
    toast('Slide removed', 'success');
    reload();
  };

  const handleSaveSettings = () => {
    onSaveConfig(settings);
  };

  return (
    <ModalWrapper title="Edit Hero Carousel" onClose={onClose}>
      
      {!slideDraft && (
        <div className="flex gap-4 border-b border-white/10 mb-6 pb-2">
          <button 
            onClick={() => setActiveTab('slides')}
            className={`text-xs font-bold uppercase tracking-widest pb-2 ${activeTab === 'slides' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/80'}`}
          >
            Slides
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`text-xs font-bold uppercase tracking-widest pb-2 ${activeTab === 'settings' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/80'}`}
          >
            Settings
          </button>
        </div>
      )}

      {slideDraft ? (
        <div className="space-y-4">
          <button onClick={() => setSlideDraft(null)} className="text-xs text-white/50 hover:text-white flex items-center gap-1 mb-2">
            ← Back to list
          </button>
          
          <div onClick={() => !uploading && fileRef.current?.click()}
            className={`border-2 border-dashed border-white/10 bg-white/[0.02] rounded-xl p-4 text-center ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/30 hover:bg-white/[0.04]'} transition-all overflow-hidden relative`}>
            {uploading ? (
              <div className="py-6 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-white/50 mb-2" size={24} />
                <p className="text-[13px] font-semibold text-white/80">Uploading Image...</p>
              </div>
            ) : slideDraft.image ? (
               <img src={slideDraft.image} className={`w-full h-32 object-${slideDraft.objectFit || 'cover'} opacity-80`} style={{ objectPosition: slideDraft.objectPosition || 'top' }} alt="Preview" />
            ) : (
              <div className="py-6">
                <Upload size={24} className="text-white/30 mx-auto mb-3" />
                <p className="text-[13px] font-semibold text-white/80">Click to change image</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => uploadImg(e.target.files)} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
               <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Image Fit</label>
               <select 
                 value={slideDraft.objectFit || 'cover'} 
                 onChange={e => setSlideDraft({...slideDraft, objectFit: e.target.value})}
                 className="w-full bg-[#141410] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none"
               >
                 <option value="cover">Fill Area Edge-to-Edge (Cropped)</option>
                 <option value="contain">Show Full Image (Uncropped, leaves gaps)</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Image Focus Point</label>
               <p className="text-[9px] text-white/30 mb-2">Choose which part of the image stays visible when it fills the screen</p>
               <select 
                 value={slideDraft.objectPosition || 'top'} 
                 onChange={e => setSlideDraft({...slideDraft, objectPosition: e.target.value})}
                 className="w-full bg-[#141410] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none"
               >
                 <option value="top">Top (Best for faces/heads)</option>
                 <option value="center">Center</option>
                 <option value="bottom">Bottom</option>
                 <option value="left">Left</option>
                 <option value="right">Right</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Headline (Optional)</label>
               <input value={slideDraft.headline || ''} onChange={e => setSlideDraft({...slideDraft, headline: e.target.value})} className="w-full bg-[#141410] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none" placeholder="e.g. THE NEW COLLECTION" />
            </div>
            <div>
               <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Subheadline (Optional)</label>
               <input value={slideDraft.subheadline || ''} onChange={e => setSlideDraft({...slideDraft, subheadline: e.target.value})} className="w-full bg-[#141410] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none" placeholder="e.g. SS25 IS HERE" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Button Text</label>
                 <input value={slideDraft.ctaLabel || ''} onChange={e => setSlideDraft({...slideDraft, ctaLabel: e.target.value})} className="w-full bg-[#141410] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none" placeholder="e.g. SHOP NOW" />
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Button Link</label>
                 <input value={slideDraft.ctaLink || ''} onChange={e => setSlideDraft({...slideDraft, ctaLink: e.target.value})} className="w-full bg-[#141410] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none" placeholder="e.g. /shop" />
              </div>
            </div>
          </div>
          
          <button onClick={saveSlide} disabled={savingSlide || uploading} className="w-full py-3 mt-4 bg-white text-black rounded-xl text-[12px] font-bold hover:bg-white/90 transition-colors disabled:opacity-50">
            {savingSlide ? 'Saving...' : 'Save Slide'}
          </button>
        </div>
      ) : activeTab === 'slides' ? (
        <div className="space-y-4">
          <div onClick={() => !uploading && fileRef.current?.click()}
            className={`border-2 border-dashed border-white/10 bg-white/[0.02] rounded-xl p-8 text-center ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/30 hover:bg-white/[0.04]'} transition-all`}>
            {uploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-white/50 mb-3" size={24} />
                <p className="text-[13px] font-semibold text-white/80">Uploading Image...</p>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-white/30 mx-auto mb-3" />
                <p className="text-[13px] font-semibold text-white/80">Click to add a new slide</p>
                <p className="text-[11px] text-white/40 mt-1">Recommended format: JPG/PNG</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => uploadImg(e.target.files)} />
          </div>

          <div className="space-y-2 mt-6">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Current Slides ({slides.length})</p>
            {slides.length === 0 && <p className="text-white/30 text-sm py-4">No slides yet.</p>}
            {slides.map((sl) => (
              <div key={sl.id} className="flex items-center gap-4 bg-[#141410] border border-white/10 rounded-xl p-3">
                <div className="w-20 h-12 rounded overflow-hidden shrink-0">
                  <img src={sl.image} alt="" className={`w-full h-full object-${sl.objectFit || 'cover'}`} />
                </div>
                <div className="flex-1 text-[11px] text-white/80 truncate">
                  <span className="font-bold">{sl.headline || 'No Text'}</span>
                  <p className="text-white/40 text-[9px] mt-0.5 truncate">{sl.image.split('/').pop()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSlideDraft(sl)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => removeSlide(sl.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Transition Effect</label>
            <div className="flex gap-3">
               <button 
                 onClick={() => setSettings({...settings, hero_display_mode: 'fade'})}
                 className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${settings.hero_display_mode === 'fade' ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:bg-white/5'}`}
               >
                 Fade
               </button>
               <button 
                 onClick={() => setSettings({...settings, hero_display_mode: 'slide'})}
                 className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${settings.hero_display_mode === 'slide' ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:bg-white/5'}`}
               >
                 Slide
               </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Transition Speed (Seconds)</label>
            <input 
              type="number"
              value={settings.hero_speed} 
              onChange={e => setSettings({...settings, hero_speed: Number(e.target.value)})}
              className="w-full bg-[#141410] border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors"
            />
          </div>
          <button onClick={handleSaveSettings} className="w-full py-3 mt-4 bg-[#c9a96e] text-black rounded-xl text-[12px] font-bold hover:bg-[#d4b87e] transition-colors">
            Save Settings
          </button>
        </div>
      )}
    </ModalWrapper>
  );
}

function FeaturedClothesModal({ config, products, onSave, onClose }) {
  const [selectedIds, setSelectedIds] = useState(config || []);

  const toggleProduct = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 12) {
        toast('Maximum 12 products allowed', 'error');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = () => {
    onSave(selectedIds);
  };

  return (
    <ModalWrapper title="Edit Featured Products — New Arrivals Grid" onClose={onClose}>
      <p className="text-[12px] text-white/60 mb-6">Select up to 12 products that appear in the homepage 4×3 grid. They display in the order you select them.</p>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {products.filter(p => p.status === 'ACTIVE').map(product => {
          const isSelected = selectedIds.includes(product.id);
          const index = selectedIds.indexOf(product.id);
          return (
            <div key={product.id} onClick={() => toggleProduct(product.id)}
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-white/10 border-white/20' : 'bg-[#141410] border-transparent hover:border-white/10'}`}>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'border-[#c9a96e] bg-[#c9a96e]' : 'border-white/20'}`}>
                {isSelected && <Check size={12} className="text-black" />}
              </div>
              <div className="w-10 h-10 rounded bg-white/5 overflow-hidden shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-white/10 m-auto mt-2" />
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-[12px] font-semibold text-white/90 truncate">{product.name}</p>
                <p className="text-[10px] text-white/40 mt-0.5 uppercase">{product.category}</p>
              </div>
              {isSelected && <div className="text-[10px] font-bold bg-white/10 text-white/80 px-2 py-1">{index + 1}</div>}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-[12px] font-semibold text-white/60 hover:text-white transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-3 bg-white text-black text-[12px] font-bold hover:bg-white/90 transition-colors">Save Selection ({selectedIds.length}/12)</button>
      </div>
    </ModalWrapper>
  );
}

function SplitContentModal({ type, config, onSave, onClose }) {
  const isCollections = type === 'collections';
  const keyName = isCollections ? 'collections_row' : 'new_arrivals';
  const blockConfig = config[keyName] || {};
  
  const [draft, setDraft] = useState({
    title: blockConfig.title || (isCollections ? 'COLLECTIONS' : 'NEW ARRIVALS'),
    image: blockConfig.image || ''
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const uploadImg = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    toast('Compressing and uploading image...', 'info');
    
    try {
      const compressedFile = await compressImage(files[0], 1920, 0.8);
      const { url } = await uploadFile(compressedFile, { bucket: BUCKETS.GENERAL, folder: 'split' });
      if (url) setDraft(p => ({ ...p, image: url }));
    } catch (err) {
      toast('Upload failed.', 'error');
    }
    
    setUploading(false);
  };

  const handleSave = () => {
    onSave({
      [keyName]: draft
    });
  };

  return (
    <ModalWrapper title={`Edit ${isCollections ? 'Collections' : 'New Arrivals'} Block`} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Display Title</label>
          <input 
            value={draft.title} 
            onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Background Image</label>
          <div onClick={() => !uploading && fileRef.current?.click()}
            className={`border-2 border-dashed border-white/10 bg-[#141410] rounded-xl p-2 text-center ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/30'} transition-all relative overflow-hidden group`}>
            
            {uploading ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-white/50 mb-2" size={24} />
                <p className="text-[12px] font-semibold text-white/80">Uploading Image...</p>
              </div>
            ) : draft.image ? (
              <div className="w-full h-40 relative">
                <img src={draft.image} alt="" className="w-full h-full object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <p className="text-[12px] font-bold text-white uppercase tracking-widest">Change Image</p>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <Upload size={20} className="text-white/30 mx-auto mb-2" />
                <p className="text-[12px] text-white/50">Click to upload</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => uploadImg(e.target.files)} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-[12px] font-semibold text-white/60 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={uploading} className="flex-1 py-3 bg-white text-black rounded-xl text-[12px] font-bold hover:bg-white/90 transition-colors disabled:opacity-50">Save Changes</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ── Categories Info Modal ─────────────────────────────────────────────────────
// Categories are currently hardcoded in CategoriesShowcase.jsx.
// This modal informs the admin and shows what they are.
function CategoriesInfoModal({ onClose }) {
  const categories = [
    { label: 'Sweatshirts', link: '/shop?q=sweatshirt' },
    { label: 'Accessories', link: '/shop?q=accessories' },
    { label: 'Polo', link: '/shop?q=polo' },
    { label: 'Tank Tops', link: '/shop?q=tank' },
  ];

  return (
    <ModalWrapper title="Category Showcase — 4 Tiles" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-[12px] text-white/60 leading-relaxed">
          The categories section shows 4 fixed tiles with images linking to shop filter pages. 
          The category images are curated Unsplash photos. Each tile links to a filtered shop page.
        </p>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Current Categories</p>
          {categories.map((cat, i) => (
            <div key={cat.label} className="flex items-center gap-4 bg-[#141410] border border-white/10 px-4 py-3">
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10">{i + 1}</span>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-white/90">{cat.label}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{cat.link}</p>
              </div>
              <span className="text-[9px] border border-red-500/50 text-red-400/70 px-3 py-1 font-bold uppercase tracking-widest">SHOP NOW</span>
            </div>
          ))}
        </div>

        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-4 py-3">
          <p className="text-[11px] text-[#D4AF37]/80 font-bold uppercase tracking-wider mb-1">How to Change Categories</p>
          <p className="text-[11px] text-white/50 leading-relaxed">
            To update category names, images, or links, ask your developer to edit 
            <span className="font-mono text-white/70 mx-1">src/components/home/CategoriesShowcase.jsx</span>
          </p>
        </div>

        <button onClick={onClose} className="w-full py-3 bg-white text-black text-[12px] font-bold hover:bg-white/90 transition-colors">
          Got It
        </button>
      </div>
    </ModalWrapper>
  );
}
