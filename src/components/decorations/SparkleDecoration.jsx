import { useMemo } from 'react';

/**
 * Tiny four-point stars that twinkle in place (opacity only).
 */
export default function SparkleDecoration({ count = 24, tokens = {} }) {
  const colors = useMemo(
    () => ['#d4af37', '#fef08a', tokens.accent || '#c9a96e', tokens.banner_text || '#fcf9f3'],
    [tokens.accent, tokens.banner_text]
  );

  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 43 + 17) % 100;
      const size = 7 + (seed % 8);
      const left = ((i * 97) / count + (seed % 9)) % 96;
      const top = 6 + ((i * 83 + seed) % 86);
      const dur = 3.2 + (seed % 5) * 0.7; // slow opacity twinkle
      const delay = -((seed * 0.17) % dur);
      const color = colors[i % colors.length];
      return { id: i, size, left, top, dur, delay, color };
    });
  }, [count, colors]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="dec-twinkle absolute"
          style={{
            left: `${s.left.toFixed(1)}%`,
            top: `${s.top.toFixed(1)}%`,
            animationDuration: `${s.dur.toFixed(2)}s`,
            animationDelay: `${s.delay.toFixed(2)}s`,
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 20 20" fill={s.color}>
            <path d="M10 0L12.3 7.7L20 10L12.3 12.3L10 20L7.7 12.3L0 10L7.7 7.7L10 0Z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

