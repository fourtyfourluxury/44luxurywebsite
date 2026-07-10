import { Link } from 'react-router-dom';
import { useSiteStore } from '../../store/useSiteStore';

const isVideo = (url = '') => /\.(mp4|webm|mov)$/i.test(url) || url.includes('/video/');

export default function SplitContent() {
  const { splitContent, _hasHydrated } = useSiteStore();

  if (!_hasHydrated || !splitContent) return null;

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Collections Half */}
        <Link 
          to="/collections" 
          className="relative group aspect-[4/5] md:aspect-auto md:h-[80vh] min-h-[500px] overflow-hidden bg-[#1c1c18]"
        >
          {splitContent.collections?.image && (
            isVideo(splitContent.collections.image) ? (
              <video 
                src={splitContent.collections.image} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
                muted autoPlay loop playsInline
              />
            ) : (
              <img 
                src={splitContent.collections.image} 
                alt="Collections" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
              />
            )
          )}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="font-unica text-6xl md:text-7xl lg:text-8xl text-[#fcf9f3] uppercase tracking-tighter text-center px-6 drop-shadow-lg">
              {splitContent.collections?.title || 'COLLECTIONS'}
            </h2>
          </div>
        </Link>

        {/* New Arrivals Half */}
        <Link 
          to="/shop?sort=newest" 
          className="relative group aspect-[4/5] md:aspect-auto md:h-[80vh] min-h-[500px] overflow-hidden bg-[#1c1c18]"
        >
          {splitContent.newArrivals?.image && (
            isVideo(splitContent.newArrivals.image) ? (
              <video 
                src={splitContent.newArrivals.image} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
                muted autoPlay loop playsInline
              />
            ) : (
              <img 
                src={splitContent.newArrivals.image} 
                alt="New Arrivals" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
              />
            )
          )}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="font-unica text-6xl md:text-7xl lg:text-8xl text-[#fcf9f3] uppercase tracking-tighter text-center px-6 drop-shadow-lg">
              {splitContent.newArrivals?.title || 'NEW ARRIVALS'}
            </h2>
          </div>
        </Link>
      </div>
    </section>
  );
}
