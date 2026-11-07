/**
 * 3 baubles hanging on thin lines from the top edge near a corner, swaying slightly.
 */
export default function OrnamentsHanging({
  side = 'left',
  tokens = {},
  reducedMotion = false,
}) {
  const accent = tokens.accent || '#b91c1c';
  const contrast = tokens.banner_text || '#fcf9f3';
  const posStyle =
    side === 'right'
      ? { right: '2.2%', top: 'var(--header-offset, 70px)' }
      : { left: '2.2%', top: 'var(--header-offset, 70px)' };

  const baubles = [
    { x: 18, len: 38, r: 9, color: accent, dur: '4.5s' },
    { x: 46, len: 56, r: 10.5, color: '#d4af37', dur: '5.4s' },
    { x: 74, len: 32, r: 8, color: contrast, dur: '4.9s' },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={posStyle}
    >
      <svg width="94" height="82" viewBox="0 0 94 82" fill="none">
        {baubles.map((b, idx) => (
          <g
            key={idx}
            className={reducedMotion ? '' : 'dec-swing-top'}
            style={{
              transformOrigin: `${b.x}px 0px`,
              animationDuration: b.dur,
            }}
          >
            <line x1={b.x} y1="0" x2={b.x} y2={b.len} stroke="#d4af37" strokeWidth="1" />
            <rect x={b.x - 2.5} y={b.len - 2} width="5" height="3" fill="#d4af37" />
            <circle
              cx={b.x}
              cy={b.len + b.r}
              r={b.r}
              fill={b.color}
              stroke="#d4af37"
              strokeWidth="1"
            />
            <path
              d={`M${b.x - b.r + 2} ${b.len + b.r} Q${b.x} ${b.len + b.r + 3} ${b.x + b.r - 2} ${b.len + b.r}`}
              stroke="#d4af37"
              strokeWidth="1"
              fill="none"
              opacity="0.75"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

