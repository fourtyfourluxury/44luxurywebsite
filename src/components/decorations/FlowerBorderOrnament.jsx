/**
 * A thin row of tulips and daisies along the bottom edge that sways slowly.
 */
export default function FlowerBorderOrnament({
  tokens = {},
  isPhone = false,
  reducedMotion = false,
}) {
  const count = isPhone ? 10 : 22;
  const tulipColors = [
    tokens.accent || '#ec4899',
    '#f472b6',
    '#fbbf24',
    '#a78bfa',
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 right-0 pointer-events-none select-none overflow-hidden"
      style={{ height: isPhone ? '22px' : '32px' }}
    >
      <div
        className={`w-full h-full flex items-end justify-around px-2 ${
          reducedMotion ? '' : 'dec-sway-bottom'
        }`}
        style={{ transformOrigin: 'center bottom', animationDuration: '5.5s' }}
      >
        {Array.from({ length: count }, (_, i) => {
          const isDaisy = i % 2 === 1;
          const color = tulipColors[i % tulipColors.length];
          return (
            <svg
              key={i}
              width={isPhone ? '18' : '24'}
              height={isPhone ? '22' : '30'}
              viewBox="0 0 24 30"
              fill="none"
            >
              {/* Stem & leaves */}
              <line x1="12" y1="12" x2="12" y2="30" stroke="#15803d" strokeWidth="1.8" />
              <path d="M12 24 Q7 20 6 16 Q10 18 12 22" fill="#16a34a" />
              <path d="M12 25 Q17 21 18 17 Q14 19 12 23" fill="#16a34a" />

              {isDaisy ? (
                <g>
                  <circle cx="12" cy="6" r="3" fill="#ffffff" />
                  <circle cx="16" cy="9" r="3" fill="#ffffff" />
                  <circle cx="14.5" cy="13.5" r="3" fill="#ffffff" />
                  <circle cx="9.5" cy="13.5" r="3" fill="#ffffff" />
                  <circle cx="8" cy="9" r="3" fill="#ffffff" />
                  <circle cx="12" cy="10" r="2.6" fill="#facc15" />
                </g>
              ) : (
                <path
                  d="M7 9 C7 14 17 14 17 9 L15 4 L12 7 L9 4 Z"
                  fill={color}
                />
              )}
            </svg>
          );
        })}
      </div>
    </div>
  );
}

