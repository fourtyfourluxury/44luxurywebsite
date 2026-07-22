import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * A row-action dropdown that portals its menu to document.body instead of
 * rendering inline. Table/list rows commonly sit inside an `overflow-hidden`
 * or `overflow-y-auto` ancestor (for rounded corners or scrolling) — an
 * absolutely-positioned menu inside that ancestor gets silently clipped
 * wherever it extends past the ancestor's bounds, no matter its z-index.
 * Portaling escapes that clipping entirely.
 */
export default function RowActionMenu({ trigger, children, open, onOpenChange, align = 'right' }) {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({
        top: rect.bottom + 4,
        left: align === 'left' ? rect.left : undefined,
        right: align === 'right' ? window.innerWidth - rect.right : undefined,
      });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onOpenChange]);

  return (
    <>
      <span ref={triggerRef} className="inline-flex" onClick={(e) => { e.stopPropagation(); onOpenChange(!open); }}>
        {trigger}
      </span>
      {open && coords && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{ position: 'fixed', top: coords.top, left: coords.left, right: coords.right }}
          className="bg-[#1e1e1a] border border-white/10 rounded-xl shadow-2xl z-[100] w-48 py-1 overflow-hidden"
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
