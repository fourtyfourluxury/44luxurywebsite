import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-[#1c1c18] text-[#fcf9f3] flex items-center justify-center hover:bg-[#4b0e1e] transition-all duration-300 shadow-lg opacity-90 hover:opacity-100"
      style={{ animation: 'fadeIn 0.3s ease forwards' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
