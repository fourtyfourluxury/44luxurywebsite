import { useMemo } from 'react';

/**
 * Six-armed snowflake SVGs in mixed sizes (6 to 18 px), different fall speeds,
 * gentle side-to-side sway and slow rotation; plus soft round flakes behind for depth.
 */
export default function SnowDecoration({ count = 24 }) {
  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 37 + 13) % 100;
      const isRoundBack = i % 4 === 0;
      const size = isRoundBack ? 4 + (seed % 5) : 6 + (seed % 13); // 6 to 18px
      const left = ((i * 100) / count + (seed % 7)) % 98;
      const dur = 9 + (seed % 9); // 9s to 17s
      const delay = -((seed * 0.23) % dur);
      const opacity = isRoundBack ? 0.35 + (seed % 25) * 0.01 : 0.55 + (seed % 35) * 0.01;
      return { id: i, isRoundBack, size, left, dur, delay, opacity };
    });
  }, [count]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((f) => (
        <div
          key={f.id}
          className="dec-fall-sway absolute -top-6"
          style={{
            left: `${f.left.toFixed(1)}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay.toFixed(2)}s`,
          }}
        >
          {f.isRoundBack ? (
            <svg viewBox="0 0 12 12" width={f.size} height={f.size}>
              <circle cx="6" cy="6" r="4.5" fill="#ffffff" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width={f.size}
              height={f.size}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <g>
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M9.5 4.5L12 7L14.5 4.5M9.5 19.5L12 17L14.5 19.5" />
              </g>
              <g transform="rotate(60 12 12)">
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M9.5 4.5L12 7L14.5 4.5M9.5 19.5L12 17L14.5 19.5" />
              </g>
              <g transform="rotate(120 12 12)">
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M9.5 4.5L12 7L14.5 4.5M9.5 19.5L12 17L14.5 19.5" />
              </g>
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

