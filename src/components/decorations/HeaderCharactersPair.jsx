/**
 * Header character pairs sitting or hanging on the bottom edge of the header
 * (top: var(--header-offset, 70px)), one at ~12% from the left and a mirrored
 * copy at ~12% from the right with offset animation timing.
 */

const CHARACTER_KEYFRAMES = `
@keyframes hcLegSwingA {
  0%, 100% { transform: rotate(-10deg); }
  50%      { transform: rotate(12deg); }
}
@keyframes hcLegSwingB {
  0%, 100% { transform: rotate(12deg); }
  50%      { transform: rotate(-10deg); }
}
@keyframes hcSantaWave {
  0%, 78%, 100% { transform: rotate(0deg); }
  83%, 91%      { transform: rotate(-28deg); }
  87%, 95%      { transform: rotate(14deg); }
}
@keyframes hcBlink {
  0%, 92%, 100% { transform: scaleY(1); }
  95%           { transform: scaleY(0.12); }
}
@keyframes hcEarTwitch {
  0%, 84%, 100% { transform: rotate(0deg); }
  88%           { transform: rotate(-9deg); }
  93%           { transform: rotate(6deg); }
}
@keyframes hcNoseWiggle {
  0%, 80%, 100% { transform: translateY(0) scale(1); }
  85%, 92%      { transform: translateY(-1px) scale(1.12); }
}
@keyframes hcLookAround {
  0%, 70%, 100% { transform: translateX(0); }
  78%, 84%      { transform: translateX(-2px); }
  88%, 94%      { transform: translateX(2px); }
}
@keyframes hcGhostBob {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50%      { transform: translate3d(0, 6px, 0); }
}
@keyframes hcHemSway {
  0%, 100% { transform: skewX(-4deg); }
  50%      { transform: skewX(4deg); }
}
@keyframes hcWingFlap {
  0%, 100% { transform: rotate(0deg) scaleX(1); }
  50%      { transform: rotate(-12deg) scaleX(0.88); }
}
@keyframes hcHornPuff {
  0%, 76%, 100% { opacity: 0; transform: translate3d(0, 0, 0) scale(0.4); }
  82%           { opacity: 0.92; transform: translate3d(8px, -4px, 0) scale(1); }
  94%           { opacity: 0; transform: translate3d(16px, 4px, 0) scale(1.15); }
}
@keyframes hcFlagWave {
  0%, 100% { transform: skewY(-4deg) scaleX(1); }
  50%      { transform: skewY(4deg) scaleX(0.95); }
}
@keyframes hcPendulumSwing {
  0%, 100% { transform: rotate(-4.5deg); }
  50%      { transform: rotate(4.5deg); }
}
`;

