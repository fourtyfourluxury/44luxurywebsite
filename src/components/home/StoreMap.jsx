import { useSiteStore } from '../../store/useSiteStore';

export default function StoreMap() {
  const { contactMap } = useSiteStore();

  // CMS values with fallbacks
  const visible = contactMap?.visible !== false;
  const address = contactMap?.address || 'Shop C426, Shariff Plaza, Banex, Wuse 2, Abuja, FCT, Nigeria';
  const lat = contactMap?.lat ?? 9.0573;
  const lng = contactMap?.lng ?? 7.4845;

  if (!visible) return null;

  // Query by exact coordinates (not a text search) so the pin is dropped
  // and visible the instant the map loads — no click needed to reveal it.
  // No fake parenthetical label this time (that's what caused "place info
  // could not load" previously) — a bare coordinate pin loads instantly
  // and clicking it still works, it just shows plain coordinates.
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=17&ie=UTF8&iwloc=B&output=embed`;

  return (
    <section id="store-map" className="w-full bg-[#13130f]">
      {/* ── Minimalist Header (matching reference image) ───────────────── */}
      <div className="w-full py-6 text-center border-t border-[#fcf9f3]/10">
        <h2 className="font-unica text-3xl md:text-4xl uppercase tracking-widest text-[#fcf9f3]">
          VISIT OUR STORE
        </h2>
      </div>

      {/* ── Google Maps Embed ──────────────────────── */}
      <div className="w-full">
        <div
          className="relative w-full overflow-hidden"
          style={{ height: 'clamp(400px, 60vh, 700px)' }}
        >
          {/* CSS Filter to force Dark Mode onto the Google Maps iframe to match the website's dark luxury aesthetic */}
          <style>{`
            .google-map-iframe {
              filter: invert(90%) hue-rotate(180deg) grayscale(20%) contrast(1.1);
            }
          `}</style>

          <iframe
            title="Google Maps Location"
            className="w-full h-full google-map-iframe"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={mapSrc}
            allowFullScreen
          />

          {/* Address overlay — top-left corner, visible as soon as the page loads */}
          <div className="absolute top-4 left-4 z-10 bg-[#13130f]/90 backdrop-blur-sm border border-[#fcf9f3]/10 px-4 py-3 max-w-[280px] pointer-events-none">
            <p className="font-grotesk font-bold text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] mb-1">
              44 Luxury Flagship Store
            </p>
            <p className="font-plex text-xs text-[#fcf9f3]/80 leading-relaxed">{address}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
