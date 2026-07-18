import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Package, Trash2, Copy, ChevronDown,
  GripVertical, Star, Zap, Tag, Eye, EyeOff, RefreshCw, AlertTriangle
} from 'lucide-react';
import {
  getAllProducts, deleteProduct, duplicateProduct,
  updateProductStatus, getProductStats, updateProductOrder, toggleProductFlag,
} from '../../services/admin/productAdminService';
import { detectMissingColumns, clearSchemaCache } from '../../services/schemaDetector';
import { toast } from '../../components/ui/ToastProvider';
import ProductEditor from './ProductEditor';

const STATUS_CFG = {
  ACTIVE:       { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'In Stock' },
  DRAFT:        { dot: 'bg-white/30',    text: 'text-white/40',    bg: 'bg-white/5',        label: 'Draft' },
  'SOLD OUT':   { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Out of Stock' },
  'PRE-ORDER':  { dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Pre-Order' },
};

function StatusPill({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function StockBadge({ stock }) {
  if (stock === 0) return <span className="text-red-400 text-[12px] font-bold">Out of stock</span>;
  if (stock <= 10) return <span className="text-amber-400 text-[12px] font-semibold">{stock} left</span>;
  return <span className="text-white/60 text-[12px]">{stock}</span>;
}

function FlagDot({ active, color = 'text-[#c9a96e]' }) {
  return (
    <span className={`text-[11px] font-bold ${active ? color : 'text-white/15'}`}>
      ●
    </span>
  );
}

export default function ProductsManager() {
  const [products, setProducts]       = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilter]     = useState('');
  const [editorOpen, setEditorOpen]   = useState(false);
  const [editing, setEditing]         = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuOpen, setMenuOpen]       = useState(null);
  const [dragIdx, setDragIdx]         = useState(null);
  const [dragOver, setDragOver]       = useState(null);
  const [reordering, setReordering]   = useState(false);
  const [viewMode, setViewMode]       = useState('table'); // 'table' | 'grid'
  const [missingCols, setMissingCols] = useState([]);

  useEffect(() => { load(); }, [filterStatus]);

  useEffect(() => {
    const t = setTimeout(() => load(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setLoading(true);
    const [{ products: data }, { stats: s }] = await Promise.all([
      getAllProducts({ search, status: filterStatus }),
      getProductStats(),
    ]);
    setProducts(data || []);
    if (s) setStats(s);
    setLoading(false);
    // Check schema after load
    detectMissingColumns('products', ['is_best_seller', 'is_limited_edition', 'sort_order', 'video_url'])
      .then(missing => setMissingCols(missing));
  };

  const openCreate = () => { setEditing(null); setEditorOpen(true); };
  const openEdit   = (p) => { setEditing(p);   setEditorOpen(true); setMenuOpen(null); };

  const handleDuplicate = async (id) => {
    setMenuOpen(null);
    const { error } = await duplicateProduct(id);
    if (error) { toast(error, 'error'); return; }
    toast('Product duplicated as Draft', 'success');
    load();
  };

  const confirmDelete = async () => {
    const { error } = await deleteProduct(deleteTarget.id);
    if (error) { toast(error, 'error'); return; }
    toast('Product deleted', 'success');
    setDeleteTarget(null);
    load();
  };

  const handleStatusQuick = async (id, status) => {
    setMenuOpen(null);
    const { error } = await updateProductStatus(id, status);
    if (error) { toast(error, 'error'); return; }
    toast('Status updated', 'success');
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleFlagToggle = async (id, flag, currentValue) => {
    const newVal = !currentValue;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [flag]: newVal } : p));
    const { error } = await toggleProductFlag(id, flag, newVal);
    if (error) {
      toast(error, 'error');
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [flag]: currentValue } : p));
    } else {
      toast(`${flag.replace('is_', '').replace('_', ' ')} updated`, 'success');
    }
  };

  // ── Drag-and-drop reorder ──
  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(idx);
  };

  const handleDrop = async (e, dropIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) { resetDrag(); return; }

    const reordered = [...products];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    setProducts(reordered);
    resetDrag();

    setReordering(true);
    const { error } = await updateProductOrder(reordered.map(p => p.id));
    setReordering(false);
    if (error) { toast('Failed to save order', 'error'); load(); }
    else toast('Order saved ✓', 'success');
  };

  const resetDrag = () => { setDragIdx(null); setDragOver(null); };

  const statCards = [
    { label: 'Total',        value: stats?.total     ?? 0, color: 'text-white' },
    { label: 'Active',       value: stats?.active    ?? 0, color: 'text-emerald-400' },
    { label: 'Low Stock',    value: stats?.lowStock  ?? 0, color: 'text-amber-400' },
    { label: 'Out of Stock', value: stats?.outOfStock ?? 0, color: 'text-red-400' },
  ];

  return (
    <div className="p-8 max-w-[1400px]" onClick={() => setMenuOpen(null)}>

      {/* Schema Migration Banner */}
      {missingCols.length > 0 && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-4 flex items-center gap-4">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-[12px] font-bold text-amber-400">⚠️ Publishing will fail — database migration pending</p>
            <p className="text-[10px] text-amber-400/60 mt-0.5">
              Missing: <code>{missingCols.join(', ')}</code> — run <code>020_complete_schema_audit.sql</code> in Supabase SQL Editor
            </p>
          </div>
          <a
            href="https://supabase.com/dashboard/project/vlcwvdgqtsooiwcgdukc/sql"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 bg-amber-500 text-[#0a0a08] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors"
          >
            Fix Now →
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Content</p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Products</h1>
          <p className="text-[11px] text-white/25 mt-1">Drag rows to reorder · Click flags to toggle instantly</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/60 transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          {reordering && (
            <span className="text-[10px] text-[#c9a96e] font-semibold uppercase tracking-wider animate-pulse">
              Saving order…
            </span>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#c9a96e] text-[#0a0a08] px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#d4b87e] transition-colors"
          >
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Stat Strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-[#141410] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-[#141410] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilter(e.target.value)}
          className="bg-[#141410] border border-white/[0.06] rounded-xl px-3 py-2.5 text-[12px] text-white/60 outline-none focus:border-white/20 transition-colors"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">In Stock</option>
          <option value="DRAFT">Draft</option>
          <option value="SOLD OUT">Out of Stock</option>
          <option value="PRE-ORDER">Pre-Order</option>
        </select>
        {/* Legend */}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-white/25 font-semibold uppercase tracking-wider">
          <span className="text-[#c9a96e]">★</span> Featured
          <span className="text-emerald-400">●</span> New
          <span className="text-amber-400">★</span> Best Seller
          <span className="text-purple-400">◆</span> Ltd Ed.
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141410] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-3 py-3.5 w-8" />
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">Product</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">Category</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">Price</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">Stock</th>
              <th className="px-5 py-3.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white/25">Flags</th>
              <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/25">Status</th>
              <th className="px-5 py-3.5 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr><td colSpan={8} className="py-16 text-center text-white/25 text-sm">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <Package size={32} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No products found</p>
                  <button onClick={openCreate} className="mt-4 text-[#c9a96e] text-[12px] font-semibold hover:underline">
                    + Add your first product
                  </button>
                </td>
              </tr>
            ) : products.map((p, idx) => (
              <tr
                key={p.id}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDrop={e => handleDrop(e, idx)}
                onDragEnd={resetDrag}
                className={`transition-colors cursor-default ${
                  dragOver === idx && dragIdx !== idx
                    ? 'bg-[#c9a96e]/10 border-t-2 border-[#c9a96e]/40'
                    : dragIdx === idx
                    ? 'opacity-40'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Drag handle */}
                <td className="px-3 py-3.5 text-white/20 cursor-grab active:cursor-grabbing">
                  <GripVertical size={14} />
                </td>

                {/* Product */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-white/5 overflow-hidden shrink-0">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <Package size={16} className="text-white/20 m-auto mt-3" />}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white/80">{p.name}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {p.collection?.name || 'No collection'} · {p.sku || 'No SKU'}
                        {p.video_url && <span className="ml-1 text-blue-400/60">▶ video</span>}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-5 py-3.5 text-[12px] text-white/50">
                  {p.subcategory || '—'}
                </td>

                {/* Price */}
                <td className="px-5 py-3.5">
                  <p className="text-[13px] font-semibold text-white/80">₦{(p.price || 0).toLocaleString()}</p>
                  {p.compare_price > 0 && (
                    <p className="text-[10px] text-white/25 line-through">₦{p.compare_price.toLocaleString()}</p>
                  )}
                </td>

                {/* Stock */}
                <td className="px-5 py-3.5"><StockBadge stock={p.stock ?? 0} /></td>

                {/* Flags — clickable toggles */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      title="Featured"
                      onClick={() => handleFlagToggle(p.id, 'is_featured', p.is_featured)}
                      className="hover:scale-125 transition-transform"
                    >
                      <Star size={13} className={p.is_featured ? 'text-[#c9a96e] fill-[#c9a96e]' : 'text-white/15'} />
                    </button>
                    <button
                      title="New Arrival"
                      onClick={() => handleFlagToggle(p.id, 'is_new', p.is_new)}
                      className="hover:scale-125 transition-transform"
                    >
                      <Zap size={13} className={p.is_new ? 'text-emerald-400 fill-emerald-400' : 'text-white/15'} />
                    </button>
                    <button
                      title="Best Seller"
                      onClick={() => handleFlagToggle(p.id, 'is_best_seller', p.is_best_seller)}
                      className="hover:scale-125 transition-transform"
                    >
                      <Tag size={13} className={p.is_best_seller ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
                    </button>
                    <button
                      title="Limited Edition"
                      onClick={() => handleFlagToggle(p.id, 'is_limited_edition', p.is_limited_edition)}
                      className="hover:scale-125 transition-transform text-[11px] font-bold"
                    >
                      <span className={p.is_limited_edition ? 'text-purple-400' : 'text-white/15'}>◆</span>
                    </button>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5"><StatusPill status={p.status} /></td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <div className="relative flex justify-end" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
                    >
                      <ChevronDown size={15} />
                    </button>
                    {menuOpen === p.id && (
                      <div className="absolute right-0 top-9 bg-[#1e1e1a] border border-white/10 rounded-xl shadow-2xl z-20 w-48 py-1 overflow-hidden">
                        <button onClick={() => openEdit(p)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors">
                          ✏️ Edit Product
                        </button>
                        <button onClick={() => handleDuplicate(p.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors">
                          <Copy size={13} /> Duplicate
                        </button>
                        <div className="border-t border-white/[0.06] my-1" />
                        {p.status !== 'ACTIVE' && (
                          <button onClick={() => handleStatusQuick(p.id, 'ACTIVE')} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-emerald-400 hover:bg-emerald-500/5 transition-colors">
                            ● Mark In Stock
                          </button>
                        )}
                        {p.status !== 'DRAFT' && (
                          <button onClick={() => handleStatusQuick(p.id, 'DRAFT')} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-white/50 hover:bg-white/[0.05] transition-colors">
                            ● Set Draft
                          </button>
                        )}
                        {p.status !== 'SOLD OUT' && (
                          <button onClick={() => handleStatusQuick(p.id, 'SOLD OUT')} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-red-400 hover:bg-red-500/5 transition-colors">
                            ● Mark Out of Stock
                          </button>
                        )}
                        {p.status !== 'PRE-ORDER' && (
                          <button onClick={() => handleStatusQuick(p.id, 'PRE-ORDER')} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-blue-400 hover:bg-blue-500/5 transition-colors">
                            ● Set Pre-Order
                          </button>
                        )}
                        <div className="border-t border-white/[0.06] my-1" />
                        <button onClick={() => { setDeleteTarget(p); setMenuOpen(null); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[12px] text-red-400 hover:bg-red-500/5 transition-colors">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Editor */}
      {editorOpen && (
        <ProductEditor
          product={editing}
          onClose={() => setEditorOpen(false)}
          onSave={() => {
            setEditorOpen(false);
            load();
            toast(editing ? 'Product updated!' : 'Product published!', 'success');
          }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a16] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="text-[15px] font-bold text-white text-center mb-2">Delete Product?</h3>
            <p className="text-[12px] text-white/40 text-center mb-6">
              "<span className="text-white/60">{deleteTarget.name}</span>" will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-[12px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 rounded-xl text-[12px] font-bold text-white hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