function SantaCharacter({ delay = '0s', reducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 68 76"
      fill="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Top wire hook */}
      <line x1="8" y1="2" x2="60" y2="2" stroke="#292524" strokeWidth="1.5" strokeLinecap="round" />

      {/* Swinging left leg */}
      <g
        style={{
          transformOrigin: '29px 44px',
          animation: reducedMotion ? 'none' : `hcLegSwingA 2.8s ease-in-out ${delay} infinite`,
        }}
      >
        <rect x="25" y="44" width="7" height="15" fill="#dc2626" stroke="#1c1c18" strokeWidth="1.4" />
        <rect x="24" y="55" width="9" height="3.5" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.2" />
        <path d="M24 58.5 H34 V64 H22 V60.5 Z" fill="#1c1c18" />
      </g>

      {/* Swinging right leg */}
      <g
        style={{
          transformOrigin: '39px 44px',
          animation: reducedMotion ? 'none' : `hcLegSwingB 2.8s ease-in-out ${delay} infinite`,
        }}
      >
        <rect x="36" y="44" width="7" height="15" fill="#dc2626" stroke="#1c1c18" strokeWidth="1.4" />
        <rect x="35" y="55" width="9" height="3.5" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.2" />
        <path d="M35 58.5 H46 V64 H35 Z" fill="#1c1c18" />
      </g>

      {/* Seated torso / red coat */}
      <path
        d="M21 26 C21 22 47 22 47 26 L49 45 H19 L21 26 Z"
        fill="#dc2626"
        stroke="#1c1c18"
        strokeWidth="1.5"
      />
      {/* White fur coat trim + belt */}
      <rect x="18" y="42" width="32" height="4.5" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.3" />
      <rect x="20" y="35" width="28" height="4" fill="#1c1c18" />
      <rect x="31" y="34" width="6" height="6" fill="#d4af37" stroke="#1c1c18" strokeWidth="1.2" />

      {/* Resting left arm */}
      <path
        d="M21 28 L14 37 L18 40 L23 32 Z"
        fill="#dc2626"
        stroke="#1c1c18"
        strokeWidth="1.4"
      />
      <circle cx="15.5" cy="39" r="3.2" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.3" />

      {/* Waving right arm (waves every ~8s) */}
      <g
        style={{
          transformOrigin: '46px 28px',
          animation: reducedMotion ? 'none' : `hcSantaWave 8s ease-in-out ${delay} infinite`,
        }}
      >
        <path
          d="M46 28 L56 20 L59 24 L48 33 Z"
          fill="#dc2626"
          stroke="#1c1c18"
          strokeWidth="1.4"
        />
        <circle cx="58.5" cy="21" r="3.5" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.3" />
      </g>

      {/* Head & rosy cheeks */}
      <circle cx="34" cy="18" r="9" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.5" />

      {/* Blinking eyes */}
      <g
        style={{
          transformOrigin: '34px 17px',
          animation: reducedMotion ? 'none' : `hcBlink 5.2s ease-in-out ${delay} infinite`,
        }}
      >
        <circle cx="30.5" cy="17" r="1.4" fill="#1c1c18" />
        <circle cx="37.5" cy="17" r="1.4" fill="#1c1c18" />
      </g>
      <circle cx="34" cy="19.5" r="1.8" fill="#ef4444" />

      {/* Full white beard */}
      <path
        d="M24 20 C23 28 28 33 34 33 C40 33 45 28 44 20 C41 22 37 22 34 22 C31 22 27 22 24 20 Z"
        fill="#fcf9f3"
        stroke="#1c1c18"
        strokeWidth="1.5"
      />

      {/* Bobble hat */}
      <path
        d="M24 13 C26 4 42 4 46 13 L52 16 L44 15 Z"
        fill="#dc2626"
        stroke="#1c1c18"
        strokeWidth="1.5"
      />
      <rect x="23" y="11.5" width="22" height="4" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.3" />
      <circle cx="53.5" cy="16.5" r="3.5" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.3" />
    </svg>
  );
}

function BunnyCharacter({ delay = '0s', reducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 68 72"
      fill="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Left ear (twitching) */}
      <g
        style={{
          transformOrigin: '26px 26px',
          animation: reducedMotion ? 'none' : `hcEarTwitch 6.4s ease-in-out ${delay} infinite`,
        }}
      >
        <ellipse cx="24" cy="14" rx="5.2" ry="12" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />
        <ellipse cx="24" cy="15" rx="2.6" ry="8" fill="#f9a8d4" />
      </g>

      {/* Right ear */}
      <g
        style={{
          transformOrigin: '42px 26px',
          animation: reducedMotion ? 'none' : `hcEarTwitch 7.2s ease-in-out ${delay} infinite`,
        }}
      >
        <ellipse cx="44" cy="14" rx="5.2" ry="12" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />
        <ellipse cx="44" cy="15" rx="2.6" ry="8" fill="#f9a8d4" />
      </g>

      {/* Bunny head peeking from top edge */}
      <circle cx="34" cy="31" r="13" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />

      {/* Eyes looking left & right + blinking */}
      <g
        style={{
          transformOrigin: '34px 29px',
          animation: reducedMotion ? 'none' : `hcLookAround 7.5s ease-in-out ${delay} infinite`,
        }}
      >
        <circle cx="29" cy="29" r="1.8" fill="#1c1c18" />
        <circle cx="39" cy="29" r="1.8" fill="#1c1c18" />
      </g>

      {/* Wiggling pink nose */}
      <g
        style={{
          transformOrigin: '34px 33px',
          animation: reducedMotion ? 'none' : `hcNoseWiggle 4.5s ease-in-out ${delay} infinite`,
        }}
      >
        <polygon points="31.5,32 36.5,32 34,35.5" fill="#f472b6" />
      </g>

      {/* Pastel Easter egg held by paws */}
      <ellipse cx="34" cy="48" rx="9" ry="11.5" fill="#a7f3d0" stroke="#1c1c18" strokeWidth="1.5" />
      <path d="M25.5 46 Q34 42 42.5 46" stroke="#f472b6" strokeWidth="2" fill="none" />
      <path d="M26 51 Q34 55 42 51" stroke="#fde047" strokeWidth="2" fill="none" />

      {/* Bunny paws holding the egg */}
      <ellipse cx="23" cy="44" rx="5" ry="3.8" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />
      <ellipse cx="45" cy="44" rx="5" ry="3.8" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />
    </svg>
  );
}

