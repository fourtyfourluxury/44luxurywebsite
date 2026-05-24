import { useState, useEffect } from 'react';
import { Search, MessageSquare, X, Send, Clock, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { getAllComplaints, respondToComplaint, updateComplaintStatus } from '../../services/admin/complaintAdminService';
import { toast } from '../../components/ui/ToastProvider';

const STATUS_CFG = {
  'OPEN':      { dot: 'bg-red-400',    text: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Open' },
  'IN REVIEW': { dot: 'bg-amber-400',  text: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'In Review' },
  'RESOLVED':  { dot: 'bg-emerald-400',text: 'text-emerald-400',bg: 'bg-emerald-500/10',label: 'Resolved' },
};

function StatusPill({ status }) {
  const s = STATUS_CFG[status] || STATUS_CFG['OPEN'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
    </span>
  );
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('IN REVIEW');
  const [sending, setSending]   = useState(false);

  useEffect(() => { load(); }, [filterStatus]);
  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (selected) {
      setResponse(selected.admin_response || '');
      setNewStatus(selected.status === 'OPEN' ? 'IN REVIEW' : selected.status);
    }
  }, [selected]);

  const load = async () => {
    setLoading(true);
    const { data } = await getAllComplaints({ status: filterStatus || 'ALL', search });
    setComplaints(data || []);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!selected || !response.trim()) { toast('Please write a response', 'error'); return; }
    setSending(true);
    const { error } = await respondToComplaint(selected.id, response.trim(), newStatus);
    setSending(false);
    if (error) { toast(error, 'error'); return; }
    toast('Response sent! Customer will be notified by email.', 'success');
    load();
    setSelected(prev => ({ ...prev, admin_response: response, status: newStatus }));
  };

  const quickStatus = async (id, status) => {
    const { error } = await updateComplaintStatus(id, status);
    if (error) { toast(error, 'error'); return; }
    toast(`Marked as ${STATUS_CFG[status]?.label}`, 'success');
    load();
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  const fmt = (v) => v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const timeAgo = (v) => {
    if (!v) return '';
    const diff = Date.now() - new Date(v).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const open      = complaints.filter(c => c.status === 'OPEN').length;
  const inReview  = complaints.filter(c => c.status === 'IN REVIEW').length;
  const resolved  = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left — Inbox List */}
      <div className={`flex flex-col ${selected ? 'w-[45%]' : 'flex-1'} border-r border-white/[0.06] transition-all overflow-hidden`}>
        <div className="p-6 border-b border-white/[0.06] shrink-0">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Operations</p>
            <h1 className="text-2xl font-bold text-white">Complaints</h1>
          </div>
          {/* Stat filters */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[['', 'All', `${complaints.length}`, 'text-white'], ['OPEN', 'Open', `${open}`, 'text-red-400'], ['RESOLVED', 'Resolved', `${resolved}`, 'text-emerald-400']].map(([s, l, count, c]) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`p-2.5 rounded-xl border text-center transition-all ${filterStatus === s ? 'border-white/20 bg-white/5' : 'border-white/[0.05] hover:border-white/10'}`}>
                <p className={`text-lg font-bold ${c}`}>{count}</p>
                <p className="text-[9px] text-white/30 font-medium uppercase tracking-wider">{l}</p>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full bg-[#141410] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-[12px] text-white placeholder-white/25 outline-none focus:border-white/15 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No complaints found</p>
            </div>
          ) : complaints.map(c => (
            <div key={c.id}
              onClick={() => setSelected(c)}
              className={`px-6 py-4 cursor-pointer transition-colors hover:bg-white/[0.02] ${selected?.id === c.id ? 'bg-white/[0.03]' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  {c.status === 'OPEN' && <span className="w-2 h-2 rounded-full bg-red-400 shrink-0 mt-0.5" />}
                  <p className="text-[13px] font-semibold text-white/80 truncate">{c.customer_name || 'Anonymous'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusPill status={c.status} />
                  <p className="text-[10px] text-white/25">{timeAgo(c.created_at)}</p>
                </div>
              </div>
              <p className="text-[12px] font-semibold text-white/50 truncate">{c.subject || 'No subject'}</p>
              <p className="text-[11px] text-white/30 truncate mt-0.5">{c.message}</p>
              {c.order_number && (
                <p className="text-[10px] text-white/20 mt-1.5">Order #{c.order_number}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Detail & Response */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a08]">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[15px] font-bold text-white truncate">{selected.customer_name}</p>
                <StatusPill status={selected.status} />
              </div>
              <p className="text-[11px] text-white/40">{selected.email} · {fmt(selected.created_at)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selected.status !== 'RESOLVED' && (
                <button onClick={() => quickStatus(selected.id, 'RESOLVED')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[11px] font-semibold hover:bg-emerald-500/20 transition-colors">
                  <CheckCircle size={12} /> Resolve
                </button>
              )}
              {selected.status === 'RESOLVED' && (
                <button onClick={() => quickStatus(selected.id, 'OPEN')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-[11px] font-semibold hover:bg-white/10 hover:text-white/60 transition-colors">
                  <RotateCcw size={12} /> Reopen
                </button>
              )}
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white transition-colors ml-2"><X size={16} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Complaint */}
            <div className="bg-[#141410] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-white/70">{selected.subject || 'Support Request'}</p>
                {selected.order_number && (
                  <span className="text-[10px] text-white/30 bg-white/5 px-2.5 py-1 rounded-full">Order #{selected.order_number}</span>
                )}
              </div>
              <p className="text-[13px] text-white/60 leading-relaxed">{selected.message}</p>
            </div>

            {/* Previous response */}
            {selected.admin_response && (
              <div className="bg-[#c9a96e]/[0.05] border border-[#c9a96e]/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={13} className="text-[#c9a96e]" />
                  <p className="text-[11px] font-semibold text-[#c9a96e]">Your Previous Response</p>
                </div>
                <p className="text-[13px] text-white/60 leading-relaxed">{selected.admin_response}</p>
              </div>
            )}

            {/* Response Box */}
            <div className="bg-[#141410] border border-white/[0.06] rounded-xl p-5 space-y-4">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                {selected.admin_response ? 'Update Response' : 'Write Response'}
              </p>
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                rows={5}
                placeholder="Type your response to the customer. They will receive this by email..."
                className="w-full bg-[#0a0a08] border border-white/[0.08] focus:border-white/20 rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 outline-none resize-none transition-colors"
              />
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">Update Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    className="w-full bg-[#0a0a08] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[12px] text-white outline-none transition-colors">
                    <option value="IN REVIEW">In Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="OPEN">Open</option>
                  </select>
                </div>
                <button onClick={handleSend} disabled={sending || !response.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#c9a96e] text-[#0a0a08] rounded-xl text-[12px] font-bold hover:bg-[#d4b87e] transition-colors disabled:opacity-40 mt-5">
                  <Send size={13} />{sending ? 'Sending...' : 'Send Response'}
                </button>
              </div>
              <p className="text-[10px] text-white/25">📧 Customer will receive an email notification with your response.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#0a0a08]">
          <div className="text-center">
            <MessageSquare size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/25 text-sm">Select a complaint to respond</p>
          </div>
        </div>
      )}
    </div>
  );
}
