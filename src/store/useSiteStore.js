import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as productService from '../services/productService';
import * as collectionService from '../services/collectionService';
import * as homepageService from '../services/homepageService';
import { subscribeToHomepageConfig, subscribeToHeroSlides, subscribeToProducts, subscribeToCollections, subscribeToHomepageSections } from '../services/realtimeService';

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSiteStore = create(
  persist(
    (set, get) => ({
      // ─── Data State ──────────────────────────────────────────
      products: [],
      collections: [],
      heroSlides: [],
      loading: true,
      initialized: false,
      error: null,

      // ─── Homepage Config ────────────────────────────────────
      heroDisplayMode: 'slideshow',
      heroSpeed: 5,

      announcement: {
        visible: true,
        messages: [
          'BORN FROM PAIN. BUILT TO LAST',
          'BORN FROM PAIN. BUILT TO LAST',
        ],
        bgColor: '#1c1c18',
        textColor: '#fcf9f3',
      },

      // ─── Main Homepage Content ──────────────────────────────
      featuredClothes: {
        productIds: [], // max 5
      },
      homepageSections: [], // admin-managed named product sections (title + product_ids)
      splitContent: {
        collections: {
          image: '',
          title: 'COLLECTIONS',
        },
        newArrivals: {
          image: '',
          title: 'NEW ARRIVALS',
        }
      },
      contactHero: {
        title: 'CONTACT',
        subtitle: 'GET IN TOUCH',
        image: '/lifestyle-contact.jpg',
      },
      contactMap: {
        visible: true,
        sectionTitle: 'VISIT OUR STORE',
        sectionDescription: 'Step into the 44 Luxury showroom and experience the collection in person. Our team is on hand for bespoke styling consultations and exclusive in-store drops.',
        address: 'Shop C426, Shariff Plaza, Banex, Wuse 2, Abuja, FCT, Nigeria',
        lat: 9.0573,
        lng: 7.4845,
        mapsLink: 'https://maps.google.com/?q=Shop+C426+Shariff+Plaza+Banex+Wuse+2+Abuja',
        hours: 'Mon–Sat  10am–7pm \u00b7 Sun  12pm–5pm',
        popupContent: '44 Luxury\nShop C426, Shariff Plaza, Banex, Wuse 2, Abuja',
      },
      faqHero: {
        title: 'FAQ',
        subtitle: 'HELP & INFORMATION',
        image: '/lifestyle-faq.jpg',
      },
      categories: [
        {
          label: 'Sweatshirts',
          slug: '/shop?q=sweatshirt',
          image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&q=85&auto=format&fit=crop',
        },
        {
          label: 'Accessories',
          slug: '/shop?q=accessories',
          image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700&q=85&auto=format&fit=crop',
        },
        {
          label: 'Polo',
          slug: '/shop?q=polo',
          image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=700&q=85&auto=format&fit=crop',
        },
        {
          label: 'Tank Tops',
          slug: '/shop?q=tank',
          image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=85&auto=format&fit=crop',
        },
        {
          label: 'Skirts',
          slug: '/category/skirts',
          image: '',
        },
        {
          label: 'Crop Tops',
          slug: '/category/crop-tops',
          image: '',
        },
        {
          label: 'Socks',
          slug: '/category/socks',
          image: '',
        },
        {
          label: 'Denim',
          slug: '/category/denim',
          image: '',
        },
      ],

      // ─── Orders (will be fetched per user) ──────────────────
      orders: [],

      // ─── Complaints (will be fetched per user) ──────────────
      complaints: [],

      // ─── Settings ────────────────────────────────────────────
      settings: {
        brandName: '44LUXURY',
        currency: '₦',
        announcementDefault: 'FREE DELIVERY ON ORDERS ABOVE ₦150,000',
      },

      // ─── Cart ────────────────────────────────────────────────
      cart: [],
      isCartOpen: false,

      // ─── Wishlist ────────────────────────────────────────────
      wishlist: [],

      // ─── Recently Viewed ─────────────────────────────────────
      recentlyViewed: [],

      // ─── Hydration ───────────────────────────────────────────
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      // ─── Initialize Store (Fetch from Supabase) ─────────────
      initializeStore: async () => {
        const state = get();
        
        // Don't re-initialize if already done
        if (state.initialized) {
          console.log('Store already initialized');
          return;
        }

        console.log('Initializing store from Supabase...');
        set({ loading: true, error: null });

        try {
          // Fetch products from Supabase
          const { products, error: productsError } = await productService.getProducts();
          if (productsError) {
            console.error('Error fetching products:', productsError);
            throw new Error(productsError);
          }

          // Fetch collections from Supabase
          const { collections, error: collectionsError } = await collectionService.getCollections();
          if (collectionsError) {
            console.error('Error fetching collections:', collectionsError);
            throw new Error(collectionsError);
          }

          // Fetch homepage config from Supabase
          const { config: homepageConfig, error: homepageError } = await homepageService.getHomepageConfig();
          if (homepageError) {
            console.warn('Error fetching homepage config:', homepageError);
            // Don't throw - homepage config is optional
          }

          // Fetch hero slides from Supabase
          const { slides: heroSlides, error: slidesError } = await homepageService.getHeroSlides();
          if (slidesError) {
            console.warn('Error fetching hero slides:', slidesError);
          }

          // Fetch admin-managed homepage product sections
          const { sections: homepageSections, error: sectionsError } = await homepageService.getHomepageProductSections();
          if (sectionsError) {
            console.warn('Error fetching homepage sections:', sectionsError);
          }

          // Update store with fetched data
          set({
            products: products || [],
            collections: collections || [],
            heroSlides: heroSlides || [],
            homepageSections: homepageSections || [],
            // Update homepage sections from config
            announcement: homepageConfig?.announcement || state.announcement,
            heroDisplayMode: homepageConfig?.hero_display_mode || state.heroDisplayMode,
            heroSpeed: homepageConfig?.hero_speed || state.heroSpeed,
            featuredClothes: { productIds: homepageConfig?.featured_product_ids || [] },
            splitContent: {
              collections: homepageConfig?.collections_row || state.splitContent.collections,
              newArrivals: homepageConfig?.new_arrivals || state.splitContent.newArrivals,
            },
            contactHero: homepageConfig?.sections?.contact_hero || state.contactHero,
            contactMap: homepageConfig?.sections?.contact_map || state.contactMap,
            faqHero: homepageConfig?.sections?.faq_hero || state.faqHero,
            categories: homepageConfig?.sections?.categories || state.categories,
            loading: false,
            initialized: true,
            error: null,
          });

          console.log('✅ Store initialized successfully:', {
            products: products?.length || 0,
            collections: collections?.length || 0,
            heroSlides: heroSlides?.length || 0,
            sections: {
              announcement: !!homepageConfig?.announcement,
              featuredClothes: !!homepageConfig?.featured_product_ids,
              splitContent: !!homepageConfig?.collections_row,
            },
          });
        } catch (error) {
          console.error('Failed to initialize store:', error);
          set({
            loading: false,
            initialized: false,
            error: error.message,
          });
        }
      },

      // ─── Refresh Homepage Data (Manual) ──────────────────────
      refreshHomepage: async () => {
        console.log('🔄 Manually refreshing homepage data...');
        
        try {
          // Fetch homepage config
          const { config: homepageConfig } = await homepageService.getHomepageConfig();
          
          // Fetch hero slides
          const { slides: heroSlides } = await homepageService.getHeroSlides();

          // Fetch admin-managed homepage product sections
          const { sections: homepageSections } = await homepageService.getHomepageProductSections();

          if (homepageConfig) {
            const current = get();
            set({
              heroSlides: heroSlides || [],
              homepageSections: homepageSections || [],
              announcement: homepageConfig.announcement || current.announcement,
              heroDisplayMode: homepageConfig.hero_display_mode || current.heroDisplayMode,
              heroSpeed: homepageConfig.hero_speed || current.heroSpeed,
              featuredClothes: { productIds: homepageConfig.featured_product_ids || [] },
              splitContent: {
                collections: homepageConfig.collections_row || current.splitContent.collections,
                newArrivals: homepageConfig.new_arrivals || current.splitContent.newArrivals,
              },
              contactHero: homepageConfig.sections?.contact_hero || current.contactHero,
              contactMap: homepageConfig.sections?.contact_map || current.contactMap,
              faqHero: homepageConfig.sections?.faq_hero || current.faqHero,
              categories: homepageConfig.sections?.categories || current.categories,
            });
            
            console.log('✅ Homepage data refreshed successfully');
          }
        } catch (error) {
          console.error('❌ Failed to refresh homepage:', error);
        }
      },

      // ─── Subscribe to Homepage Realtime Updates ──────────────
      subscribeToHomepageUpdates: () => {
        console.log('📡 Subscribing to homepage & data realtime updates...');
        
        // Subscribe to homepage config changes
        const configChannel = subscribeToHomepageConfig(({ config }) => {
          console.log('🔄 Realtime: Homepage config updated');
          const current = get();
          set({
            announcement: config.announcement || current.announcement,
            heroDisplayMode: config.hero_display_mode || current.heroDisplayMode,
            heroSpeed: config.hero_speed || current.heroSpeed,
            featuredClothes: { productIds: config.featured_product_ids || [] },
            splitContent: {
              collections: config.collections_row || current.splitContent.collections,
              newArrivals: config.new_arrivals || current.splitContent.newArrivals,
            },
            contactHero: config.sections?.contact_hero || current.contactHero,
            contactMap: config.sections?.contact_map || current.contactMap,
            faqHero: config.sections?.faq_hero || current.faqHero,
            categories: config.sections?.categories || current.categories,
          });
        });

        // Subscribe to hero slides changes
        const slidesChannel = subscribeToHeroSlides(async () => {
          console.log('🔄 Realtime: Hero slides changed, refetching...');
          const { slides } = await homepageService.getHeroSlides();
          set({ heroSlides: slides || [] });
        });

        // Subscribe to products changes
        const productsChannel = subscribeToProducts(() => {
          console.log('🔄 Realtime: Products table updated, refetching...');
          get().refreshProducts();
        });

        // Subscribe to collections changes
        const collectionsChannel = subscribeToCollections(() => {
          console.log('🔄 Realtime: Collections table updated, refetching...');
          get().refreshCollections();
        });

        // Subscribe to homepage sections changes
        const sectionsChannel = subscribeToHomepageSections(async () => {
          console.log('🔄 Realtime: Homepage sections changed, refetching...');
          const { sections } = await homepageService.getHomepageProductSections();
          set({ homepageSections: sections || [] });
        });

        // Return cleanup function
        return () => {
          console.log('🔌 Unsubscribing from realtime updates');
          configChannel.unsubscribe();
          slidesChannel.unsubscribe();
          if (productsChannel) productsChannel.unsubscribe();
          if (collectionsChannel) collectionsChannel.unsubscribe();
          if (sectionsChannel) sectionsChannel.unsubscribe();
        };
      },

      // ─── Refresh Data (Re-fetch from Supabase) ──────────────
      refreshProducts: async () => {
        const { products, error } = await productService.getProducts();
        if (!error && products) {
          set({ products });
        }
      },

      refreshCollections: async () => {
        const { collections, error } = await collectionService.getCollections();
        if (!error && collections) {
          set({ collections });
        }
      },

      // ─── Cart Actions ────────────────────────────────────────
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addToCart: (product, size, color, qty = 1) => set((state) => {
        const existing = state.cart.find(
          i => i.id === product.id && i.size === size && i.color === color
        );
        if (existing) {
          return {
            cart: state.cart.map(i =>
              i.id === product.id && i.size === size && i.color === color
                ? { ...i, qty: i.qty + qty }
                : i
            ),
            isCartOpen: true,
          };
        }
        return {
          cart: [...state.cart, {
            ...product, size, color, qty,
            cartId: `${product.id}-${size}-${color}-${Date.now()}`,
          }],
          isCartOpen: true,
        };
      }),

      removeFromCart: (cartId) => set((state) => ({
        cart: state.cart.filter(i => i.cartId !== cartId),
      })),

      updateQty: (cartId, qty) => set((state) => ({
        cart: qty <= 0
          ? state.cart.filter(i => i.cartId !== cartId)
          : state.cart.map(i => i.cartId === cartId ? { ...i, qty } : i),
      })),

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
      },

      getCartCount: () => {
        const { cart } = get();
        return cart.reduce((sum, i) => sum + i.qty, 0);
      },

      // ─── Wishlist Actions ────────────────────────────────────
      toggleWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.includes(productId)
          ? state.wishlist.filter(id => id !== productId)
          : [...state.wishlist, productId],
      })),

      isWishlisted: (productId) => get().wishlist.includes(productId),

      // ─── Recently Viewed ─────────────────────────────────────
      addRecentlyViewed: (productId) => set((state) => {
        const filtered = state.recentlyViewed.filter(id => id !== productId);
        return { recentlyViewed: [productId, ...filtered].slice(0, 8) };
      }),

      // ─── Auth Actions (REMOVED - Use authStore instead) ──
      // All authentication is now handled by authStore with real Supabase integration
      // These deprecated methods have been removed to prevent confusion

      // ─── Admin — Products ─────────────────────────────────────
      addProduct: (product) => set((state) => ({
        products: [...state.products, product],
      })),
      updateProduct: (id, data) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...data } : p),
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id),
        featuredClothes: {
          ...state.featuredClothes,
          productIds: state.featuredClothes.productIds?.filter(fid => fid !== id) || [],
        },
      })),

      // ─── Admin — Collections ──────────────────────────────────
      addCollection: (collection) => set((state) => ({
        collections: [...state.collections, collection],
      })),
      updateCollection: (id, data) => set((state) => ({
        collections: state.collections.map(c => c.id === id ? { ...c, ...data } : c),
      })),
      deleteCollection: (id) => set((state) => ({
        collections: state.collections.filter(c => c.id !== id),
      })),

      // ─── Admin — Hero Slides ──────────────────────────────────
      setHeroSlides: (slides) => set({ heroSlides: slides }),
      addHeroSlide: (slide) => set((state) => ({
        heroSlides: [...state.heroSlides, slide],
      })),
      updateHeroSlide: (id, data) => set((state) => ({
        heroSlides: state.heroSlides.map(s => s.id === id ? { ...s, ...data } : s),
      })),
      deleteHeroSlide: (id) => set((state) => ({
        heroSlides: state.heroSlides.filter(s => s.id !== id),
      })),

      updateAnnouncement: (data) => set((state) => ({
        announcement: { ...state.announcement, ...data },
      })),

      // alias used by AdminHeader publish
      setAnnouncementMessages: (messages) => set((state) => ({
        announcement: { ...state.announcement, messages },
      })),

      // ─── Admin — Homepage Content ─────────────────────────────
      setFeaturedClothes: (data) => set({ featuredClothes: data }),
      setSplitContent: (data) => set({ splitContent: data }),

      // ─── Admin — Settings ─────────────────────────────────────
      updateSettings: (data) => set((state) => ({
        settings: { ...state.settings, ...data },
      })),

      // ─── Orders ───────────────────────────────────────────────
      setOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o),
      })),

      // ─── Complaints ───────────────────────────────────────────
      addComplaint: (complaint) => set((state) => ({
        complaints: [{ ...complaint, id: `C${String(state.complaints.length + 1).padStart(3, '0')}`, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }, ...state.complaints],
      })),
      updateComplaint: (id, updates) => set((state) => ({
        complaints: state.complaints.map(c => c.id === id ? { ...c, ...updates } : c),
      })),
    }),
    {
      name: '44luxury-store',
      version: 4, // Increment version to trigger migration
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // Only persist cart, wishlist, and recentlyViewed
      // Don't persist products/collections (fetch from Supabase)
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
        announcement: state.announcement,
        settings: state.settings,
        _hasHydrated: state._hasHydrated,
      }),
    }
  )
);
