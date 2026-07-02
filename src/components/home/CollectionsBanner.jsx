import { Link } from 'react-router-dom';

export default function CollectionsBanner() {
  return (
    <section className="w-full bg-[#1c1c18] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* Left — Text Block */}
        <div className="flex-1">
          <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-5">
            THE FULL RANGE
          </p>
          <h2 className="font-unica text-[clamp(3.5rem,8vw,8rem)] uppercase tracking-tighter text-[#fcf9f3] leading-[0.88] mb-8">
            44 LUXURY<br />
            <span className="text-[#D4AF37]">COLLECTIONS</span>
          </h2>
          <p className="font-plex text-sm text-[#a8a8a0] max-w-sm leading-relaxed mb-10">
            Every piece crafted with intent. Explore our full range of collections — from everyday staples to statement pieces. Born from pain, built to last.
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center gap-4 bg-[#D4AF37] text-[#1c1c18] font-grotesk font-black uppercase tracking-[0.2em] text-[11px] px-9 py-4 hover:bg-[#fcf9f3] transition-colors duration-300 group"
          >
            EXPLORE COLLECTIONS
            <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
          </Link>
        </div>

        {/* Right — Decorative Grid of small squares */}
        <div className="hidden md:grid grid-cols-3 gap-2 w-[340px] shrink-0">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-[#fcf9f3]/5 hover:bg-[#D4AF37]/20 transition-colors duration-500 flex items-center justify-center"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {i === 4 && (
                <span className="font-unica text-2xl text-[#D4AF37] tracking-tighter select-none">44</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Scrolling Marquee */}
      <div className="w-full overflow-hidden border-t border-[#fcf9f3]/8 py-4">
        <div className="animate-marquee whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-0">
              <span className="font-unica text-[2rem] uppercase tracking-tighter text-[#fcf9f3]/10 mx-6">
                44 LUXURY
              </span>
              <span className="text-[#D4AF37]/30 mx-4 font-thin">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
