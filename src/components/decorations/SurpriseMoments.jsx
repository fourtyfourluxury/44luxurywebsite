import { useState, useEffect, useRef } from 'react';
import { useSiteStore } from '../../store/useSiteStore';

const SURPRISE_INTERVALS_MS = {
  low: [60000, 120000],
  medium: [25000, 60000],
  high: [15000, 40000],
};

const SURPRISE_DURATION_MS = {
  sleigh: 7800,
  elf_peek: 5800,
  bunny_hop: 7400,
  ghosts: 7600,
  spiders: 6200,
  cupid_arrow: 5600,
  party_poppers: 3200,
  shooting_stars: 3400,
};

const SURPRISE_KEYFRAMES = `
@keyframes smSleighFly {
  0%   { transform: translate3d(-220px, 18px, 0); opacity: 0; }
  8%   { opacity: 1; }
  50%  { transform: translate3d(48vw, -8px, 0); opacity: 1; }
  92%  { opacity: 1; }
  100% { transform: translate3d(105vw, 12px, 0); opacity: 0; }
}
@keyframes smGiftDrop {
  0%, 38% { transform: translate3d(42vw, 12vh, 0) rotate(0deg); opacity: 0; }
  43%     { transform: translate3d(44vw, 14vh, 0) rotate(12deg); opacity: 1; }
  85%     { transform: translate3d(46vw, 56vh, 0) rotate(160deg); opacity: 0.85; }
  100%    { transform: translate3d(47vw, 68vh, 0) rotate(210deg); opacity: 0; }
}
@keyframes smElfPeekLeft {
  0%, 100% { transform: translate3d(-44px, 8px, 0) rotate(-8deg); opacity: 0; }
  18%, 78% { transform: translate3d(0, 0, 0) rotate(6deg); opacity: 1; }
  45%      { transform: translate3d(4px, -2px, 0) rotate(12deg); opacity: 1; }
}
@keyframes smElfPeekRight {
  0%, 100% { transform: translate3d(44px, 8px, 0) scaleX(-1) rotate(-8deg); opacity: 0; }
  18%, 78% { transform: translate3d(0, 0, 0) scaleX(-1) rotate(6deg); opacity: 1; }
  45%      { transform: translate3d(-4px, -2px, 0) scaleX(-1) rotate(12deg); opacity: 1; }
}
@keyframes smBunnyHopAcross {
  0%   { transform: translate3d(-80px, 0, 0); opacity: 0; }
  8%   { opacity: 1; }
  16%  { transform: translate3d(14vw, -22px, 0); }
  25%  { transform: translate3d(24vw, 0, 0); }
  34%  { transform: translate3d(36vw, -22px, 0); }
  43%  { transform: translate3d(46vw, 0, 0); }
  52%  { transform: translate3d(58vw, -22px, 0); }
  61%  { transform: translate3d(68vw, 0, 0); }
  70%  { transform: translate3d(80vw, -22px, 0); }
  80%  { transform: translate3d(90vw, 0, 0); opacity: 1; }
  100% { transform: translate3d(104vw, -12px, 0); opacity: 0; }
}
@keyframes smEggWobbleFade {
  0%, 28% { transform: scale(0) rotate(0deg); opacity: 0; }
  36%     { transform: scale(1) rotate(-10deg); opacity: 1; }
  52%     { transform: scale(1) rotate(10deg); opacity: 1; }
  68%     { transform: scale(1) rotate(-6deg); opacity: 0.9; }
  100%    { transform: scale(0.85) rotate(0deg); opacity: 0; }
}
@keyframes smGhostDrift {
  0%   { transform: translate3d(-70px, 10px, 0); opacity: 0; }
  15%  { opacity: 0.68; }
  50%  { transform: translate3d(50vw, -16px, 0); opacity: 0.72; }
  85%  { opacity: 0.65; }
  100% { transform: translate3d(104vw, 8px, 0); opacity: 0; }
}
@keyframes smGhostSidePeek {
  0%, 100% { transform: translate3d(46px, 0, 0) rotate(0deg); opacity: 0; }
  25%, 70% { transform: translate3d(0, 0, 0) rotate(-8deg); opacity: 0.78; }
  48%      { transform: translate3d(-4px, -4px, 0) rotate(6deg); opacity: 0.82; }
}
@keyframes smSpiderDrop {
  0%       { transform: translate3d(0, -130px, 0); opacity: 0; }
  10%      { opacity: 1; }
  40%, 65% { transform: translate3d(0, 0, 0); opacity: 1; }
  92%      { opacity: 1; }
  100%     { transform: translate3d(0, -130px, 0); opacity: 0; }
}
@keyframes smCupidArrowArc {
  0%   { transform: translate3d(8vw, 46vh, 0) rotate(-24deg); opacity: 0; }
  10%  { opacity: 1; }
  52%  { transform: translate3d(52vw, 24vh, 0) rotate(8deg); opacity: 1; }
  56%  { transform: translate3d(55vw, 25vh, 0) rotate(14deg); opacity: 0; }
  100% { transform: translate3d(55vw, 25vh, 0) rotate(14deg); opacity: 0; }
}
@keyframes smHeartBurst {
  0%, 50% { transform: translate3d(0, 0, 0) scale(0.2); opacity: 0; }
  62%     { opacity: 0.95; }
  100%    { transform: translate3d(var(--hx, 24px), var(--hy, -24px), 0) scale(1.1); opacity: 0; }
}
@keyframes smPopperPiece {
  0%   { transform: translate3d(0, 0, 0) scale(0.4) rotate(0deg); opacity: 1; }
  55%  { transform: translate3d(var(--px, 45px), var(--py, -95px), 0) scale(1) rotate(180deg); opacity: 0.95; }
  100% { transform: translate3d(var(--px2, 65px), var(--py2, -20px), 0) scale(0.85) rotate(320deg); opacity: 0; }
}
@keyframes smShootingStar {
  0%   { transform: translate3d(15vw, 8vh, 0) rotate(22deg) scaleX(0.3); opacity: 0; }
  20%  { opacity: 0.85; }
  80%  { opacity: 0.75; }
  100% { transform: translate3d(78vw, 34vh, 0) rotate(22deg) scaleX(1.1); opacity: 0; }
}
`;

