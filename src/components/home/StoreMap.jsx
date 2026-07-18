import { useSiteStore } from '../../store/useSiteStore';

export default function StoreMap() {
  const { contactMap } = useSiteStore();

  // CMS values with fallbacks
  const visible = contactMap?.visible !== false;
  const lat = contactMap?.lat ?? 9.0573;
  const lng = contactMap?.lng ?? 7.4845;

  if (!visible) return null;

  // Query by exact coordinates (not a text address search) so the pin always
  // drops precisely on the store — a text query depends on Google's fuzzy
  // geocoding and can drift to a nearby building or the wrong plaza.
  const pinLabel = '44+Luxury+Store';
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}(${pinLabel})&z=17&ie=UTF8&iwloc=B&output=embed`;

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
        </div>
      </div>
    </section>
  );
}