function GhostCharacter({ delay = '0s', reducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 64 72"
      fill="none"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        animation: reducedMotion ? 'none' : `hcGhostBob 4.2s ease-in-out ${delay} infinite`,
      }}
    >
      <g
        style={{
          transformOrigin: '32px 30px',
          animation: reducedMotion ? 'none' : `hcHemSway 5.4s ease-in-out ${delay} infinite`,
        }}
      >
        {/* Friendly rounded ghost body with wavy hem */}
        <path
          d="M16 28 C16 14 48 14 48 28 L50 56 C46 52 43 58 39 55 C35 52 33 58 29 55 C25 52 21 58 14 55 L16 28 Z"
          fill="#fcf9f3"
          fillOpacity="0.92"
          stroke="#1c1c18"
          strokeWidth="1.5"
        />
        {/* Side stubby arms */}
        <path d="M16 34 C10 34 9 40 15 41" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />
        <path d="M48 34 C54 34 55 40 49 41" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />
      </g>

      {/* Tiny blink eyes & friendly smile */}
      <g
        style={{
          transformOrigin: '32px 28px',
          animation: reducedMotion ? 'none' : `hcBlink 4.8s ease-in-out ${delay} infinite`,
        }}
      >
        <circle cx="27" cy="28" r="2.2" fill="#1c1c18" />
        <circle cx="37" cy="28" r="2.2" fill="#1c1c18" />
      </g>
      <ellipse cx="23.5" cy="31.5" rx="2.2" ry="1.2" fill="#f97316" opacity="0.55" />
      <ellipse cx="40.5" cy="31.5" rx="2.2" ry="1.2" fill="#f97316" opacity="0.55" />
      <path d="M29 33 Q32 36 35 33" stroke="#1c1c18" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function CupidCharacter({ delay = '0s', reducedMotion = false, hasBow = true }) {
  return (
    <svg
      viewBox="0 0 72 74"
      fill="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Flapping wings */}
      <g
        style={{
          transformOrigin: '26px 28px',
          animation: reducedMotion ? 'none' : `hcWingFlap 3.2s ease-in-out ${delay} infinite`,
        }}
      >
        <path
          d="M25 26 C11 16 8 28 16 33 C11 36 15 41 25 36 Z"
          fill="#fcf9f3"
          stroke="#1c1c18"
          strokeWidth="1.4"
        />
      </g>
      <g
        style={{
          transformOrigin: '44px 28px',
          animation: reducedMotion ? 'none' : `hcWingFlap 3.2s ease-in-out ${delay} infinite`,
        }}
      >
        <path
          d="M45 26 C59 16 62 28 54 33 C59 36 55 41 45 36 Z"
          fill="#fcf9f3"
          stroke="#1c1c18"
          strokeWidth="1.4"
        />
      </g>

      {/* Seated legs */}
      <g
        style={{
          transformOrigin: '31px 44px',
          animation: reducedMotion ? 'none' : `hcLegSwingA 3.4s ease-in-out ${delay} infinite`,
        }}
      >
        <rect x="28" y="43" width="5.5" height="14" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.4" />
      </g>
      <g
        style={{
          transformOrigin: '39px 44px',
          animation: reducedMotion ? 'none' : `hcLegSwingB 3.4s ease-in-out ${delay} infinite`,
        }}
      >
        <rect x="36.5" y="43" width="5.5" height="14" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.4" />
      </g>

      {/* Cherub tunic & sash */}
      <path
        d="M25 25 H45 L47 44 H23 L25 25 Z"
        fill="#fcf9f3"
        stroke="#1c1c18"
        strokeWidth="1.5"
      />
      <path d="M26 26 L44 43" stroke="#e11d48" strokeWidth="3" />

      {/* Head & golden curls */}
      <circle cx="35" cy="17" r="8.5" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.5" />
      <path
        d="M26 14 C27 8 43 8 44 14 C41 11 29 11 26 14 Z"
        fill="#d4af37"
        stroke="#1c1c18"
        strokeWidth="1.3"
      />
      <circle cx="32" cy="17.5" r="1.3" fill="#1c1c18" />
      <circle cx="38" cy="17.5" r="1.3" fill="#1c1c18" />

      {/* Tiny bow or heart */}
      {hasBow ? (
        <g transform="translate(46, 22)">
          <path d="M2 0 C11 6 11 16 2 22" stroke="#d4af37" strokeWidth="2" fill="none" />
          <line x1="2" y1="0" x2="2" y2="22" stroke="#1c1c18" strokeWidth="1" />
          <line x1="-2" y1="11" x2="12" y2="11" stroke="#e11d48" strokeWidth="1.4" />
          <polygon points="12,11 9,8.5 9,13.5" fill="#e11d48" />
        </g>
      ) : (
        <path
          d="M35 36 L31 32 C29 30 31 27 33.5 29 L35 30.5 L36.5 29 C39 27 41 30 39 32 L35 36 Z"
          fill="#e11d48"
          stroke="#1c1c18"
          strokeWidth="1.2"
        />
      )}
    </svg>
  );
}