function isModalOrDrawerBlocking(previewMode) {
  if (previewMode || typeof document === 'undefined') return false;
  try {
    const cartOpen = Boolean(useSiteStore.getState()?.isCartOpen);
    if (cartOpen) return true;
    if (document.body?.style?.overflow === 'hidden') return true;
    if (document.querySelector('[role="dialog"]')) return true;
  } catch {
    // Ignore store access errors
  }
  return false;
}

/**
 * ONE shared scheduler hook so that at most one surprise runs at a time.
 * First surprise ~8s after load, then random interval by intensity
 * (or every ~6s in the admin decoration preview panel).
 */
function useSurpriseScheduler({
  surpriseKeys = [],
  intensity = 'medium',
  isPhone = false,
  reducedMotion = false,
  isTabVisible = true,
  previewMode = false,
}) {
  const [activeSurprise, setActiveSurprise] = useState(null);
  const lastIndexRef = useRef(-1);
  const keysSignature = surpriseKeys.join(',');

  useEffect(() => {
    if (
      surpriseKeys.length === 0 ||
      isPhone ||
      reducedMotion ||
      !isTabVisible
    ) {
      setActiveSurprise(null);
      return;
    }

    let triggerTimer = null;
    let clearTimer = null;
    let cancelled = false;

    const getNextDelay = (isFirst) => {
      if (previewMode) {
        return isFirst ? 1200 : 6000;
      }
      if (isFirst) {
        return 8000;
      }
      const [minMs, maxMs] =
        SURPRISE_INTERVALS_MS[intensity] || SURPRISE_INTERVALS_MS.medium;
      return Math.round(minMs + Math.random() * (maxMs - minMs));
    };

    const scheduleNext = (isFirst = false) => {
      const delay = getNextDelay(isFirst);
      triggerTimer = window.setTimeout(() => {
        if (cancelled) return;

        // Skip if tab hidden, cart drawer open, or modal open
        if (
          document.visibilityState !== 'visible' ||
          isModalOrDrawerBlocking(previewMode)
        ) {
          scheduleNext(false);
          return;
        }

        let pickIdx = Math.floor(Math.random() * surpriseKeys.length);
        if (surpriseKeys.length > 1 && pickIdx === lastIndexRef.current) {
          pickIdx = (pickIdx + 1) % surpriseKeys.length;
        }
        lastIndexRef.current = pickIdx;
        const chosenKey = surpriseKeys[pickIdx];
        const duration = SURPRISE_DURATION_MS[chosenKey] || 6500;

        setActiveSurprise({ key: chosenKey, runId: Date.now() });

        clearTimer = window.setTimeout(() => {
          if (cancelled) return;
          setActiveSurprise(null);
          scheduleNext(false);
        }, duration);
      }, delay);
    };

    scheduleNext(true);

    return () => {
      cancelled = true;
      if (triggerTimer) window.clearTimeout(triggerTimer);
      if (clearTimer) window.clearTimeout(clearTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysSignature, intensity, isPhone, reducedMotion, isTabVisible, previewMode]);

  return activeSurprise;
}

/**
 * 1. sleigh: Santa's sleigh with 3 reindeer (one with a glowing red nose)
 * flies across the upper third in ~8s and drops a small gift that falls and fades.
 */
function SleighSurprise() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Flying sleigh + 3 reindeer */}
      <div
        className="absolute"
        style={{
          top: 'calc(var(--header-offset, 70px) + 18px)',
          left: 0,
          animation: 'smSleighFly 7.6s linear forwards',
        }}
      >
        <svg width="210" height="54" viewBox="0 0 210 54" fill="none">
          {/* Sleigh runners & body */}
          <path d="M6 44 H54 C60 44 64 40 64 36" stroke="#d4af37" strokeWidth="2" fill="none" />
          <path
            d="M10 24 H48 L56 38 H14 L10 24 Z"
            fill="#b91c1c"
            stroke="#d4af37"
            strokeWidth="1.5"
          />
          {/* Santa in sleigh */}
          <circle cx="28" cy="18" r="5.5" fill="#fde68a" />
          <path d="M22 15 L28 6 L35 15 Z" fill="#dc2626" />
          <circle cx="28" cy="6" r="2" fill="#fcf9f3" />
          {/* Gift sack in back */}
          <circle cx="17" cy="20" r="6" fill="#15803d" />

          {/* Reins */}
          <line x1="54" y1="28" x2="184" y2="26" stroke="#d4af37" strokeWidth="1" opacity="0.8" />

          {/* 3 Reindeer (front one has glowing red nose) */}
          {[82, 128, 174].map((rx, idx) => (
            <g key={rx} transform={`translate(${rx}, 14)`}>
              {/* Body & legs */}
              <ellipse cx="12" cy="14" rx="10" ry="5.5" fill="#92400e" stroke="#1c1c18" strokeWidth="1" />
              <line x1="6" y1="18" x2="3" y2="27" stroke="#92400e" strokeWidth="1.8" />
              <line x1="18" y1="18" x2="22" y2="26" stroke="#92400e" strokeWidth="1.8" />
              {/* Neck & head */}
              <circle cx="22" cy="8" r="4.5" fill="#92400e" stroke="#1c1c18" strokeWidth="1" />
              {/* Antlers */}
              <path d="M20 4 L18 0 M22 4 L25 0" stroke="#78350f" strokeWidth="1.3" />
              {/* Nose (Rudolph on front reindeer idx === 2) */}
              <circle
                cx="26.5"
                cy="8"
                r={idx === 2 ? '2.4' : '1.4'}
                fill={idx === 2 ? '#ef4444' : '#1c1c18'}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Dropped small gift that falls and fades */}
      <div
        className="absolute top-0 left-0"
        style={{ animation: 'smGiftDrop 7.6s ease-in forwards' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="15" fill="#dc2626" stroke="#1c1c18" strokeWidth="1.4" />
          <rect x="10.5" y="6" width="3" height="15" fill="#d4af37" />
          <rect x="3" y="12" width="18" height="3" fill="#d4af37" />
        </svg>
      </div>
    </div>
  );
}

/**
 * 2. elf_peek: a little elf peeks from behind the Christmas tree, looks around and ducks back
 * (if there is no tree, peek from the screen edge).
 */
function ElfPeekSurprise({ hasTree = false, side = 'left', avoidPreviewPill = false }) {
  const isRight = side === 'right';
  const posStyle = hasTree
    ? isRight
      ? { right: '150px', bottom: '36px' }
      : { left: avoidPreviewPill ? '320px' : '92px', bottom: '36px' }
    : isRight
      ? { right: '0px', bottom: '18%' }
      : { left: '0px', bottom: '18%' };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        ...posStyle,
        animation: `${isRight ? 'smElfPeekRight' : 'smElfPeekLeft'} 5.6s ease-in-out forwards`,
      }}
    >
      <svg width="54" height="62" viewBox="0 0 54 62" fill="none">
        {/* Pointed green elf hat with gold bell */}
        <polygon points="14,22 30,4 42,24" fill="#15803d" stroke="#1c1c18" strokeWidth="1.5" />
        <circle cx="30" cy="4" r="3" fill="#d4af37" stroke="#1c1c18" strokeWidth="1.2" />
        {/* Pointed ear */}
        <polygon points="40,26 49,23 42,32" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.3" />
        {/* Elf head & cheerful eyes */}
        <circle cx="28" cy="28" r="11" fill="#fde68a" stroke="#1c1c18" strokeWidth="1.5" />
        <circle cx="25" cy="27" r="1.6" fill="#1c1c18" />
        <circle cx="32" cy="27" r="1.6" fill="#1c1c18" />
        <path d="M25 32 Q28.5 35 32 32" stroke="#1c1c18" strokeWidth="1.4" fill="none" />
        {/* Red & green collar */}
        <polygon points="16,38 22,45 28,39 34,45 40,38" fill="#dc2626" stroke="#1c1c18" strokeWidth="1.3" />
      </svg>
    </div>
  );
}

