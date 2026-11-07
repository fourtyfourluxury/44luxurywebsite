/**
 * 3 painted Easter eggs (patterns in pastel colors) in a bottom corner.
 */
export default function EasterEggsOrnament({
  side = 'left',
  tokens = {},
  avoidPreviewPill = false,
}) {
  const accent = tokens.accent || '#f472b6';
  const posStyle =
    side === 'right'
      ? { right: '84px', bottom: '8px' }
      : { left: '16px', bottom: avoidPreviewPill ? '56px' : '8px' };

  return (
    <div
      aria-hidden="true"
      className="absolute pointer-events-none select-none"
      style={posStyle}
    >
      <svg width="96" height="58" viewBox="0 0 96 58" fill="none">
        {/* Left tilted pastel blue egg */}
        <g transform="rotate(-12 24 32)">
          <path
            d="M24 10 C14 10 10 26 10 36 C10 46 16 52 24 52 C32 52 38 46 38 36 C38 26 34 10 24 10 Z"
            fill="#bae6fd"
          />
          <path d="M12 28 L18 24 L24 28 L30 24 L36 28" stroke="#f472b6" strokeWidth="2" fill="none" />
          <circle cx="19" cy="37" r="2" fill="#fef08a" />
          <circle cx="29" cy="37" r="2" fill="#fef08a" />
        </g>

        {/* Right tilted pastel yellow egg */}
        <g transform="rotate(14 72 34)">
          <path
            d="M72 12 C62 12 58 28 58 38 C58 47 64 52 72 52 C80 52 86 47 86 38 C86 28 82 12 72 12 Z"
            fill="#fef08a"
          />
          <path d="M60 30 Q72 34 84 30" stroke="#a78bfa" strokeWidth="2.2" fill="none" />
          <path d="M60 39 Q72 43 84 39" stroke={accent} strokeWidth="2.2" fill="none" />
        </g>

        {/* Center pastel pink/lavender egg */}
        <g>
          <path
            d="M48 6 C37 6 33 24 33 35 C33 45 39 52 48 52 C57 52 63 45 63 35 C63 24 59 6 48 6 Z"
            fill="#fbcfe8"
          />
          <path d="M35 24 L42 29 L48 24 L54 29 L61 24" stroke="#ffffff" strokeWidth="2" fill="none" />
          <circle cx="48" cy="35" r="2.5" fill={accent} />
          <circle cx="41" cy="37" r="2" fill="#a78bfa" />
          <circle cx="55" cy="37" r="2" fill="#a78bfa" />
        </g>

        {/* Grass blades at bottom */}
        <path
          d="M6 54 Q10 44 14 54 M22 54 Q25 42 29 54 M44 54 Q48 43 52 54 M66 54 Q70 43 74 54 M82 54 Q86 45 90 54"
          stroke="#16a34a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

