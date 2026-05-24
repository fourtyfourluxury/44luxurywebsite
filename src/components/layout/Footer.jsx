import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../ui/ToastProvider';

const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
);
const TikTokIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const footerLinks = {
  SHOP: [
    { label: 'New Arrivals', href: '/shop?filter=new' },
    { label: 'Men', href: '/shop/men' },
    { label: 'Women', href: '/shop/women' },
    { label: 'Collections', href: '/shop' },
  ],
  SUPPORT: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping & Returns', href: '/faq#shipping' },
    { label: 'Size Guide', href: '/faq#sizing' },
    { label: 'Contact', href: '/contact' },
  ],
  COMPANY: [
    { label: 'About 44LUXURY', href: '/about' },
    { label: 'Careers', href: '/about#careers' },
    { label: 'Press', href: '/about#press' },
    { label: 'Stockists', href: '/about#stockists' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    toast("You're on the list — welcome to the collective!", 'success');
    setEmail('');
  };

  return (
    <footer className="bg-[#1c1c18] text-[#fcf9f3] pt-20 pb-10">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link to="/" className="font-unica text-5xl uppercase tracking-tighter text-[#fcf9f3] hover:text-[#D4AF37] transition-colors block mb-6">
              44 LUXURY
            </Link>
            <p className="font-plex text-sm text-[#5f5e5e] max-w-xs leading-relaxed mb-8">
              Born from pain. Built to last.<br />
              African luxury streetwear — unapologetically bold, architecturally precise.
            </p>
            {/* Newsletter */}
            <h4 className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#fcf9f3] mb-3">Join the Collective</h4>
            <form className="flex" onSubmit={handleNewsletter}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="YOUR EMAIL ADDRESS"
                className="flex-1 bg-[#2a2a26] text-[#fcf9f3] font-plex text-xs px-4 py-3 outline-none placeholder:text-[#5f5e5e] border border-transparent focus:border-[#fcf9f3]/20"
              />
              <button
                type="submit"
                className="bg-[#fcf9f3] text-[#1c1c18] font-grotesk font-bold uppercase text-xs tracking-widest px-5 py-3 hover:bg-[#D4AF37] transition-colors shrink-0"
              >
                JOIN
              </button>
            </form>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-grotesk font-bold text-xs uppercase tracking-widest text-[#fcf9f3] mb-5">{heading}</h4>
              <ul className="flex flex-col gap-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="font-plex text-sm text-[#5f5e5e] hover:text-[#fcf9f3] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#fcf9f3]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-plex text-xs text-[#5f5e5e]">
            © {new Date().getFullYear()} 44LUXURY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/_44luxury" target="_blank" rel="noopener noreferrer" className="text-[#5f5e5e] hover:text-[#fcf9f3] transition-colors">
              <IgIcon />
            </a>
            <a href="https://www.tiktok.com/@44.luxury" target="_blank" rel="noopener noreferrer" className="text-[#5f5e5e] hover:text-[#fcf9f3] transition-colors">
              <TikTokIcon />
            </a>
            <a href="https://www.whatsapp.com/catalog/2349067794779/" target="_blank" rel="noopener noreferrer" className="text-[#5f5e5e] hover:text-[#fcf9f3] transition-colors">
              <WhatsAppIcon />
            </a>
          </div>
          <div className="flex items-center gap-4 font-plex text-xs text-[#5f5e5e]">
            <Link to="/privacy" className="hover:text-[#fcf9f3] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#fcf9f3] transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
