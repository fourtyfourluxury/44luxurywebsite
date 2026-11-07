/**
 * 3 fanous-style lanterns hanging from the top edge with a warm glow and a gentle swing.
 */
export default function LanternsOrnament({
  side = 'left',
  tokens = {},
  reducedMotion = false,
}) {
  const frameColor = '#d4af37';
  const accent = tokens.accent || '#0f766e';
  const posStyle =
    side === 'right'
      ? { right: '2.2%', top: 'var(--header-offset, 70px)' }
      : { left: '2.2%', top: 'var(--header-offset, 70px)' };

  const lanterns = [
    { x: 22, chain: 20, scale: 0.9, dur: '5.2s' },
    { x: 54, chain: 34, scale: 1.05, dur: '6.1s' },
    { x: 84, chain: 16, scale: 0.85, dur: '4.8s' },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={posStyle}
    >
      <svg width="108" height="106" viewBox="0 0 108 106" fill="none">
        {lanterns.map((l, idx) => (
          <g
            key={idx}
            className={reducedMotion ? '' : 'dec-swing-top'}
            style={{
              transformOrigin: `${l.x}px 0px`,
              animationDuration: l.dur,
            }}
          >
            {/* Hanging chain */}
            <line x1={l.x} y1="0" x2={l.x} y2={l.chain} stroke={frameColor} strokeWidth="1.2" />

            <g transform={`translate(${l.x}, ${l.chain}) scale(${l.scale})`}>
              {/* Warm outer aura */}
              <circle cx="0" cy="22" r="14" fill="#fde047" opacity="0.22" />
              {/* Dome */}
              <path d="M-8 8 Q0 -2 8 8 Z" fill={frameColor} />
              {/* Lantern body */}
              <polygon points="-8,8 8,8 10,28 -10,28" fill={accent} stroke={frameColor} strokeWidth="1.4" />
              {/* Inner glowing window */}
              <polygon points="-5,11 5,11 6,25 -6,25" fill="#fef08a" opacity="0.9" />
              {/* Base & tassel */}
              <polygon points="-10,28 10,28 6,33 -6,33" fill={frameColor} />
              <circle cx="0" cy="36" r="1.8" fill={frameColor} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

