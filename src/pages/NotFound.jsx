import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf9f3] px-6 text-center">
      <p className="font-grotesk font-semibold text-xs uppercase tracking-[0.2em] text-[#5f5e5e] mb-4">Error 404</p>
      <h1 className="font-unica text-[10rem] md:text-[14rem] uppercase tracking-tighter text-[#1c1c18] leading-none mb-8">
        404
      </h1>
      <p className="font-plex text-lg text-[#5f5e5e] max-w-md mb-10">
        This page doesn't exist. It may have moved, been removed, or never existed.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-[#4b0e1e] transition-colors"
        >
          RETURN HOME
        </Link>
        <Link
          to="/shop"
          className="border border-[#1c1c18] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs px-10 py-4 hover:bg-[#1c1c18] hover:text-[#fcf9f3] transition-colors"
        >
          SHOP ALL
        </Link>
      </div>
    </div>
  );
}
