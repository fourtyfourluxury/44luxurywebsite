import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to get user profile with role
export const getUserProfile = async (userId) => {
  console.log('🔍 getUserProfile: Fetching profile for userId:', userId);
  
  try {
    // Increased timeout to 15 seconds to handle Supabase lock conflicts
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout after 15 seconds')), 15000)
    );

    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    console.log('🔍 getUserProfile: Query completed');
    console.log('🔍 getUserProfile: Result:', { 
      hasData: !!data, 
      data, 
      error: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      errorHint: error?.hint
    });

    if (error) {
      console.error('❌ Error fetching user profile:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      return null;
    }

    if (!data) {
      console.warn('⚠️ No profile data returned for user:', userId);
      return null;
    }

    console.log('✅ Profile fetched successfully:', { email: data.email, role: data.role });
    return data;
  } catch (err) {
    console.error('❌ Exception in getUserProfile:', err);
    console.error('❌ Exception details:', err.message, err.stack);
    return null;
  }
};

// Helper function to check if user is admin
export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;

  const profile = await getUserProfile(user.id);
  return profile?.role === 'admin';
};
