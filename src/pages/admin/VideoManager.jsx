import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Play, Upload, Link as LinkIcon } from 'lucide-react';
import DisplayModePanel from '../../components/admin/DisplayModePanel';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StatusBadge from '../../components/admin/StatusBadge';
import { toast } from '../../components/ui/ToastProvider';
import * as videoAdminService from '../../services/admin/videoAdminService';

const ALL_PAGES = ['Home', 'Men', 'Women', 'Shop', 'About', 'Collections', 'Product Pages'];
const DISPLAY_STYLES = ['HERO FULLSCREEN', 'INLINE SECTION', 'BACKGROUND LOOP'];
const PLAYBACKS = ['AUTOPLAY MUTED', 'PLAY ON CLICK', 'LOOP'];

const EMPTY = {
  title: '', source: 'UPLOAD', url: '', youtubeUrl: '', vimeoUrl: '', thumbnail: '',
  pages: [], displayStyle: 'INLINE SECTION', playback: ['AUTOPLAY MUTED'],
  overlayHeadline: '', overlaySubtext: '', overlayCta: '',
  displayMode: 'SINGLE', transitionSpeed: 5, status: 'ACTIVE',
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete">{label}</label>
    {children}
  </div>
);
const Inp = (props) => (
  <input {...props} className="bg-[#0f0f0c] border border-[#2a2a26] focus:border-bone text-bone px-4 py-2.5 font-plex text-sm outline-none transition-colors w-full" />
);

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    const { data, error } = await videoAdminService.getAllVideos();
    if (error) {
      toast(error, 'error');
    } else {
      setVideos(data || []);
    }
    setLoading(false);
  };

  const set = (k, v) => setEditing(prev => ({ ...prev, [k]: v }));

  const togglePage = (page) => set('pages', editing.pages.includes(page) ? editing.pages.filter(p => p !== page) : [...editing.pages, page]);
  const togglePlayback = (p) => set('playback', editing.playback.includes(p) ? editing.playback.filter(x => x !== p) : [...editing.playback, p]);

  const handleSave = async () => {
    if (!editing.title.trim()) { toast('Video title is required', 'error'); return; }
    
    try {
      if (editing.id) {
        const { error } = await videoAdminService.updateVideo(editing.id, editing);
        if (error) throw new Error(error);
        toast('Video updated', 'success');
      } else {
        const { error } = await videoAdminService.createVideo(editing);
        if (error) throw new Error(error);
        toast('Video added', 'success');
      }
      setEditing(null);
      loadVideos();
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await videoAdminService.deleteVideo(id);
      if (error) throw new Error(error);
      toast('Video deleted', 'success');
      setConfirmDelete(null);
      loadVideos();
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  const getEmbedUrl = (v) => {
    if (v.source === 'YOUTUBE') return v.youtube_url || v.youtubeUrl;
    if (v.source === 'VIMEO') return v.vimeo_url || v.vimeoUrl;
    return v.url;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-1">Admin</p>
            <h1 className="font-unica text-5xl uppercase tracking-tighter text-bone">VIDEOS</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="font-plex text-sm text-concrete">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-1">Admin</p>
          <h1 className="font-unica text-5xl uppercase tracking-tighter text-bone">VIDEOS</h1>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 bg-bone text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs px-5 py-3 hover:bg-[#D4AF37] transition-colors">
          <Plus size={14} /> ADD VIDEO
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[#2a2a26]">
          <Upload size={40} className="text-concrete/20 mb-4" />
          <p className="font-unica text-3xl uppercase tracking-tighter text-concrete/30">NO VIDEOS YET</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <div key={video.id} className="flex gap-5 border border-[#2a2a26] p-5 hover:border-bone/30 transition-colors">
              {/* Thumbnail */}
              <div className="w-28 h-18 shrink-0 bg-[#1c1c18] overflow-hidden relative" style={{ height: '72px' }}>
                {video.thumbnail
                  ? <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-concrete/30 font-unica text-xs">NO THUMB</div>}
                <div className="absolute top-1.5 left-1.5">
                  <span className="bg-[#0f0f0c]/80 font-grotesk font-bold text-[8px] uppercase tracking-wide text-concrete px-1.5 py-0.5">
                    {video.source}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-grotesk font-bold text-sm text-bone uppercase tracking-wide mb-1">{video.title}</p>
                    <p className="font-plex text-xs text-concrete mb-2">{getEmbedUrl(video)?.slice(0, 60)}...</p>
                    <div className="flex flex-wrap gap-2 items-center">
                      {video.pages.map(p => (
                        <span key={p} className="bg-[#1c1c18] border border-[#2a2a26] font-grotesk font-bold text-[9px] uppercase tracking-widest text-concrete px-2 py-0.5">{p}</span>
                      ))}
                      <span className="text-concrete/30">·</span>
                      <span className="font-plex text-[10px] text-concrete">{video.displayStyle}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <StatusBadge status={video.status || 'ACTIVE'} />
                    <button onClick={() => setEditing({ ...video })} className="text-concrete hover:text-bone"><Edit2 size={15} /></button>
                    <button onClick={() => setConfirmDelete(video.id)} className="text-concrete hover:text-red-400"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDITOR MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-[#141412] border border-[#2a2a26] w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a26] sticky top-0 bg-[#141412] z-10">
              <h2 className="font-unica text-2xl uppercase tracking-tighter text-bone">{editing.id ? 'EDIT VIDEO' : 'ADD VIDEO'}</h2>
              <button onClick={() => setEditing(null)} className="text-concrete hover:text-bone"><X size={18} /></button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Title */}
              <Field label="Video Title">
                <Inp value={editing.title} onChange={e => set('title', e.target.value)} placeholder="THE CORE EDIT" />
              </Field>

              {/* Source toggle */}
              <div>
                <label className="block font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-2">Video Source</label>
                <div className="flex gap-2">
                  {[
                    { id: 'UPLOAD', icon: Upload, label: 'Upload File' },
                    { id: 'YOUTUBE', icon: Play, label: 'YouTube URL' },
                    { id: 'VIMEO', icon: LinkIcon, label: 'Vimeo URL' },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <button key={s.id} onClick={() => set('source', s.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-grotesk font-bold text-[10px] uppercase tracking-widest border transition-colors
                          ${editing.source === s.id ? 'bg-bone text-[#1c1c18] border-bone' : 'border-[#2a2a26] text-concrete hover:text-bone'}`}>
                        <Icon size={12} /> {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URL fields based on source */}
              {editing.source === 'UPLOAD' && <Field label="Video URL (mp4/webm)"><Inp value={editing.url} onChange={e => set('url', e.target.value)} placeholder="https://..." /></Field>}
              {editing.source === 'YOUTUBE' && <Field label="YouTube URL"><Inp value={editing.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)} placeholder="https://youtube.com/watch?v=..." /></Field>}
              {editing.source === 'VIMEO' && <Field label="Vimeo URL"><Inp value={editing.vimeoUrl} onChange={e => set('vimeoUrl', e.target.value)} placeholder="https://vimeo.com/..." /></Field>}
              <Field label="Thumbnail Image URL"><Inp value={editing.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="https://..." /></Field>
              {editing.thumbnail && <div className="aspect-video overflow-hidden bg-[#0f0f0c]"><img src={editing.thumbnail} alt="" className="w-full h-full object-cover" /></div>}

              {/* Assign to pages */}
              <div>
                <label className="block font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-2">Assign to Pages</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PAGES.map(page => (
                    <button key={page} onClick={() => togglePage(page)}
                      className={`px-3 py-2 font-grotesk font-bold text-[10px] uppercase tracking-widest border transition-colors
                        ${editing.pages.includes(page) ? 'bg-bone text-[#1c1c18] border-bone' : 'border-[#2a2a26] text-concrete hover:text-bone'}`}>
                      {page}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display style */}
              <div>
                <label className="block font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-2">Display Style</label>
                <div className="flex gap-2 flex-wrap">
                  {DISPLAY_STYLES.map(s => (
                    <button key={s} onClick={() => set('displayStyle', s)}
                      className={`px-4 py-2.5 font-grotesk font-bold text-[10px] uppercase tracking-widest border transition-colors
                        ${editing.displayStyle === s ? 'bg-bone text-[#1c1c18] border-bone' : 'border-[#2a2a26] text-concrete hover:text-bone'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback */}
              <div>
                <label className="block font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-2">Playback Options</label>
                <div className="flex gap-2 flex-wrap">
                  {PLAYBACKS.map(p => (
                    <button key={p} onClick={() => togglePlayback(p)}
                      className={`px-4 py-2.5 font-grotesk font-bold text-[10px] uppercase tracking-widest border transition-colors
                        ${editing.playback.includes(p) ? 'bg-bone text-[#1c1c18] border-bone' : 'border-[#2a2a26] text-concrete hover:text-bone'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overlay text */}
              <div className="border-t border-[#2a2a26] pt-5">
                <h3 className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#D4AF37] mb-4">OVERLAY TEXT (OPTIONAL)</h3>
                <div className="flex flex-col gap-4">
                  <Field label="Headline"><Inp value={editing.overlayHeadline} onChange={e => set('overlayHeadline', e.target.value)} placeholder="THE UNCOMPROMISING FORM" /></Field>
                  <Field label="Subtext"><Inp value={editing.overlaySubtext} onChange={e => set('overlaySubtext', e.target.value)} placeholder="Crafted for those who command attention." /></Field>
                  <Field label="CTA Text"><Inp value={editing.overlayCta} onChange={e => set('overlayCta', e.target.value)} placeholder="EXPLORE THE COLLECTION" /></Field>
                </div>
              </div>

              {/* Display mode if multiple */}
              <div className="border-t border-[#2a2a26] pt-5">
                <h3 className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#D4AF37] mb-4">DISPLAY MODE</h3>
                <DisplayModePanel
                  config={{ displayMode: editing.displayMode, transitionSpeed: editing.transitionSpeed, autoplay: true, showDots: true, showArrows: true, loop: true }}
                  onChange={(c) => { set('displayMode', c.displayMode); set('transitionSpeed', c.transitionSpeed); }}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-2">Status</label>
                <div className="flex gap-2">
                  {['ACTIVE', 'DRAFT'].map(s => (
                    <button key={s} onClick={() => set('status', s)}
                      className={`flex-1 py-2.5 font-grotesk font-bold text-[10px] uppercase tracking-widest border transition-colors
                        ${editing.status === s ? 'bg-bone text-[#1c1c18] border-bone' : 'border-[#2a2a26] text-concrete hover:text-bone'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-[#2a2a26]">
              <button onClick={handleSave} className="flex-1 bg-bone text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs py-3.5 hover:bg-[#D4AF37] transition-colors">
                {editing.id ? 'SAVE CHANGES' : 'ADD VIDEO'}
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-[#2a2a26] text-concrete hover:text-bone font-grotesk font-bold uppercase tracking-widest text-xs py-3.5 transition-colors">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Video"
          message="This video will be permanently removed from all pages it is assigned to."
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