/**
 * 3. bunny_hop: a bunny hops across the bottom edge and leaves one or two painted eggs
 * that wobble and fade.
 */
function BunnyHopSurprise() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[90px] overflow-hidden pointer-events-none">
      {/* Left-behind painted egg 1 */}
      <div
        className="absolute bottom-2 left-[32%]"
        style={{ animation: 'smEggWobbleFade 7.2s ease-in-out forwards' }}
      >
        <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
          <ellipse cx="11" cy="14" rx="9" ry="12" fill="#f9a8d4" stroke="#1c1c18" strokeWidth="1.4" />
          <path d="M3 13 Q11 9 19 13" stroke="#fde047" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Left-behind painted egg 2 */}
      <div
        className="absolute bottom-2 left-[62%]"
        style={{ animation: 'smEggWobbleFade 7.2s ease-in-out 1.1s forwards' }}
      >
        <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
          <ellipse cx="11" cy="14" rx="9" ry="12" fill="#a7f3d0" stroke="#1c1c18" strokeWidth="1.4" />
          <circle cx="8" cy="11" r="2" fill="#f472b6" />
          <circle cx="14" cy="16" r="2" fill="#60a5fa" />
        </svg>
      </div>

      {/* Hopping bunny */}
      <div
        className="absolute bottom-1 left-0"
        style={{ animation: 'smBunnyHopAcross 7.2s linear forwards' }}
      >
        <svg width="58" height="52" viewBox="0 0 58 52" fill="none">
          <circle cx="10" cy="34" r="5" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.4" />
          <ellipse cx="26" cy="32" rx="14" ry="10" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />
          <circle cx="40" cy="23" r="9" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.5" />
          <ellipse cx="36" cy="9" rx="3.2" ry="8" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.4" />
          <ellipse cx="42" cy="9" rx="3.2" ry="8" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.4" />
          <circle cx="43" cy="21" r="1.5" fill="#1c1c18" />
          <circle cx="48" cy="23" r="1.5" fill="#f472b6" />
          <ellipse cx="20" cy="42" rx="6" ry="3" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.4" />
          <ellipse cx="35" cy="42" rx="5" ry="3" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1.4" />
        </svg>
      </div>
    </div>
  );
}

