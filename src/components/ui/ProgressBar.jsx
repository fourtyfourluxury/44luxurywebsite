import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ProgressBar() {
  const location = useLocation();
  const barRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.style.opacity = '1';

    requestAnimationFrame(() => {
      bar.style.transition = 'width 0.4s ease';
      bar.style.width = '80%';
    });

    timerRef.current = setTimeout(() => {
      bar.style.transition = 'width 0.2s ease';
      bar.style.width = '100%';
      setTimeout(() => {
        bar.style.transition = 'opacity 0.3s ease';
        bar.style.opacity = '0';
      }, 200);
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none">
      <div
        ref={barRef}
        style={{ width: '0%', opacity: 0 }}
        className="h-full bg-[#D4AF37]"
      />
    </div>
  );
}
