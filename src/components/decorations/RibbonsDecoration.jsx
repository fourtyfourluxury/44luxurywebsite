import { useMemo } from 'react';

const RIBBON_COLORS = ['#15803d', '#ffffff', '#16a34a', '#fcf9f3'];

/**
 * Thin green and white ribbons/confetti pieces drifting down (Independence Day / festive).
 */
export default function RibbonsDecoration({ count = 24 }) {
  const ribbons = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 37 + 9) % 100;
      const left = ((i * 100) / count + (seed % 7)) % 98;
      const dur = 8.5 + (seed % 7);
      const delay = -((seed * 0.22) % dur);
      const color = RIBBON_COLORS[i % RIBBON_COLORS.length];
      const height = 14 + (seed % 8);
      return { id: i, left, dur, delay, color, height };
    });
  }, [count]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {ribbons.map((r) => (
        <div
          key={r.id}
          className="dec-fall-tumble absolute -top-6"
          style={{
            left: `${r.left.toFixed(1)}%`,
            animationDuration: `${r.dur}s`,
            animationDelay: `${r.delay.toFixed(2)}s`,
            opacity: 0.82,
          }}
        >
          <svg width="8" height={r.height} viewBox="0 0 8 20" fill="none">
            <path
              d="M4 1C1.5 5 6.5 10 4 14C2 17 5 19 4 19.5"
              stroke={r.color}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
