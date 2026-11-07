/**
 * Small clusters of roses and leaves in the bottom corner.
 */
export default function RoseCornersOrnament({
  side = 'left',
  tokens = {},
  avoidPreviewPill = false,
}) {
  const primaryRose = tokens.accent || '#be123c';
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
      <svg width="96" height="72" viewBox="0 0 96 72" fill="none">
        {/* Leaves */}
        <path d="M18 52 C6 42 8 26 24 34 C28 42 24 50 18 52 Z" fill="#14532d" />
        <path d="M58 58 C74 54 84 40 68 34 C60 38 56 48 58 58 Z" fill="#166534" />
        <path d="M36 28 C32 12 46 8 50 22 C48 28 42 30 36 28 Z" fill="#15803d" />

        {/* Left Rose */}
        <g transform="translate(26, 44)">
          <circle cx="0" cy="0" r="14" fill={primaryRose} />
          <path
            d="M-7 -3 C-3 -9 6 -8 8 -1 C9 5 2 9 -4 7 C-9 5 -8 -2 -3 -4 C1 -6 4 -2 2 2 C0 4 -3 2 -2 0"
            stroke="#fecdd3"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Right Rose */}
        <g transform="translate(56, 48)">
          <circle cx="0" cy="0" r="11" fill="#e11d48" />
          <path
            d="M-5 -2 C-2 -7 5 -6 6 -1 C7 4 1 7 -3 5 C-6 3 -5 -2 -2 -3 C1 -4 3 -1 1 1"
            stroke="#ffe4e6"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Top Rosebud */}
        <g transform="translate(42, 26)">
          <circle cx="0" cy="0" r="8.5" fill="#fb7185" />
          <path
            d="M-4 -1 C-1 -5 4 -4 5 0 C5 3 1 5 -2 4 C-4 2 -3 -1 -1 -2"
            stroke="#fff1f2"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

