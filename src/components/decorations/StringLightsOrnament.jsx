/**
 * A drooping string of small bulbs in alternating theme colors under the header,
 * with a soft twinkle (opacity only, slow).
 */
export default function StringLightsOrnament({
  tokens = {},
  isPhone = false,
  reducedMotion = false,
}) {
  const colors = [
    tokens.accent || '#b91c1c',
    '#d4af37',
    tokens.banner_text || '#fcf9f3',
    '#22c55e',
  ];

  const segments = isPhone ? 4 : 8;

  return (
    <div
      aria-hidden="true"
      className="absolute left-0 right-0 pointer-events-none select-none overflow-hidden"
      style={{ top: 'var(--header-offset, 70px)', height: isPhone ? '22px' : '28px' }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${segments * 120} 28`}
        preserveAspectRatio="none"
      >
        {Array.from({ length: segments }, (_, sIdx) => {
          const x0 = sIdx * 120;
          const xMid = x0 + 60;
          const x1 = x0 + 120;
          return (
            <g key={sIdx}>
              <path
                d={`M${x0} 1 Q${xMid} 19 ${x1} 1`}
                stroke="#3a3a34"
                strokeWidth="1.2"
                fill="none"
              />
              {[0.22, 0.5, 0.78].map((t, bIdx) => {
                const bx = x0 + t * 120;
                const by = 1 + 4 * t * (1 - t) * 10 + 3;
                const col = colors[(sIdx * 3 + bIdx) % colors.length];
                const isEven = (sIdx + bIdx) % 2 === 0;
                return (
                  <g
                    key={bIdx}
                    className={
                      reducedMotion
                        ? ''
                        : isEven
                        ? 'dec-twinkle'
                        : 'dec-twinkle-alt'
                    }
                    style={{
                      animationDuration: isEven ? '3.4s' : '4.2s',
                    }}
                  >
                    <rect x={bx - 1.5} y={by - 4} width="3" height="2.5" fill="#292524" />
                    <ellipse cx={bx} cy={by + 1} rx="3.2" ry="4.5" fill={col} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
