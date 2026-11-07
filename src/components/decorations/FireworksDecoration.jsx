import { useMemo } from 'react';

/**
 * Soft, slow bursts of small particles in theme colors, one burst every 12 to 20 seconds,
 * low opacity, NO rapid flashing (nothing flashes more than 3 times per second).
 */
export default function FireworksDecoration({ tokens = {} }) {
  const bursts = useMemo(() => {
    const colors = [
      tokens.accent || '#d4af37',
      '#d4af37',
      tokens.banner_text || '#fcf9f3',
    ];
    return [
      { id: 0, left: '22%', top: '24%', dur: '14s', delay: '0s', color: colors[0] },
      { id: 1, left: '76%', top: '20%', dur: '17s', delay: '-5.5s', color: colors[1] },
      { id: 2, left: '50%', top: '28%', dur: '19s', delay: '-11s', color: colors[2] },
    ];
  }, [tokens.accent, tokens.banner_text]);

  const rays = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 30), []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {bursts.map((b) => (
        <div
          key={b.id}
          className="dec-firework-burst absolute"
          style={{
            left: b.left,
            top: b.top,
            animationDuration: b.dur,
            animationDelay: b.delay,
          }}
        >
          <svg width="96" height="96" viewBox="0 0 96 96" className="-translate-x-1/2 -translate-y-1/2">
            {rays.map((deg) => (
              <g key={deg} transform={`rotate(${deg} 48 48)`}>
                <circle cx="48" cy="14" r="2.2" fill={b.color} opacity="0.55" />
                <circle cx="48" cy="24" r="1.5" fill="#d4af37" opacity="0.4" />
              </g>
            ))}
          </svg>
        </div>
      ))}
    </div>
  );
}

