import { useMemo } from 'react';

/**
 * 3 to 5 small bats flying slowly across the top third of the screen.
 */
export default function BatsDecoration({ count = 24 }) {
  const batCount = count <= 12 ? 3 : count <= 24 ? 4 : 5;

  const bats = useMemo(() => {
    return Array.from({ length: batCount }, (_, i) => {
      const top = 9 + i * 5.5; // strictly within top third (9% to 31%)
      const dur = 16 + i * 3.5; // slow flight 16s to 30s
      const delay = -(i * 4.2);
      const size = 20 + (i % 3) * 4;
      return { id: i, top, dur, delay, size };
    });
  }, [batCount]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {bats.map((b) => (
        <div
          key={b.id}
          className="dec-bat-fly absolute left-0"
          style={{
            top: `${b.top}%`,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            opacity: 0.72,
          }}
        >
          <svg width={b.size} height={b.size * 0.55} viewBox="0 0 36 20" fill="#1c1c18">
            <path d="M18 7L15 3L14 7C10 4 4 4 0 9C4 8 7 10 9 13C11 11 14 11 16 14L18 16L20 14C22 11 25 11 27 13C29 10 32 8 36 9C32 4 26 4 22 7L21 3L18 7Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

