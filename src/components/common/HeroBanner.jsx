/**
 * HeroBanner — Full-bleed luxury editorial hero for static pages
 *
 * Design language: YL Collectives
 * ─ True edge-to-edge image (no horizontal padding, no max-width box)
 * ─ Portrait-first 4:5 aspect ratio, capped at 92dvh
 * ─ Gradient from black bottom → transparent top for text legibility
 * ─ Text anchored bottom-left with generous responsive padding
 * ─ Optional CTA button
 *
 * Props:
 *   title          — main heading over the image
 *   subtitle       — small eyebrow label above title
 *   image          — background image path / URL
 *   overlayOpacity — 0–1 additional flat tint (default 0.35)
 *   alignment      — "bottom-left" | "center" | "left" (default "bottom-left")
 *   cta            — optional { label, href }
 */
export default function HeroBanner({
  title,
  subtitle,
  image,
  overlayOpacity = 0.35,
  alignment = 'bottom-left',
  cta = null,
}) {
  const isCenter = alignment === 'center';
  const isLeft   = alignment === 'left';
  const isBottomCenter = alignment === 'bottom-center';

  return (
    <div className="w-full bg-[#1c1c18]">
      {/*
        Container sizing — mirrors HeroSlider/YL proportions:
        ▸ Mobile:  aspect-[4/5], capped at 92svh
        ▸ Desktop: aspect-[4/5], capped at 92dvh
        No horizontal padding — image touches browser edges.
      */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 'calc(100vw / 0.8)',
        }}
      >
        {/* Background image */}
        {image && (
          <img
            src={image}
            alt={title || '44LUXURY editorial'}
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />
        )}

        {/* Base gradient — heavy at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent z-10" />

        {/* Optional flat overlay tint */}
        <div
          className="absolute inset-0 z-10"
          style={{ background: `rgba(28,28,24,${overlayOpacity})` }}
        />

        {/* Text content */}
        <div className={`absolute z-20 ${
          isBottomCenter
            ? 'inset-x-0 bottom-0 flex flex-col items-center justify-end text-center px-6 pb-16 md:pb-24 lg:pb-28'
            : isCenter
            ? 'inset-0 flex flex-col items-center justify-center text-center px-8'
            : isLeft
            ? 'inset-0 flex flex-col items-start justify-center px-8 md:px-14 lg:px-20'
            : 'bottom-0 left-0 flex flex-col items-start px-6 pb-12 md:px-14 md:pb-18 lg:px-20 lg:pb-20'
        }`}>
          <div className={`${isBottomCenter || isCenter ? 'max-w-[75%] md:max-w-[600px] flex flex-col items-center' : 'max-w-[88%] md:max-w-[680px]'}`}>
            {subtitle && (
              <p className="font-grotesk font-bold text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#fcf9f3]/65 mb-3 md:mb-4">
                {subtitle}
              </p>
            )}
            {title && (
              <h1 className="font-unica text-[clamp(2.2rem,5vw,4.2rem)] uppercase tracking-[-0.01em] leading-[1.05] text-[#fcf9f3] drop-shadow-2xl">
                {title}
              </h1>
            )}
            {cta && (
              <a
                href={cta.href}
                className="mt-7 inline-block bg-[#fcf9f3] text-[#1c1c18] border border-[#fcf9f3] font-grotesk font-bold uppercase tracking-[0.18em] text-[10px] md:text-[11px] px-9 py-3.5 hover:bg-transparent hover:text-[#fcf9f3] transition-all duration-300"
              >
                {cta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
