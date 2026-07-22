import { useState, useEffect } from 'react';
import { Search, ShoppingCart, ChevronDown, X, Package, MapPin, Phone, Mail, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { getAllOrders, updateOrderStatus, updateTrackingInfo, getOrderDetails, exportOrdersToCSV } from '../../services/admin/orderAdminService';
import { toast } from '../../components/ui/ToastProvider';
import RowActionMenu from '../../components/admin/RowActionMenu';

const STATUS = {
  ORDERED:    { label: 'Ordered',    dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-500/10' },
  DISPATCHED: { label: 'Dispatched', dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-500/10' },
  DELIVERED:  { label: 'Delivered',  dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  CANCELLED:  { label: 'Cancelled',  dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-500/10' },
};

const NEXT_STATUS = {
  ORDERED:    ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['DELIVERED', 'CANCELLED'],
  DELIVERED:  [],
  CANCELLED:  [],
};

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.ORDERED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
    </span>
  );
}

const PAYMENT = {
  PENDING:   { label: 'Payment pending',  text: 'text-amber-400',   bg: 'bg-amber-500/10' },
  APPROVED:  { label: 'Paid',             text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  FAILED:    { label: 'Payment failed',   text: 'text-red-400',     bg: 'bg-red-500/10' },
  CANCELLED: { label: 'Payment cancelled',text: 'text-white/40',    bg: 'bg-white/[0.06]' },
  REFUNDED:  { label: 'Refunded',         text: 'text-white/50',    bg: 'bg-white/[0.06]' },
};

function PaymentPill({ status }) {
  const s = PAYMENT[status] || PAYMENT.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

export default function OrdersManager() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilter] = useState('');
  const [selected, setSelected] = useState(null); // detail panel
  const [detail, setDetail]     = useState(null);
  const [detailLoading, setDL]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [trackInput, setTrackInput] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { load(); }, [filterStatus]);
  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setLoading(true);
    const { orders: data } = await getAllOrders({ status: filterStatus, search });
    setOrders(data || []);
    setLoading(false);
  };

  const openDetail = async (order) => {
    setSelected(order);
    setDL(true);
    const { order: full } = await getOrderDetails(order.id);
    setDetail(full);
    setTrackInput(full?.tracking_number || '');
    setDL(false);
  };

  const handleStatusChange = async (orderId, status) => {
    setMenuOpen(null);
    setUpdating(true);
    const { error } = await updateOrderStatus(orderId, status);
    setUpdating(false);
    if (error) { toast(error, 'error'); return; }
    toast(`Order marked as ${STATUS[status]?.label}`, 'success');
    load();
    if (selected?.id === orderId) openDetail({ id: orderId });
  };

  const saveTracking = async () => {
    if (!detail) return;
    setUpdating(true);
    const { error } = await updateTrackingInfo(detail.id, trackInput, '');
    setUpdating(false);
    if (error) { toast(error, 'error'); return; }
    toast('Tracking number saved', 'success');
    openDetail(detail);
  };

  const fmt = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—';
  const fmtTime = (v) => v ? new Date(v).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) : '';

  const statCounts = {
    ORDERED:    orders.filter(o => o.status === 'ORDERED').length,
    DISPATCHED: orders.filter(o => o.status === 'DISPATCHED').length,
    DELIVERED:  orders.filter(o => o.status === 'DELIVERED').length,
  };

  return (
    <div className="flex h-full overflow-hidden" onClick={() => setMenuOpen(null)}>
      {/* Left — Orders List */}
      <div className={`flex flex-col ${selected ? 'w-[55%]' : 'flex-1'} border-r border-white/[0.06] transition-all overflow-hidden`}>
        <div className="p-6 border-b border-white/[0.06] shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Operations</p>
              <h1 className="text-2xl font-bold text-white">Orders</h1>
            </div>
            <button onClick={() => exportOrdersToCSV(orders)} className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-semibold">Export CSV</button>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[['ORDERED','Ordered','text-blue-400'],['DISPATCHED','Dispatched','text-amber-400'],['DELIVERED','Delivered','text-emerald-400']].map(([s,l,c]) => (
              <button key={s} onClick={() => setFilter(filterStatus === s ? '' : s)}
                className={`p-2.5 rounded-xl border text-center transition-all ${filterStatus === s ? 'border-white/20 bg-white/5' : 'border-white/[0.05] hover:border-white/10'}`}>
                <p className={`text-lg font-bold ${c}`}>{statCounts[s]}</p>
                <p className="text-[9px] text-white/30 font-medium uppercase tracking-wider">{l}</p>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or email..."
              className="w-full bg-[#141410] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none focus:border-white/15 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No orders found</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id}
              onClick={() => openDetail(order)}
              className={`flex items-center gap-4 px-6 py-4 border-b border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.02] ${selected?.id === order.id ? 'bg-white/[0.03]' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-[13px] font-semibold text-white">#{order.order_number}</p>
                  <PaymentPill status={order.payment_status} />
                  <StatusPill status={order.status} />
                </div>
                <p className="text-[11px] text-white/40 truncate">{order.customer_name} · {order.customer_email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-semibold text-white">₦{(order.total||0).toLocaleString()}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{fmt(order.created_at)}</p>
              </div>
              <div className="shrink-0" onClick={e => e.stopPropagation()}>
                {NEXT_STATUS[order.status]?.length > 0 && (
                  <RowActionMenu
                    open={menuOpen === order.id}
                    onOpenChange={(next) => setMenuOpen(next ? order.id : null)}
                    trigger={
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/[0.06] transition-all">
                        <ChevronDown size={14} />
                      </button>
                    }
                  >
                    {NEXT_STATUS[order.status]?.map(ns => (
                      <button key={ns} onClick={() => { handleStatusChange(order.id, ns); setMenuOpen(null); }}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-[12px] transition-colors ${ns === 'CANCELLED' ? 'text-red-400 hover:bg-red-500/5' : `${STATUS[ns]?.text} hover:bg-white/[0.04]`}`}>
                        {ns === 'DISPATCHED' && <Truck size={12} />}
                        {ns === 'DELIVERED'  && <CheckCircle size={12} />}
                        {ns === 'CANCELLED'  && <XCircle size={12} />}
                        Mark {STATUS[ns]?.label}
                      </button>
                    ))}
                  </RowActionMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Order Detail */}
      {selected && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a08]">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Order Details</p>
              <h2 className="text-[15px] font-bold text-white mt-0.5">#{detail?.order_number || selected.order_number}</h2>
            </div>
            <button onClick={() => { setSelected(null); setDetail(null); }} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
          </div>

          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : detail ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PaymentPill status={detail.payment_status} />
                  <StatusPill status={detail.status} />
                </div>
                <div className="flex gap-2">
                  {NEXT_STATUS[detail.status]?.map(ns => (
                    <button key={ns} onClick={() => handleStatusChange(detail.id, ns)} disabled={updating}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50
                        ${ns === 'CANCELLED' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-[#c9a96e]/10 text-[#c9a96e] hover:bg-[#c9a96e]/20'}`}>
                      → {STATUS[ns]?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-[#141410] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Customer</p>
                <div className="flex items-center gap-2 text-[12px] text-white/60"><Mail size={12} className="text-white/20" />{detail.customer_email}</div>
                <div className="flex items-center gap-2 text-[12px] text-white/60"><Phone size={12} className="text-white/20" />{detail.customer_phone || '—'}</div>
                {detail.shipping_address && (
                  <div className="flex items-start gap-2 text-[12px] text-white/60">
                    <MapPin size={12} className="text-white/20 mt-0.5 shrink-0" />
                    <span>{detail.shipping_address?.line1}, {detail.shipping_address?.city}, {detail.shipping_address?.state}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="bg-[#141410] border border-white/[0.06] rounded-xl overflow-hidden">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-4 py-3 border-b border-white/[0.06]">Items Ordered</p>
                {(detail.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-white/70 truncate">{item.product?.name || 'Product'}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[12px] font-semibold text-white/60 shrink-0">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                  </div>
                ))}
                <div className="px-4 py-3 bg-white/[0.02] flex justify-between">
                  <p className="text-[12px] font-bold text-white">Total</p>
                  <p className="text-[13px] font-bold text-[#c9a96e]">₦{(detail.total || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Tracking */}
              <div className="bg-[#141410] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Tracking Number</p>
                <div className="flex gap-2">
                  <input value={trackInput} onChange={e => setTrackInput(e.target.value)} placeholder="Enter tracking number..."
                    className="flex-1 bg-[#0a0a08] border border-white/[0.08] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-white/25 transition-colors" />
                  <button onClick={saveTracking} disabled={updating} className="px-4 py-2.5 bg-[#c9a96e]/10 text-[#c9a96e] rounded-xl text-[12px] font-semibold hover:bg-[#c9a96e]/20 transition-colors disabled:opacity-50">Save</button>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-[#141410] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Timeline</p>
                <div className="space-y-3">
                  {[
                    { label: 'Order placed',  time: detail.created_at,    icon: ShoppingCart, active: true },
                    { label: 'Dispatched',    time: detail.dispatched_at, icon: Truck,         active: !!detail.dispatched_at },
                    { label: 'Delivered',     time: detail.delivered_at,  icon: CheckCircle,   active: !!detail.delivered_at },
                  ].map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <div key={i} className={`flex items-center gap-3 ${!step.active ? 'opacity-25' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.active ? 'bg-[#c9a96e]/20' : 'bg-white/5'}`}>
                          <Icon size={12} className={step.active ? 'text-[#c9a96e]' : 'text-white/30'} />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-white/70">{step.label}</p>
                          {step.time && <p className="text-[10px] text-white/30">{fmt(step.time)} at {fmtTime(step.time)}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
