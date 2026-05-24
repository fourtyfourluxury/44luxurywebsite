const STATUS_MAP = {
  ACTIVE:      'bg-green-900/40 text-green-400 border-green-700/30',
  DRAFT:       'bg-[#2a2a26] text-concrete border-[#3a3a36]',
  'SOLD OUT':  'bg-red-900/30 text-red-400 border-red-700/30',
  DELIVERED:   'bg-green-900/40 text-green-400 border-green-700/30',
  DISPATCHED:  'bg-blue-900/40 text-blue-400 border-blue-700/30',
  PROCESSING:  'bg-yellow-900/30 text-yellow-400 border-yellow-700/30',
  CANCELLED:   'bg-red-900/30 text-red-400 border-red-700/30',
  PENDING:     'bg-orange-900/30 text-orange-400 border-orange-700/30',
  REFUNDED:    'bg-purple-900/30 text-purple-400 border-purple-700/30',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_MAP[status] || 'bg-[#2a2a26] text-concrete border-[#3a3a36]';
  return (
    <span className={`inline-block border font-grotesk font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 ${cls}`}>
      {status}
    </span>
  );
}
