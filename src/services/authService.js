import { supabase, getUserProfile } from '../lib/supabase';
import { sendWelcomeEmail } from './emailService';

/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */

// Re-export getUserProfile for use in auth store
export { getUserProfile };

// Sign up new user with email and password
export const signUp = async ({ email, password, fullName }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Send welcome email (don't fail signup if email fails)
    if (data.user) {
      try {
        await sendWelcomeEmail({
          email: data.user.email,
          name: fullName || data.user.email.split('@')[0],
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue with signup even if email fails
      }
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: error.message };
  }
};

// Sign in with email and password
export const signIn = async ({ email, password }) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile with role
    const profile = await getUserProfile(data.user.id);

    return {
      user: data.user,
      profile,
      session: data.session,
      error: null,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, profile: null, session: null, error: error.message };
  }
};

// Sign in with Google OAuth
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { data: null, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
};

// Get current session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error) {
    console.error('Get session error:', error);
    return { session: null, error: error.message };
  }
};

// Get current user with profile
export const getCurrentUserWithProfile = async () => {
  try {
    console.log('🔍 authService.getCurrentUserWithProfile: Fetching user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('🔍 authService.getCurrentUserWithProfile: User result:', { 
      hasUser: !!user, 
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message 
    });
    
    if (userError) throw userError;
    if (!user) {
      console.log('⚠️ authService.getCurrentUserWithProfile: No user found');
      return { user: null, profile: null, error: null };
    }

    console.log('🔍 authService.getCurrentUserWithProfile: Fetching profile for user:', user.id);
    const profile = await getUserProfile(user.id);
    console.log('🔍 authService.getCurrentUserWithProfile: Profile result:', { 
      hasProfile: !!profile, 
      profile 
    });

    return { user, profile, error: null };
  } catch (error) {
    console.error('❌ authService.getCurrentUserWithProfile error:', error);
    return { user: null, profile: null, error: error.message };
  }
};

// Update user password
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { data: null, error: error.message };
  }
};

// Update user email
export const updateEmail = async (newEmail) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Update email error:', error);
    return { data: null, error: error.message };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { data: null, error: error.message };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    // Pass event and session to callback
    // Profile fetching is handled in the callback to avoid lock conflicts
    callback(event, session);
  });
};

// Check if user is admin
export const checkIsAdmin = async () => {
  try {
    const { user, profile } = await getCurrentUserWithProfile();
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Check admin error:', error);
    return false;
  }
};

// Admin login (same as regular login, but checks admin role)
export const adminLogin = async ({ email, password }) => {
  try {
    const result = await signIn({ email, password });
    
    if (result.error) return result;
    
    // Check if user is admin
    if (result.profile?.role !== 'admin') {
      await signOut();
      return {
        user: null,
        profile: null,
        session: null,
        error: 'Access denied. Admin privileges required.',
      };
    }

    return result;
  } catch (error) {
    console.error('Admin login error:', error);
    return { user: null, profile: null, session: null, error: error.message };
  }
};