/**
 * 4. ghosts: 3 to 5 translucent ghosts drift slowly across;
 * plus one peeks in from a side edge and does a small wobble.
 */
function GhostsSurprise() {
  const drifters = [
    { top: '22%', delay: '0s', scale: 0.9 },
    { top: '44%', delay: '0.7s', scale: 1.05 },
    { top: '64%', delay: '1.3s', scale: 0.85 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drifters.map((g, idx) => (
        <div
          key={idx}
          className="absolute left-0"
          style={{
            top: g.top,
            animation: `smGhostDrift 7.2s ease-in-out ${g.delay} forwards`,
          }}
        >
          <svg
            width={44 * g.scale}
            height={52 * g.scale}
            viewBox="0 0 44 52"
            fill="none"
          >
            <path
              d="M8 22 C8 8 36 8 36 22 L38 46 C33 42 29 48 24 44 C19 40 14 48 6 44 Z"
              fill="#fcf9f3"
              fillOpacity="0.78"
              stroke="#1c1c18"
              strokeWidth="1.4"
            />
            <circle cx="18" cy="22" r="2" fill="#1c1c18" />
            <circle cx="26" cy="22" r="2" fill="#1c1c18" />
          </svg>
        </div>
      ))}

      {/* Side-edge peeking ghost */}
      <div
        className="absolute right-0 top-[36%]"
        style={{ animation: 'smGhostSidePeek 6.4s ease-in-out forwards' }}
      >
        <svg width="50" height="56" viewBox="0 0 50 56" fill="none">
          <path
            d="M10 24 C10 10 40 10 40 24 L42 48 C36 44 31 50 25 46 C19 42 14 50 8 46 Z"
            fill="#fcf9f3"
            fillOpacity="0.85"
            stroke="#1c1c18"
            strokeWidth="1.5"
          />
          <circle cx="20" cy="24" r="2.2" fill="#1c1c18" />
          <circle cx="29" cy="24" r="2.2" fill="#1c1c18" />
        </svg>
      </div>
    </div>
  );
}

