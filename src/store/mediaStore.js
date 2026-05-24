import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMediaStore = create(
  persist(
    (set, get) => ({
      files: [
        {
          id: 'm-1', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1440&auto=format&fit=crop',
          name: 'hero-bomber-ss25.jpg', type: 'image', size: 248000, dimensions: '1440x960',
          tags: ['homepage', 'hero'], usedIn: ['Homepage Hero'], uploadedAt: '2025-04-01T10:00:00Z'
        },
        {
          id: 'm-2', url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1440&auto=format&fit=crop',
          name: 'men-cargo-trouser.jpg', type: 'image', size: 312000, dimensions: '1440x2160',
          tags: ['products'], usedIn: ['Cargo Trouser Product'], uploadedAt: '2025-04-02T11:00:00Z'
        },
        {
          id: 'm-3', url: 'https://images.unsplash.com/photo-1616847223018-b223dabc26ad?q=80&w=1440&auto=format&fit=crop',
          name: 'women-draped-dress.jpg', type: 'image', size: 198000, dimensions: '1440x1920',
          tags: ['products', 'collections'], usedIn: ['Draped Dress Product'], uploadedAt: '2025-04-03T09:00:00Z'
        },
        {
          id: 'm-4', url: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1440&auto=format&fit=crop',
          name: 'editorial-banner.jpg', type: 'image', size: 422000, dimensions: '2070x1380',
          tags: ['homepage', 'editorial'], usedIn: ['Editorial Banner'], uploadedAt: '2025-04-05T14:00:00Z'
        },
        {
          id: 'm-5', url: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1440&auto=format&fit=crop',
          name: 'overcoat-editorial.jpg', type: 'image', size: 287000, dimensions: '1440x2160',
          tags: ['products', 'lookbook'], usedIn: ['Structured Overcoat'], uploadedAt: '2025-04-06T16:00:00Z'
        },
        {
          id: 'm-6', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1440&auto=format&fit=crop',
          name: 'women-blazer-editorial.jpg', type: 'image', size: 341000, dimensions: '1440x1920',
          tags: ['collections', 'lookbook'], usedIn: ['Women Collection'], uploadedAt: '2025-04-07T08:00:00Z'
        },
      ],

      uploadFile: (fileData) => set((state) => ({
        files: [{ ...fileData, id: `m-${Date.now()}`, uploadedAt: new Date().toISOString() }, ...state.files]
      })),

      deleteFile: (id) => set((state) => ({
        files: state.files.filter(f => f.id !== id)
      })),

      bulkDelete: (ids) => set((state) => ({
        files: state.files.filter(f => !ids.includes(f.id))
      })),

      replaceFile: (id, newData) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, ...newData } : f)
      })),

      tagFile: (id, tags) => set((state) => ({
        files: state.files.map(f => f.id === id ? { ...f, tags } : f)
      })),

      addUsage: (fileId, usage) => set((state) => ({
        files: state.files.map(f => f.id === fileId
          ? { ...f, usedIn: [...new Set([...(f.usedIn || []), usage])] }
          : f)
      })),
    }),
    { name: '44lux_media_v2' }
  )
);
