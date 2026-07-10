import { useEffect, useRef, useState } from 'react';
import { MapPin, Clock, ExternalLink, Navigation } from 'lucide-react';
import { useSiteStore } from '../../store/useSiteStore';

export default function StoreMap() {
  const { contactMap } = useSiteStore();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [isIntersected, setIsIntersected] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // CMS values with fallbacks
  const visible        = contactMap?.visible !== false;
  const sectionTitle   = contactMap?.sectionTitle   || 'VISIT OUR STORE';
  const sectionDesc    = contactMap?.sectionDescription || 'Step into the 44 Luxury showroom and experience the collection in person. Our team is on hand for bespoke styling consultations and exclusive in-store drops.';
  const address        = contactMap?.address  || 'Shop C426, Shariff Plaza, Banex, Wuse 2, Abuja, FCT, Nigeria';
  const lat            = parseFloat(contactMap?.lat  ?? 9.0573);
  const lng            = parseFloat(contactMap?.lng  ?? 7.4845);
  const mapsLink       = contactMap?.mapsLink  || `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  const hours          = contactMap?.hours     || 'Mon–Sat  10am–7pm · Sun  12pm–5pm';
  const popupContent   = contactMap?.popupContent || '44 Luxury\nShop C426, Shariff Plaza, Banex, Wuse 2, Abuja';

  // 1. Intersection Observer for Lazy Loading
  useEffect(() => {
    if (!visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsIntersected(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [visible]);

  // 2. Load Leaflet Dynamically when in view
  useEffect(() => {
    if (!isIntersected) return;

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Import leaflet package dynamically
    import('leaflet')
      .then((L) => {
        window.L = L.default || L;
        setLeafletLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load Leaflet:', err);
        setMapError(true);
      });

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [isIntersected]);

  // 3. Initialize/Update Map Instance
  useEffect(() => {
    if (!leafletLoaded || !window.L || !containerRef.current) return;

    const L = window.L;

    // Cleanup previous map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      // Create map instance
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: false, // disable scroll zoom to prevent accidental page scroll hijacking
      });

      mapRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create premium red SVG pin marker
      const redIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" style="filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.3));">
          <path d="M18 0 C8 0 0 8 0 18 C0 30 18 46 18 46 C18 46 36 30 36 18 C36 8 28 0 18 0 Z" fill="#b91c1c" />
          <circle cx="18" cy="18" r="6" fill="#ffffff" />
        </svg>
      `;

      const customIcon = L.divIcon({
        html: redIconSvg,
        className: 'custom-leaflet-marker',
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -40]
      });

      // Marker popup content
      // Formats newline characters to <br/> tags
      const formattedPopupHtml = `
        <div style="font-family:'Space Grotesk',sans-serif; min-width: 180px; padding: 4px;">
          <p style="margin: 0 0 8px; color: #1c1c18; font-size: 12px; line-height: 1.4; font-weight: 500;">
            ${popupContent.replace(/\n/g, '<br/>')}
          </p>
          <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" 
             style="display: inline-flex; align-items: center; gap: 4px; background: #1c1c18; color: #fcf9f3; font-size: 10px; font-weight: bold; text-decoration: none; padding: 6px 12px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
            Get Directions ↗
          </a>
        </div>
      `;

      // Place the marker
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(formattedPopupHtml).openPopup();

    } catch (e) {
      console.error('Error rendering Leaflet map:', e);
      setMapError(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, lat, lng, popupContent, mapsLink]);

  if (!visible) return null;

  return (
    <section id="store-map" className="w-full bg-[#1c1c18] py-20 md:py-28">
      {/* ── Section header ─────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-end">
          
          {/* Left — headline + description */}
          <div>
            <p className="font-grotesk font-bold text-[10px] uppercase tracking-[0.28em] text-[#fcf9f3]/35 mb-4">
              OUR SHOWROOM · ABUJA, NIGERIA
            </p>
            <h2 className="font-unica text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter text-[#fcf9f3] leading-[1.0] mb-6">
              {sectionTitle}
            </h2>
            <p className="font-plex text-sm text-[#fcf9f3]/55 leading-relaxed max-w-lg">
              {sectionDesc}
            </p>
          </div>

          {/* Right — address + hours + CTA */}
          <div className="flex flex-col gap-5 lg:items-end">
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-[#b91c1c] mt-0.5 shrink-0" />
              <div>
                <p className="font-grotesk font-bold text-[9px] uppercase tracking-[0.22em] text-[#fcf9f3]/35 mb-1">ADDRESS</p>
                <p className="font-plex text-sm text-[#fcf9f3]/75 leading-relaxed lg:text-right max-w-sm">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={14} className="text-[#b91c1c] mt-0.5 shrink-0" />
              <div>
                <p className="font-grotesk font-bold text-[9px] uppercase tracking-[0.22em] text-[#fcf9f3]/35 mb-1">OPENING HOURS</p>
                <p className="font-grotesk font-bold text-[11px] uppercase tracking-widest text-[#fcf9f3]/65 lg:text-right">{hours}</p>
              </div>
            </div>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#fcf9f3] text-[#1c1c18] font-grotesk font-bold uppercase tracking-[0.2em] text-[11px] px-8 py-4 hover:bg-[#fcf9f3]/88 transition-colors group mt-2"
            >
              <Navigation size={13} className="shrink-0" />
              GET DIRECTIONS
              <ExternalLink size={11} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Map container with luxury styling ──────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div 
          className="relative w-full overflow-hidden rounded-2xl shadow-2xl border border-white/10" 
          style={{ height: 'clamp(380px, 50vw, 640px)' }}
        >
          {/* Tile saturation/contrast filters to match luxury aesthetic */}
          <style>{`
            .leaflet-tile-container img {
              filter: grayscale(1) contrast(1.1) brightness(0.95);
            }
            .custom-leaflet-marker {
              background: none !important;
              border: none !important;
            }
            .leaflet-popup-content-wrapper {
              background: #fcf9f3 !important;
              color: #1c1c18 !important;
              border-radius: 8px !important;
              border: 1px solid rgba(0, 0, 0, 0.1) !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
            }
            .leaflet-popup-tip {
              background: #fcf9f3 !important;
            }
          `}</style>

          {/* Map Mount Point */}
          <div ref={containerRef} className="w-full h-full bg-[#13130f]" />

          {/* Lazy load loading screen */}
          {!isIntersected && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#13130f] z-20">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#b91c1c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="font-grotesk text-xs uppercase tracking-widest text-[#fcf9f3]/30">Loading Map...</p>
              </div>
            </div>
          )}

          {/* Fallback if map fails to render */}
          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#13130f] gap-4 z-20">
              <MapPin size={32} className="text-[#b91c1c]" strokeWidth={1.5} />
              <div className="text-center px-6">
                <p className="font-unica text-2xl uppercase tracking-wider text-[#fcf9f3]/60 mb-2">
                  Map Unavailable
                </p>
                <p className="font-plex text-sm text-[#fcf9f3]/35 mb-4 max-w-xs">
                  Could not load OpenStreetMap at this time.
                </p>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-[#fcf9f3]/20 text-[#fcf9f3]/60 font-grotesk font-bold uppercase tracking-[0.18em] text-[10px] px-6 py-3 hover:border-[#fcf9f3]/50 hover:text-[#fcf9f3] transition-colors"
                >
                  Open in Google Maps <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
