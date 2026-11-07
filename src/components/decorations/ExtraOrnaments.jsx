/**
 * Second-wave corner and edge ornaments:
 * easter_basket, chicks, teddy, black_cat, spiderwebs, mosque_skyline,
 * bunting, disco_ball, balloons, price_tags, fog.
 */

const EXTRA_ORNAMENT_KEYFRAMES = `
@keyframes eoHeartPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.1); }
}
@keyframes eoCatTailSwish {
  0%, 100% { transform: rotate(-10deg); }
  50%      { transform: rotate(14deg); }
}
@keyframes eoBlink {
  0%, 91%, 100% { transform: scaleY(1); }
  95%           { transform: scaleY(0.1); }
}
@keyframes eoDiscoSpin {
  0%, 100% { transform: scaleX(1); }
  50%      { transform: scaleX(-1); }
}
@keyframes eoDiscoLightFade {
  0%, 100% { opacity: 0.15; }
  50%      { opacity: 0.72; }
}
@keyframes eoBalloonBob {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50%      { transform: translate3d(0, -7px, 0); }
}
@keyframes eoFogDrift {
  0%, 100% { transform: translate3d(-4%, 0, 0); opacity: 0.78; }
  50%      { transform: translate3d(4%, 0, 0); opacity: 0.95; }
}
`;

function getBottomCornerOffset(side, avoidPreviewPill, extraShiftPx = 0) {
  if (side === 'right') {
    return { right: `${84 + extraShiftPx}px`, bottom: '0px' };
  }
  const baseLeft = avoidPreviewPill ? 248 : 18;
  return { left: `${baseLeft + extraShiftPx}px`, bottom: '0px' };
}

/**
 * 1. easter_basket: woven basket with painted eggs and grass in the bottom corner on ornament_side.
 */
