import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp, signIn, signInWithGoogle } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // Sign up new user
        const { user, error: signUpError } = await signUp({
          email,
          password,
          fullName: name,
        });

        if (signUpError) {
          setError(signUpError);
          setLoading(false);
          return;
        }

        setSuccess('Account created! Please check your email to verify your account.');
        setLoading(false);
        
        // Auto-switch to login after 2 seconds
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 2000);
      } else {
        // Sign in existing user
        const { user, profile, error: signInError } = await signIn({
          email,
          password,
        });

        if (signInError) {
          setError(signInError);
          setLoading(false);
          return;
        }

        // Auth store will be updated automatically by auth state listener
        // Navigate to account page
        navigate('/account');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { data, error: googleError } = await signInWithGoogle();

      if (googleError) {
        setError(googleError);
        setLoading(false);
        return;
      }

      // Google OAuth will redirect, so we don't need to do anything else here
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f3] flex">
      {/* Left panel — image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#1c1c18]">
        <img
          src="/lifestyle-login.jpg"
          alt="44LUXURY — Born From Pain collection, model wearing signature jacket"
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/80 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-16">
          <h2 className="font-unica text-6xl uppercase tracking-tighter text-[#fcf9f3] leading-tight mb-4">
            JOIN THE COLLECTIVE
          </h2>
          <p className="font-plex text-sm text-[#fcf9f3]/60 max-w-sm leading-relaxed">
            Members get early access to drops, exclusive pricing, and members-only editorial content.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-[400px]">
          <Link to="/" className="flex justify-center mb-12 hover:opacity-80 transition-opacity">
            <img src="/favicon.png" alt="44 LUXURY" className="h-8 w-auto object-contain" />
          </Link>

          <div className="flex mb-10 border-b border-[#1c1c18]/10">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 pb-4 font-grotesk font-bold text-xs uppercase tracking-widest transition-all border-b-2 -mb-px
                  ${mode === m ? 'border-[#1c1c18] text-[#1c1c18]' : 'border-transparent text-[#5f5e5e] hover:text-[#1c1c18]'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-[#1c1c18] font-grotesk font-bold uppercase tracking-widest text-xs py-4 border-2 border-[#1c1c18] hover:bg-[#f6f3ed] transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'CONTINUE WITH GOOGLE'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1c1c18]/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#fcf9f3] px-4 font-grotesk font-bold text-[#5f5e5e] tracking-widest">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === 'register' && (
              <div>
                <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] block mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  className="w-full bg-[#f6f3ed] border border-transparent focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3.5 outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#f6f3ed] border border-transparent focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3.5 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-[#1c1c18] block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-[#f6f3ed] border border-transparent focus:border-[#1c1c18] text-[#1c1c18] font-plex text-sm px-4 py-3.5 outline-none transition-colors"
              />
              {mode === 'register' && (
                <p className="font-plex text-[10px] text-[#5f5e5e] mt-1">Minimum 6 characters</p>
              )}
            </div>

            {error && (
              <p className="font-plex text-xs text-red-700 bg-red-50 px-4 py-3 border border-red-200">{error}</p>
            )}

            {success && (
              <p className="font-plex text-xs text-green-700 bg-green-50 px-4 py-3 border border-green-200">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1c1c18] text-[#fcf9f3] font-grotesk font-bold uppercase tracking-widest text-xs py-4 hover:bg-[#4b0e1e] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (mode === 'register' ? 'Creating account...' : 'Signing in...') : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>


          </form>
        </div>
      </div>
    </div>
  );
}
