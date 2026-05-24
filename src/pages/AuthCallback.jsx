import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔐 AuthCallback: Starting OAuth callback handling...');
        console.log('🔐 Current URL:', window.location.href);
        console.log('🔐 Referrer:', document.referrer);
        
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        console.log('🔐 getSession result:', { 
          hasSession: !!data?.session, 
          hasUser: !!data?.session?.user,
          userId: data?.session?.user?.id,
          userEmail: data?.session?.user?.email,
          error: error?.message 
        });

        if (error) {
          console.error('❌ OAuth callback error:', error);
          setError(error.message);
          // Redirect to auth page with error
          setTimeout(() => {
            navigate('/auth?error=oauth_failed');
          }, 2000);
          return;
        }

        if (data.session) {
          console.log('✅ OAuth successful, session exists');
          console.log('👤 User ID:', data.session.user.id);
          console.log('📧 User Email:', data.session.user.email);
          
          // Wait for profile to be created by trigger
          console.log('⏳ Waiting for profile creation...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Get the updated profile to check role
          // Note: We don't call initialize() here because App.jsx already handles it
          // The auth state will be updated by the global auth listener
          console.log('🔍 Fetching user profile...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          
          console.log('📋 Profile fetch result:', { 
            hasProfile: !!profileData, 
            profile: profileData,
            error: profileError?.message 
          });
          
          if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
            setError('Failed to load user profile. Please try again.');
            setTimeout(() => {
              navigate('/auth?error=profile_not_found');
            }, 2000);
            return;
          }
          
          const isAdmin = profileData?.role === 'admin';
          console.log('👑 Is Admin:', isAdmin);
          
          // Check if this was an admin login attempt
          // Use localStorage to track login intent (set in AdminLogin.jsx)
          const loginIntent = localStorage.getItem('login_intent');
          console.log('🔐 Login Intent:', loginIntent);
          
          // Clear the login intent
          localStorage.removeItem('login_intent');
          
          // Redirect based on role and intent
          if (isAdmin) {
            // Admin user - always go to admin dashboard
            console.log('✅ Admin user detected - redirecting to /admin');
            // Use window.location for hard redirect to ensure clean state
            window.location.href = '/admin';
          } else if (loginIntent === 'admin') {
            // Non-admin tried to access admin - show error
            console.log('❌ Non-admin user tried to access admin');
            setError('Access denied. Your account does not have admin privileges.');
            setTimeout(() => {
              window.location.href = '/admin/login?error=not_admin';
            }, 2000);
          } else {
            // Regular user - go to account page
            console.log('✅ Regular user - redirecting to /account');
            navigate('/account', { replace: true });
          }
        } else {
          console.warn('⚠️ No session found in callback');
          navigate('/auth');
        }
      } catch (err) {
        console.error('❌ Unexpected error in OAuth callback:', err);
        setError(err.message);
        setTimeout(() => {
          navigate('/auth?error=unexpected');
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fcf9f3] flex items-center justify-center px-6">
      <div className="text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-unica text-3xl uppercase tracking-tighter text-[#1c1c18] mb-3">
              Authentication Failed
            </h1>
            <p className="font-plex text-sm text-[#5f5e5e] mb-6">
              {error}
            </p>
            <p className="font-plex text-xs text-[#5f5e5e]">
              Redirecting you back to sign in...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1c1c18] flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-[#fcf9f3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-unica text-3xl uppercase tracking-tighter text-[#1c1c18] mb-3">
              Completing Sign In
            </h1>
            <p className="font-plex text-sm text-[#5f5e5e]">
              Please wait while we complete your authentication...
            </p>
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-[#1c1c18] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#1c1c18] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#1c1c18] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
