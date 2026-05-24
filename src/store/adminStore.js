import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialSlides = [
  { id: 's-1', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070', headline: 'NEW ARRIVALS', subtext: '', ctaLabel: 'SHOP NOW', ctaLink: '/shop' },
];

const initialVideos = [
  { 
    id: 'v-1', 
    title: 'THE CORE EDIT', 
    url: 'https://joy.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190301_1_25_11_preview.mp4', 
    thumbnail: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1440&auto=format&fit=crop', 
    visible: true, 
    caption: 'Discover the uncompromising framework of our modern silhouette.',
    createdAt: new Date().toISOString() 
  }
];

const initialSections = [
  { id: 'sec-video', title: 'Featured Video', visible: true, type: 'video' },
  { id: 'sec-hero', title: 'Hero', visible: true, type: 'hero' },
  { id: 'sec-new', title: 'New Arrivals', visible: true, type: 'products' },
  { id: 'sec-editorial', title: 'Editorial Feature', visible: true, type: 'editorial' },
  { id: 'sec-collections', title: 'Collections Row', visible: true, type: 'collections' }
];

export const useAdminStore = create(
  persist(
    (set, get) => ({
      slides: initialSlides,
      autoplay: true,
      autoplaySpeed: 5,
      sections: initialSections,
      videos: initialVideos,
      
      setSlides: (slides) => set({ slides }),
      updateSlide: (id, data) => set((state) => ({ slides: state.slides.map(s => s.id === id ? {...s, ...data} : s) })),
      addSlide: (slide) => set((state) => ({ slides: [...state.slides, { ...slide, id: `s-${Date.now()}` }] })),
      removeSlide: (id) => set((state) => ({ slides: state.slides.filter(s => s.id !== id) })),
      
      addVideo: (video) => set((state) => ({ videos: [...state.videos, { ...video, id: `v-${Date.now()}` }] })),
      updateVideo: (id, data) => set((state) => ({ videos: state.videos.map(v => v.id === id ? {...v, ...data} : v) })),
      deleteVideo: (id) => set((state) => ({ videos: state.videos.filter(v => v.id !== id) })),

      setAutoplay: (autoplay) => set({ autoplay }),
      setAutoplaySpeed: (autoplaySpeed) => set({ autoplaySpeed }),
      
      setSections: (sections) => set({ sections }),
      toggleSectionVisibility: (id) => set((state) => ({
         sections: state.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
      }))
    }),
    { name: '44lux_homepage', version: 2 }
  )
);
