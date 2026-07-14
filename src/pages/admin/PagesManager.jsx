import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, FileText, Check, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';
import { getAllPages, createPage, updatePage, deletePage } from '../../services/admin/pageAdminService';
import { toast } from '../../components/ui/ToastProvider';

const EMPTY = {
  title: '',
  slug: '',
  content: '',
  is_active: true
};

export default function PagesManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  
  // Editor Modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await getAllPages();
    if (error) {
      toast(error, 'error');
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setEditorOpen(true);
  };

  const handleOpenEdit = (page) => {
    setEditing(page);
    setForm({
      title: page.title || '',
      slug: page.slug || '',
      content: page.content || '',
      is_active: page.is_active ?? true
    });
    setErrors({});
    setEditorOpen(true);
  };

  const setField = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      
      // Auto-generate slug from title if editing is new
      if (k === 'title' && !editing) {
        next.slug = v
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.slug.trim()) {
      errs.slug = 'Slug is required';
    } else if (!/^[a-z0-9-_]+$/.test(form.slug)) {
      errs.slug = 'Slug can only contain lowercase letters, numbers, dashes and underscores';
    }
    if (!form.content.trim()) errs.content = 'Content is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    let result;
    if (editing) {
      result = await updatePage(editing.id, form);
    } else {
      result = await createPage(form);
    }

    setSaving(false);

    if (result.error) {
      toast(result.error, 'error');
    } else {
      toast(editing ? 'Page updated successfully' : 'Page created successfully', 'success');
      setEditorOpen(false);
      load();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { success, error } = await deletePage(deleteTarget.id);
    if (error) {
      toast(error, 'error');
    } else {
      toast('Page deleted', 'success');
      setDeleteTarget(null);
      load();
    }
  };

  const handleToggleActive = async (page) => {
    const nextActive = !page.is_active;
    
    // Optimistic UI update
    setPages(prev => prev.map(p => p.id === page.id ? { ...p, is_active: nextActive } : p));
    
    const { error } = await updatePage(page.id, { ...page, is_active: nextActive });
    if (error) {
      toast(error, 'error');
      // Rollback
      setPages(prev => prev.map(p => p.id === page.id ? { ...p, is_active: page.is_active } : p));
    } else {
      toast(`Page ${nextActive ? 'activated' : 'deactivated'}`, 'success');
    }
  };

  // Filters & Search
  const filteredPages = pages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.slug.toLowerCase().includes(search.toLowerCase());
    
    if (activeFilter === 'active') return matchesSearch && p.is_active;
    if (activeFilter === 'inactive') return matchesSearch && !p.is_active;
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Website</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Custom Pages</h1>
          <p className="text-[11px] text-white/25 mt-1">Manage return policy, FAQ, terms, privacy, and other custom text pages.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#d4b87e] transition-colors"
        >
          <Plus size={15} /> Add Custom Page
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full bg-[#141410] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <div className="flex bg-[#141410] border border-white/[0.06] rounded-xl p-1">
          {[
            { id: 'all', label: 'All Pages' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                activeFilter === f.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-[#141410] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">Page Details</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">Slug</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">Last Updated</th>
              <th className="px-5 py-3.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white/25">Status</th>
              <th className="px-5 py-3.5 w-24 text-right text-[10px] font-semibold uppercase tracking-wider text-white/25">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-white/25 text-sm">
                  <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading custom pages...
                </td>
              </tr>
            ) : filteredPages.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-white/25 text-sm">
                  <FileText size={32} className="text-white/10 mx-auto mb-3" />
                  No pages found
                </td>
              </tr>
            ) : (
              filteredPages.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-[#c9a96e]" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white/80">{p.title}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {p.content.split(/\n+/).length} blocks / paragraphs
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[12px] text-white/50 font-mono">/{p.slug}</td>
                  <td className="px-5 py-4 text-[12px] text-white/40">
                    {new Date(p.updated_at || p.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                          p.is_active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-white/5 text-white/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-400' : 'bg-white/20'}`} />
                        {p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.04] transition-all"
                        title="View Live"
                      >
                        <ExternalLink size={13} />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-[#c9a96e] hover:bg-white/[0.04] transition-all"
                        title="Edit Page"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/5 transition-all"
                        title="Delete Page"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#10100d] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-[15px] font-bold text-white">
                  {editing ? `Edit: ${editing.title}` : 'Create Custom Page'}
                </h3>
                <p className="text-[11px] text-white/30 mt-0.5">Edit title, URL slug, and markdown content</p>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Page Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    placeholder="Returns & Exchange Policy"
                    className="w-full bg-[#161612] border border-white/[0.08] focus:border-white/20 rounded-xl px-4 py-2.5 text-[12px] text-white outline-none transition-colors"
                  />
                  {errors.title && <p className="text-red-400 text-[10px] mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">URL Slug</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-[12px] font-mono select-none">/</span>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => setField('slug', e.target.value)}
                      placeholder="return-policy"
                      className="w-full bg-[#161612] border border-white/[0.08] focus:border-white/20 rounded-xl pl-6 pr-4 py-2.5 text-[12px] text-white font-mono outline-none transition-colors"
                    />
                  </div>
                  {errors.slug && <p className="text-red-400 text-[10px] mt-1">{errors.slug}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Page Content (Markdown)</label>
                  <textarea
                    rows={12}
                    value={form.content}
                    onChange={e => setField('content', e.target.value)}
                    placeholder="At 44 Luxury, we take pride..."
                    className="w-full bg-[#161612] border border-white/[0.08] focus:border-white/20 rounded-xl px-4 py-3 text-[12px] text-white font-mono outline-none resize-none transition-colors"
                  />
                  {errors.content && <p className="text-red-400 text-[10px] mt-1">{errors.content}</p>}
                </div>

                <div className="flex items-center justify-between p-4 bg-[#161612] rounded-xl border border-white/[0.04]">
                  <div>
                    <p className="text-[12px] font-semibold text-white/80">Page Visibility</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Toggle active state on storefront</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField('is_active', !form.is_active)}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      form.is_active ? 'bg-[#c9a96e]' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        form.is_active ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Live Preview / Formatting Help */}
              <div className="flex flex-col h-full overflow-hidden bg-[#141410] border border-white/[0.06] rounded-2xl p-5">
                <div className="border-b border-white/[0.06] pb-3 mb-4 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Markdown formatting help</span>
                  <span className="text-[9px] text-[#c9a96e] font-mono">### Header · **Bold** · • Bullet</span>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[50vh] pr-2 space-y-4 text-white/70">
                  <h3 className="font-unica text-3xl uppercase tracking-tighter text-white mb-4">
                    {form.title || 'Page Title'}
                  </h3>
                  
                  {form.content ? (
                    <div className="space-y-3 font-plex text-[12px] leading-relaxed">
                      {form.content.split(/\n\n+/).map((block, bIdx) => {
                        const trimmed = block.trim();
                        if (trimmed.startsWith('###')) {
                          return (
                            <h4 key={bIdx} className="font-unica text-lg uppercase tracking-tight text-white mt-6 mb-2 border-b border-white/5 pb-1">
                              {trimmed.replace(/^###\s*/, '')}
                            </h4>
                          );
                        }
                        if (trimmed.startsWith('•') || trimmed.includes('\n•')) {
                          return (
                            <ul key={bIdx} className="list-none pl-0 my-3 flex flex-col gap-1.5">
                              {trimmed.split('\n').map((line, lIdx) => (
                                <li key={lIdx} className="flex items-start gap-2 text-white/60">
                                  <span className="text-[#c9a96e]">•</span>
                                  <span>{line.replace(/^•\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={bIdx} className="text-white/60">{trimmed}</p>;
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-white/20 italic">Write content to see the live preview...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-[#141410] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-5 py-2.5 border border-white/10 rounded-xl text-[12px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#c9a96e] text-[#0a0a08] px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#d4b87e] transition-colors disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Page'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#10100d] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="text-[14px] font-bold text-white text-center mb-2">Delete Page?</h3>
            <p className="text-[11px] text-white/40 text-center mb-6">
              Are you sure you want to delete the "<span className="text-white/60">{deleteTarget.title}</span>" page? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-white/10 rounded-xl text-[11px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 rounded-xl text-[11px] font-bold text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
