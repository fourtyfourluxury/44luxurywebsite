import { useMemo } from 'react';

/**
 * Soft flower petals and tiny blossoms drifting down in spring tones.
 */
export default function PetalsDecoration({ count = 24, tokens = {} }) {
  const springTones = useMemo(
    () => [
      '#fbcfe8',
      '#f9a8d4',
      '#fde68a',
      '#ddd6fe',
      tokens.accent || '#f472b6',
    ],
    [tokens.accent]
  );

  const petals = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 31 + 11) % 100;
      const isBlossom = i % 4 === 0;
      const size = isBlossom ? 11 + (seed % 5) : 8 + (seed % 7);
      const left = ((i * 100) / count + (seed % 7)) % 98;
      const dur = 9 + (seed % 8);
      const delay = -((seed * 0.21) % dur);
      const color = springTones[i % springTones.length];
      return { id: i, isBlossom, size, left, dur, delay, color };
    });
  }, [count, springTones]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {petals.map((p) => (
        <div
          key={p.id}
          className="dec-fall-sway absolute -top-5"
          style={{
            left: `${p.left.toFixed(1)}%`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay.toFixed(2)}s`,
            opacity: 0.78,
          }}
        >
          {p.isBlossom ? (
            <svg width={p.size} height={p.size} viewBox="0 0 20 20">
              <circle cx="10" cy="5" r="3.5" fill={p.color} />
              <circle cx="15" cy="9" r="3.5" fill={p.color} />
              <circle cx="13" cy="15" r="3.5" fill={p.color} />
              <circle cx="7" cy="15" r="3.5" fill={p.color} />
              <circle cx="5" cy="9" r="3.5" fill={p.color} />
              <circle cx="10" cy="10.5" r="2.2" fill="#fef08a" />
            </svg>
          ) : (
            <svg width={p.size} height={p.size} viewBox="0 0 16 16">
              <path
                d="M8 1C4.5 4 3 8.5 5.5 12.5C7 14.5 9 14.5 10.5 12.5C13 8.5 11.5 4 8 1Z"
                fill={p.color}
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