function PartyCharacter({ delay = '0s', reducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 74 72"
      fill="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Seated legs */}
      <rect x="24" y="44" width="6" height="14" fill="#1c1c18" />
      <rect x="34" y="44" width="6" height="14" fill="#1c1c18" />

      {/* Festive jacket */}
      <path
        d="M20 26 H44 L46 45 H18 L20 26 Z"
        fill="#d4af37"
        stroke="#1c1c18"
        strokeWidth="1.5"
      />
      <polygon points="32,26 28,36 36,36" fill="#fcf9f3" />

      {/* Head */}
      <circle cx="32" cy="19" r="8" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.5" />
      <circle cx="29.5" cy="18.5" r="1.3" fill="#1c1c18" />
      <circle cx="34.5" cy="18.5" r="1.3" fill="#1c1c18" />

      {/* Gold party hat */}
      <polygon
        points="32,2 24,13 40,13"
        fill="#d4af37"
        stroke="#1c1c18"
        strokeWidth="1.5"
      />
      <circle cx="32" cy="2" r="2.2" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.2" />

      {/* Party horn */}
      <polygon
        points="36,21 52,17 52,23"
        fill="#e11d48"
        stroke="#1c1c18"
        strokeWidth="1.3"
      />

      {/* Small confetti puff every ~10s */}
      <g
        style={{
          transformOrigin: '54px 19px',
          animation: reducedMotion ? 'none' : `hcHornPuff 10s ease-out ${delay} infinite`,
        }}
      >
        <circle cx="57" cy="14" r="2" fill="#d4af37" />
        <rect x="60" y="19" width="4" height="2.5" fill="#e11d48" />
        <circle cx="56" cy="24" r="1.8" fill="#38bdf8" />
      </g>
    </svg>
  );
}

