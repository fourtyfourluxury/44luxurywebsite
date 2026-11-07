import { useMemo } from 'react';

/**
 * Small rectangles and circles in the theme colors, tumbling down.
 */
export default function ConfettiDecoration({ count = 24, tokens = {} }) {
  const palette = useMemo(
    () => [
      tokens.accent || '#4b0e1e',
      tokens.banner_bg || '#1c1c18',
      tokens.banner_text || '#fcf9f3',
      '#d4af37',
      '#e6c687',
    ],
    [tokens.accent, tokens.banner_bg, tokens.banner_text]
  );

  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 41 + 19) % 100;
      const isCircle = i % 3 === 0;
      const size = 7 + (seed % 7);
      const left = ((i * 100) / count + (seed % 6)) % 98;
      const dur = 7.5 + (seed % 7);
      const delay = -((seed * 0.19) % dur);
      const color = palette[i % palette.length];
      return { id: i, isCircle, size, left, dur, delay, color };
    });
  }, [count, palette]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="dec-fall-tumble absolute -top-5"
          style={{
            left: `${p.left.toFixed(1)}%`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay.toFixed(2)}s`,
            opacity: 0.78,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 12 12">
            {p.isCircle ? (
              <circle cx="6" cy="6" r="4.5" fill={p.color} />
            ) : (
              <rect x="1.5" y="3" width="9" height="5.5" fill={p.color} />
            )}
          </svg>
        </div>
      ))}
    </div>
  );
}

