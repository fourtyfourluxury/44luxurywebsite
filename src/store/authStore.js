import { create } from 'zustand';
import * as authService from '../services/authService';

/**
 * Auth Store - Manages authentication state
 * Now integrated with Supabase Auth
 */

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  error: null,
  _initializing: false, // Prevent multiple simultaneous initializations

  // Initialize auth state from Supabase session
  initialize: async () => {
    const state = get();
    
    // Prevent multiple simultaneous initializations
    if (state._initializing) {
      console.log('⚠️ authStore.initialize: Already initializing, waiting...');
      // Wait for the current initialization to complete (max 20 seconds)
      let waitTime = 0;
      while (get()._initializing && waitTime < 20000) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitTime += 100;
      }
      
      if (waitTime >= 20000) {
        console.error('❌ authStore.initialize: Timeout waiting for initialization');
        set({ _initializing: false, loading: false, error: 'Initialization timeout' });
        return;
      }
      
      console.log('✅ authStore.initialize: Previous initialization completed');
      return;
    }

    // If already initialized and has user, skip
    if (state.user && !state.loading) {
      console.log('✅ authStore.initialize: Already initialized with user:', state.user.email);
      return;
    }

    try {
      console.log('🔄 authStore.initialize: Starting...');
      set({ loading: true, _initializing: true });
      
      const { user, profile } = await authService.getCurrentUserWithProfile();
      
      console.log('🔄 authStore.initialize: Got user and profile:', { 
        hasUser: !!user, 
        hasProfile: !!profile,
        userId: user?.id,
        userEmail: user?.email,
        profileRole: profile?.role 
      });
      
      if (user && profile) {
        set({
          user,
          profile,
          isAuthenticated: true,
          isAdmin: profile.role === 'admin',
          loading: false,
          error: null,
          _initializing: false,
        });
        console.log('✅ authStore.initialize: Auth state set successfully', {
          isAuthenticated: true,
          isAdmin: profile.role === 'admin',
          email: user.email
        });
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isAdmin: false,
          loading: false,
          _initializing: false,
        });
        console.log('⚠️ authStore.initialize: No user or profile found');
      }
    } catch (error) {
      console.error('❌ authStore.initialize error:', error);
      set({ loading: false, error: error.message, _initializing: false });
    }
  },

  // Sign up new user
  signUp: async ({ email, password, fullName }) => {
    try {
      set({ loading: true, error: null });
      const { user, error } = await authService.signUp({ email, password, fullName });
      
      if (error) {
        set({ loading: false, error });
        return { success: false, error };
      }

      // Note: User needs to verify email before they can sign in
      set({ loading: false });
      return { success: true, user };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Sign in with email/password
  signIn: async ({ email, password }) => {
    try {
      set({ loading: true, error: null });
      const { user, profile, session, error } = await authService.signIn({ email, password });
      
      if (error) {
        set({ loading: false, error });
        return { success: false, error };
      }

      set({
        user,
        profile,
        session,
        isAuthenticated: true,
        isAdmin: profile?.role === 'admin',
        loading: false,
        error: null,
      });

      // Trigger cart merge after successful login
      if (user?.id) {
        // Import dynamically to avoid circular dependency
        import('../store/cartStore').then(({ useCartStore }) => {
          useCartStore.getState().mergeCartOnLogin(user.id);
        });
      }

      return { success: true, user, profile };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await authService.signInWithGoogle();
      
      if (error) {
        set({ loading: false, error });
        return { success: false, error };
      }

      // OAuth redirect will happen, state will be updated on callback
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Admin login (checks admin role)
  adminLogin: async ({ email, password }) => {
    try {
      set({ loading: true, error: null });
      const { user, profile, session, error } = await authService.adminLogin({ email, password });
      
      if (error) {
        set({ loading: false, error });
        return { success: false, error };
      }

      set({
        user,
        profile,
        session,
        isAuthenticated: true,
        isAdmin: true,
        loading: false,
        error: null,
      });

      return { success: true, user, profile };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await authService.signOut();
      
      if (error) {
        set({ loading: false, error });
        return { success: false, error };
      }

      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Update password
  updatePassword: async (newPassword) => {
    try {
      set({ loading: true, error: null });
      const { error } = await authService.updatePassword(newPassword);
      
      if (error) {
        set({ loading: false, error });
        return { success: false, error };
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      const { error } = await authService.resetPassword(email);
      
      if (error) {
        set({ loading: false, error });
        return { success: false, error };
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Listen to auth state changes
  subscribeToAuthChanges: () => {
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
          console.log('🔔 SIGNED_IN event - fetching profile...');
          // Fetch profile directly here without going through initialize
          const profile = await authService.getUserProfile(session.user.id);
          
          set({
            user: session.user,
            profile,
            session,
            isAuthenticated: true,
            isAdmin: profile?.role === 'admin',
            loading: false,
          });

          console.log('✅ Auth state updated after SIGNED_IN:', {
            isAuthenticated: true,
            isAdmin: profile?.role === 'admin',
            email: session.user.email
          });

          // Trigger cart merge on sign in
          if (session.user?.id) {
            import('../store/cartStore').then(({ useCartStore }) => {
              useCartStore.getState().mergeCartOnLogin(session.user.id);
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔔 SIGNED_OUT event - clearing auth state...');
          set({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔔 TOKEN_REFRESHED event - updating session...');
          set({ session });
        } else if (event === 'INITIAL_SESSION' && session) {
          console.log('🔔 INITIAL_SESSION event - fetching profile...');
          // Fetch profile for initial session
          const profile = await authService.getUserProfile(session.user.id);
          
          set({
            user: session.user,
            profile,
            session,
            isAuthenticated: true,
            isAdmin: profile?.role === 'admin',
            loading: false,
          });

          console.log('✅ Auth state updated after INITIAL_SESSION:', {
            isAuthenticated: true,
            isAdmin: profile?.role === 'admin',
            email: session.user.email
          });
        }
      }
    );

    return subscription;
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
