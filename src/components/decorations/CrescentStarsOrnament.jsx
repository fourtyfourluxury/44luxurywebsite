/**
 * A hanging crescent moon with 3 small stars from the top corner, with a slow swing.
 */
export default function CrescentStarsOrnament({
  side = 'left',
  tokens = {},
  reducedMotion = false,
}) {
  const gold = '#d4af37';
  const accent = tokens.accent || '#d4af37';
  const posStyle =
    side === 'right'
      ? { right: '2.2%', top: 'var(--header-offset, 70px)' }
      : { left: '2.2%', top: 'var(--header-offset, 70px)' };

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={posStyle}
    >
      <svg width="96" height="108" viewBox="0 0 96 108" fill="none">
        {/* Main swinging crescent */}
        <g
          className={reducedMotion ? '' : 'dec-swing-top'}
          style={{ transformOrigin: '48px 0px', animationDuration: '5.8s' }}
        >
          <line x1="48" y1="0" x2="48" y2="34" stroke={gold} strokeWidth="1.2" />
          <path
            d="M56 36 A20 20 0 1 0 56 76 A15 15 0 1 1 56 36 Z"
            fill={gold}
          />
        </g>

        {/* Small hanging star 1 */}
        <g
          className={reducedMotion ? '' : 'dec-swing-top'}
          style={{ transformOrigin: '18px 0px', animationDuration: '4.6s' }}
        >
          <line x1="18" y1="0" x2="18" y2="48" stroke={gold} strokeWidth="0.9" opacity="0.8" />
          <polygon
            points="18,48 20,53 25,53.5 21,57 22.2,62 18,59 13.8,62 15,57 11,53.5 16,53"
            fill={accent}
          />
        </g>

        {/* Small hanging star 2 */}
        <g
          className={reducedMotion ? '' : 'dec-swing-top'}
          style={{ transformOrigin: '78px 0px', animationDuration: '5.1s' }}
        >
          <line x1="78" y1="0" x2="78" y2="40" stroke={gold} strokeWidth="0.9" opacity="0.8" />
          <polygon
            points="78,40 79.8,44.5 84.5,45 81,48 82,52.5 78,50 74,52.5 75,48 71.5,45 76.2,44.5"
            fill={gold}
          />
        </g>

        {/* Small hanging star 3 */}
        <g
          className={reducedMotion ? '' : 'dec-swing-top'}
          style={{ transformOrigin: '66px 0px', animationDuration: '6.3s' }}
        >
          <line x1="66" y1="0" x2="66" y2="72" stroke={gold} strokeWidth="0.8" opacity="0.7" />
          <polygon
            points="66,72 67.5,75.5 71,76 68.5,78.5 69.2,82 66,80 62.8,82 63.5,78.5 61,76 64.5,75.5"
            fill={gold}
          />
        </g>
      </svg>
    </div>
  );
}

