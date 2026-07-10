import { useState, useEffect, useRef } from 'react';
import {
  Upload, Trash2, Edit2, Plus, X, RefreshCw, GripVertical, Check, Image as ImageIcon,
  Settings, Type, Loader2, ArrowUp, ArrowDown
} from 'lucide-react';
import { getHomepageConfig, updateHomepageConfig, getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from '../../services/admin/homepageAdminService';
import { uploadFile, compressImage, deleteFileByUrl, BUCKETS } from '../../services/storageService';
import { toast } from '../../components/ui/ToastProvider';
import { useSiteStore } from '../../store/useSiteStore';

const isVideo = (name = '') => /\.(mp4|webm|mov)$/i.test(name) || name.includes('/video/');

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
      setConfig(p => {
        const updatedSections = { ...(p?.sections || {}), [key]: data };
        return {
          ...p,
          sections: updatedSections,
          _rawSections: { ...(p?._rawSections || {}), [key]: data },
          [key]: data
        };
      }); 
    }
    setActiveEditor(null);
  };

  const saveMultipleConfig = async (updates) => {
    const { error } = await updateHomepageConfig(updates);
    if (error) toast(error, 'error'); 
    else { 
      toast('Saved successfully!', 'success'); 
      setConfig(p => {
        const updatedSections = { ...(p?.sections || {}), ...updates };
        return {
          ...p,
          ...updates,
          sections: updatedSections,
          _rawSections: { ...(p?._rawSections || {}), ...updates }
        };
      }); 
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
            <h2 className="font-unica text-3xl uppercase tracking-tighter text-white/70">44 LUXURY</h2>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1">CURATED CATEGORIES</p>
          </div>
          {/* 4 category tiles */}
          <div className="grid grid-cols-4 gap-3 px-8 w-full opacity-60 group-hover:opacity-30 transition-opacity">
            {(config?.sections?.categories || config?.categories || [
              { label: 'Sweatshirts', image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&q=85&auto=format&fit=crop' },
              { label: 'Accessories', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&q=85&auto=format&fit=crop' },
              { label: 'Polo', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=700&q=85&auto=format&fit=crop' },
              { label: 'Tank Tops', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=85&auto=format&fit=crop' }
            ]).map((cat, i) => (
              <div key={i} className="aspect-[4/5] bg-white/5 border border-white/10 flex flex-col items-center justify-end pb-4 relative overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="relative z-10 text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2 text-center px-1 truncate w-full">{cat.label}</span>
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

        {/* ── Section 4: CONTACT PAGE BANNER ── */}
        <div
          onClick={() => setActiveEditor('contact_hero')}
          className="relative w-full py-12 bg-[#0c0c09] cursor-pointer group flex flex-col items-center border-b border-white/10"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
          <div className="w-full px-8 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[9px] bg-black/60 text-white/60 font-bold uppercase tracking-widest px-3 py-1.5">
                4. CONTACT PAGE HERO BANNER
              </span>
              <p className="text-[10px] text-white/30 mt-2 font-mono">
                {config?.sections?.contact_hero?.image ? 'Dynamic Image Active' : 'Default Asset Active'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {config?.sections?.contact_hero?.visible !== false ? (
                <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2.5 py-1 uppercase tracking-widest">ENABLED</span>
              ) : (
                <span className="text-[9px] text-white/30 font-bold bg-white/5 px-2.5 py-1 uppercase tracking-widest">DISABLED</span>
              )}
            </div>
          </div>
          <div className="w-full px-8 opacity-60 group-hover:opacity-30 transition-opacity">
            <div className="aspect-[4/5] max-w-[200px] mx-auto bg-white/5 border border-white/10 overflow-hidden relative flex items-center justify-center">
              {config?.sections?.contact_hero?.image ? (
                <img src={config?.sections?.contact_hero?.image} className="w-full h-full object-cover" alt="Contact Hero Preview" />
              ) : (
                <img src="/lifestyle-contact.jpg" className="w-full h-full object-cover" alt="Contact Hero Preview Default" />
              )}
              <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                <p className="text-[8px] font-bold text-white/70 uppercase tracking-widest mb-1">{config?.sections?.contact_hero?.subtitle || 'GET IN TOUCH'}</p>
                <h3 className="font-unica text-xl text-white uppercase leading-none">{config?.sections?.contact_hero?.title || 'CONTACT'}</h3>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-none">
            <button className="bg-white text-black px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl pointer-events-auto">
              <Edit2 size={14} /> Edit Contact Banner
            </button>
          </div>
        </div>

        {/* ── Section 5: FAQ PAGE BANNER ── */}
        <div
          onClick={() => setActiveEditor('faq_hero')}
          className="relative w-full py-12 bg-[#090907] cursor-pointer group flex flex-col items-center"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
          <div className="w-full px-8 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[9px] bg-black/60 text-white/60 font-bold uppercase tracking-widest px-3 py-1.5">
                5. FAQ PAGE HERO BANNER
              </span>
              <p className="text-[10px] text-white/30 mt-2 font-mono">
                {config?.sections?.faq_hero?.image ? 'Dynamic Image Active' : 'Default Asset Active'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {config?.sections?.faq_hero?.visible !== false ? (
                <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2.5 py-1 uppercase tracking-widest">ENABLED</span>
              ) : (
                <span className="text-[9px] text-white/30 font-bold bg-white/5 px-2.5 py-1 uppercase tracking-widest">DISABLED</span>
              )}
            </div>
          </div>
          <div className="w-full px-8 opacity-60 group-hover:opacity-30 transition-opacity">
            <div className="aspect-[4/5] max-w-[200px] mx-auto bg-white/5 border border-white/10 overflow-hidden relative flex items-center justify-center">
              {config?.sections?.faq_hero?.image ? (
                <img src={config?.sections?.faq_hero?.image} className="w-full h-full object-cover" alt="FAQ Hero Preview" />
              ) : (
                <img src="/lifestyle-faq.jpg" className="w-full h-full object-cover" alt="FAQ Hero Preview Default" />
              )}
              <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                <p className="text-[8px] font-bold text-white/70 uppercase tracking-widest mb-1">{config?.sections?.faq_hero?.subtitle || 'HELP & INFORMATION'}</p>
                <h3 className="font-unica text-xl text-white uppercase leading-none">{config?.sections?.faq_hero?.title || 'FAQ'}</h3>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-none">
            <button className="bg-white text-black px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl pointer-events-auto">
              <Edit2 size={14} /> Edit FAQ Banner
            </button>
          </div>
        </div>

        {/* ── Section 6: HOMEPAGE STORE MAP ── */}
        <div
          onClick={() => setActiveEditor('contact_map')}
          className="relative w-full py-10 bg-[#06060502] cursor-pointer group flex flex-col items-center border-t border-white/10"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
          <div className="w-full px-8 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[9px] bg-black/60 text-white/60 font-bold uppercase tracking-widest px-3 py-1.5">
                6. FLAGSHIP STORE MAP (HOMEPAGE)
              </span>
              <p className="text-[10px] text-white/30 mt-2 font-mono">
                {config?.sections?.contact_map?.address || 'Shariff Plaza, Banex Wuse 2, Shop C426, Abuja, Nigeria'}
              </p>
              <p className="text-[9px] text-white/20 mt-1 font-mono">
                lat: {config?.sections?.contact_map?.lat ?? '9.0573'} · lng: {config?.sections?.contact_map?.lng ?? '7.4845'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {config?.sections?.contact_map?.visible !== false ? (
                <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-2.5 py-1 uppercase tracking-widest">VISIBLE</span>
              ) : (
                <span className="text-[9px] text-white/30 font-bold bg-white/5 px-2.5 py-1 uppercase tracking-widest">HIDDEN</span>
              )}
            </div>
          </div>

          {/* Map preview thumbnail */}
          <div className="w-full px-8 opacity-60 group-hover:opacity-30 transition-opacity">
            <div className="w-full max-w-[560px] mx-auto h-[110px] bg-[#1a1a14] border border-white/10 overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4b0e1e]/60"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <p className="text-[9px] font-grotesk uppercase tracking-widest text-white/30">Interactive Google Map · JS API</p>
                <p className="text-[8px] font-grotesk text-white/20">{config?.sections?.contact_map?.sectionTitle || 'VISIT OUR FLAGSHIP STORE'}</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 pointer-events-none">
            <button className="bg-white text-black px-6 py-2.5 font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl pointer-events-auto">
              <Edit2 size={14} /> Edit Store Map & Location
            </button>
          </div>
        </div>
      </div>

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
        <CategoriesEditorModal
          config={config}
          onSave={(data) => saveConfig('categories', data)}
          onClose={() => setActiveEditor(null)}
        />
      )}
      {(activeEditor === 'contact_hero' || activeEditor === 'faq_hero') && (
        <PageBannerEditorModal
          page={activeEditor === 'contact_hero' ? 'contact' : 'faq'}
          config={config}
          onSave={(data) => saveConfig(activeEditor, data)}
          onClose={() => setActiveEditor(null)}
        />
      )}
      {activeEditor === 'contact_map' && (
        <ContactMapEditorModal
          config={config}
          onSave={(data) => saveConfig('contact_map', data)}
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
    const isVideoFile = isVideo(files[0].name) || files[0].type.startsWith('video/');
    toast(isVideoFile ? 'Uploading video...' : 'Compressing and uploading image...', 'info');
    
    try {
      let fileToUpload = files[0];
      if (!isVideoFile) {
        fileToUpload = await compressImage(files[0], 1920, 0.8);
      }
      
      const { url } = await uploadFile(fileToUpload, { bucket: BUCKETS.HERO_SLIDES, folder: 'hero' });
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
               isVideo(slideDraft.image) ? (
                 <video src={slideDraft.image} className={`w-full h-32 object-${slideDraft.objectFit || 'cover'} opacity-80`} style={{ objectPosition: slideDraft.objectPosition || 'top' }} muted autoPlay loop />
               ) : (
                 <img src={slideDraft.image} className={`w-full h-32 object-${slideDraft.objectFit || 'cover'} opacity-80`} style={{ objectPosition: slideDraft.objectPosition || 'top' }} alt="Preview" />
               )
            ) : (
              <div className="py-6">
                <Upload size={24} className="text-white/30 mx-auto mb-3" />
                <p className="text-[13px] font-semibold text-white/80">Click to change media</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => uploadImg(e.target.files)} />
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
                <div className="w-20 h-12 rounded overflow-hidden shrink-0 bg-black flex items-center justify-center">
                  {isVideo(sl.image) ? (
                    <video src={sl.image} className={`w-full h-full object-${sl.objectFit || 'cover'}`} muted />
                  ) : (
                    <img src={sl.image} alt="" className={`w-full h-full object-${sl.objectFit || 'cover'}`} />
                  )}
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
    const isVideoFile = isVideo(files[0].name) || files[0].type.startsWith('video/');
    toast(isVideoFile ? 'Uploading video...' : 'Compressing and uploading image...', 'info');
    
    try {
      let fileToUpload = files[0];
      if (!isVideoFile) {
        fileToUpload = await compressImage(files[0], 1920, 0.8);
      }
      const { url } = await uploadFile(fileToUpload, { bucket: BUCKETS.GENERAL, folder: 'split' });
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
              <div className="w-full h-40 relative bg-black flex items-center justify-center">
                {isVideo(draft.image) ? (
                  <video src={draft.image} className="w-full h-full object-cover rounded-lg" muted autoPlay loop />
                ) : (
                  <img src={draft.image} alt="" className="w-full h-full object-cover rounded-lg" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <p className="text-[12px] font-bold text-white uppercase tracking-widest">Change Media</p>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <Upload size={20} className="text-white/30 mx-auto mb-2" />
                <p className="text-[12px] text-white/50">Click to upload</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => uploadImg(e.target.files)} />
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

// ── Categories Editor Modal ───────────────────────────────────────────────────
function CategoriesEditorModal({ config, onSave, onClose }) {
  const defaultCategories = [
    {
      label: 'Sweatshirts',
      slug: '/shop?q=sweatshirt',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&q=85&auto=format&fit=crop',
    },
    {
      label: 'Accessories',
      slug: '/shop?q=accessories',
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&q=85&auto=format&fit=crop',
    },
    {
      label: 'Polo',
      slug: '/shop?q=polo',
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=700&q=85&auto=format&fit=crop',
    },
    {
      label: 'Tank Tops',
      slug: '/shop?q=tank',
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=85&auto=format&fit=crop',
    },
  ];

  const initialCategories = config?.sections?.categories || config?.categories || defaultCategories;
  const [categories, setCategories] = useState(JSON.parse(JSON.stringify(initialCategories)));
  const [editingIndex, setEditingIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setCategories(updated);
  };

  const handleUploadImage = async (files, index) => {
    if (!files?.length) return;
    setUploading(true);
    toast('Compressing and uploading category image...', 'info');

    try {
      const compressed = await compressImage(files[0], 1200, 0.8);
      
      // Clean up previous dynamic image from Supabase storage if applicable
      const oldUrl = categories[index].image;
      if (oldUrl && oldUrl.includes('/storage/v1/object/public/')) {
        await deleteFileByUrl(oldUrl);
      }

      const { url } = await uploadFile(compressed, { bucket: BUCKETS.HOMEPAGE, folder: 'homepage/categories' });
      if (url) {
        const updated = [...categories];
        updated[index].image = url;
        setCategories(updated);
        toast('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      toast('Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClearImage = async (index) => {
    const oldUrl = categories[index].image;
    if (oldUrl && oldUrl.includes('/storage/v1/object/public/')) {
      await deleteFileByUrl(oldUrl);
    }
    const updated = [...categories];
    updated[index].image = '';
    setCategories(updated);
    toast('Image cleared.', 'info');
  };

  const handleUpdateField = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;
    setCategories(updated);
  };

  const handleSave = () => {
    onSave(categories);
  };

  return (
    <ModalWrapper title="Edit Curated Categories (4 Tiles)" onClose={onClose}>
      <div className="space-y-4 overflow-y-auto pr-1 max-h-[70vh]">
        {editingIndex === null ? (
          <>
            <p className="text-[12px] text-white/55 mb-3 font-grotesk tracking-wide leading-relaxed">
              Reorder, edit, or upload custom cover campaign photos (4:5 aspect ratio) for each of the 4 homepage category showcase tiles.
            </p>
            <div className="space-y-3">
              {categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#141410] border border-white/10 p-3 rounded-xl">
                  <div className="w-16 h-20 bg-white/5 border border-white/10 overflow-hidden relative flex items-center justify-center shrink-0">
                    {cat.image ? (
                      <img src={cat.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <ImageIcon size={18} className="text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-white truncate">{cat.label || 'Unnamed Category'}</p>
                    <p className="text-[10px] text-white/40 mt-1 truncate">{cat.slug || 'No Link'}</p>
                  </div>
                  
                  {/* Reorder and Edit Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => handleMove(i, -1)} 
                      disabled={i === 0}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button 
                      onClick={() => handleMove(i, 1)} 
                      disabled={i === categories.length - 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button 
                      onClick={() => setEditingIndex(i)} 
                      className="ml-1 px-3 py-1.5 bg-white/5 hover:bg-white/15 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-[12px] font-semibold text-white/60 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-white text-black rounded-xl text-[12px] font-bold hover:bg-white/90 transition-colors">Save Category Config</button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setEditingIndex(null)} className="text-xs text-[#c9a96e] hover:underline flex items-center gap-1 mb-2">
              ← Back to Categories List
            </button>
            
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Editing Tile {editingIndex + 1}: {categories[editingIndex].label}</h4>
            
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Category Cover Image</label>
              <div 
                onClick={() => !uploading && fileRef.current?.click()}
                className={`border-2 border-dashed border-white/10 bg-[#141410] rounded-xl p-2 text-center transition-all relative overflow-hidden group ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/30'}`}
              >
                {uploading ? (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <Loader2 className="animate-spin text-white/50 mb-2" size={20} />
                    <p className="text-[11px] text-white/80">Uploading to Supabase...</p>
                  </div>
                ) : categories[editingIndex].image ? (
                  <div className="w-full h-40 relative bg-black flex items-center justify-center">
                    <img src={categories[editingIndex].image} alt="" className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <p className="text-[11px] font-bold text-white uppercase tracking-widest">Change Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload size={18} className="text-white/30 mx-auto mb-2" />
                    <p className="text-[11px] text-white/50">Click to upload custom cover</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleUploadImage(e.target.files, editingIndex)} />
              </div>
              {categories[editingIndex].image && (
                <button 
                  onClick={() => handleClearImage(editingIndex)}
                  className="mt-2 text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Trash2 size={11} /> Clear cover image
                </button>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Category Label</label>
              <input 
                value={categories[editingIndex].label} 
                onChange={e => handleUpdateField(editingIndex, 'label', e.target.value)}
                className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none transition-colors"
                placeholder="e.g. Outerwear"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Shop Link (URL Path)</label>
              <input 
                value={categories[editingIndex].slug} 
                onChange={e => handleUpdateField(editingIndex, 'slug', e.target.value)}
                className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none transition-colors"
                placeholder="e.g. /shop?q=sweatshirt"
              />
            </div>

            <button 
              onClick={() => setEditingIndex(null)}
              className="w-full py-3 mt-2 bg-[#c9a96e] text-black rounded-xl text-[12px] font-bold hover:bg-[#d4b87e] transition-colors"
            >
              Done Editing Tile
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}

// ── Page Banner Editor Modal ───────────────────────────────────────────────────
function PageBannerEditorModal({ page, config, onSave, onClose }) {
  const isContact = page === 'contact';
  const defaultTitle = isContact ? 'CONTACT' : 'FAQ';
  const defaultSubtitle = isContact ? 'GET IN TOUCH' : 'HELP & INFORMATION';
  const defaultImage = isContact ? '/lifestyle-contact.jpg' : '/lifestyle-faq.jpg';
  
  const pageKey = isContact ? 'contact_hero' : 'faq_hero';
  const currentBanner = config?.sections?.[pageKey] || {};

  const [draft, setDraft] = useState({
    title: currentBanner.title || defaultTitle,
    subtitle: currentBanner.subtitle || defaultSubtitle,
    image: currentBanner.image || defaultImage,
    visible: currentBanner.visible !== false,
  });

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUploadImage = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    toast('Compressing and uploading banner image...', 'info');

    try {
      const compressed = await compressImage(files[0], 2000, 0.8);
      
      // Clear old dynamic image if present
      if (draft.image && draft.image.includes('/storage/v1/object/public/')) {
        await deleteFileByUrl(draft.image);
      }

      const { url } = await uploadFile(compressed, { bucket: BUCKETS.HOMEPAGE, folder: page });
      if (url) {
        setDraft(d => ({ ...d, image: url }));
        toast('Banner uploaded successfully!', 'success');
      }
    } catch (err) {
      toast('Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClearImage = async () => {
    if (draft.image && draft.image.includes('/storage/v1/object/public/')) {
      await deleteFileByUrl(draft.image);
    }
    setDraft(d => ({ ...d, image: '' }));
    toast('Image cleared.', 'info');
  };

  const handleSave = () => {
    onSave(draft);
  };

  return (
    <ModalWrapper title={`Edit ${defaultTitle} Page Hero Banner`} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-[#141410] border border-white/10 px-4 py-3 rounded-xl">
          <div>
            <p className="text-[12px] font-bold text-white">Enable Page Hero Banner</p>
            <p className="text-[10px] text-white/40 mt-0.5">Toggle visibility of this banner on the page</p>
          </div>
          <button 
            onClick={() => setDraft(d => ({ ...d, visible: !d.visible }))}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${draft.visible ? 'bg-[#c9a96e]' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-black transition-transform duration-200 ${draft.visible ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Banner Image</label>
          <div 
            onClick={() => !uploading && fileRef.current?.click()}
            className={`border-2 border-dashed border-white/10 bg-[#141410] rounded-xl p-2 text-center transition-all relative overflow-hidden group ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white/30'}`}
          >
            {uploading ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-white/50 mb-2" size={20} />
                <p className="text-[11px] text-white/80 font-semibold">Uploading to Supabase...</p>
              </div>
            ) : draft.image ? (
              <div className="w-full h-44 relative bg-black flex items-center justify-center">
                <img src={draft.image} alt="" className="w-full h-full object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <p className="text-[11px] font-bold text-white uppercase tracking-widest">Change Image</p>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <Upload size={20} className="text-white/30 mx-auto mb-2" />
                <p className="text-[12px] text-white/50">Click to upload custom banner</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleUploadImage(e.target.files)} />
          </div>
          {draft.image && draft.image !== defaultImage && (
            <button 
              onClick={handleClearImage}
              className="mt-2 text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <Trash2 size={11} /> Reset to default asset
            </button>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Hero Title</label>
          <input 
            value={draft.title} 
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors"
            placeholder="e.g. CONTACT"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Hero Subtitle</label>
          <input 
            value={draft.subtitle} 
            onChange={e => setDraft(d => ({ ...d, subtitle: e.target.value }))}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors"
            placeholder="e.g. GET IN TOUCH"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-[12px] font-semibold text-white/60 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={uploading} className="flex-1 py-3 bg-white text-black rounded-xl text-[12px] font-bold hover:bg-white/90 transition-colors disabled:opacity-50">Save Changes</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ── Contact Map Editor Modal ───────────────────────────────────────────────────
function ContactMapEditorModal({ config, onSave, onClose }) {
  const current = config?.sections?.contact_map || {};

  const [draft, setDraft] = useState({
    visible:            current.visible !== false,
    sectionTitle:       current.sectionTitle       || 'VISIT OUR STORE',
    sectionDescription: current.sectionDescription || 'Step into the 44 Luxury showroom and experience the collection in person. Our team is on hand for bespoke styling consultations and exclusive in-store drops.',
    address:            current.address            || 'Shop C426, Shariff Plaza, Banex, Wuse 2, Abuja, FCT, Nigeria',
    lat:                current.lat !== undefined ? current.lat : 9.0573,
    lng:                current.lng !== undefined ? current.lng : 7.4845,
    mapsLink:           current.mapsLink           || 'https://maps.google.com/?q=Shop+C426+Shariff+Plaza+Banex+Wuse+2+Abuja',
    hours:              current.hours              || 'Mon–Sat  10am–7pm · Sun  12pm–5pm',
    popupContent:       current.popupContent       || '44 Luxury\nShop C426, Shariff Plaza, Banex, Wuse 2, Abuja',
  });

  const handleSave = () => {
    // Parse coordinates safely
    const latNum = parseFloat(draft.lat);
    const lngNum = parseFloat(draft.lng);
    onSave({
      ...draft,
      lat: isNaN(latNum) ? 9.0573 : latNum,
      lng: isNaN(lngNum) ? 7.4845 : lngNum
    });
  };

  return (
    <ModalWrapper title="Edit Flagship Store Map & Location" onClose={onClose}>
      <div className="space-y-5">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between bg-[#141410] border border-white/10 px-4 py-3 rounded-xl">
          <div>
            <p className="text-[12px] font-bold text-white">Enable Homepage Map Section</p>
            <p className="text-[10px] text-white/40 mt-0.5">Toggle visibility of the store location map on the homepage</p>
          </div>
          <button 
            type="button"
            onClick={() => setDraft(d => ({ ...d, visible: !d.visible }))}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${draft.visible ? 'bg-[#c9a96e]' : 'bg-white/10'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-black transition-transform duration-200 ${draft.visible ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Section Title */}
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Section Title</label>
          <input
            value={draft.sectionTitle}
            onChange={e => setDraft(d => ({ ...d, sectionTitle: e.target.value }))}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors"
            placeholder="e.g. VISIT OUR STORE"
          />
        </div>

        {/* Section Description */}
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Section Description</label>
          <textarea
            value={draft.sectionDescription}
            onChange={e => setDraft(d => ({ ...d, sectionDescription: e.target.value }))}
            rows={3}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors resize-none"
            placeholder="Invite customers to visit the showroom..."
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Store Address (Display text)</label>
          <input
            value={draft.address}
            onChange={e => setDraft(d => ({ ...d, address: e.target.value }))}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors"
            placeholder="e.g. Shop C426, Shariff Plaza, Banex, Wuse 2, Abuja, FCT, Nigeria"
          />
        </div>

        {/* Opening Hours */}
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Opening Hours</label>
          <input
            value={draft.hours}
            onChange={e => setDraft(d => ({ ...d, hours: e.target.value }))}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors"
            placeholder="e.g. Mon–Sat  10am–7pm · Sun  12pm–5pm"
          />
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Latitude</label>
            <input
              type="text"
              value={draft.lat}
              onChange={e => setDraft(d => ({ ...d, lat: e.target.value }))}
              className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors font-mono"
              placeholder="e.g. 9.0573"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Longitude</label>
            <input
              type="text"
              value={draft.lng}
              onChange={e => setDraft(d => ({ ...d, lng: e.target.value }))}
              className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors font-mono"
              placeholder="e.g. 7.4845"
            />
          </div>
        </div>

        {/* Marker Popup Content */}
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Marker Popup Content (use newlines for spacing)</label>
          <textarea
            value={draft.popupContent}
            onChange={e => setDraft(d => ({ ...d, popupContent: e.target.value }))}
            rows={3}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors resize-none"
            placeholder="44 Luxury&#10;Shop C426, Shariff Plaza, Banex, Wuse 2, Abuja"
          />
        </div>

        {/* Directions Link */}
        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">"Get Directions" URL</label>
          <input
            value={draft.mapsLink}
            onChange={e => setDraft(d => ({ ...d, mapsLink: e.target.value }))}
            className="w-full bg-[#141410] border border-white/10 focus:border-white/30 rounded-xl px-4 py-3 text-[13px] text-white outline-none transition-colors font-mono"
            placeholder="e.g. https://maps.google.com/?q=..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/10 rounded-xl text-[12px] font-semibold text-white/60 hover:text-white transition-colors">Cancel</button>
          <button type="button" onClick={handleSave} className="flex-1 py-3 bg-white text-black rounded-xl text-[12px] font-bold hover:bg-white/90 transition-colors">Save Changes</button>
        </div>
      </div>
    </ModalWrapper>
  );
}

