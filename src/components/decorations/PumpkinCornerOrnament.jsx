/**
 * A carved jack-o'-lantern with a soft flicker in a bottom corner.
 */
export default function PumpkinCornerOrnament({
  side = 'left',
  reducedMotion = false,
  avoidPreviewPill = false,
}) {
  const posStyle =
    side === 'right'
      ? { right: '84px', bottom: '10px' }
      : { left: '16px', bottom: avoidPreviewPill ? '56px' : '10px' };

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={posStyle}
    >
      <svg width="86" height="76" viewBox="0 0 86 76" fill="none">
        {/* Stem */}
        <path
          d="M40 16 C39 8 44 4 49 6 C46 10 46 13 47 16 Z"
          fill="#15803d"
        />
        {/* Side lobes */}
        <ellipse cx="26" cy="44" rx="18" ry="23" fill="#c2410c" />
        <ellipse cx="60" cy="44" rx="18" ry="23" fill="#c2410c" />
        {/* Middle lobes */}
        <ellipse cx="34" cy="44" rx="17" ry="25" fill="#ea580c" />
        <ellipse cx="52" cy="44" rx="17" ry="25" fill="#ea580c" />
        {/* Center lobe */}
        <ellipse cx="43" cy="45" rx="15" ry="25" fill="#f97316" />

        {/* Carved glowing face (soft slow flicker) */}
        <g
          className={reducedMotion ? '' : 'dec-twinkle'}
          style={{ animationDuration: '2.8s' }}
        >
          <polygon points="30,32 37,39 25,39" fill="#fef08a" />
          <polygon points="56,32 61,39 49,39" fill="#fef08a" />
          <polygon points="43,40 46,45 40,45" fill="#fde047" />
          <path
            d="M26 50 L32 54 L37 51 L43 55 L49 51 L54 54 L60 50 L56 59 L49 57 L43 60 L37 57 L30 59 Z"
            fill="#fef08a"
          />
        </g>
      </svg>
    </div>
  );
}

