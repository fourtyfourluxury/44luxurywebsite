import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, X, ShoppingBag, Heart, AlertCircle } from 'lucide-react';

// Global event bus for toasts
const listeners = new Set();

export function toast(message, type = 'success') {
  const id = Date.now();
  listeners.forEach(fn => fn({ id, message, type }));
}

export function useToastEvents(callback) {
  useEffect(() => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }, [callback]);
}

const ICONS = {
  success: CheckCircle,
  cart: ShoppingBag,
  wishlist: Heart,
  error: AlertCircle,
};

const COLORS = {
  success: 'bg-[#1c1c18] text-[#fcf9f3]',
  cart: 'bg-[#D4AF37] text-[#1c1c18]',
  wishlist: 'bg-[#4b0e1e] text-[#fcf9f3]',
  error: 'bg-red-800 text-[#fcf9f3]',
};

function ToastItem({ toast: t, onRemove }) {
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[t.type] || CheckCircle;

  useEffect(() => {
    const enter = setTimeout(() => setVisible(true), 10);
    const exit = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(t.id), 350);
    }, 2800);
    return () => { clearTimeout(enter); clearTimeout(exit); };
  }, [t.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 shadow-2xl min-w-[240px] max-w-[360px]
        ${COLORS[t.type] || COLORS.success}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transition: 'opacity 0.35s ease, transform 0.35s ease' }}
    >
      <Icon size={17} className="shrink-0" />
      <p className="font-grotesk font-semibold text-xs uppercase tracking-widest flex-1">{t.message}</p>
      <button onClick={() => { setVisible(false); setTimeout(() => onRemove(t.id), 350); }} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts(prev => [...prev, t]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useToastEvents(addToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
