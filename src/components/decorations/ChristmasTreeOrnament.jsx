/**
 * Decorated Christmas tree (~140px tall on desktop: layered green tiers, gold star on top,
 * baubles, twinkling lights, and gift boxes at its base) in the bottom corner on ornament_side.
 */
export default function ChristmasTreeOrnament({
  side = 'left',
  tokens = {},
  reducedMotion = false,
  avoidPreviewPill = false,
}) {
  const accent = tokens.accent || '#b91c1c';
  const posStyle =
    side === 'right'
      ? { right: '84px', bottom: '10px' }
      : { left: '16px', bottom: avoidPreviewPill ? '58px' : '10px' };

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={posStyle}
    >
      <svg width="112" height="142" viewBox="0 0 112 142" fill="none">
        {/* Trunk */}
        <rect x="49" y="112" width="14" height="22" fill="#5c3a21" />

        {/* Layered pine tiers */}
        <polygon points="56,88 16,116 96,116" fill="#14532d" />
        <polygon points="56,62 22,94 90,94" fill="#166534" />
        <polygon points="56,38 29,70 83,70" fill="#15803d" />
        <polygon points="56,18 36,46 76,46" fill="#16a34a" />

        {/* Garland swags */}
        <path
          d="M38 44 Q56 52 74 44 M31 67 Q56 77 81 67 M25 91 Q56 102 87 91"
          stroke="#d4af37"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          fill="none"
          opacity="0.85"
        />

        {/* Baubles */}
        <circle cx="45" cy="42" r="3.2" fill={accent} />
        <circle cx="66" cy="40" r="3" fill="#d4af37" />
        <circle cx="39" cy="64" r="3.6" fill="#d4af37" />
        <circle cx="57" cy="61" r="3.6" fill={accent} />
        <circle cx="72" cy="65" r="3.4" fill="#fcf9f3" />
        <circle cx="32" cy="89" r="3.8" fill={accent} />
        <circle cx="52" cy="86" r="3.5" fill="#d4af37" />
        <circle cx="69" cy="90" r="3.8" fill={accent} />
        <circle cx="26" cy="111" r="3.8" fill="#d4af37" />
        <circle cx="48" cy="109" r="3.8" fill="#fcf9f3" />
        <circle cx="78" cy="110" r="3.8" fill={accent} />

        {/* Twinkling fairy lights */}
        <g className={reducedMotion ? '' : 'dec-twinkle'} style={{ animationDuration: '3.2s' }}>
          <circle cx="55" cy="34" r="2" fill="#fef08a" />
          <circle cx="48" cy="53" r="2" fill="#fef08a" />
          <circle cx="64" cy="76" r="2.2" fill="#fef08a" />
          <circle cx="41" cy="100" r="2.2" fill="#fef08a" />
          <circle cx="63" cy="103" r="2" fill="#fef08a" />
        </g>

        {/* Gold Star on Top */}
        <polygon
          points="56,3 59.2,11.2 68,11.8 61.2,17.2 63.4,25.6 56,20.8 48.6,25.6 50.8,17.2 44,11.8 52.8,11.2"
          fill="#d4af37"
        />

        {/* Gift Boxes at Base */}
        <g>
          {/* Left gift */}
          <rect x="26" y="120" width="18" height="15" fill={accent} />
          <rect x="34" y="120" width="2.5" height="15" fill="#d4af37" />
          <rect x="26" y="126" width="18" height="2.5" fill="#d4af37" />
          {/* Right gift */}
          <rect x="66" y="122" width="20" height="13" fill="#d4af37" />
          <rect x="75" y="122" width="2.5" height="13" fill={accent} />
          <rect x="66" y="127" width="20" height="2.5" fill={accent} />
          {/* Small center-front gift */}
          <rect x="46" y="125" width="14" height="11" fill="#fcf9f3" stroke={accent} strokeWidth="1" />
          <rect x="52" y="125" width="2" height="11" fill={accent} />
        </g>
      </svg>
    </div>
  );
}

