import { Link } from 'react-router-dom';
import HeroBanner from '../components/common/HeroBanner';

const TIMELINE = [
  { year: '2019', event: 'Founded in Lagos, Nigeria by the 44LUXURY creative collective.' },
  { year: '2020', event: 'First drop — "ONYX 001" — sells out in 44 hours.' },
  { year: '2021', event: 'First international stockist secured in London.' },
  { year: '2022', event: 'The SS22 campaign reaches 1 million views in 72 hours.' },
  { year: '2023', event: 'Launch of "THE LUMINOUS" — our first full women\'s collection.' },
  { year: '2024', event: '44LUXURY opens its Lagos flagship on Bourdillon Road, Ikoyi.' },
  { year: '2025', event: 'SS25 "BORN FROM PAIN" — the defining collection of a generation.' },
];

const VALUES = [
  { title: 'UNCOMPROMISING CONSTRUCTION', body: 'Every garment is sampled minimum 3 times before production. We reject anything that doesn\'t meet our 44-point quality checklist.' },
  { title: 'PREMIUM MATERIALS', body: 'We source only from certified premium suppliers. Our heavyweight cottons, selvedge denims, and wool blends are chosen for longevity, not cost savings.' },
  { title: 'ARCHITECTURAL SILHOUETTES', body: 'We draw from architecture, industrial design, and African craft tradition. Every silhouette is a deliberate act of design — not trend-chasing.' },
  { title: 'RADICAL TRANSPARENCY', body: 'We publish our pricing breakdown, factory partners, and material sourcing on our website. No smoke. No mirrors.' },
];

export default function About() {
  return (
    <div>
      <HeroBanner
        title={<>BORN FROM PAIN.<br />BUILT TO LAST.</>}
        subtitle="EST. 2019 — LAGOS, NIGERIA"
        image="/lifestyle-about.jpg"
        overlayOpacity={0.42}
        alignment="bottom-center"
      />

      {/* ── Mission ───────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          <div>
            <p className="font-grotesk font-semibold text-[10px] uppercase tracking-[0.2em] text-[#5f5e5e] mb-6">OUR MISSION</p>
            <h2 className="font-unica text-5xl md:text-6xl uppercase tracking-tighter text-[#1c1c18] leading-tight mb-8">
              AFRICAN LUXURY.<br />NO COMPROMISES.
            </h2>
            <p className="font-plex text-base text-[#5f5e5e] leading-relaxed mb-6">
              44LUXURY was founded on a single, stubborn belief: African fashion deserves to be held to the same standard
              as the world's great luxury houses. Not almost. Not close. Exactly.
            </p>
            <p className="font-plex text-base text-[#5f5e5e] leading-relaxed">
              We build garments that will outlast trends, outlast seasons, and outlast the brands that chased them.
              Every thread is deliberate. Every silhouette is architectural. Every drop is limited — because quality has no scale.
            </p>
          </div>
          <div className="bg-[#1c1c18] overflow-hidden" style={{ minHeight: '520px' }}>
            <img
              src="/lifestyle-login.jpg"
              alt="44LUXURY — Born From Pain jacket, confidence and premium craftsmanship"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────── */}
      <section className="bg-[#1c1c18] py-24 px-6">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="font-unica text-5xl md:text-7xl uppercase tracking-tighter text-[#fcf9f3] mb-16 leading-none">
            WHAT WE STAND FOR
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#fcf9f3]/10">
            {VALUES.map(v => (
              <div key={v.title} className="bg-[#1c1c18] p-10">
                <h3 className="font-grotesk font-bold text-[11px] uppercase tracking-widest text-[#D4AF37] mb-4">{v.title}</h3>
                <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 py-24">
        <h2 className="font-unica text-5xl md:text-7xl uppercase tracking-tighter text-[#1c1c18] mb-16 leading-none">THE STORY</h2>
        <div className="flex flex-col gap-0">
          {TIMELINE.map((item, i) => (
            <div key={item.year} className={`flex gap-12 items-start py-10 ${i < TIMELINE.length - 1 ? 'border-b border-[#1c1c18]/10' : ''}`}>
              <p className="font-unica text-5xl text-[#D4AF37] shrink-0 w-24">{item.year}</p>
              <p className="font-plex text-sm text-[#5f5e5e] leading-relaxed pt-3">{item.event}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-[#fcf9f3] border-t border-[#1c1c18]/10 py-24 px-6 text-center">
        <h2 className="font-unica text-5xl md:text-7xl uppercase tracking-tighter text-[#1c1c18] mb-6">JOIN THE MOVEMENT</h2>
        <p className="font-plex text-sm text-[#5f5e5e] mb-10 max-w-sm mx-auto leading-relaxed">
          Be part of something uncompromising. Shop the collection.
        </p>
        <Link to="/shop" className="inline-block bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-sm px-12 py-4 hover:bg-[#4b0e1e] transition-colors">
          SHOP NOW
        </Link>
      </section>
    </div>
  );
}