function FlagCharacter({ delay = '0s', reducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 68 72"
      fill="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Mounting bracket & pole */}
      <rect x="12" y="0" width="8" height="4" fill="#d4af37" stroke="#1c1c18" strokeWidth="1.2" />
      <line x1="16" y1="2" x2="16" y2="62" stroke="#1c1c18" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="62" r="3" fill="#d4af37" stroke="#1c1c18" strokeWidth="1.3" />

      {/* Waving Green-White-Green pennant flag */}
      <g
        style={{
          transformOrigin: '16px 20px',
          animation: reducedMotion ? 'none' : `hcFlagWave 3.8s ease-in-out ${delay} infinite`,
        }}
      >
        <polygon points="16,8 30,11.5 30,32.5 16,36" fill="#15803d" stroke="#1c1c18" strokeWidth="1.4" />
        <polygon points="30,11.5 44,15 44,29 30,32.5" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.4" />
        <polygon points="44,15 58,22 44,29" fill="#15803d" stroke="#1c1c18" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

function CrescentCharacter({ delay = '0s', reducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 64 74"
      fill="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <g
        style={{
          transformOrigin: '32px 0px',
          animation: reducedMotion ? 'none' : `hcPendulumSwing 5.2s ease-in-out ${delay} infinite`,
        }}
      >
        {/* Short hanging strings */}
        <line x1="28" y1="0" x2="28" y2="18" stroke="#d4af37" strokeWidth="1.5" />
        <line x1="42" y1="0" x2="42" y2="28" stroke="#d4af37" strokeWidth="1.2" />

        {/* Gold Crescent Moon */}
        <path
          d="M36 16 A19 19 0 1 0 36 54 A14 14 0 1 1 36 16 Z"
          fill="#d4af37"
          stroke="#1c1c18"
          strokeWidth="1.5"
        />

        {/* Five-point star */}
        <polygon
          points="42,27 44,32 49.5,32.5 45,36 46.5,41.5 42,38.2 37.5,41.5 39,36 34.5,32.5 40,32"
          fill="#fcf9f3"
          stroke="#1c1c18"
          strokeWidth="1.3"
        />
      </g>
    </svg>
  );
}

function TagCharacter({ delay = '0s', reducedMotion = false }) {
  return (
    <svg
      viewBox="0 0 64 76"
      fill="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <g
        style={{
          transformOrigin: '32px 0px',
          animation: reducedMotion ? 'none' : `hcPendulumSwing 4.8s ease-in-out ${delay} infinite`,
        }}
      >
        {/* Hanging string */}
        <line x1="32" y1="0" x2="32" y2="16" stroke="#d4af37" strokeWidth="1.5" />
        {/* Large blank gold price tag (no text or numbers anywhere) */}
        <polygon
          points="24,14 40,14 46,23 46,62 18,62 18,23"
          fill="#d4af37"
          stroke="#1c1c18"
          strokeWidth="1.6"
        />
        {/* Inner decorative border line */}
        <rect
          x="22"
          y="26"
          width="20"
          height="31"
          fill="#eab308"
          stroke="#1c1c18"
          strokeWidth="1.1"
        />
        {/* Grommet hole */}
        <circle cx="32" cy="19.5" r="3" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

function renderCharacterByType(pairKey, { delay, reducedMotion, isRight }) {
  switch (pairKey) {
    case 'santa_pair':
      return <SantaCharacter delay={delay} reducedMotion={reducedMotion} />;
    case 'bunny_pair':
      return <BunnyCharacter delay={delay} reducedMotion={reducedMotion} />;
    case 'ghost_pair':
      return <GhostCharacter delay={delay} reducedMotion={reducedMotion} />;
    case 'cupid_pair':
      return <CupidCharacter delay={delay} reducedMotion={reducedMotion} hasBow={!isRight} />;
    case 'party_pair':
      return <PartyCharacter delay={delay} reducedMotion={reducedMotion} />;
    case 'flag_pair':
      return <FlagCharacter delay={delay} reducedMotion={reducedMotion} />;
    case 'crescent_pair':
      return <CrescentCharacter delay={delay} reducedMotion={reducedMotion} />;
    case 'tag_pair':
      return <TagCharacter delay={delay} reducedMotion={reducedMotion} />;
    default:
      return null;
  }
}

export default function HeaderCharactersPair({
  pairKey,
  reducedMotion = false,
}) {
  if (!pairKey) return null;

  const sizeStyle = {
    top: 'var(--header-offset, 70px)',
    height: 'clamp(56px, 5vw, 72px)',
    width: 'clamp(52px, 4.6vw, 68px)',
  };

  return (
    <div aria-hidden="true" className="pointer-events-none select-none">
      <style>{CHARACTER_KEYFRAMES}</style>

      {/* Left header character (~12% from left edge) */}
      <div
        className="absolute pointer-events-none"
        style={{
          ...sizeStyle,
          left: '12%',
        }}
      >
        {renderCharacterByType(pairKey, {
          delay: '0s',
          reducedMotion,
          isRight: false,
        })}
      </div>

      {/* Right mirrored header character (~12% from right edge, offset timing) */}
      <div
        className="absolute pointer-events-none"
        style={{
          ...sizeStyle,
          right: '12%',
          transform: 'scaleX(-1)',
        }}
      >
        {renderCharacterByType(pairKey, {
          delay: '2.9s',
          reducedMotion,
          isRight: true,
        })}
      </div>
    </div>
  );
}