/**
 * 5. spiders: a spider lowers on a silk thread from the top edge (below the header),
 * pauses, then climbs back up.
 */
function SpidersSurprise({ side = 'left' }) {
  const posStyle =
    side === 'right'
      ? { left: '24%', top: 'var(--header-offset, 70px)' }
      : { right: '24%', top: 'var(--header-offset, 70px)' };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        ...posStyle,
        animation: 'smSpiderDrop 6s ease-in-out forwards',
      }}
    >
      <svg width="46" height="140" viewBox="0 0 46 140" fill="none">
        {/* Silk thread */}
        <line x1="23" y1="0" x2="23" y2="108" stroke="#e5e7eb" strokeWidth="1.2" />
        {/* Spider body */}
        <circle cx="23" cy="114" r="8" fill="#141410" stroke="#d4af37" strokeWidth="0.9" />
        <circle cx="23" cy="123" r="5" fill="#141410" stroke="#d4af37" strokeWidth="0.9" />
        {/* 8 legs */}
        <path
          d="M15 111 L6 105 M15 114 L5 114 M15 117 L6 123 M16 120 L9 128"
          stroke="#141410"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M31 111 L40 105 M31 114 L41 114 M31 117 L40 123 M30 120 L37 128"
          stroke="#141410"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Tiny glowing eyes */}
        <circle cx="21" cy="124" r="1.2" fill="#ef4444" />
        <circle cx="25" cy="124" r="1.2" fill="#ef4444" />
      </svg>
    </div>
  );
}

/**
 * 6. cupid_arrow: an arrow flies across in an arc and bursts into 6 to 8 small hearts that fade.
 */
