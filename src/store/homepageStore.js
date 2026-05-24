import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultSections = [
  {
    id: 'sec-announcement', type: 'announcement', title: 'Announcement Bar', visible: false,
    config: { message: 'FREE SHIPPING ON ORDERS OVER ₦50,000', bgColor: '#1c1c18', textColor: '#fcf9f3' }
  },
  {
    id: 'sec-hero', type: 'hero', title: 'Hero', visible: true,
    config: {
      displayMode: 'SLIDESHOW',
      transitionSpeed: 5, autoplay: true, pauseOnHover: true,
      showDots: true, showArrows: true, transitionEffect: 'FADE', loop: true, showOnMobile: true,
      slides: [
        { id: 'sl-1', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070', headline: 'NEW ARRIVALS', subheadline: 'The Core Edit — SS25', ctaLabel: 'SHOP NOW', ctaLink: '/shop' }
      ]
    }
  },
  {
    id: 'sec-tagline', type: 'tagline', title: 'Brand Tagline Strip', visible: true,
    config: { text: 'BORN FROM PAIN. BUILT TO LAST.' }
  },
  {
    id: 'sec-new', type: 'products', title: 'New Arrivals Section', visible: true,
    config: { headline: 'NEW ARRIVALS', auto: true, autoCount: 8, pinnedIds: [] }
  },
  {
    id: 'sec-editorial', type: 'editorial', title: 'Editorial Feature', visible: true,
    config: {
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1440',
      headline: 'THE UNCOMPROMISING FORM', body: 'Crafted for those who command attention.', ctaLabel: 'EXPLORE', ctaLink: '/shop',
      imagePosition: 'LEFT', displayMode: 'STATIC'
    }
  },
  {
    id: 'sec-collections', type: 'collections', title: 'Collections Row', visible: true,
    config: { collections: [] }
  },
  {
    id: 'sec-video', type: 'video', title: 'Homepage Video Section', visible: false,
    config: {
      videoUrl: '', thumbnail: '', displayStyle: 'AUTOPLAY_MUTED_LOOP', displayLayout: 'INLINE_SECTION',
      overlayHeadline: '', overlaySubtext: '', overlayCta: '', overlayOpacity: 40,
      displayMode: 'SINGLE', transitionSpeed: 5, autoplay: true
    }
  },
  {
    id: 'sec-page-media', type: 'page-media', title: 'Page Media Settings', visible: true,
    config: {
      pages: {
        home: { bgImage: '', bgVideo: '', displayMode: 'STATIC', speed: 5, overlayColor: '#000000', overlayOpacity: 0, showOnMobile: true },
        men: { bgImage: '', bgVideo: '', displayMode: 'STATIC', speed: 5, overlayColor: '#000000', overlayOpacity: 0, showOnMobile: true },
        women: { bgImage: '', bgVideo: '', displayMode: 'STATIC', speed: 5, overlayColor: '#000000', overlayOpacity: 0, showOnMobile: true },
        shop: { bgImage: '', bgVideo: '', displayMode: 'STATIC', speed: 5, overlayColor: '#000000', overlayOpacity: 0, showOnMobile: true },
        about: { bgImage: '', bgVideo: '', displayMode: 'STATIC', speed: 5, overlayColor: '#000000', overlayOpacity: 0, showOnMobile: true }
      }
    }
  }
];

export const useHomepageStore = create(
  persist(
    (set, get) => ({
      sections: defaultSections,
      
      setSections: (sections) => set({ sections }),
      
      updateSection: (id, config) => set((state) => ({
        sections: state.sections.map(s => s.id === id ? { ...s, config: { ...s.config, ...config } } : s)
      })),
      
      toggleSection: (id) => set((state) => ({
        sections: state.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
      })),
      
      // Hero slide management
      addSlide: (slide) => set((state) => {
        const heroSection = state.sections.find(s => s.id === 'sec-hero');
        const updatedSlides = [...(heroSection?.config?.slides || []), { ...slide, id: `sl-${Date.now()}` }];
        return {
          sections: state.sections.map(s => s.id === 'sec-hero' 
            ? { ...s, config: { ...s.config, slides: updatedSlides } } 
            : s)
        };
      }),
      
      updateSlide: (slideId, data) => set((state) => {
        const heroSection = state.sections.find(s => s.id === 'sec-hero');
        const updatedSlides = (heroSection?.config?.slides || []).map(sl => sl.id === slideId ? { ...sl, ...data } : sl);
        return {
          sections: state.sections.map(s => s.id === 'sec-hero'
            ? { ...s, config: { ...s.config, slides: updatedSlides } }
            : s)
        };
      }),
      
      deleteSlide: (slideId) => set((state) => {
        const heroSection = state.sections.find(s => s.id === 'sec-hero');
        const updatedSlides = (heroSection?.config?.slides || []).filter(sl => sl.id !== slideId);
        return {
          sections: state.sections.map(s => s.id === 'sec-hero'
            ? { ...s, config: { ...s.config, slides: updatedSlides } }
            : s)
        };
      }),
      
      reorderSlides: (slides) => set((state) => ({
        sections: state.sections.map(s => s.id === 'sec-hero'
          ? { ...s, config: { ...s.config, slides } }
          : s)
      })),
    }),
    { name: '44lux_homepage_v3' }
  )
);
