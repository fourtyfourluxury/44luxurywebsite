import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ title = 'Are you sure?', message, confirmLabel = 'DELETE', onConfirm, onCancel, danger = true }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1c1c18] border border-[#2a2a26] w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a26]">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className={danger ? 'text-red-500' : 'text-[#D4AF37]'} />
            <h3 className="font-unica text-xl uppercase tracking-tighter text-bone">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-concrete hover:text-bone transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="font-plex text-sm text-concrete leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 font-grotesk font-bold uppercase tracking-widest text-xs transition-colors
              ${danger ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-[#D4AF37] text-[#1c1c18] hover:bg-[#c9a02d]'}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-[#2a2a26] text-concrete hover:text-bone font-grotesk font-bold uppercase tracking-widest text-xs transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
