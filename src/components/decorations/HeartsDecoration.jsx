import { useMemo } from 'react';

/**
 * Hearts rising from the bottom with slight wobble and fading out.
 */
export default function HeartsDecoration({ count = 24, tokens = {} }) {
  const colors = useMemo(
    () => [
      tokens.accent || '#be123c',
      '#fb7185',
      '#f43f5e',
      tokens.banner_text || '#fda4af',
    ],
    [tokens.accent, tokens.banner_text]
  );

  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 29 + 7) % 100;
      const size = 9 + (seed % 9);
      const left = ((i * 100) / count + (seed % 8)) % 97;
      const dur = 8 + (seed % 7);
      const delay = -((seed * 0.27) % dur);
      const color = colors[i % colors.length];
      return { id: i, size, left, dur, delay, color };
    });
  }, [count, colors]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="dec-rise-wobble absolute -bottom-6"
          style={{
            left: `${h.left.toFixed(1)}%`,
            animationDuration: `${h.dur}s`,
            animationDelay: `${h.delay.toFixed(2)}s`,
          }}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill={h.color}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

