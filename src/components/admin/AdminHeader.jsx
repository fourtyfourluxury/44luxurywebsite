import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, Globe, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHomepageStore } from '../../store/homepageStore';
import { useSiteStore } from '../../store/useSiteStore';
import { toast } from '../ui/ToastProvider';

export default function AdminHeader() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { sections } = useHomepageStore();
  const { setHeroSlides, setAnnouncementMessages } = useSiteStore();

  const handlePublish = () => {
    // Sync homepage config → storefront store
    const heroSection = sections.find(s => s.id === 'sec-hero');
    if (heroSection?.config?.slides) {
      setHeroSlides(heroSection.config.slides);
    }
    const announcementSection = sections.find(s => s.id === 'sec-announcement');
    if (announcementSection?.config?.messages) {
      setAnnouncementMessages(announcementSection.config.messages);
    }
    toast('Changes published to storefront', 'success');
  };

  const handleLogout = async () => {
    console.log('🔓 AdminHeader: Logout initiated...');
    
    try {
      // Clear any stored login intent
      localStorage.removeItem('login_intent');
      
      // Sign out from Supabase
      const { success, error } = await signOut();
      
      if (error) {
        console.error('❌ AdminHeader: Logout error:', error);
        toast('Failed to sign out. Please try again.', 'error');
        return;
      }
      
      console.log('✅ AdminHeader: Logout successful, redirecting to /admin/login');
      
      // Force redirect to admin login (not home page)
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('❌ AdminHeader: Unexpected logout error:', err);
      toast('An error occurred during sign out.', 'error');
    }
  };

  return (
    <header className="h-14 bg-[#0f0f0c] border-b border-[#2a2a26] flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-unica text-xl uppercase tracking-widest text-bone">44 LUXURY</span>
        <span className="font-grotesk text-[9px] uppercase tracking-widest text-concrete border border-[#2a2a26] px-2 py-0.5">CMS</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Publish */}
        <button
          onClick={handlePublish}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-[10px] px-4 py-2 hover:bg-[#c9a02d] transition-colors"
        >
          <Save size={13} />
          PUBLISH CHANGES
        </button>

        {/* Exit to storefront */}
        <Link
          to="/"
          className="flex items-center gap-2 border border-[#2a2a26] text-concrete hover:text-bone hover:border-bone font-grotesk font-bold uppercase tracking-widest text-[10px] px-4 py-2 transition-colors"
        >
          <Globe size={13} />
          STOREFRONT
        </Link>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-[#2a2a26] pl-4">
          <span className="font-plex text-xs text-concrete hidden md:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete hover:text-red-400 transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </div>
    </header>
  );
}
