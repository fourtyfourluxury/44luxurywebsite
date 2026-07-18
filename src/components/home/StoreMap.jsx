import { useSiteStore } from '../../store/useSiteStore';

export default function StoreMap() {
  const { contactMap } = useSiteStore();

  // CMS values with fallbacks
  const visible = contactMap?.visible !== false;
  const address = contactMap?.address || 'Shop C426, Shariff Plaza, Banex, Wuse 2, Abuja, FCT, Nigeria';

  if (!visible) return null;

  // Query by the plaza's real, indexed name/address rather than raw
  // coordinates with a made-up label — a synthetic coordinate+label pin
  // isn't a real Google Place, which is why clicking it showed
  // "place info could not load". Searching the actual landmark name lets
  // Google resolve it to the real, clickable place.
  const mapQuery = 'Shariff Plaza, Banex, Wuse 2, Abuja, Nigeria';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=17&ie=UTF8&iwloc=B&output=embed`;

  return (
    <section id="store-map" className="w-full bg-[#13130f]">
      {/* ── Minimalist Header (matching reference image) ───────────────── */}
      <div className="w-full py-6 text-center border-t border-[#fcf9f3]/10">
        <h2 className="font-unica text-3xl md:text-4xl uppercase tracking-widest text-[#fcf9f3]">
          VISIT OUR STORE
        </h2>
        <p className="font-plex text-xs text-[#fcf9f3]/50 mt-2">{address}</p>
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
        </div>
      </div>
    </section>
  );
}