function CupidArrowSurprise({ tokens = {} }) {
  const heartColor = tokens.accent || '#e11d48';
  const burstHearts = [
    { hx: '-38px', hy: '-32px' },
    { hx: '38px', hy: '-30px' },
    { hx: '-46px', hy: '6px' },
    { hx: '46px', hy: '8px' },
    { hx: '-22px', hy: '34px' },
    { hx: '24px', hy: '32px' },
    { hx: '0px', hy: '-44px' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Flying golden arrow */}
      <div
        className="absolute top-0 left-0"
        style={{ animation: 'smCupidArrowArc 5.4s ease-out forwards' }}
      >
        <svg width="76" height="24" viewBox="0 0 76 24" fill="none">
          <line x1="6" y1="12" x2="62" y2="12" stroke="#d4af37" strokeWidth="2.4" />
          <polygon points="4,7 14,12 4,17" fill="#fcf9f3" stroke="#1c1c18" strokeWidth="1" />
          <path
            d="M72 12 L62 5 C60 8 60 16 62 19 L72 12 Z"
            fill={heartColor}
            stroke="#1c1c18"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      {/* Heart burst at arc apex (55vw, 25vh) */}
      <div className="absolute left-[55%] top-[25%]">
        {burstHearts.map((b, idx) => (
          <div
            key={idx}
            className="absolute"
            style={{
              '--hx': b.hx,
              '--hy': b.hy,
              animation: 'smHeartBurst 5.4s ease-out forwards',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={heartColor}>
              <path d="M12 21l-1.4-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.5L12 21z" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 7. party_poppers: two confetti bursts from the bottom corners that settle in about 3 s.
 */
function PartyPoppersSurprise({ tokens = {} }) {
  const palette = [tokens.accent || '#d4af37', '#d4af37', '#e11d48', '#38bdf8', '#fcf9f3'];
  const pieces = [
    { px: '42px', py: '-110px', px2: '60px', py2: '-24px' },
    { px: '78px', py: '-135px', px2: '105px', py2: '-30px' },
    { px: '28px', py: '-85px', px2: '40px', py2: '-15px' },
    { px: '95px', py: '-95px', px2: '125px', py2: '-18px' },
    { px: '62px', py: '-150px', px2: '82px', py2: '-36px' },
    { px: '115px', py: '-120px', px2: '140px', py2: '-22px' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Left bottom corner burst */}
      <div className="absolute left-4 bottom-4">
        {pieces.map((p, idx) => (
          <div
            key={`l-${idx}`}
            className="absolute"
            style={{
              width: '8px',
              height: '5px',
              backgroundColor: palette[idx % palette.length],
              '--px': p.px,
              '--py': p.py,
              '--px2': p.px2,
              '--py2': p.py2,
              animation: 'smPopperPiece 3s cubic-bezier(0.2, 0.8, 0.3, 1) forwards',
            }}
          />
        ))}
      </div>

      {/* Right bottom corner burst */}
      <div className="absolute right-4 bottom-4" style={{ transform: 'scaleX(-1)' }}>
        {pieces.map((p, idx) => (
          <div
            key={`r-${idx}`}
            className="absolute"
            style={{
              width: '8px',
              height: '5px',
              backgroundColor: palette[(idx + 1) % palette.length],
              '--px': p.px,
              '--py': p.py,
              '--px2': p.px2,
              '--py2': p.py2,
              animation: 'smPopperPiece 3s cubic-bezier(0.2, 0.8, 0.3, 1) forwards',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 8. shooting_stars: one thin, soft shooting star crosses the upper area (no flashing).
 */
function ShootingStarSurprise() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-0 left-0"
        style={{ animation: 'smShootingStar 3.2s ease-out forwards' }}
      >
        <svg width="140" height="18" viewBox="0 0 140 18" fill="none">
          <defs>
            <linearGradient id="smShootingStarGrad" x1="0" y1="9" x2="134" y2="9" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0" />
              <stop offset="75%" stopColor="#fde047" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#fcf9f3" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <line x1="0" y1="9" x2="130" y2="9" stroke="url(#smShootingStarGrad)" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="132" cy="9" r="3" fill="#fcf9f3" />
        </svg>
      </div>
    </div>
  );
}

export default function SurpriseMoments({
  surpriseKeys = [],
  allActiveKeys = [],
  intensity = 'medium',
  side = 'left',
  tokens = {},
  isPhone = false,
  reducedMotion = false,
  isTabVisible = true,
  previewMode = false,
  avoidPreviewPill = false,
}) {
  const activeSurprise = useSurpriseScheduler({
    surpriseKeys,
    intensity,
    isPhone,
    reducedMotion,
    isTabVisible,
    previewMode,
  });

  if (!activeSurprise) return null;

  const { key, runId } = activeSurprise;
  const hasTree = allActiveKeys.includes('christmas_tree');

  return (
    <div key={runId} aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <style>{SURPRISE_KEYFRAMES}</style>
      {key === 'sleigh' && <SleighSurprise />}
      {key === 'elf_peek' && (
        <ElfPeekSurprise hasTree={hasTree} side={side} avoidPreviewPill={avoidPreviewPill} />
      )}
      {key === 'bunny_hop' && <BunnyHopSurprise />}
      {key === 'ghosts' && <GhostsSurprise />}
      {key === 'spiders' && <SpidersSurprise side={side} />}
      {key === 'cupid_arrow' && <CupidArrowSurprise tokens={tokens} />}
      {key === 'party_poppers' && <PartyPoppersSurprise tokens={tokens} />}
      {key === 'shooting_stars' && <ShootingStarSurprise />}
    </div>
  );
}