export function EasterBasketOrnament({ side = 'left', avoidPreviewPill = false }) {
  const posStyle = getBottomCornerOffset(side, avoidPreviewPill, 0);
  return (
    <div aria-hidden="true" className="absolute pointer-events-none select-none" style={posStyle}>
      <svg width="96" height="86" viewBox="0 0 96 86" fill="none">
        {/* Basket handle */}
        <path
          d="M22 44 C22 10 74 10 74 44"
          stroke="#92400e"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M22 44 C22 14 74 14 74 44"
          stroke="#d97706"
          strokeWidth="2"
          fill="none"
        />

        {/* Painted eggs inside basket */}
        <ellipse cx="34" cy="42" rx="10" ry="13" fill="#f9a8d4" stroke="#1c1c18" strokeWidth="1.4" />
        <path d="M25 40 Q34 36 43 40" stroke="#fcf9f3" strokeWidth="1.8" fill="none" />

        <ellipse cx="49" cy="39" rx="10.5" ry="14" fill="#a7f3d0" stroke="#1c1c18" strokeWidth="1.4" />
        <circle cx="46" cy="35" r="2" fill="#f472b6" />
        <circle cx="53" cy="38" r="2" fill="#fde047" />

        <ellipse cx="63" cy="43" rx="9.5" ry="12.5" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.4" />
        <path d="M54 42 L59 39 L64 43 L69 39 L72 42" stroke="#60a5fa" strokeWidth="1.6" fill="none" />

        {/* Grass blades */}
        <path
          d="M16 47 L22 36 L26 47 L33 35 L38 47 L48 34 L53 47 L62 36 L67 47 L75 37 L80 47 Z"
          fill="#15803d"
        />

        {/* Woven basket body */}
        <polygon
          points="16,46 80,46 72,82 24,82"
          fill="#b45309"
          stroke="#1c1c18"
          strokeWidth="1.5"
        />
        {/* Basket rim */}
        <rect
          x="13"
          y="43"
          width="70"
          height="6.5"
          fill="#d97706"
          stroke="#1c1c18"
          strokeWidth="1.4"
        />
        {/* Woven crosshatch lines */}
        <line x1="28" y1="50" x2="32" y2="82" stroke="#78350f" strokeWidth="1.5" />
        <line x1="48" y1="50" x2="48" y2="82" stroke="#78350f" strokeWidth="1.5" />
        <line x1="68" y1="50" x2="64" y2="82" stroke="#78350f" strokeWidth="1.5" />
        <line x1="19" y1="58" x2="77" y2="58" stroke="#78350f" strokeWidth="1.5" />
        <line x1="21" y1="70" x2="75" y2="70" stroke="#78350f" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/**
 * 2. chicks: two baby chicks, one peeking from half an egg shell, blinking.
 */
export function ChicksOrnament({
  side = 'left',
  avoidPreviewPill = false,
  reducedMotion = false,
  hasBasket = false,
}) {
  const posStyle = getBottomCornerOffset(side, avoidPreviewPill, hasBasket ? 96 : 0);
  return (
    <div aria-hidden="true" className="absolute pointer-events-none select-none" style={posStyle}>
      <svg width="86" height="64" viewBox="0 0 86 64" fill="none">
        {/* Chick 1: standing baby chick */}
        <g transform="translate(6, 16)">
          <line x1="14" y1="38" x2="12" y2="46" stroke="#ea580c" strokeWidth="1.6" />
          <line x1="22" y1="38" x2="24" y2="46" stroke="#ea580c" strokeWidth="1.6" />
          <ellipse cx="18" cy="28" rx="12" ry="11" fill="#fde047" stroke="#1c1c18" strokeWidth="1.4" />
          <circle cx="18" cy="14" r="9.5" fill="#fde047" stroke="#1c1c18" strokeWidth="1.4" />
          <g
            style={{
              transformOrigin: '18px 13px',
              animation: reducedMotion ? 'none' : 'eoBlink 4.6s ease-in-out infinite',
            }}
          >
            <circle cx="14.5" cy="13" r="1.4" fill="#1c1c18" />
            <circle cx="21.5" cy="13" r="1.4" fill="#1c1c18" />
          </g>
          <polygon points="16,15.5 20,15.5 18,19" fill="#f97316" />
        </g>

        {/* Chick 2: peeking from half an egg shell */}
        <g transform="translate(44, 12)">
          <circle cx="18" cy="22" r="10" fill="#fde047" stroke="#1c1c18" strokeWidth="1.4" />
          <g
            style={{
              transformOrigin: '18px 20px',
              animation: reducedMotion ? 'none' : 'eoBlink 5.4s ease-in-out 1.8s infinite',
            }}
          >
            <circle cx="14.5" cy="20" r="1.4" fill="#1c1c18" />
            <circle cx="21.5" cy="20" r="1.4" fill="#1c1c18" />
          </g>
          <polygon points="16,22.5 20,22.5 18,26" fill="#f97316" />
          {/* Cracked half egg shell */}
          <path
            d="M4 28 L9 32 L14 27 L19 32 L24 27 L29 32 L32 28 C32 43 26 50 18 50 C10 50 4 43 4 28 Z"
            fill="#fcf9f3"
            stroke="#1c1c18"
            strokeWidth="1.4"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * 3. teddy: a teddy bear holding a heart in the bottom corner, slow heart pulse (scale only).
 */
export function TeddyOrnament({
  side = 'left',
  tokens = {},
  avoidPreviewPill = false,
  reducedMotion = false,
}) {
  const posStyle = getBottomCornerOffset(side, avoidPreviewPill, 0);
  const heartColor = tokens.accent || '#e11d48';

  return (
    <div aria-hidden="true" className="absolute pointer-events-none select-none" style={posStyle}>
      <svg width="88" height="92" viewBox="0 0 88 92" fill="none">
        {/* Ears */}
        <circle cx="26" cy="18" r="9" fill="#92400e" stroke="#1c1c18" strokeWidth="1.5" />
        <circle cx="26" cy="18" r="5" fill="#d97706" />
        <circle cx="62" cy="18" r="9" fill="#92400e" stroke="#1c1c18" strokeWidth="1.5" />
        <circle cx="62" cy="18" r="5" fill="#d97706" />

        {/* Seated body & legs */}
        <ellipse cx="44" cy="62" rx="22" ry="24" fill="#92400e" stroke="#1c1c18" strokeWidth="1.5" />
        <circle cx="24" cy="80" r="9.5" fill="#92400e" stroke="#1c1c18" strokeWidth="1.5" />
        <circle cx="24" cy="80" r="5" fill="#fde68a" />
        <circle cx="64" cy="80" r="9.5" fill="#92400e" stroke="#1c1c18" strokeWidth="1.5" />
        <circle cx="64" cy="80" r="5" fill="#fde68a" />

        {/* Head & snout */}
        <circle cx="44" cy="31" r="17" fill="#92400e" stroke="#1c1c18" strokeWidth="1.5" />
        <ellipse cx="44" cy="35" rx="7.5" ry="5.5" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.2" />
        <ellipse cx="44" cy="33.5" rx="3" ry="2" fill="#1c1c18" />
        <circle cx="37.5" cy="27.5" r="2" fill="#1c1c18" />
        <circle cx="50.5" cy="27.5" r="2" fill="#1c1c18" />

        {/* Pulsing heart held by paws */}
        <g
          style={{
            transformOrigin: '44px 58px',
            animation: reducedMotion ? 'none' : 'eoHeartPulse 3.2s ease-in-out infinite',
          }}
        >
          <path
            d="M44 73 L31 60 C25 54 29 45 37 47 C40.5 48 42.8 50.5 44 53 C45.2 50.5 47.5 48 51 47 C59 45 63 54 57 60 L44 73 Z"
            fill={heartColor}
            stroke="#1c1c18"
            strokeWidth="1.5"
          />
        </g>

        {/* Paws holding the heart */}
        <circle cx="28" cy="57" r="6.5" fill="#92400e" stroke="#1c1c18" strokeWidth="1.5" />
        <circle cx="60" cy="57" r="6.5" fill="#92400e" stroke="#1c1c18" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/**
 * 4. black_cat: a black cat silhouette with glowing eyes (slow blink) and a swishing tail,
 * sitting on the header edge on ornament_side.
 */
export function BlackCatOrnament({ side = 'left', reducedMotion = false }) {
  const posStyle =
    side === 'right'
      ? { right: '2.5%', top: 'var(--header-offset, 70px)' }
      : { left: '2.5%', top: 'var(--header-offset, 70px)' };

  return (
    <div aria-hidden="true" className="absolute pointer-events-none select-none" style={posStyle}>
      <svg width="64" height="68" viewBox="0 0 64 68" fill="none">
        {/* Swishing tail hanging down */}
        <g
          style={{
            transformOrigin: '44px 36px',
            animation: reducedMotion ? 'none' : 'eoCatTailSwish 3.8s ease-in-out infinite',
          }}
        >
          <path
            d="M44 34 C54 42 54 56 45 62"
            stroke="#141410"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Seated cat body & head silhouette */}
        <path
          d="M20 38 C18 24 24 18 32 18 C40 18 46 24 44 38 Z"
          fill="#141410"
          stroke="#d4af37"
          strokeWidth="0.9"
        />
        <circle cx="32" cy="14" r="9.5" fill="#141410" stroke="#d4af37" strokeWidth="0.9" />
        {/* Pointed ears */}
        <polygon points="23,9 25,1 30,7" fill="#141410" />
        <polygon points="41,9 39,1 34,7" fill="#141410" />

        {/* Glowing yellow-green eyes with slow blink */}
        <g
          style={{
            transformOrigin: '32px 14px',
            animation: reducedMotion ? 'none' : 'eoBlink 5.5s ease-in-out infinite',
          }}
        >
          <ellipse cx="28.5" cy="14" rx="2.2" ry="1.6" fill="#fde047" />
          <ellipse cx="35.5" cy="14" rx="2.2" ry="1.6" fill="#fde047" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 5. spiderwebs: delicate webs in both top corners (below --header-offset)
 * and a small one in each bottom corner.
 */
function CornerWebSvg({ size = 88, flipX = false, flipY = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      style={{
        transform: `${flipX ? 'scaleX(-1)' : ''} ${flipY ? 'scaleY(-1)' : ''}`.trim() || undefined,
      }}
    >
      <g stroke="#d6d3d1" strokeWidth="1.1" opacity="0.48">
        <line x1="0" y1="0" x2="96" y2="12" />
        <line x1="0" y1="0" x2="86" y2="44" />
        <line x1="0" y1="0" x2="68" y2="72" />
        <line x1="0" y1="0" x2="42" y2="88" />
        <line x1="0" y1="0" x2="12" y2="96" />
        <path d="M24 3 Q22 14 14 20 Q10 24 3 24" />
        <path d="M48 6 Q43 26 32 34 Q20 43 6 48" />
        <path d="M72 9 Q64 36 49 49 Q34 62 9 72" />
      </g>
    </svg>
  );
}

export function SpiderwebsOrnament() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none">
      {/* Top-left web */}
      <div className="absolute left-0" style={{ top: 'var(--header-offset, 70px)' }}>
        <CornerWebSvg size={86} />
      </div>
      {/* Top-right web */}
      <div className="absolute right-0" style={{ top: 'var(--header-offset, 70px)' }}>
        <CornerWebSvg size={86} flipX />
      </div>
      {/* Bottom-left small web */}
      <div className="absolute left-0 bottom-0">
        <CornerWebSvg size={54} flipY />
      </div>
      {/* Bottom-right small web */}
      <div className="absolute right-0 bottom-0">
        <CornerWebSvg size={54} flipX flipY />
      </div>
    </div>
  );
}

/**
 * 6. mosque_skyline: a subtle silhouette of domes and minarets along the bottom edge
 * at about 0.25 opacity, static, with a few softly twinkling window lights.
 */
export function MosqueSkylineOrnament({ reducedMotion = false }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[58px] pointer-events-none select-none overflow-hidden"
    >
      <svg
        width="100%"
        height="58"
        viewBox="0 0 1200 58"
        preserveAspectRatio="none"
        fill="none"
      >
        <g fill="#d4af37" opacity="0.25">
          {/* Base horizon */}
          <rect x="0" y="48" width="1200" height="10" />
          {/* Left minaret & dome cluster */}
          <rect x="70" y="12" width="8" height="38" />
          <polygon points="74,2 68,12 80,12" />
          <path d="M100 48 C100 22 170 22 170 48 Z" />
          <path d="M180 48 C180 30 225 30 225 48 Z" />
          <rect x="240" y="16" width="7" height="34" />
          <polygon points="243.5,6 238,16 249,16" />

          {/* Center grand mosque silhouette */}
          <rect x="490" y="8" width="8" height="40" />
          <polygon points="494,0 488,8 500,8" />
          <path d="M515 48 C515 26 560 26 560 48 Z" />
          <path d="M555 48 C555 10 645 10 645 48 Z" />
          <path d="M640 48 C640 26 685 26 685 48 Z" />
          <rect x="702" y="8" width="8" height="40" />
          <polygon points="706,0 700,8 712,8" />

          {/* Right minaret & dome cluster */}
          <rect x="950" y="16" width="7" height="34" />
          <polygon points="953.5,6 948,16 959,16" />
          <path d="M975 48 C975 30 1020 30 1020 48 Z" />
          <path d="M1030 48 C1030 22 1100 22 1100 48 Z" />
          <rect x="1120" y="12" width="8" height="38" />
          <polygon points="1124,2 1118,12 1130,12" />
        </g>

        {/* Softly twinkling window lights */}
        {[135, 595, 605, 1065].map((wx, idx) => (
          <rect
            key={wx}
            x={wx}
            y="38"
            width="3"
            height="5"
            fill="#fef08a"
            className={reducedMotion ? '' : idx % 2 === 0 ? 'dec-twinkle' : 'dec-twinkle-alt'}
          />
        ))}
      </svg>
    </div>
  );
}

/**
 * 7. bunting: a string of triangular pennants along the header edge in the theme colors
 * (for independence-day use green, white, green).
 */
export function BuntingOrnament({
  tokens = {},
  themeSlug = '',
  isPhone = false,
}) {
  const isIndependence =
    String(themeSlug || '').toLowerCase().includes('independence') ||
    tokens.accent === '#15803d' ||
    tokens.accent === '#008751';

  const palette = isIndependence
    ? ['#15803d', '#fcf9f3', '#15803d']
    : [tokens.accent || '#b91c1c', '#d4af37', tokens.banner_text || '#fcf9f3'];

  const count = isPhone ? 10 : 20;
  const step = 1200 / count;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 pointer-events-none select-none overflow-hidden"
      style={{ top: 'var(--header-offset, 70px)', height: '28px' }}
    >
      <svg
        width="100%"
        height="28"
        viewBox="0 0 1200 28"
        preserveAspectRatio="none"
        fill="none"
      >
        <line x1="0" y1="1.5" x2="1200" y2="1.5" stroke="#1c1c18" strokeWidth="1.5" />
        {Array.from({ length: count }, (_, i) => {
          const x1 = i * step + 4;
          const x2 = (i + 1) * step - 4;
          const xm = (x1 + x2) / 2;
          const fill = palette[i % palette.length];
          return (
            <polygon
              key={i}
              points={`${x1},2 ${x2},2 ${xm},24`}
              fill={fill}
              stroke="#1c1c18"
              strokeWidth="1.2"
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * 8. disco_ball: a mirrored ball hanging from the top near ornament_side, slowly rotating,
 * throwing a few soft light dots that drift (opacity only).
 */
export function DiscoBallOrnament({ side = 'left', reducedMotion = false }) {
  const posStyle =
    side === 'right'
      ? { right: '2.5%', top: 'var(--header-offset, 70px)' }
      : { left: '2.5%', top: 'var(--header-offset, 70px)' };

  return (
    <div aria-hidden="true" className="absolute pointer-events-none select-none" style={posStyle}>
      <svg width="104" height="106" viewBox="0 0 104 106" fill="none">
        {/* Hanging cord */}
        <line x1="52" y1="0" x2="52" y2="22" stroke="#d4af37" strokeWidth="1.5" />

        {/* Soft drifting light dots (opacity only) */}
        {[
          { cx: 14, cy: 36, r: 2.5, d: '0s' },
          { cx: 88, cy: 32, r: 2, d: '1.1s' },
          { cx: 20, cy: 76, r: 3, d: '2.2s' },
          { cx: 86, cy: 72, r: 2.5, d: '0.6s' },
          { cx: 52, cy: 94, r: 2.2, d: '1.7s' },
        ].map((dot, idx) => (
          <circle
            key={idx}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill="#fef08a"
            style={{
              animation: reducedMotion ? 'none' : `eoDiscoLightFade 3.4s ease-in-out ${dot.d} infinite`,
            }}
          />
        ))}

        {/* Mirrored ball */}
        <g
          style={{
            transformOrigin: '52px 46px',
            animation: reducedMotion ? 'none' : 'eoDiscoSpin 7s ease-in-out infinite',
          }}
        >
          <circle cx="52" cy="46" r="22" fill="#e5e7eb" stroke="#1c1c18" strokeWidth="1.5" />
          <ellipse cx="52" cy="46" rx="11" ry="22" stroke="#9ca3af" strokeWidth="1.1" />
          <line x1="30" y1="38" x2="74" y2="38" stroke="#9ca3af" strokeWidth="1.1" />
          <line x1="30" y1="46" x2="74" y2="46" stroke="#9ca3af" strokeWidth="1.1" />
          <line x1="30" y1="54" x2="74" y2="54" stroke="#9ca3af" strokeWidth="1.1" />
          {/* Specular facet highlights */}
          <rect x="44" y="32" width="6" height="5" fill="#ffffff" />
          <rect x="54" y="40" width="6" height="5" fill="#fef08a" />
          <rect x="39" y="48" width="5" height="5" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 9. balloons: a cluster of 4 gold balloons rising along the edge on ornament_side,
 * each showing one digit of the upcoming year (months Oct to Dec use next year,
 * otherwise the current year), gently bobbing. For independence-day use green and
 * white balloons with no digits.
 */
export function BalloonsOrnament({
  side = 'left',
  tokens = {},
  themeSlug = '',
  avoidPreviewPill = false,
  reducedMotion = false,
}) {
  const now = new Date();
  const targetYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
  const digits = String(targetYear).padStart(4, '0').slice(0, 4).split('');

  const isIndependence =
    String(themeSlug || '').toLowerCase().includes('independence') ||
    tokens.accent === '#15803d' ||
    tokens.accent === '#008751';

  const posStyle =
    side === 'right'
      ? { right: '18px', bottom: '84px' }
      : { left: avoidPreviewPill ? '248px' : '18px', bottom: '24px' };

  const items = [
    { x: 20, y: 26, delay: '0s', fill: isIndependence ? '#15803d' : '#d4af37', textFill: '#1c1c18' },
    { x: 48, y: 18, delay: '0.8s', fill: isIndependence ? '#fcf9f3' : '#eab308', textFill: '#1c1c18' },
    { x: 76, y: 26, delay: '1.6s', fill: isIndependence ? '#15803d' : '#d4af37', textFill: '#1c1c18' },
    { x: 104, y: 18, delay: '2.4s', fill: isIndependence ? '#fcf9f3' : '#eab308', textFill: '#1c1c18' },
  ];

  return (
    <div aria-hidden="true" className="absolute pointer-events-none select-none" style={posStyle}>
      <svg width="124" height="106" viewBox="0 0 124 106" fill="none">
        {items.map((b, idx) => (
          <g
            key={idx}
            style={{
              animation: reducedMotion ? 'none' : `eoBalloonBob 3.8s ease-in-out ${b.delay} infinite`,
            }}
          >
            {/* String */}
            <path
              d={`M${b.x} ${b.y + 18} Q${b.x - 4} ${b.y + 42} 62 102`}
              stroke="#a8a29e"
              strokeWidth="1.1"
              fill="none"
            />
            {/* Balloon oval */}
            <ellipse
              cx={b.x}
              cy={b.y}
              rx="13.5"
              ry="17"
              fill={b.fill}
              stroke="#1c1c18"
              strokeWidth="1.4"
            />
            {/* Balloon knot */}
            <polygon points={`${b.x - 2.5},${b.y + 17} ${b.x + 2.5},${b.y + 17} ${b.x},${b.y + 20}`} fill={b.fill} />
            {/* Digit of upcoming year (hidden for independence-day) */}
            {!isIndependence && (
              <text
                x={b.x}
                y={b.y + 4.5}
                textAnchor="middle"
                fill={b.textFill}
                fontSize="13"
                fontWeight="700"
                fontFamily="Space Grotesk, sans-serif"
              >
                {digits[idx]}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * 10. price_tags: 3 small blank gold tags hanging at different lengths, swinging.
 */
export function PriceTagsOrnament({ side = 'left', reducedMotion = false }) {
  const posStyle =
    side === 'right'
      ? { right: '2.5%', top: 'var(--header-offset, 70px)' }
      : { left: '2.5%', top: 'var(--header-offset, 70px)' };

  const tags = [
    { x: 18, cord: 18, dur: '4.4s' },
    { x: 46, cord: 34, dur: '5.3s' },
    { x: 74, cord: 24, dur: '4.9s' },
  ];

  return (
    <div aria-hidden="true" className="absolute pointer-events-none select-none" style={posStyle}>
      <svg width="92" height="90" viewBox="0 0 92 90" fill="none">
        {tags.map((t, idx) => (
          <g
            key={idx}
            className={reducedMotion ? '' : 'dec-swing-top'}
            style={{
              transformOrigin: `${t.x}px 0px`,
              animationDuration: t.dur,
            }}
          >
            <line x1={t.x} y1="0" x2={t.x} y2={t.cord} stroke="#d4af37" strokeWidth="1.2" />
            <polygon
              points={`${t.x - 6},${t.cord} ${t.x + 6},${t.cord} ${t.x + 10},${t.cord + 6} ${t.x + 10},${t.cord + 30} ${t.x - 10},${t.cord + 30} ${t.x - 10},${t.cord + 6}`}
              fill="#d4af37"
              stroke="#1c1c18"
              strokeWidth="1.3"
            />
            <circle cx={t.x} cy={t.cord + 5} r="2" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * 11. fog: a low drifting fog band along the bottom plus a soft vignette in the corners,
 * made of gradients only (no blur filters); static on reduced motion.
 */
export function FogOrnament({ reducedMotion = false }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Soft corner vignette using radial gradient only */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 62%, rgba(12,10,16,0.34) 100%)',
        }}
      />
      {/* Drifting bottom fog band using layered gradients only */}
      <div
        className="absolute bottom-0 left-[-10%] right-[-10%] h-[96px]"
        style={{
          background:
            'linear-gradient(to top, rgba(214, 211, 209, 0.24) 0%, rgba(214, 211, 209, 0.1) 52%, rgba(214, 211, 209, 0) 100%)',
          animation: reducedMotion ? 'none' : 'eoFogDrift 14s ease-in-out infinite',
        }}
      />
    </div>
  );
}

export default function ExtraOrnaments({
  activeKeys = [],
  side = 'left',
  tokens = {},
  themeSlug = '',
  isPhone = false,
  reducedMotion = false,
  avoidPreviewPill = false,
}) {
  const has = (k) => activeKeys.includes(k);

  return (
    <div aria-hidden="true" className="pointer-events-none select-none">
      <style>{EXTRA_ORNAMENT_KEYFRAMES}</style>

      {/* Allowed on both desktop and phone (< 768px): bunting and fog */}
      {has('bunting') && (
        <BuntingOrnament tokens={tokens} themeSlug={themeSlug} isPhone={isPhone} />
      )}
      {has('fog') && <FogOrnament reducedMotion={reducedMotion} />}

      {/* Desktop/tablet only (>= 768px) */}
      {!isPhone && (
        <>
          {has('easter_basket') && (
            <EasterBasketOrnament side={side} avoidPreviewPill={avoidPreviewPill} />
          )}
          {has('chicks') && (
            <ChicksOrnament
              side={side}
              avoidPreviewPill={avoidPreviewPill}
              reducedMotion={reducedMotion}
              hasBasket={has('easter_basket') || has('easter_eggs')}
            />
          )}
          {has('teddy') && (
            <TeddyOrnament
              side={side}
              tokens={tokens}
              avoidPreviewPill={avoidPreviewPill}
              reducedMotion={reducedMotion}
            />
          )}
          {has('black_cat') && (
            <BlackCatOrnament side={side} reducedMotion={reducedMotion} />
          )}
          {has('spiderwebs') && <SpiderwebsOrnament />}
          {has('mosque_skyline') && (
            <MosqueSkylineOrnament reducedMotion={reducedMotion} />
          )}
          {has('disco_ball') && (
            <DiscoBallOrnament side={side} reducedMotion={reducedMotion} />
          )}
          {has('balloons') && (
            <BalloonsOrnament
              side={side}
              tokens={tokens}
              themeSlug={themeSlug}
              avoidPreviewPill={avoidPreviewPill}
              reducedMotion={reducedMotion}
            />
          )}
          {has('price_tags') && (
            <PriceTagsOrnament side={side} reducedMotion={reducedMotion} />
          )}
        </>
      )}
    </div>
  );
}

