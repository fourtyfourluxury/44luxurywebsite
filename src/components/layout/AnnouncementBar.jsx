import { useSiteStore } from '../../store/useSiteStore';

export default function AnnouncementBar() {
  const { announcement, _hasHydrated } = useSiteStore();

  if (!_hasHydrated) return null;

  const messages = announcement?.messages || [];
  if (!announcement?.visible || messages.length === 0) return null;

  const ticker = [...messages, ...messages];

  return (
    <div
      className="w-full overflow-hidden py-2.5 select-none"
      style={{
        backgroundColor: announcement.bgColor || '#1c1c18',
        color: announcement.textColor || '#fcf9f3',
      }}
    >
      <div className="animate-marquee">
        {ticker.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-0">
            <span className="font-grotesk text-[11px] font-semibold uppercase tracking-[0.18em]">
              {msg}
            </span>
            <span className="mx-8 text-[#fcf9f3]/30 font-thin select-none">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
