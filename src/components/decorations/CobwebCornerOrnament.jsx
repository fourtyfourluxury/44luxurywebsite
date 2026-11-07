/**
 * A thin cobweb in the top corner (static).
 */
export default function CobwebCornerOrnament({ side = 'left' }) {
  const posStyle =
    side === 'right'
      ? { right: 0, top: 'var(--header-offset, 70px)', transform: 'scaleX(-1)' }
      : { left: 0, top: 'var(--header-offset, 70px)' };

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none opacity-55"
      style={posStyle}
    >
      <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
        <g stroke="#a8a29e" strokeWidth="1.1">
          {/* Radial threads */}
          <line x1="0" y1="0" x2="106" y2="12" />
          <line x1="0" y1="0" x2="96" y2="48" />
          <line x1="0" y1="0" x2="76" y2="76" />
          <line x1="0" y1="0" x2="48" y2="96" />
          <line x1="0" y1="0" x2="12" y2="106" />

          {/* Connecting scalloped web arcs */}
          <path d="M28 3 Q26 10 25 13 Q22 18 20 20 Q16 23 13 25 Q8 26 3 28" />
          <path d="M56 6 Q52 18 50 25 Q45 34 40 40 Q33 46 25 50 Q16 53 6 56" />
          <path d="M84 9 Q78 26 74 37 Q66 50 58 58 Q48 67 37 74 Q24 79 9 84" />
        </g>
      </svg>
    </div>
  );
}

