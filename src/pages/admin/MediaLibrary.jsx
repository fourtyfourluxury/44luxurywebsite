import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Search, Grid, List, Copy, Trash2, X, ImageIcon, Film } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadFile, deleteFile, BUCKETS } from '../../services/storageService';
import { toast } from '../../components/ui/ToastProvider';

const BUCKETS_LIST = [
  { key: 'ALL',         label: 'All Files',     bucket: null },
  { key: 'products',    label: 'Products',       bucket: BUCKETS.PRODUCTS },
  { key: 'collections', label: 'Collections',    bucket: BUCKETS.COLLECTIONS },
  { key: 'homepage',    label: 'Homepage',       bucket: BUCKETS.HOMEPAGE },
  { key: 'hero-slides', label: 'Hero Slides',    bucket: BUCKETS.HERO_SLIDES },
  { key: 'general',     label: 'General',        bucket: BUCKETS.GENERAL },
];

const fmtSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)}MB`;
  return `${Math.round(bytes / 1000)}KB`;
};

const isVideo = (name = '') => /\.(mp4|webm|mov|avi)$/i.test(name);

export default function MediaLibrary() {
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeBucket, setActiveBucket] = useState('ALL');
  const [search, setSearch]       = useState('');
  const [viewMode, setViewMode]   = useState('grid');
  const [selected, setSelected]   = useState(null); // file object
  const [dragging, setDragging]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadFiles(); }, [activeBucket]);

  const loadFiles = async () => {
    setLoading(true);
    setFiles([]);
    const bucketsToLoad = activeBucket === 'ALL'
      ? Object.values(BUCKETS)
      : [BUCKETS_LIST.find(b => b.key === activeBucket)?.bucket].filter(Boolean);

    const allFiles = [];

    // Helper: recursively list files in a bucket (including subfolders)
    const listBucketFiles = async (bucket, folder = '') => {
      const { data, error } = await supabase.storage.from(bucket).list(folder, {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (!data) return;

      for (const item of data) {
        if (!item.name || item.name === '.emptyFolderPlaceholder') continue;

        const itemPath = folder ? `${folder}/${item.name}` : item.name;

        // If item has no metadata (or id is null), it's a folder — recurse into it
        if (!item.metadata || item.id === null) {
          await listBucketFiles(bucket, itemPath);
        } else {
          // It's a real file
          const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(itemPath);
          allFiles.push({ ...item, publicUrl, bucket, path: itemPath });
        }
      }
    };

    for (const bucket of bucketsToLoad) {
      await listBucketFiles(bucket);
    }

    setFiles(allFiles);
    setLoading(false);
  };

  const handleUpload = async (fileList) => {
    if (!fileList?.length) return;
    const targetBucket = activeBucket === 'ALL' ? BUCKETS.GENERAL : (BUCKETS_LIST.find(b => b.key === activeBucket)?.bucket || BUCKETS.GENERAL);
    setUploading(true);
    let count = 0;
    for (const file of Array.from(fileList)) {
      const { url, error } = await uploadFile(file, { bucket: targetBucket });
      if (url) count++;
      else if (error) toast(`Failed: ${file.name}`, 'error');
    }
    setUploading(false);
    if (count > 0) { toast(`${count} file${count > 1 ? 's' : ''} uploaded`, 'success'); loadFiles(); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { success, error } = await deleteFile(deleteTarget.path, deleteTarget.bucket);
    if (!success) { toast(error || 'Delete failed', 'error'); return; }
    toast('File deleted', 'success');
    setDeleteTarget(null);
    if (selected?.path === deleteTarget.path) setSelected(null);
    loadFiles();
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast('URL copied to clipboard!', 'success');
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleUpload(e.dataTransfer.files);
  }, [activeBucket]);

  const filtered = files.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 h-full flex flex-col max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 shrink-0">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Content</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Media Library</h1>
          <p className="text-[12px] text-white/30 mt-1">{files.length} file{files.length !== 1 ? 's' : ''} in {activeBucket === 'ALL' ? 'all buckets' : activeBucket}</p>
        </div>
        <label className={`flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#d4b87e] transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          <Upload size={14} />{uploading ? 'Uploading...' : 'Upload Files'}
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => handleUpload(e.target.files)} />
        </label>
      </div>

      {/* Bucket Tabs */}
      <div className="flex gap-1.5 mb-5 shrink-0 overflow-x-auto pb-1">
        {BUCKETS_LIST.map(b => (
          <button key={b.key} onClick={() => setActiveBucket(b.key)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${activeBucket === b.key ? 'bg-[#c9a96e] text-[#0a0a08]' : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/[0.08]'}`}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Search + View Toggle */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
            className="w-full bg-[#141410] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none focus:border-white/15 transition-colors" />
        </div>
        <div className="flex gap-1">
          {[['grid', Grid], ['list', List]].map(([m, Icon]) => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === m ? 'bg-white/10 text-white' : 'text-white/25 hover:text-white/60 hover:bg-white/[0.05]'}`}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Drop + Content Area */}
      <div
        className={`flex-1 overflow-hidden flex gap-5 rounded-2xl transition-all ${dragging ? 'ring-2 ring-[#c9a96e]/50' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {/* File Grid/List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Upload size={36} className="text-white/10 mb-3" />
              <p className="text-white/25 text-sm">{dragging ? 'Drop to upload' : 'No files yet — drag and drop or click Upload'}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map(f => (
                <div key={`${f.bucket}/${f.path}`}
                  onClick={() => setSelected(f)}
                  className={`relative group aspect-square rounded-xl overflow-hidden bg-white/5 cursor-pointer border transition-all ${selected?.path === f.path && selected?.bucket === f.bucket ? 'border-[#c9a96e]' : 'border-white/[0.05] hover:border-white/15'}`}
                >
                  {isVideo(f.name)
                    ? <div className="w-full h-full flex items-center justify-center"><Film size={24} className="text-white/30" /></div>
                    : <img src={f.publicUrl} alt={f.name} className="w-full h-full object-cover" loading="lazy" />}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button onClick={e => { e.stopPropagation(); copyUrl(f.publicUrl); }}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Copy size={13} className="text-[#0a0a08]" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-[9px] text-white/80 truncate">{f.name}</p>
                    <p className="text-[8px] text-white/40">{fmtSize(f.metadata?.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#141410] border border-white/[0.06] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-white/[0.06]">
                  {['Preview','Filename','Bucket','Size','Date',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map(f => (
                    <tr key={`${f.bucket}/${f.path}`} onClick={() => setSelected(f)} className="hover:bg-white/[0.02] cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden">
                          {!isVideo(f.name) && <img src={f.publicUrl} alt="" className="w-full h-full object-cover" loading="lazy" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-white/60 max-w-[200px]"><p className="truncate">{f.name}</p></td>
                      <td className="px-4 py-3 text-[11px] text-white/30">{f.bucket}</td>
                      <td className="px-4 py-3 text-[11px] text-white/30">{fmtSize(f.metadata?.size)}</td>
                      <td className="px-4 py-3 text-[11px] text-white/30">{f.created_at ? new Date(f.created_at).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 justify-end">
                          <button onClick={e => { e.stopPropagation(); copyUrl(f.publicUrl); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"><Copy size={12} /></button>
                          <button onClick={e => { e.stopPropagation(); setDeleteTarget(f); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-64 bg-[#141410] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-4 shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">File Details</p>
              <button onClick={() => setSelected(null)} className="text-white/20 hover:text-white/60 transition-colors"><X size={14} /></button>
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
              {isVideo(selected.name)
                ? <div className="w-full h-full flex items-center justify-center"><Film size={32} className="text-white/20" /></div>
                : <img src={selected.publicUrl} alt={selected.name} className="w-full h-full object-cover" />}
            </div>
            <div className="space-y-3">
              {[['Filename', selected.name], ['Bucket', selected.bucket], ['Size', fmtSize(selected.metadata?.size)]].map(([l, v]) => (
                <div key={l}><p className="text-[9px] font-semibold text-white/30 uppercase tracking-wider mb-0.5">{l}</p><p className="text-[11px] text-white/60 break-all">{v}</p></div>
              ))}
            </div>
            <button onClick={() => copyUrl(selected.publicUrl)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#c9a96e]/10 text-[#c9a96e] rounded-xl text-[11px] font-bold hover:bg-[#c9a96e]/20 transition-colors">
              <Copy size={13} /> Copy URL
            </button>
            <button onClick={() => setDeleteTarget(selected)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/5 text-red-400 rounded-xl text-[11px] font-bold hover:bg-red-500/10 transition-colors border border-red-500/10">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a16] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-400" /></div>
            <h3 className="text-[15px] font-bold text-white text-center mb-2">Delete File?</h3>
            <p className="text-[11px] text-white/40 text-center mb-6 break-all">"{deleteTarget.name}" will be permanently deleted.</p>
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
